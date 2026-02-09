/**
 * Custom RxJS Operators for Discord Events
 * 
 * Reusable operators for common event processing patterns
 */

import { Observable, type OperatorFunction } from "rxjs";
import { filter, map, tap } from "rxjs/operators";

/**
 * Operator: Filter events by predicate
 */
export const where = <T>(
  predicate: (value: T) => boolean
): OperatorFunction<T, T> => 
  filter(predicate);

/**
 * Operator: Map events to new values
 */
export const select = <T, R>(
  selector: (value: T) => R
): OperatorFunction<T, R> => 
  map(selector);

/**
 * Operator: Log events with optional label
 */
export const log = <T>(
  label?: string
): OperatorFunction<T, T> => 
  tap({
    next: (value) => {
      console.log(label ? `[${label}]` : "", value);
    },
  });

/**
 * Operator: Log errors with optional label
 */
export const logError = <T>(
  label?: string
): OperatorFunction<T, T> => 
  tap({
    error: (error) => {
      console.error(label ? `[${label} Error]` : "Error:", error);
    },
  });

/**
 * Operator: Throttle events by key over time window
 */
export const throttleBy = <T, K>(
  keyFn: (value: T) => K,
  windowMs: number
): OperatorFunction<T, T> => {
  const lastEmission = new Map<K, number>();
  
  return filter<T>((value) => {
    const key = keyFn(value);
    const now = Date.now();
    const last = lastEmission.get(key) ?? 0;
    
    if (now - last >= windowMs) {
      lastEmission.set(key, now);
      return true;
    }
    return false;
  });
};

/**
 * Operator: Debounce events by key
 */
export const debounceBy = <T, K>(
  keyFn: (value: T) => K,
  delayMs: number
): OperatorFunction<T, T> => {
  const timeouts = new Map<K, ReturnType<typeof setTimeout>>();
  const pending = new Map<K, T>();
  
  return (source: Observable<T>) => 
    new Observable<T>((subscriber) => {
      const subscription = source.subscribe({
        next: (value) => {
          const key = keyFn(value);
          
          // Clear existing timeout
          const existing = timeouts.get(key);
          if (existing) {
            clearTimeout(existing);
          }
          
          // Store pending value
          pending.set(key, value);
          
          // Set new timeout
          const timeout = setTimeout(() => {
            const pendingValue = pending.get(key);
            if (pendingValue !== undefined) {
              subscriber.next(pendingValue);
              pending.delete(key);
            }
            timeouts.delete(key);
          }, delayMs);
          
          timeouts.set(key, timeout);
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      
      return () => {
        subscription.unsubscribe();
        for (const timeout of timeouts.values()) {
          clearTimeout(timeout);
        }
      };
    });
};

/**
 * Operator: Take only the first N events
 */
export const takeFirst = <T>(n: number): OperatorFunction<T, T> => {
  let count = 0;
  return filter<T>(() => {
    if (count < n) {
      count++;
      return true;
    }
    return false;
  });
};

/**
 * Operator: Skip first N events
 */
export const skipFirst = <T>(n: number): OperatorFunction<T, T> => {
  let count = 0;
  return filter<T>(() => {
    count++;
    return count > n;
  });
};

/**
 * Operator: Distinct events by key
 */
export const distinctByKey = <T, K>(
  keyFn: (value: T) => K
): OperatorFunction<T, T> => {
  const seen = new Set<K>();
  return filter<T>((value) => {
    const key = keyFn(value);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Operator: Buffer events over time
 */
export const bufferTime = <T>(
  windowMs: number
): OperatorFunction<T, T[]> => 
  (source: Observable<T>) => 
    new Observable<T[]>((subscriber) => {
      const buffer: T[] = [];
      
      const subscription = source.subscribe({
        next: (value) => {
          buffer.push(value);
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      
      const interval = setInterval(() => {
        if (buffer.length > 0) {
          subscriber.next([...buffer]);
          buffer.length = 0;
        }
      }, windowMs);
      
      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    });

/**
 * Operator: Accumulate events with reducer
 */
export const reduceEvents = <T, R>(
  reducer: (acc: R, value: T) => R,
  initial: R
): OperatorFunction<T, R> => 
  (source: Observable<T>) => 
    new Observable<R>((subscriber) => {
      let acc = initial;
      
      const subscription = source.subscribe({
        next: (value) => {
          acc = reducer(acc, value);
        },
        error: (err) => subscriber.error(err),
        complete: () => {
          subscriber.next(acc);
          subscriber.complete();
        },
      });
      
      return () => subscription.unsubscribe();
    });

/**
 * Operator: Catch errors and return fallback value
 */
export const catchWithFallback = <T, R>(
  fallback: R,
  _onError?: (error: unknown) => void
): OperatorFunction<T, T | R> => 
  (source: Observable<T>) => 
    new Observable<T | R>((subscriber) => {
      const subscription = source.subscribe({
        next: (value) => subscriber.next(value),
        error: () => {
          subscriber.next(fallback);
        },
        complete: () => subscriber.complete(),
      });
      
      return () => subscription.unsubscribe();
    });
