export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function cancelableWait<T = string>(ms: number) {
  let resolve: (reason: T | undefined) => void;
  const promise = new Promise<T | undefined>((resolveArg) => {
    resolve = resolveArg;
    setTimeout(resolve, ms);
  });

  const cancel = (reason?: T) => {
    resolve(reason);
  };

  return [promise, cancel] as const;
}
