 
 
import { ApplyValueTransformers } from 'typeorm/util/ApplyValueTransformers';
import { DriverUtils } from 'typeorm/driver/DriverUtils';
import { DateUtils } from 'typeorm/util/DateUtils';
import { OrmUtils } from 'typeorm/util/OrmUtils';
import { SelectQueryBuilder } from 'typeorm';

import { VIRTUAL_COLUMN_KEY } from './decorators/virtual-column.decorator';

/**
 * [description]
 * @link https://pietrzakadrian.com/blog/virtual-column-solutions-for-typeorm#5-decorator-method
 */
declare module 'typeorm' {
  /**
   * [description]
   */
  interface SelectQueryBuilder<Entity> {
    /**
     * [description]
     */
    getMany(this: SelectQueryBuilder<Entity>): Promise<Entity[] | undefined>;

    /**
     * [description]
     */
    getOne(this: SelectQueryBuilder<Entity>): Promise<Entity | undefined>;

    /**
     * [description]
     */
    // @ts-ignore
    executeEntitiesAndRawResults(): Promise<{ entities: Entity[]; raw: any[] }>;
  }
}

SelectQueryBuilder.prototype.getMany = async function () {
  const { entities, raw } = await this.getRawAndEntities();
  if (!raw.length) return entities;

  const idKey = Object.keys(raw[0])[0];
  const items = entities.map((entity) => {
    try {
      const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};

      const item = raw.find((el) => el[idKey] === entity.id);

      for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
        entity[propertyKey] = item[name];
      }
    } catch {}

    return entity;
  });

  return items.slice();
};

SelectQueryBuilder.prototype.getOne = async function () {
  const { entities, raw } = await this.getRawAndEntities();

  try {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entities[0]) ?? {};

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entities[0][propertyKey] = raw[0][name];
    }
  } catch {}

  return entities[0];
};

/**
 * Polyfill getManyAndCount function with using decorator @VirtualColumn
 */
// @ts-ignore
const originExecute = SelectQueryBuilder.prototype.executeEntitiesAndRawResults;
// @ts-ignore
SelectQueryBuilder.prototype.executeEntitiesAndRawResults = async function (queryRunner) {
  const { entities, raw } = await originExecute.call(this, queryRunner);
  if (!raw.length) return { entities, raw };

  const idKey = Object.keys(raw[0])[0];
  entities.forEach((entity) => {
    try {
      const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};
      const item = raw.find((el) => el[idKey] === entity.id);

      for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
        entity[propertyKey] = item[name];
      }
    } catch {}
  });

  return { entities, raw };
};

/**
 * When using geography type in column, it always update even not changed
 * @link https://github.com/typeorm/typeorm/issues/10377
 * @link https://github.com/typeorm/typeorm/pull/10944
 */
try {
  // Import the internal class by its path
  const SubjectChangedColumnsComputer =
    require('typeorm/persistence/SubjectChangedColumnsComputer').SubjectChangedColumnsComputer;

  // Override the `computeDiffColumns` method
  SubjectChangedColumnsComputer.prototype.computeDiffColumns = function (subject) {
    // if there is no persisted entity then nothing to compute changed in it
    if (!subject.entity) return;

    subject.metadata.columns.forEach((column) => {
      // ignore special columns
      if (
        column.isVirtual ||
        column.isDiscriminator // ||
        // column.isUpdateDate ||
        // column.isVersion ||
        // column.isCreateDate
      )
        return;

      const changeMap = subject.changeMaps.find((changeMap) => changeMap.column === column);
      if (changeMap) {
        subject.changeMaps.splice(subject.changeMaps.indexOf(changeMap), 1);
      }

      // get user provided value - column value from the user provided persisted entity
      const entityValue = column.getEntityValue(subject.entity!);

      // we don't perform operation over undefined properties (but we DO need null properties!)
      if (entityValue === undefined) return;

      // if there is no database entity then all columns are treated as new, e.g. changed
      if (subject.databaseEntity) {
        // skip transform database value for json / jsonb for comparison later on
        const shouldTransformDatabaseEntity = column.type !== 'json' && column.type !== 'jsonb';

        // get database value of the column
        let databaseValue = column.getEntityValue(
          subject.databaseEntity,
          shouldTransformDatabaseEntity,
        );

        // filter out "relational columns" only in the case if there is a relation object in entity
        if (column.relationMetadata) {
          const value = column.relationMetadata.getEntityValue(subject.entity!);
          if (value !== null && value !== undefined) return;
        }
        let normalizedValue = entityValue;
        // normalize special values to make proper comparision
        if (entityValue !== null) {
          switch (column.type) {
            case 'date':
              normalizedValue = DateUtils.mixedDateToDateString(entityValue);
              break;

            case 'time':
            case 'time with time zone':
            case 'time without time zone':
            case 'timetz':
              normalizedValue = DateUtils.mixedDateToTimeString(entityValue);
              break;

            case 'datetime':
            case 'datetime2':
            case Date:
            case 'timestamp':
            case 'timestamp without time zone':
            case 'timestamp with time zone':
            case 'timestamp with local time zone':
            case 'timestamptz':
              normalizedValue = DateUtils.mixedDateToUtcDatetimeString(entityValue);
              databaseValue = DateUtils.mixedDateToUtcDatetimeString(databaseValue);
              break;

            /**
             * PATCHING START
             */
            case 'geography':
            case 'geometry':
              // In "SelectQueryBuilder.buildEscapedEntityColumnSelects" function,
              // spatialTypes(geography and geometry) use GeoJson only in Postgres Family
              if (
                DriverUtils.isPostgresFamily(subject.metadata.connection.driver) &&
                OrmUtils.deepCompare(entityValue, databaseValue)
              ) {
                return;
              }
              break;
            /**
             * PATCHING END
             */

            case 'json':
            case 'jsonb':
              // JSON.stringify doesn't work because postgresql sorts jsonb before save.
              // If you try to save json '[{"messages": "", "attribute Key": "", "level":""}] ' as jsonb,
              // then postgresql will save it as '[{"level": "", "message":"", "attributeKey": ""}]'
              if (OrmUtils.deepCompare(entityValue, databaseValue)) return;
              break;

            case 'simple-array':
              normalizedValue = DateUtils.simpleArrayToString(entityValue);
              databaseValue = DateUtils.simpleArrayToString(databaseValue);
              break;
            case 'simple-enum':
              normalizedValue = DateUtils.simpleEnumToString(entityValue);
              databaseValue = DateUtils.simpleEnumToString(databaseValue);
              break;
            case 'simple-json':
              normalizedValue = DateUtils.simpleJsonToString(entityValue);
              databaseValue = DateUtils.simpleJsonToString(databaseValue);
              break;
          }

          if (column.transformer) {
            normalizedValue = ApplyValueTransformers.transformTo(column.transformer, entityValue);
          }
        }

        // if value is not changed - then do nothing
        if (Buffer.isBuffer(normalizedValue) && Buffer.isBuffer(databaseValue)) {
          if (normalizedValue.equals(databaseValue)) {
            return;
          }
        } else {
          if (normalizedValue === databaseValue) return;
        }
      }

      if (!subject.diffColumns.includes(column)) subject.diffColumns.push(column);

      subject.changeMaps.push({
        column: column,
        value: entityValue,
      });
    });
  };
} catch (error) {
  console.error('Failed to patch SubjectChangedColumnsComputer:', error);
}
