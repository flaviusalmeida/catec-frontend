// Next Imports
import { redirect } from 'next/navigation'

import type { ChildrenType } from '@core/types'

// Lib Imports
import { getAuthSession } from '@/libs/auth'

// Util Imports
import {
  getCatecDefinirSenhaUrl,
  getCatecHomeUrl,
  getCatecLoginUrl,
  needsTrocaSenha
} from '@/utils/catec/authPaths'

const RequireTrocaSenhaRoute = async ({ children }: ChildrenType) => {
  const session = await getAuthSession()

  if (!session) {
    redirect(getCatecLoginUrl(getCatecDefinirSenhaUrl()))
  }

  if (!needsTrocaSenha(session)) {
    redirect(getCatecHomeUrl())
  }

  return <>{children}</>
}

export default RequireTrocaSenhaRoute
