export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function cancelableWait(ms: number) {
  let resolve: () => void;
  const promise = new Promise<void>((resolveArg) => {
    resolve = resolveArg;
    setTimeout(resolve, ms);
  });

  let isCanceled = false;
  const cancel = () => {
    resolve();
    isCanceled = true;
  };

  function getIsCanceled() {
    return isCanceled;
  }

  return [promise, cancel, getIsCanceled] as const;
}
