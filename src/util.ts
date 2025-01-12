export interface Logger {
  log(message?: string, ...args: unknown[]): void
  warn(input: Error | string): Error | string
}

export class NullLogger implements Logger {
  log(_message?: string, ..._args: unknown[]): void {
    // do nothing
  }

  warn(_input: Error | string): Error | string {
    return ''
  }
}

export function maxBy<T>(collection: T[], iteratee: (item: T) => number): T | undefined {
  const max = Math.max(...collection.map((item) => iteratee(item)))
  return collection.find((item) => iteratee(item) === max)
}

export function minBy<T>(collection: T[], iteratee: (item: T) => number): T | undefined {
  const min = Math.min(...collection.map((item) => iteratee(item)))
  return collection.find((item) => iteratee(item) === min)
}
