/**
 * Create an object composed of the picked object properties
 * @param object - The source object
 * @param keys - An array of keys to pick
 * @returns A new object with the picked properties
 */
const pick = <T, K extends keyof T>(object: T, keys: K[]): Partial<T> => {
  return keys.reduce((result: Partial<T>, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
    return result;
  }, {});
};

export default pick;
