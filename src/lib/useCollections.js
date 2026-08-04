import { useCallback, useEffect, useState } from 'react'

export const MAX_COLLECTIONS = 10
export const MAX_AGENTS_PER_COLLECTION = 15
export const COLLECTIONS_STORAGE_KEY = 'ila_agent_collections'
export const DEFAULT_COLLECTION_ID = 'all-agents'

const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `collection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createDefaultCollection() {
  const now = new Date().toISOString()

  return {
    id: DEFAULT_COLLECTION_ID,
    name: 'All Agents',
    agentIds: [],
    createdAt: now,
    updatedAt: now,
    isDefault: true,
  }
}

function normalizeCollection(collection) {
  if (!collection || typeof collection !== 'object') return null

  const isDefaultCollection =
    collection.id === DEFAULT_COLLECTION_ID || Boolean(collection.isDefault)
  const name = typeof collection.name === 'string' ? collection.name.trim() : ''
  const normalizedName = isDefaultCollection ? 'All Agents' : name

  if (!normalizedName && !isDefaultCollection) return null

  const now = new Date().toISOString()
  const agentIds = Array.isArray(collection.agentIds)
    ? [
        ...new Set(
          collection.agentIds
            .filter((id) => typeof id === 'string' && id.trim())
            .map((id) => id.trim())
        ),
      ].slice(0, MAX_AGENTS_PER_COLLECTION)
    : []

  return {
    id:
      typeof collection.id === 'string' && collection.id.trim()
        ? collection.id.trim()
        : createId(),
    name: normalizedName,
    agentIds,
    createdAt:
      typeof collection.createdAt === 'string' ? collection.createdAt : now,
    updatedAt:
      typeof collection.updatedAt === 'string' ? collection.updatedAt : now,
    isDefault: isDefaultCollection,
  }
}

function buildCollections(collections) {
  const normalized = Array.isArray(collections)
    ? collections.map(normalizeCollection).filter(Boolean)
    : []

  const defaultCollection =
    normalized.find((collection) => collection.id === DEFAULT_COLLECTION_ID) ||
    createDefaultCollection()

  const customCollections = normalized.filter(
    (collection) => collection.id !== DEFAULT_COLLECTION_ID
  )

  const uniqueCollections = [defaultCollection, ...customCollections].filter(
    (collection, index, all) =>
      all.findIndex((item) => item.id === collection.id) === index
  )

  return uniqueCollections.slice(0, MAX_COLLECTIONS + 1)
}

export function loadCollections() {
  if (typeof localStorage === 'undefined') return [createDefaultCollection()]

  try {
    const raw = localStorage.getItem(COLLECTIONS_STORAGE_KEY)
    if (!raw) return [createDefaultCollection()]

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [createDefaultCollection()]

    return buildCollections(parsed)
  } catch {
    return [createDefaultCollection()]
  }
}

export function saveCollections(collections) {
  if (typeof localStorage === 'undefined') return

  const normalized = Array.isArray(collections)
    ? buildCollections(collections)
    : [createDefaultCollection()]

  localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(normalized))
}

function persist(updater) {
  const current = loadCollections()
  const result = updater(current)

  const next = Array.isArray(result.collections)
    ? result.collections
    : current

  saveCollections(next)
  notify()

  return {
    ...result,
    collections: loadCollections(),
  }
}

export function useCollections() {
  const [collections, setCollections] = useState(loadCollections)

  useEffect(() => {
    const sync = () => setCollections(loadCollections())

    listeners.add(sync)

    return () => {
      listeners.delete(sync)
    }
  }, [])

  const runMutation = useCallback((updater) => {
    const result = persist(updater)
    setCollections(result.collections)
    return result
  }, [])

  const createCollection = useCallback(
    (name) => {
      const trimmedName = typeof name === 'string' ? name.trim() : ''

      if (!trimmedName) {
        return { ok: false, error: 'Collection name is required.' }
      }

      return runMutation((current) => {
        const customCollections = current.filter(
          (collection) => collection.id !== DEFAULT_COLLECTION_ID
        )

        if (customCollections.length >= MAX_COLLECTIONS) {
          return {
            ok: false,
            error: `You can create up to ${MAX_COLLECTIONS} collections.`,
          }
        }

        const duplicateName = customCollections.some(
          (collection) =>
            collection.name.toLowerCase() === trimmedName.toLowerCase()
        )

        if (duplicateName) {
          return {
            ok: false,
            error: 'A collection with that name already exists.',
          }
        }

        const now = new Date().toISOString()
        const collection = {
          id: createId(),
          name: trimmedName,
          agentIds: [],
          createdAt: now,
          updatedAt: now,
          isDefault: false,
        }

        return {
          ok: true,
          collection,
          collections: [
            current.find((item) => item.id === DEFAULT_COLLECTION_ID) ||
              createDefaultCollection(),
            collection,
            ...customCollections,
          ],
        }
      })
    },
    [runMutation]
  )

  const deleteCollection = useCallback(
    (collectionId) => {
      if (collectionId === DEFAULT_COLLECTION_ID) {
        return { ok: false, error: 'The default collection cannot be deleted.' }
      }

      return runMutation((current) => {
        const collectionToDelete = current.find((item) => item.id === collectionId)

        if (!collectionToDelete) {
          return { ok: false, error: 'Collection not found.' }
        }

        const defaultCollection = current.find(
          (item) => item.id === DEFAULT_COLLECTION_ID
        ) || createDefaultCollection()
        const now = new Date().toISOString()

        return {
          ok: true,
          collections: current
            .filter((collection) => collection.id !== collectionId)
            .map((collection) =>
              collection.id === DEFAULT_COLLECTION_ID
                ? {
                    ...collection,
                    agentIds: [
                      ...new Set([...collection.agentIds, ...collectionToDelete.agentIds]),
                    ],
                    updatedAt: now,
                  }
                : collection
            )
            .filter((collection, index, all) =>
              all.findIndex((item) => item.id === collection.id) === index
            )
            .map((collection) =>
              collection.id === DEFAULT_COLLECTION_ID
                ? { ...defaultCollection, ...collection, updatedAt: now }
                : collection
            ),
        }
      })
    },
    [runMutation]
  )

  const renameCollection = useCallback(
    (collectionId, name) => {
      const trimmedName = typeof name === 'string' ? name.trim() : ''

      if (!trimmedName) {
        return { ok: false, error: 'Collection name is required.' }
      }

      if (collectionId === DEFAULT_COLLECTION_ID) {
        return { ok: false, error: 'The default collection cannot be renamed.' }
      }

      return runMutation((current) => {
        const customCollections = current.filter(
          (collection) => collection.id !== DEFAULT_COLLECTION_ID
        )
        const duplicateName = customCollections.some(
          (collection) =>
            collection.id !== collectionId &&
            collection.name.toLowerCase() === trimmedName.toLowerCase()
        )

        if (duplicateName) {
          return {
            ok: false,
            error: 'A collection with that name already exists.',
          }
        }

        return {
          ok: true,
          collections: current.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  name: trimmedName,
                  updatedAt: new Date().toISOString(),
                }
              : collection
          ),
        }
      })
    },
    [runMutation]
  )

  const addAgentToCollection = useCallback(
    (collectionId, agentId) => {
      if (!collectionId || !agentId) {
        return { ok: false, error: 'Collection and agent are required.' }
      }

      const normalizedAgentId = typeof agentId === 'string' ? agentId.trim() : ''

      if (!normalizedAgentId) {
        return { ok: false, error: 'Agent is required.' }
      }

      return runMutation((current) => {
        const collection = current.find((item) => item.id === collectionId)

        if (!collection) {
          return { ok: false, error: 'Collection not found.' }
        }

        if (collection.agentIds.includes(normalizedAgentId)) {
          return {
            ok: false,
            error: 'This agent is already in that collection.',
          }
        }

        if (collection.agentIds.length >= MAX_AGENTS_PER_COLLECTION) {
          return {
            ok: false,
            error: `Collections can contain up to ${MAX_AGENTS_PER_COLLECTION} agents.`,
          }
        }

        const now = new Date().toISOString()

        return {
          ok: true,
          collections: current.map((item) => {
            if (item.id === collectionId) {
              return {
                ...item,
                agentIds: [...new Set([...item.agentIds, normalizedAgentId])],
                updatedAt: now,
              }
            }

            if (item.agentIds.includes(normalizedAgentId)) {
              return {
                ...item,
                agentIds: item.agentIds.filter((id) => id !== normalizedAgentId),
                updatedAt: now,
              }
            }

            return item
          }),
        }
      })
    },
    [runMutation]
  )

  const removeAgentFromCollection = useCallback(
    (collectionId, agentId) => {
      if (!collectionId || !agentId) {
        return { ok: false, error: 'Collection and agent are required.' }
      }

      return runMutation((current) => ({
        ok: true,
        collections: current.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                agentIds: collection.agentIds.filter((id) => id !== agentId),
                updatedAt: new Date().toISOString(),
              }
            : collection
        ),
      }))
    },
    [runMutation]
  )

  const moveAgentToCollection = useCallback(
    (agentId, collectionId) => {
      if (!collectionId || !agentId) {
        return { ok: false, error: 'Collection and agent are required.' }
      }

      return addAgentToCollection(collectionId, agentId)
    },
    [addAgentToCollection]
  )

  const getCollectionById = useCallback(
    (collectionId) =>
      collections.find((collection) => collection.id === collectionId),
    [collections]
  )

  const getAgentCollectionId = useCallback(
    (agentId) => {
      const normalizedAgentId = typeof agentId === 'string' ? agentId.trim() : ''

      if (!normalizedAgentId) return DEFAULT_COLLECTION_ID

      const collection = collections.find(
        (item) => item.id !== DEFAULT_COLLECTION_ID && item.agentIds.includes(normalizedAgentId)
      )

      return collection ? collection.id : DEFAULT_COLLECTION_ID
    },
    [collections]
  )

  const isAgentInCollection = useCallback(
    (collectionId, agentId) =>
      Boolean(getCollectionById(collectionId)?.agentIds.includes(agentId)),
    [getCollectionById]
  )

  return {
    collections,
    createCollection,
    deleteCollection,
    renameCollection,
    addAgentToCollection,
    removeAgentFromCollection,
    moveAgentToCollection,
    getCollectionById,
    getAgentCollectionId,
    isAgentInCollection,
  }
}