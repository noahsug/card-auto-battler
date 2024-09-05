export default function wait(ms: number): Promise<() => void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, ms);
    return () => clearTimeout(timeout);
  });
}
