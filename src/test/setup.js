import '@testing-library/jest-dom'

if (typeof globalThis.localStorage === 'undefined') {
  class MemoryStorage {
    #items = new Map()

    get length() {
      return this.#items.size
    }

    clear() {
      this.#items.clear()
    }

    getItem(key) {
      return this.#items.get(String(key)) ?? null
    }

    key(index) {
      return [...this.#items.keys()][index] ?? null
    }

    removeItem(key) {
      this.#items.delete(String(key))
    }

    setItem(key, value) {
      this.#items.set(String(key), String(value))
    }
  }

  const storage = new MemoryStorage()
  Object.defineProperty(globalThis, 'Storage', { configurable: true, value: MemoryStorage })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: storage,
  })
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { configurable: true, value: storage })
  }
}
