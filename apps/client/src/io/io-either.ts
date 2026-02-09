/**
 * IOEither Monad
 * 
 * Combines IO (for side effects) with Either (for error handling)
 * This gives us a monad that:
 * - Can perform side effects (IO)
 * - Can represent success/failure (Either)
 * - Is fully composable and lazy
 * 
 * This is the primary monad used throughout the bot for operations
 * that can fail (which is most operations)
 */

import type { Either } from "../utils/either.js";
import { left, right, isEitherLeft } from "../utils/either.js";
import type { IO } from "./io.js";
import { run } from "./io.js";

/**
 * IOEither type - represents a computation that:
 * - May cause side effects (IO)
 * - May fail with an error of type L (Left)
 * - May succeed with a value of type R (Right)
 */
export type IOEither<L, R> = IO<Either<L, R>>;

/**
 * Create a successful IOEither from a value
 */
export const ioEitherRight = <L, R>(value: R): IOEither<L, R> => 
  () => right(value);

/**
 * Create a failed IOEither from an error
 */
export const ioEitherLeft = <L, R>(error: L): IOEither<L, R> => 
  () => left(error);

/**
 * Lift a plain Either into IOEither
 */
export const fromEither = <L, R>(either: Either<L, R>): IOEither<L, R> => 
  () => either;

/**
 * Lift an IO into IOEither
 * The IO must already handle its own errors (not throw)
 */
export const fromIO = <L, R>(io: IO<R>): IOEither<L, R> => 
  () => {
    try {
      return right(run(io));
    } catch (error) {
      if (error instanceof Error) {
        return left(error as unknown as L);
      }
      return left(new Error(String(error)) as unknown as L);
    }
  };

/**
 * Lift a throwing IO into IOEither
 */
export const tryIO = <L, R>(io: IO<R>): IOEither<L, R> => 
  () => {
    try {
      return right(run(io));
    } catch (error) {
      return left(error as L);
    }
  };

/**
 * Map over the Right value (success case)
 */
export const mapIOEither = <L, R, T>(
  ioEither: IOEither<L, R>,
  f: (value: R) => T
): IOEither<L, T> => 
  () => {
    const result = run(ioEither);
    if (isEitherLeft(result)) {
      return result;
    }
    return right(f(result.right));
  };

/**
 * Map over the Left value (error case)
 */
export const mapLeftIOEither = <L, R, T>(
  ioEither: IOEither<L, R>,
  f: (value: L) => T
): IOEither<T, R> => 
  () => {
    const result = run(ioEither);
    if (isEitherLeft(result)) {
      return left(f(result.left));
    }
    return result;
  };

/**
 * FlatMap/Bind - chain IOEither operations
 */
export const flatMapIOEither = <L, R, T>(
  ioEither: IOEither<L, R>,
  f: (value: R) => IOEither<L, T>
): IOEither<L, T> => 
  () => {
    const result = run(ioEither);
    if (isEitherLeft(result)) {
      return result;
    }
    return run(f(result.right));
  };

/**
 * Apply a function wrapped in IOEither to a value wrapped in IOEither
 */
export const apIOEither = <L, R, T>(
  ioEitherF: IOEither<L, (value: R) => T>,
  ioEitherR: IOEither<L, R>
): IOEither<L, T> => 
  () => {
    const fResult = run(ioEitherF);
    const rResult = run(ioEitherR);
    
    if (isEitherLeft(fResult)) {
      return fResult;
    }
    if (isEitherLeft(rResult)) {
      return rResult;
    }
    return right(fResult.right(rResult.right));
  };

/**
 * Fold - pattern match on IOEither
 */
export const foldIOEither = <L, R, T>(
  ioEither: IOEither<L, R>,
  onLeft: (value: L) => T,
  onRight: (value: R) => T
): IO<T> => 
  () => {
    const result = run(ioEither);
    if (isEitherLeft(result)) {
      return onLeft(result.left);
    }
    return onRight(result.right);
  };

/**
 * Get the value from IOEither with a default for the Left case
 */
