import type { ChildrenType } from '@core/types'

import RequireTrocaSenhaRoute from '@/hocs/RequireTrocaSenhaRoute'

const Layout = async (props: ChildrenType) => {
  const { children } = props

  return <RequireTrocaSenhaRoute>{children}</RequireTrocaSenhaRoute>
}

export default Layout
