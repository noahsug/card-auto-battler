export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function cancelableWait(ms: number): [Promise<void>, () => void] {
  let resolve: () => void;
  const promise = new Promise<void>((resolveArg) => {
    resolve = resolveArg;
    setTimeout(resolve, ms);
  });

  const cancel = () => resolve();
  return [promise, cancel];
}
