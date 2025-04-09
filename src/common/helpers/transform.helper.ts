/**
 * [description]
 * @param value
 */
export function toNumArrayByComa(value: string | string[]): number[] {
  if (Array.isArray(value)) return value.map((el) => parseFloat(el));
  if (typeof value === 'string')
    return value?.split(/[, ]+/).map((el) => parseFloat(el));
  return value;
}

/**
 * [description]
 * @param value
 * @param cb
 */
export async function toPromiseArrayFromIterator<U>(
  iterator: AsyncIterableIterator<U>,
): Promise<Awaited<U>[]> {
  if (!iterator) return [];

  const array: Awaited<U>[] = [];
  for await (const data of iterator) {
    array.push(data);
  }
  return array;
}

/**
 * [description]
 * @param array
 * @param value
 */
export function toObjectFromStringArray<T>(
  array: string[],
  value: T,
): Record<string, T> {
  return array.reduce(
    (acc, curr) => ((acc[curr] = value), acc),
    <Record<string, T>>{},
  );
}

/**
 * Transform array of string dot-notation to object
 * ['title', 'foo.bar', 'foo.other', 'foo.bar.sub.deep'] =>
 * {
 *  title: true,
 *  foo: {
 *    other: true,
 *    bar: {
 *      sub: {
 *        deep: true
 *      }
 *    }
 *  }
 * }
 * @param array
 * @param initialValue
 * @param initialObject
 */
export const stringArrayToNestedObject = (
  array: string[],
  initialValue: true | string | number = true,
  initialObject: any = {},
): Record<string, any> => {
  const result = initialObject;

  array.forEach((path) => {
    const keys = path.split('.');
    let current = result;

    keys.forEach((key, index) => {
      const isOnlyOneKey = keys.length === 1;
      const isMiddleKey = index >= 0 && index < keys.length - 1;
      const isLastKey = index === keys.length - 1;

      if (isOnlyOneKey) {
        if (current[key] === undefined) {
          current[key] = initialValue;
        }
        return;
      }

      if (isMiddleKey && typeof current[key] !== 'object') {
        current[key] = {};
        current = current[key];
        return;
      }

      if (current[key] === undefined) {
        current[key] = isLastKey ? initialValue : {};
      }

      current = current[key];
    });
  });

  return result;
};

/**
 * [description]
 * @param object
 * @param callback
 */
export const iterateAllKeysInNestedObject = (
  object: Record<string, any>,
  callback: (path: string) => void,
): void => {
  const recursiveIterate = (obj, path = '') => {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;

      /**
       * For skip keys, what not need to iterate
       * useful for not join some *private* relations
       */
      if (obj[key] === false) continue;
      if (obj[key]?._skip_exclude === true)
        recursiveIterate(obj[key], currentPath);

      if (typeof obj[key] === 'object') {
        callback(currentPath);
        recursiveIterate(obj[key], currentPath);
      } else {
        callback(currentPath);
      }
    }
  };

  recursiveIterate(object);
};
