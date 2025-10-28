/**
 * Array Helper Functions
 * 
 * These helpers ensure safe array operations by guaranteeing an array return value
 */

/**
 * Safely ensures a value is an array
 * @param value - The value to check
 * @returns An array (either the original if it's an array, or an empty array)
 */
export const ensureArray = <T>(value: any): T[] => {
  return Array.isArray(value) ? value : [];
};

/**
 * Safely filters an array-like value
 * @param value - The value to filter
 * @param predicate - The filter function
 * @returns Filtered array
 */
export const safeFilter = <T>(
  value: any,
  predicate: (item: T, index: number, array: T[]) => boolean
): T[] => {
  return ensureArray<T>(value).filter(predicate);
};

/**
 * Safely maps an array-like value
 * @param value - The value to map
 * @param callback - The map function
 * @returns Mapped array
 */
export const safeMap = <T, U>(
  value: any,
  callback: (item: T, index: number, array: T[]) => U
): U[] => {
  return ensureArray<T>(value).map(callback);
};

/**
 * Safely reduces an array-like value
 * @param value - The value to reduce
 * @param callback - The reduce function
 * @param initialValue - The initial value
 * @returns Reduced value
 */
export const safeReduce = <T, U>(
  value: any,
  callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U,
  initialValue: U
): U => {
  return ensureArray<T>(value).reduce(callback, initialValue);
};

