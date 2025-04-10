import {
  SelectQueryBuilder,
  FindOptionsUtils,
  FindOptionsWhere,
  InsertResult,
  DeepPartial,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Transactional } from 'typeorm-transactional';
import { instanceToPlain } from 'class-transformer';

import {
  ConflictException,
  NotFoundException,
  HttpException,
  Type,
} from '@nestjs/common';

import {
  FindManyBracketsOptions,
  FindOneBracketsOptions,
} from 'src/common/interfaces';
import { ErrorTypeEnum } from 'src/common/enums';

import {
  iterateAllKeysInNestedObject,
  stringArrayToNestedObject,
} from '../helpers';
import { CommonEntity } from '../entities';

/**
 * [description]
 */
export class CommonService<EntityClass extends CommonEntity, PaginationClass> {
  /**
   * [description]
   * @param entityClass
   * @param repository
   * @param paginationClass
   * @param errorPrefix
   */
  constructor(
    public readonly entityClass: Type<EntityClass>,
    public readonly repository: Repository<EntityClass>,
    public readonly paginationClass: Type<PaginationClass>,
    public readonly errorPrefix: string = '',
  ) {}

  /**
   * Generate error in format
   * @param ErrorRef
   * @param errorType
   * @param error
   */
  public throwError(
    ErrorRef: Type<HttpException>,
    errorType: ErrorTypeEnum,
    error?: Error,
  ): never {
    throw new ErrorRef({ message: this.errorPrefix + errorType, error });
  }

