export class Peekable<T> implements Iterator<T, undefined> {
  private index = 0;
  constructor(private array: T[]) {}
  peek(): T | undefined {
    return this.array[this.index];
  }
  next() {
    const value = this.peek();
    this.index++;
    return value === undefined
      ? { done: true, value: undefined } as const
      : { done: false, value } as const;
  }
}