export const getOrElseIOEither = <L, R>(
  ioEither: IOEither<L, R>,
  defaultValue: R
): IO<R> => 
  () => {
    const result = run(ioEither);
    if (isEitherLeft(result)) {
      return defaultValue;
    }
    return result.right;
  };

/**
 * Get the value from IOEither or throw the Left error
 */
export const getOrThrowIOEither = <R>(ioEither: IOEither<Error, R>): IO<R> => 
  () => {
    const result = run(ioEither);
    if (isEitherLeft(result)) {
      throw result.left;
    }
    return result.right;
  };

/**
 * Convert IOEither to a nullable value
 */
export const toNullableIOEither = <L, R>(ioEither: IOEither<L, R>): IO<R | null> => 
  () => {
    const result = run(ioEither);
    return isEitherLeft(result) ? null : result.right;
  };

/**
 * Create IOEither from a nullable value
 */
export const fromNullableIOEither = <T, L>(
  value: T | null | undefined,
  error: L
): IOEither<L, NonNullable<T>> => 
  () => {
    if (value == null) {
      return left(error);
    }
    return right(value as NonNullable<T>);
  };

/**
 * Create IOEither from a predicate
 */
export const fromPredicateIOEither = <T, L>(
  value: T,
  predicate: (value: T) => boolean,
  error: L
): IOEither<L, T> => 
  () => {
    if (predicate(value)) {
      return right(value);
    }
    return left(error);
  };

/**
 * Sequence multiple IOEither values into one with an array of results
 * Returns first Left encountered
 */
export const sequenceIOEither = <L, R>(
  ioEithers: readonly IOEither<L, R>[]
): IOEither<L, R[]> => 
  () => {
    const results: R[] = [];
    for (const ioEither of ioEithers) {
      const result = run(ioEither);
      if (isEitherLeft(result)) {
        return result;
      }
      results.push(result.right);
    }
    return right(results);
  };

/**
 * Traverse an array with IOEither functions
 */
export const traverseIOEither = <A, L, R>(
  array: readonly A[],
  f: (value: A) => IOEither<L, R>
): IOEither<L, R[]> => 
  () => {
    const results: R[] = [];
    for (const item of array) {
      const result = run(f(item));
      if (isEitherLeft(result)) {
        return result;
      }
      results.push(result.right);
    }
    return right(results);
  };

/**
 * Execute an IOEither and discard the result (for side effects)
 */
export const execIOEither = <L, R>(ioEither: IOEither<L, R>): IO<void> => 
  () => {
    run(ioEither);
  };

/**
 * Catch and handle errors in IOEither
 */
export const catchErrorIOEither = <L, R, T>(
  ioEither: IOEither<L, R>,
  handler: (error: L) => IOEither<T, R>
): IOEither<T, R> => 
  () => {
    const result = run(ioEither);
    if (isEitherLeft(result)) {
      return run(handler(result.left));
    }
    return result;
  };

/**
 * Combine multiple IOEither values with a combine function
 */
export const combineIOEither = <L, R, T>(
  ioEither1: IOEither<L, R>,
  ioEither2: IOEither<L, T>,
  combine: (r: R, t: T) => R
): IOEither<L, R> => 
  () => {
    const result1 = run(ioEither1);
    const result2 = run(ioEither2);
    
    if (isEitherLeft(result1)) {
      return result1;
    }
    if (isEitherLeft(result2)) {
      return result2;
    }
    return right(combine(result1.right, result2.right));
  };

/**
 * Check if IOEither is a Left (failure)
 */
export const isLeftIOEither = <L, R>(ioEither: IOEither<L, R>): IO<boolean> => 
  () => {
    const result = run(ioEither);
    return isEitherLeft(result);
  };

/**
 * Check if IOEither is a Right (success)
 */
export const isRightIOEither = <L, R>(ioEither: IOEither<L, R>): IO<boolean> => 
  () => {
    const result = run(ioEither);
    return !isEitherLeft(result);
  };
