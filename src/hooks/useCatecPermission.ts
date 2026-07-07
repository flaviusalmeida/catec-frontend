'use client'

import { useCallback, useMemo } from 'react'

import { useSession } from 'next-auth/react'

import { hasAllPermissions, hasAnyPermission, hasPermission } from '@/utils/catec/hasPermission'

/** Permissões do usuário autenticado (sessão NextAuth / GET /api/v1/me). */
export function useCatecPermission() {
  const { data: session, status } = useSession()

  const permissoes = useMemo(() => session?.user?.permissoes ?? [], [session?.user?.permissoes])
  const grupos = useMemo(() => session?.user?.grupos ?? [], [session?.user?.grupos])

  const hasPermissionFn = useCallback((codigo: string) => hasPermission(permissoes, codigo), [permissoes])

  const hasAnyPermissionFn = useCallback(
    (codigos: readonly string[]) => hasAnyPermission(permissoes, codigos),
    [permissoes]
  )

  const hasAllPermissionsFn = useCallback(
    (codigos: readonly string[]) => hasAllPermissions(permissoes, codigos),
    [permissoes]
  )

  return {
    session,
    status,
    permissoes,
    grupos,
    hasPermission: hasPermissionFn,
    hasAnyPermission: hasAnyPermissionFn,
    hasAllPermissions: hasAllPermissionsFn
  }
}
