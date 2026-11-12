
type CacheEntry<T> = {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 10 * 60 * 1000
): Promise<T> {
  // Check browser memory first
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined

  if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
    return memoryEntry.data
  }

  // Check localStorage
  try {
    const stored = localStorage.getItem(`gong-cache-${key}`)

    if (stored) {
      const entry = JSON.parse(stored) as CacheEntry<T>

      if (entry.expiresAt > Date.now()) {
        memoryCache.set(key, entry)
        return entry.data
      }

      localStorage.removeItem(`gong-cache-${key}`)
    }
  } catch {
    // Continue to database if browser storage is unavailable
  }

  // Fetch fresh data
  const data = await fetcher()

  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttl,
  }

  memoryCache.set(key, entry)

  try {
    localStorage.setItem(`gong-cache-${key}`, JSON.stringify(entry))
  } catch {
    // Memory caching still works if storage is full
  }

  return data
}

export function invalidateCache(key: string) {
  memoryCache.delete(key)

  try {
    localStorage.removeItem(`gong-cache-${key}`)
  } catch {
    // Ignore storage errors
  }
}

export function clearGongCache() {
  memoryCache.clear()

  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("gong-cache-"))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // Ignore storage errors
  }
}
