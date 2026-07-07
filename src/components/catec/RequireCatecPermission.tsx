'use client'

import type { ReactNode } from 'react'

import CircularProgress from '@mui/material/CircularProgress'

import CatecAccessDenied from '@/components/catec/CatecAccessDenied'
import { useCatecPermission } from '@/hooks/useCatecPermission'
import { isPermissionAllowed } from '@/utils/catec/hasPermission'

export type RequireCatecPermissionProps = {
  children: ReactNode
  anyOf?: readonly string[]
  allOf?: readonly string[]
  code?: string
  title?: string
  message?: string
}

const RequireCatecPermission = ({
  children,
  anyOf,
  allOf,
  code,
  title,
  message
}: RequireCatecPermissionProps) => {
  const { permissoes, status } = useCatecPermission()

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center p-12'>
        <CircularProgress />
      </div>
    )
  }

  const allowed = isPermissionAllowed(permissoes, { code, anyOf, allOf })

  if (!allowed) {
    return <CatecAccessDenied title={title} message={message} />
  }

  return <>{children}</>
}

export default RequireCatecPermission
