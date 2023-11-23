type Fn = (...args: any) => any;
type WrapFn = (fn: Fn) => any;

function wrap<T extends Fn>(fn: T, wrapFn: WrapFn): T {
  return ((...args: Parameters<typeof fn>) => {
    return wrapFn(fn(args));
  }) as T;
}

export default function wrapFunctions<T extends Record<keyof T, Fn>>(fns: T, wrapFn: WrapFn) {
  const map = {} as T;
  for (const name in fns) {
    let func = fns[name];
    map[name] = wrap(func, wrapFn);
  }
  return map;
}
