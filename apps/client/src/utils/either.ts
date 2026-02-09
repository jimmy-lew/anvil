/**
 * Either Monad implementation for error handling
 * Either represents a value that can be either Left (error) or Right (success)
 * Used throughout the codebase for handling failures in a composable way
 */

/**
 * Left constructor - represents a failure or error case
 * Left is the "error" channel in the Either monad
 */
export const left = <L, R>(value: L): Either<L, R> => ({
  _tag: "Left",
  left: value,
});

/**
 * Right constructor - represents a successful value
 * Right is the "success" channel in the Either monad
 */
export const right = <L, R>(value: R): Either<L, R> => ({
  _tag: "Right",
  right: value,
});

/**
 * Either type - a tagged union for handling success/failure
 * Left<L> represents a failure with an error value of type L
 * Right<R> represents a success with a value of type R
 */
export type Either<L, R> = 
  | { readonly _tag: "Left"; readonly left: L }
  | { readonly _tag: "Right"; readonly right: R };

/**
 * Type guard to check if an Either is Right (success)
 */
export const isEitherRight = <L, R>(either: Either<L, R>): either is Right<R> =>
  either._tag === "Right";

/**
 * Type guard to check if an Either is Left (error)
 */
export const isEitherLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
  either._tag === "Left";

/**
 * Shorthand types for common usage
 */
export type Left<L> = { readonly _tag: "Left"; readonly left: L };
export type Right<R> = { readonly _tag: "Right"; readonly right: R };

/**
 * Map over the Right value - transform success value
 * Returns a new Either with the transformed Right value, or Left unchanged
 */
export const mapEither = <L, R, T>(
  either: Either<L, R>,
  f: (value: R) => T
): Either<L, T> => {
  if (isEitherLeft(either)) {
    return either;
  }
  return right(f(either.right));
};

/**
 * Map over the Left value - transform error value
 * Returns a new Either with the transformed Left value, or Right unchanged
 */
export const mapLeft = <L, R, T>(
  either: Either<L, R>,
  f: (value: L) => T
): Either<T, R> => {
  if (isEitherLeft(either)) {
    return left(f(either.left));
  }
  return either;
};

/**
 * FlatMap/Bind - chain operations that return Either
 * If Either is Left, skip the function and return Left
 * If Either is Right, apply the function to the value
 */
export const flatMap = <L, R, T>(
  either: Either<L, R>,
  f: (value: R) => Either<L, T>
): Either<L, T> => {
  if (isEitherLeft(either)) {
    return either;
  }
  return f(either.right);
};

/**
 * Get the value from Either with a default for Left case
 */
export const getOrElse = <L, R>(
  either: Either<L, R>,
  defaultValue: R
): R => {
  if (isEitherLeft(either)) {
    return defaultValue;
  }
  return either.right;
};

/**
 * Fold - pattern match on Either
 * Apply different functions to Left and Right cases
 */
export const fold = <L, R, T>(
  either: Either<L, R>,
  onLeft: (value: L) => T,
  onRight: (value: R) => T
): T => {
  if (isEitherLeft(either)) {
    return onLeft(either.left);
  }
  return onRight(either.right);
};

/**
 * Convert Either to a nullable value (Right → value, Left → null)
 */
export const toNullable = <L, R>(either: Either<L, R>): R | null =>
  isEitherLeft(either) ? null : either.right;

/**
 * Convert Either to an Option (Right → Some, Left → None)
 */
export const toOption = <L, R>(either: Either<L, R>): Option<R> =>
  isEitherLeft(either) ? none : some(either.right);

/**
 * Option type for nullable values
 */
export type Option<T> = 
  | { readonly _tag: "None" }
  | { readonly _tag: "Some"; readonly value: T };

export const none: Option<never> = { _tag: "None" };
export const some = <T>(value: T): Option<T> => ({ _tag: "Some", value });

/**
 * TryCatch - wrap a throwing function in Either
 * Converts exceptions to Left values
 */
export const tryCatch = <R>(
  f: () => R
): Either<Error, R> => {
  try {
    return right(f());
  } catch (error) {
    if (error instanceof Error) {
      return left(error);
    }
    return left(new Error(String(error)));
  }
};

/**
 * Combine multiple Either values
 * Returns first Left encountered, or all Right values as tuple
 */
export const combineEither = <L, R>(
  ...eithers: Either<L, R>[]
): Either<L, R[]> => {
  const results: R[] = [];
  for (const either of eithers) {
    if (isEitherLeft(either)) {
      return either;
    }
    results.push(either.right);
  }
  return right(results);
};

/**
 * Apply a function wrapped in Either to a value wrapped in Either
 * Useful for applicative style programming with Either
 */
export const ap = <L, R, T>(
  eitherF: Either<L, (value: R) => T>,
  eitherR: Either<L, R>
): Either<L, T> => {
  if (isEitherLeft(eitherF)) {
    return eitherF;
  }
  if (isEitherLeft(eitherR)) {
    return eitherR;
  }
  return right(eitherF.right(eitherR.right));
};

/**
 * Create Either from a nullable value
 * Returns Left with provided error if null/undefined, otherwise Right with value
 */
export const fromNullable = <T, L>(
  value: T | null | undefined,
  error: L
): Either<L, NonNullable<T>> => {
  if (value == null) {
    return left(error);
  }
  return right(value as NonNullable<T>);
};

/**
 * Create Either from a boolean condition
 * Useful for validation
 */
export const fromPredicate = <T, L>(
  value: T,
  predicate: (value: T) => boolean,
  error: L
): Either<L, T> => {
  if (predicate(value)) {
    return right(value);
  }
  return left(error);
};
