import {
  scrypt as scryptCallback,
  timingSafeEqual,
  randomBytes,
  BinaryLike,
} from 'node:crypto';
import { promisify } from 'node:util';

/**
 * [description]
 */
const scrypt = promisify<BinaryLike, BinaryLike, number, Buffer>(
  scryptCallback,
);

/**
 * [description]
 */
const saltRounds = 10;

/**
 * [description]
 */
const keyLength = 64;

/**
 * [description]
 * @param password
 */
export const hash = async (password: string): Promise<string> => {
  const salt = randomBytes(saltRounds).toString('hex');
  const derivedKey = await scrypt(password, salt, keyLength);
  return salt + ':' + derivedKey.toString('hex');
};

/**
 * [description]
 * @param password
 * @param encrypted
 */
export const compare = async (
  password: string,
  encrypted: string,
): Promise<boolean> => {
  const [salt, key] = encrypted.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = await scrypt(password, salt, keyLength);
  return timingSafeEqual(keyBuffer, derivedKey);
};

/**
 * [description]
 * @param digits
 * @param size
 */
export const generateCode = (digits = 6, size = 20): string => {
  const buffer = randomBytes(size);
  const value = buffer.readUInt32BE(0x0f) % 10 ** digits;
  return value.toString().padStart(digits, '0');
};

/**
 * [description]
 * @param obj1
 * @param obj2
 */
export const deepEqual = (obj1: any, obj2: any) => {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};
