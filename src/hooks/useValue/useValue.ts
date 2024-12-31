import { useRef } from 'react';

/**
 * Custom hook that returns a mutable ref object initialized with the given value.
 * The initial value can be a direct value or a function that returns the value.
 *
 * @template T - The type of the value.
 * @param {T | (() => T)} initialValue - The initial value or a function that returns the initial value.
 * @returns {React.RefObject<T>} A ref object with the current property set to the initial value.
 *
 * @example
 * const valueRef = useValue(5);
 * console.log(valueRef.current); // 5
 *
 * @example
 * const valueRef = useValue(() => 10);
 * console.log(valueRef.current); // 10
 */
export function useValue<T>(initialValue: T | (() => T)): React.RefObject<T> {
  const ref = useRef<T>(null);
  if (ref.current === null) {
    ref.current =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
  }
  return ref as React.RefObject<T>;
}

export default useValue;
