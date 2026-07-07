// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

// Lib Imports
import { getAuthSession } from '@/libs/auth'

// Util Imports
import { getCatecDefinirSenhaUrl, needsTrocaSenha } from '@/utils/catec/authPaths'

export default async function AuthGuard({ children }: ChildrenType) {
  const session = await getAuthSession()

  if (!session) {
    return <AuthRedirect />
  }

  if (needsTrocaSenha(session)) {
    redirect(getCatecDefinirSenhaUrl())
  }

  return <>{children}</>
}
