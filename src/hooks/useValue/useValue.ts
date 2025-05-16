import { useMemo, useRef } from 'react';

/**
 * A custom hook that provides a getter and setter for a mutable value.
 * The initial value can be a direct value or a function that returns the value.
 *
 * @template T - The type of the value.
 * @param {T | (() => T)} initialValue - The initial value or a function to compute the initial value.
 * @returns {Object} An object containing:
 *   - `get`: A function to retrieve the current value.
 *   - `set`: A function to update the value.
 *
 * @example
 * const value = useValue(10);
 * console.log(value.get()); // 10
 * value.set(20);
 * console.log(value.get()); // 20
 */
export function useValue<T>(initialValue: T | (() => T)): {
  get: () => T;
  set: (value: T) => void;
} {
  const ref = useRef<T>(null);
  if (ref.current === null) {
    ref.current =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
  }

  const value = useMemo(
    () => ({
      get: () => ref.current as T,
      set: (value: T) => {
        ref.current = value;
      }
    }),
    []
  );

  return value;
}

export default useValue;
