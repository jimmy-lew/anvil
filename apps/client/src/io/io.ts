/**
 * IO Monad implementation
 * 
 * The IO monad represents a computation that may cause side effects
 * but defers execution until explicitly run. This allows us to:
 * 
 * 1. Keep side effects pure at the type level
 * 2. Compose computations without executing them
 * 3. Control when effects actually happen (usually at the edge of the program)
 * 
 * In functional programming, we distinguish between:
 * - Pure functions: same input always produces same output, no side effects
 * - IO actions: computations that interact with the outside world
 * 
 * The IO monad lets us build up chains of IO actions that can be composed
 * and executed later, keeping our core logic pure.
 */

/**
 * IO type - represents a deferred computation that produces a value of type A
 * The computation may perform side effects when executed
 * 
 * @typeParam A - The type of value produced by this IO action
 */
export type IO<A> = () => A;

/**
 * Create an IO action from a pure value
 * Useful for lifting values into the IO context
 */
export const of = <A>(value: A): IO<A> => () => value;

/**
 * Create an IO action from a thunk (lazy evaluation)
 * The most common way to wrap side effects in IO
 */
export const fromIO = <A>(io: IO<A>): IO<A> => io;

/**
 * Execute/runs the IO action and returns the result
 * This is the only place where side effects actually happen
 */
export const run = <A>(io: IO<A>): A => io();

/**
 * Map - transform the value produced by an IO action
 * Returns a new IO that runs the original and transforms its result
 * 
 * @example
 * const getNumber = () => Math.random();
 * const doubled = map(getNumber, n => n * 2);
 * console.log(run(doubled)); // A random doubled number
 */
export const map = <A, B>(io: IO<A>, f: (value: A) => B): IO<B> => 
  () => f(run(io));

/**
 * FlatMap/Bind - chain IO actions that produce values
 * Each action in the chain can depend on the previous result
 * 
 * @example
 * const readLine = () => prompt("Enter a number: ");
 * const parse = (s: string) => parseInt(s, 10);
 * const squared = flatMap(fromIO(readLine), s => of(parse(s) ** 2));
 */
export const flatMap = <A, B>(io: IO<A>, f: (value: A) => IO<B>): IO<B> => 
  () => run(f(run(io)));

/**
 * Apply - apply a function wrapped in IO to a value wrapped in IO
 * Useful for applicative style programming
 */
export const ap = <A, B>(ioF: IO<(value: A) => B>, ioA: IO<A>): IO<B> =>
  flatMap(ioF, f => map(ioA, f));

/**
 * Chain - alias for flatMap for those who prefer that naming
 */
export const chain = flatMap;

/**
 * Get the value from IO with a default if the IO throws or returns null/undefined
 */
export const getOrElse = <A>(io: IO<A>, defaultValue: A): A => {
  try {
    const result = run(io);
    return result ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Catch errors from an IO action and recover with another IO
 */
export const catchError = <A, B>(
  io: IO<A>,
  handler: (error: unknown) => IO<B>
): IO<A | B> => {
  try {
    return of(run(io));
  } catch (error) {
    return handler(error);
  }
};

/**
 * TryCatch - wrap a throwing function in IO
 */
export const tryIO = <A>(f: () => A): IO<A> => () => {
  try {
    return f();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
};

/**
 * Sequence - run multiple IO actions in order, collecting all results
 * 
 * @example
 * const actions = [io1, io2, io3] as const;
 * const sequence = sequence(actions); // IO<[number, string, boolean]>
 */
export const sequence = <A extends readonly IO<unknown>[]>(
  ios: A
): IO<{ -readonly [K in keyof A]: A[K] extends IO<infer T> ? T : never }> => 
  () => ios.map(io => run(io as IO<unknown>)) as { -readonly [K in keyof A]: A[K] extends IO<infer T> ? T : never };

/**
 * Traverse - apply a function that returns IO to each element of an array
 * and sequence the results
 * 
 * @example
 * const urls = ["https://a.com", "https://b.com"];
 * const fetchAll = traverse(urls, url => fetchIO(url));
 */
export const traverse = <A, B>(
  array: readonly A[],
  f: (value: A) => IO<B>
): IO<B[]> => 
  () => array.map(a => run(f(a)));

/**
 * Parallel/Concurrent execution of IO actions that don't depend on each other
 * Uses Promise.all underneath for true parallelism
 */
export const parallel = <A>(ios: readonly IO<A>[]): IO<Promise<A[]>> => 
  () => Promise.all(ios.map(io => Promise.resolve().then(() => run(io))));

/**
 * Delay - create an IO that waits for specified milliseconds before executing
 */
export const delay = (ms: number): IO<void> => 
  tryIO(() => new Promise(resolve => setTimeout(resolve, ms)));

/**
 * Create IO that logs a value (for debugging)
 */
export const log = <A>(io: IO<A>, label?: string): IO<A> => {
  const result = run(io);
  console.log(label ? `${label}:` : "", result);
  return () => result;
};

/**
 * Create IO that times how long another IO takes to execute
 */
export const time = <A>(io: IO<A>): IO<{ result: A; elapsed: number }> => 
  () => {
    const start = performance.now();
    const result = run(io);
    const elapsed = performance.now() - start;
    return { result, elapsed };
  };

/**
 * Memoize/cache the result of an IO action
 * Subsequent calls return the cached value
 */
export const memoize = <A>(io: IO<A>): IO<IO<A>> => {
  let cached: A | undefined;
  let computed = false;
  return () => () => {
    if (!computed) {
      cached = run(io);
      computed = true;
    }
    return cached!;
  };
};

/**
 * Validate an IO action doesn't throw (for testing)
 */
export const succeeds = <A>(io: IO<A>): IO<boolean> => 
  () => {
    try {
      run(io);
      return true;
    } catch {
      return false;
    }
  };

/**
 * Combine multiple IO actions into one that produces a tuple
 * Alias for sequence with explicit tuple typing
 */
export const tuple = <A extends readonly IO<unknown>[]>(
  ...ios: A
): IO<{ -readonly [K in keyof A]: A[K] extends IO<infer T> ? T : never }> =>
  sequence(ios);

/**
 * Create an IO that always fails with an error
 */
export const fail = <A>(error: Error): IO<A> => {
  throw error;
};

/**
 * Check if an IO action throws when run
 */
export const throws = <A>(io: IO<A>): IO<boolean> => 
  () => {
    try {
      run(io);
      return false;
    } catch {
      return true;
    }
  };

/**
 * Create IO from a Promise
 * Useful for converting async operations to IO
 * Note: This IO will return a Promise when run, not a plain value
 */
export const fromPromise = <A>(promise: Promise<A>): IO<Promise<A>> => 
  () => promise;

/**
 * Create a Promise from an IO
 * Useful when you need to await IO in an async context
 */
export const toPromise = <A>(io: IO<A>): Promise<A> => 
  Promise.resolve().then(() => run(io));

/**
 * IO combinator for logging actions
 */
export const tap = <A>(io: IO<A>, f: (value: A) => void): IO<A> => 
  () => {
    const result = run(io);
    f(result);
    return result;
  };

/**
 * Filter/map over IO results
 */
export const filterMap = <A>(
  io: IO<A>,
  predicate: (value: A) => boolean,
  f: (value: A) => A
): IO<A> => 
  () => {
    const result = run(io);
    return predicate(result) ? f(result) : result;
  };
