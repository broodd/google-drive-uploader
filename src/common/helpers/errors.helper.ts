import { ValidationError } from 'class-validator';
import { iterate } from 'iterare';

/**
 * @link https://github.com/nestjs/nest/blob/master/packages/common/pipes/validation.pipe.ts
 * @param validationErrors
 */
export const flattenValidationErrors = (validationErrors: ValidationError[]): string[] => {
  return iterate(validationErrors)
    .map((error) => mapChildrenToValidationErrors(error))
    .flatten()
    .filter((item) => !!item.constraints)
    .map((item) => Object.values(item.constraints))
    .flatten()
    .toArray();
};

/**
 * @link https://github.com/nestjs/nest/blob/master/packages/common/pipes/validation.pipe.ts
 * @param error
 * @param parentPath
 */
export const mapChildrenToValidationErrors = (
  error: ValidationError,
  parentPath?: string,
): ValidationError[] => {
  if (!(error.children && error.children.length)) {
    return [error];
  }
  const validationErrors = [];
  parentPath = parentPath ? `${parentPath}.${error.property}` : error.property;
  for (const item of error.children) {
    if (item.children && item.children.length) {
      validationErrors.push(...mapChildrenToValidationErrors(item, parentPath));
    }
    validationErrors.push(prependConstraintsWithParentProp(parentPath, item));
  }
  return validationErrors;
};

/**
 * @link https://github.com/nestjs/nest/blob/master/packages/common/pipes/validation.pipe.ts
 * @param parentPath
 * @param error
 */
export const prependConstraintsWithParentProp = (
  parentPath: string,
  error: ValidationError,
): ValidationError => {
  const constraints = {};
  for (const key in error.constraints) {
    constraints[key] = `${parentPath}.${error.constraints[key]}`;
  }
  return {
    ...error,
    constraints,
  };
};
