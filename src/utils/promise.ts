export function getResolvablePromise<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => {};
  const promise = new Promise<T>((resolveArg) => {
    resolve = resolveArg;
  });

  return { promise, resolve };
}
