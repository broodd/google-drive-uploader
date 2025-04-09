export function querySearch(field: string, searchAlias = '%:search%'): string {
  return `REGEXP_REPLACE(${field}, '\\s', '', 'g') ILIKE REGEXP_REPLACE(${searchAlias}, '\\s', '', 'g')`;
}