  /**
   * [description]
   * @param entitiesLike
   */
  @Transactional()
  public async insert(
    entitiesLike:
      | QueryDeepPartialEntity<EntityClass>
      | QueryDeepPartialEntity<EntityClass>[],
  ): Promise<InsertResult> {
    return this.repository
      .insert(entitiesLike)
      .catch((error) =>
        this.throwError(
          ConflictException,
          ErrorTypeEnum.INPUT_DATA_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param entitiesLike
   */
  @Transactional()
  public async createMany(
    entitiesLike: DeepPartial<EntityClass>[],
  ): Promise<EntityClass[]> {
    const entities = this.repository.create(entitiesLike);
    return this.repository
      .save(entities)
      .catch((error) =>
        this.throwError(
          ConflictException,
          ErrorTypeEnum.INPUT_DATA_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param entityLike
   */
  @Transactional()
  public async createOne(
    entityLike: DeepPartial<EntityClass>,
  ): Promise<EntityClass> {
    const entity = this.repository.create(entityLike);
    return this.repository
      .save(entity)
      .catch((error) =>
        this.throwError(
          ConflictException,
          ErrorTypeEnum.INPUT_DATA_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param entityLike
   */
  @Transactional()
  public async createOneAndSelect(
    entityLike: DeepPartial<EntityClass>,
    options: FindManyBracketsOptions<EntityClass> = {
      loadEagerRelations: true,
    },
  ): Promise<EntityClass> {
    const { id } = await this.createOne(entityLike);
    return this.selectOne({ id } as FindOptionsWhere<EntityClass>, options);
  }

  /**
   * [description]
   * @param options
   */
  public find(
    options: FindManyBracketsOptions<EntityClass> = {},
  ): SelectQueryBuilder<EntityClass> {
    const metadata = this.repository.metadata;
    const qb = this.repository.createQueryBuilder(metadata.name);

    qb.setFindOptions(options);

    if (options.whereBrackets) {
      qb.andWhere(options.whereBrackets);
    }

    const orderASC: string[] = options.asc;
    const orderDESC: string[] = options.desc;
    const orderRelations: string[] = [];

    /**
     * Order custom/virtual/computed fields
     * Custom fields startsWith '__', its computed/virtual columns, ussually it's counters
     * @xample __members_count, __new_messages_count
     */
    orderASC
      ?.filter((key) => key.startsWith('__'))
      .forEach((key) => {
        qb.addOrderBy(key, 'ASC', 'NULLS LAST');
      });

    orderDESC
      ?.filter((key) => key.startsWith('__'))
      .forEach((key) => {
        qb.addOrderBy(key, 'DESC', 'NULLS LAST');
      });

    /**
     * Order nested/relations fields
     * Custom fields includes '.', its computed/virtual columns, ussually it's counters
     * @xample event.class.startTime, chat.message.owner.createdAt
     * Its will replace to event_class.startTime, chat_message_owner.createdAt
     */
    orderASC
      ?.filter((key) => key.includes('.'))
      .forEach((key) => {
        const parts = key.split('.');
        if (parts.length === 2) {
          // top level entity order
          qb.addOrderBy(parts.join('.'));
        } else {
          const field = parts.pop();
          qb.addOrderBy(parts.join('_') + '.' + field, 'ASC', 'NULLS LAST');

          orderRelations.push(parts.join('.'));
        }
      });

    orderDESC
      ?.filter((key) => key.includes('.'))
      .forEach((key) => {
        const parts = key.split('.');
        if (parts.length === 2) {
          // top level entity order
          qb.addOrderBy(parts.join('.'));
        } else {
          const field = parts.pop();
          qb.addOrderBy(parts.join('_') + '.' + field, 'DESC', 'NULLS LAST');

          orderRelations.push(parts.join('.'));
        }
      });

    if (options.loadEagerRelations !== false) {
      FindOptionsUtils.joinEagerRelations(qb, metadata.name, metadata);

      /**
       * Smart join relations from query parameter
       * @param joinRelations - user's relations from query parametr
       * @param excludeRelations - useful for overwrite user's joinRelations, and always hide some relations
       */
      options.joinRelations ??= [];
      options.excludeRelations ??= [];

      const mergedRelations = orderRelations.concat(options.joinRelations);
      const excludeRelations = options.excludeRelations.sort(
        (a, b) => a.length - b.length,
      );

      const mapedRelations = mergedRelations.map((relation) => {
        if (relation.includes('!')) return relation;

        const maxExludeRelation = excludeRelations.find((exclude) =>
          relation.startsWith(exclude),
        );
        return maxExludeRelation ? maxExludeRelation : relation;
      }, []);

      const relations = stringArrayToNestedObject(mapedRelations);
      iterateAllKeysInNestedObject(relations, (path) => {
        path = path.replace(/!/g, '');

        if (path.includes('.')) {
          const pathWithLastDot = path.replace(/\.(?=.*\.)/g, '_');
          const pathAsAlias = path.replace(/\./g, '_');
          qb.leftJoinAndSelect(pathWithLastDot, pathAsAlias);
        } else {
          qb.leftJoinAndSelect(`${qb.alias}.${path}`, path);
        }
      });
    }

    return qb;
  }

  /**
   * [description]
   * @param options
   */
  @Transactional()
  public async selectManyAndCount(
    options: FindManyBracketsOptions<EntityClass> = {
      loadEagerRelations: false,
    },
  ): Promise<PaginationClass> {
    return this.find(options)
      .getManyAndCount()
      .then((data) => new this.paginationClass(data))
      .catch((error) =>
        this.throwError(
          NotFoundException,
          ErrorTypeEnum.NOT_FOUND_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param options
   */
  @Transactional()
  public async selectMany(
    options: FindManyBracketsOptions<EntityClass> = {
      loadEagerRelations: false,
    },
  ): Promise<EntityClass[]> {
    return this.find(options)
      .getMany()
      .catch((error) =>
        this.throwError(
          NotFoundException,
          ErrorTypeEnum.NOT_FOUND_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param conditions
   * @param options
   */
  @Transactional()
  public async selectOne(
    conditions: FindManyBracketsOptions<EntityClass>['where'],
    options: FindManyBracketsOptions<EntityClass> = {
      loadEagerRelations: false,
    },
  ): Promise<EntityClass> {
    return this.find({ ...instanceToPlain(options), where: conditions })
      .getOneOrFail()
      .catch((error) =>
        this.throwError(
          NotFoundException,
          ErrorTypeEnum.NOT_FOUND_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param mergeIntoEntity
   * @param entityLike
   */
  @Transactional()
  public async updateOneFromEntity(
    mergeIntoEntity: EntityClass,
    entityLike: DeepPartial<EntityClass>,
  ): Promise<EntityClass> {
    const entity = this.repository.merge(mergeIntoEntity, entityLike);
    return this.repository
      .save(entity)
      .catch((error) =>
        this.throwError(
          ConflictException,
          ErrorTypeEnum.INPUT_DATA_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param conditions
   * @param entityLike
   */
  @Transactional()
  public async updateOne(
    conditions: FindOneBracketsOptions<EntityClass>['where'],
    entityLike: DeepPartial<EntityClass>,
  ): Promise<EntityClass> {
    const mergeIntoEntity = await this.selectOne(conditions, {
      loadEagerRelations: false,
    });
    return this.updateOneFromEntity(mergeIntoEntity, entityLike);
  }

  /**
   * [description]
   * @param conditions
   * @param entityLike
   */
  @Transactional()
  public async updateOneAndSelect(
    conditions: FindOneBracketsOptions<EntityClass>['where'],
    entityLike: DeepPartial<EntityClass>,
  ): Promise<EntityClass> {
    const { id } = await this.updateOne(conditions, entityLike);
    return this.selectOne({ id } as FindOptionsWhere<EntityClass>, {
      loadEagerRelations: true,
    });
  }

  /**
   * [description]
   * @param conditions
   * @param entityLike
   */
  @Transactional()
  public async update(
    conditions: FindOptionsWhere<EntityClass>,
    entityLike: QueryDeepPartialEntity<unknown>,
  ): Promise<number> {
    return this.repository
      .createQueryBuilder()
      .update()
      .set(entityLike)
      .where(conditions)
      .execute()
      .then((data) => data.affected)
      .catch((error) =>
        this.throwError(
          ConflictException,
          ErrorTypeEnum.INPUT_DATA_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param conditions
   */
  @Transactional()
  public async deleteOne(
    conditions: FindOneBracketsOptions<EntityClass>['where'],
  ): Promise<EntityClass> {
    const entity = await this.selectOne(conditions, {
      loadEagerRelations: false,
    });
    return this.repository
      .remove(entity)
      .catch((error) =>
        this.throwError(
          NotFoundException,
          ErrorTypeEnum.NOT_FOUND_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param conditions
   */
  @Transactional()
  public async delete(
    conditions: FindOptionsWhere<EntityClass>,
  ): Promise<number> {
    return this.repository
      .createQueryBuilder()
      .delete()
      .where(conditions)
      .execute()
      .then((data) => data.affected)
      .catch((error) =>
        this.throwError(
          ConflictException,
          ErrorTypeEnum.NOT_FOUND_ERROR,
          error,
        ),
      );
  }

  /**
   * [description]
   * @param entity
   */
  public fromEntityToRaw<T>(entity: T): Record<string, any> {
    return Object.entries(entity).reduce((acc, [key, value]) => {
      const property = this.entityClass.name + '_' + key;
      acc[property] = value;
      return acc;
    }, {});
  }

  /**
   * [description]
   * @param raw
   */
  public fromRawToEntity(raw: any): Record<string, any> {
    return Object.entries(raw).reduce((acc, [key, value]) => {
      const splited = key.split('_');
      splited.reduce((field, el, index) => {
        if (el === '') el = '_';
        if (index === 0) return acc;
        if (index === splited.length - 1) field[el] = value;
        else if (field[el] === undefined) field[el] = {};
        return field[el];
      }, {});

      return acc;
    }, {});
  }
}
