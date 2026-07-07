'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { catecNavItems } from '@/data/catecNavData'
import { hasPermission } from '@/utils/catec/hasPermission'

const STORAGE_KEY = 'catec-shortcuts-v1'

function readStoredIds(): string[] | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return null
    }

    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return null
  }
}

function resolveSelectedIds(availableIds: string[]): string[] {
  const stored = readStoredIds()

  if (stored === null) {
    return availableIds
  }

  return stored.filter(id => availableIds.includes(id))
}

export function useCatecShortcuts(permissoes: readonly string[]) {
  const availableItems = useMemo(
    () => catecNavItems.filter(item => !item.permission || hasPermission(permissoes, item.permission)),
    [permissoes]
  )

  const availableIds = useMemo(() => availableItems.map(item => item.id), [availableItems])

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    setSelectedIds(resolveSelectedIds(availableIds))
  }, [availableIds])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds))
  }, [selectedIds])

  const shortcuts = useMemo(
    () => availableItems.filter(item => selectedIds.includes(item.id)),
    [availableItems, selectedIds]
  )

  const toggleShortcut = useCallback(
    (id: string) => {
      if (!availableIds.includes(id)) {
        return
      }

      setSelectedIds(prev => (prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]))
    },
    [availableIds]
  )

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds])

  return {
    shortcuts,
    availableItems,
    toggleShortcut,
    isSelected
  }
}
