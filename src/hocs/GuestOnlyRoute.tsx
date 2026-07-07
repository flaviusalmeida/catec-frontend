// Next Imports
import { redirect } from 'next/navigation'

// Type Imports
import type { ChildrenType } from '@core/types'

// Lib Imports
import { getAuthSession } from '@/libs/auth'

// Util Imports
import { getPostAuthDestination } from '@/utils/catec/authPaths'

const GuestOnlyRoute = async ({ children }: ChildrenType) => {
  const session = await getAuthSession()

  if (session) {
    redirect(getPostAuthDestination(session))
  }

  return <>{children}</>
}

export default GuestOnlyRoute
