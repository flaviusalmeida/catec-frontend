'use client'

import type { ReactNode } from 'react'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { isPermissionAllowed } from '@/utils/catec/hasPermission'

export type CanPermissionProps = {
  children: ReactNode

  /** Exibe `children` se o usuário tiver pelo menos uma destas permissões. */
  anyOf?: readonly string[]

  /** Exibe `children` se o usuário tiver todas estas permissões. */
  allOf?: readonly string[]

  /** Uma única permissão (atalho). */
  code?: string
  fallback?: ReactNode
}

const CanPermission = ({ children, anyOf, allOf, code, fallback = null }: CanPermissionProps) => {
  const { permissoes } = useCatecPermission()

  const allowed = isPermissionAllowed(permissoes, { code, anyOf, allOf })

  return allowed ? <>{children}</> : <>{fallback}</>
}

export default CanPermission
