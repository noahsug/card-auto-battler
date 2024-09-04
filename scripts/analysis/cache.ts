import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const CACHE_DISK_LOCATION = '/tmp/card-auto-battler/cache';

export function hashValues({
  files = [],
  values = [],
}: {
  files?: string[];
  values?: (string | number)[];
}) {
  const fileChunks = files.map((file) => fs.readFileSync(file));
  const valueChunks = values.map((value) => String(value));
  return [...fileChunks, ...valueChunks]
    .reduce((hash, value) => hash.update('\0', 'utf8').update(value), crypto.createHash('md5'))
    .digest('hex');
}

export function getCachedFn<T extends (...args: any[]) => any>(
  fn: T,
  { getCacheKey, name }: { getCacheKey: (...args: Parameters<T>) => string; name: string },
) {
  const cache = getCache<ReturnType<T>>(name);

  return (...args: Parameters<T>) => {
    const key = getCacheKey(...args);

    if (!cache.has(key)) {
      const result = fn(...args);
      cache.set(key, result);
    }

    return cache.get(key)!;
  };
}

function getCache<R>(name: string) {
  const diskPath = path.join(CACHE_DISK_LOCATION, name);
  fs.mkdirSync(path.dirname(diskPath), { recursive: true });

  const cachedData = readDataFromDisk();

  function set(key: string, data: R) {
    cachedData.set(key, data);
    writeDataToDisk();
  }

  function get(key: string) {
    return cachedData.get(key);
  }

  function has(key: string) {
    return cachedData.has(key);
  }

  function readDataFromDisk() {
    if (!fs.existsSync(diskPath)) return new Map<string, R>();

    const serializedData = fs.readFileSync(diskPath, 'utf8');
    const entries = JSON.parse(serializedData);
    return new Map<string, R>(entries);
  }

  function writeDataToDisk() {
    const serializedData = JSON.stringify([...cachedData.entries()]);
    fs.writeFileSync(diskPath, serializedData, 'utf8');
  }

  return { set, get, has };
}
