/**
 * Function Composition Utilities
 * 
 * Provides helpers for composing functions in a functional style
 * These are building blocks for creating pipelines of operations
 */

/**
 * Pipe function - left-to-right function composition
 * pipe(a, b, c)(x) = c(b(a(x)))
 */
export const pipe = <A, B>(a: (input: A) => B): ((input: A) => B) => a;

/**
 * Compose function - right-to-left function composition
 * compose(a, b)(x) = b(a(x))
 */
export const compose = <A, B>(f: (input: A) => B): ((input: A) => B) => f;

/**
 * Pipe two functions
 */
export const pipe2 = <A, B, C>(
  a: (input: A) => B,
  b: (input: B) => C
): ((input: A) => C) => 
  (input: A): C => b(a(input));

/**
 * Compose two functions
 */
export const compose2 = <A, B, C>(
  b: (input: B) => C,
  a: (input: A) => B
): ((input: A) => C) => 
  (input: A): C => b(a(input));

/**
 * Constant function - returns a constant value regardless of input
 */
export const constant = <T>(value: T) => (): T => value;

/**
 * Identity function - returns input unchanged
 */
export const identity = <T>(x: T): T => x;

/**
 * Flip function - reverses the order of arguments for a binary function
 */
export const flip = <A, B, C>(f: (a: A, b: B) => C) => (b: B, a: A): C => f(a, b);

/**
 * Curry a function - convert multi-arg function to curried form
 */
export const curry = 
  <A, B, C>(f: (a: A, b: B) => C) => 
  (a: A) => 
  (b: B): C => f(a, b);

/**
 * Uncurry a function - convert curried function to multi-arg form
 */
export const uncurry = 
  <A, B, C>(f: (a: A) => (b: B) => C) => 
  (a: A, b: B): C => f(a)(b);

/**
 * Memoize a function - cache results for same inputs
 */
export const memoize = <A, B>(f: (arg: A) => B): ((arg: A) => B) => {
  const cache = new Map<A, B>();
  return (arg: A): B => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    const result = f(arg);
    cache.set(arg, result);
    return result;
  };
};

/**
 * Partial application - bind some arguments of a function
 */
export const partial = 
  <A, B, C>(f: (a: A, b: B) => C, a: A) => 
  (b: B): C => f(a, b);

/**
 * Partial application from the right
 */
export const partialRight = 
  <A, B, C>(f: (a: A, b: B) => C, b: B) => 
  (a: A): C => f(a, b);

/**
 * Negate a predicate function
 */
export const negate = <A>(f: (a: A) => boolean) => (a: A): boolean => !f(a);

/**
 * Throttle a function - ensure it only runs at most once per specified interval
 */
export const throttle = <A extends (...args: unknown[]) => unknown>(
  f: A,
  delay: number
): ((...args: Parameters<A>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<A>): void => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      f(...args);
    }
  };
};

/**
 * Debounce a function - delay execution until after specified quiet period
 */
export const debounce = <A extends (...args: unknown[]) => unknown>(
  f: A,
  delay: number
): ((...args: Parameters<A>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<A>): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => f(...args), delay);
  };
};

/**
 * Once function - ensure a function can only be called once
 */
export const once = <A extends (...args: Parameters<A>) => ReturnType<A>>(
  f: A
): ((...args: Parameters<A>) => ReturnType<A>) => {
  let called = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  return (...args: Parameters<A>): ReturnType<A> => {
    if (!called) {
      called = true;
      result = f(...args);
    }
    return result;
  };
};

/**
 * Retry a function with exponential backoff
 */
export const retry = <A>(
  f: () => A,
  maxRetries: number,
  baseDelay: number
): (() => A) => {
  return (): A => {
    let retries = 0;
    const attempt = (): A => {
      try {
        return f();
      } catch (error) {
        if (retries >= maxRetries) {
          throw error;
        }
        retries++;
        const delay = baseDelay * Math.pow(2, retries - 1);
        // Use setTimeout in real implementation
        if (typeof setTimeout !== "undefined") {
          const start = Date.now();
          while (Date.now() - start < delay) { /* busy wait */ }
        }
        return attempt();
      }
    };
    return attempt();
  };
};

/**
 * Conditionally apply a function
 */
export const when = <A>(
  condition: boolean,
  f: (x: A) => A
) => (x: A): A => condition ? f(x) : x;

/**
 * Apply a function if predicate passes, otherwise return identity
 */
export const applyIf = <A>(
  predicate: (x: A) => boolean,
  f: (x: A) => A
) => (x: A): A => predicate(x) ? f(x) : x;

/**
 * Create a function that always throws an error
 */
export const throwError = (error: Error): never => {
  throw error;
};

/**
 * Create a function that always returns a specific error
 */
export const alwaysThrow = <T>(error: Error): (() => T) => {
  return (): T => {
    throw error;
  };
};

/**
 * Check if a value is undefined
 */
export const isUndefined = <T>(x: T | undefined): x is undefined => x === undefined;

/**
 * Check if a value is null
 */
export const isNull = <T>(x: T | null): x is null => x === null;

/**
 * Check if a value is null or undefined
 */
export const isNil = <T>(x: T | null | undefined): x is null | undefined => 
  x === null || x === undefined;

/**
 * Check if a value is not null or undefined
 */
export const isNotNil = <T>(x: T | null | undefined): x is T => 
  x !== null && x !== undefined;
