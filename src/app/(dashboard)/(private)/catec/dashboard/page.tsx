import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import PainelView from '@views/catec/painel'

export const metadata: Metadata = {
  title: 'Dashboard — CATEC',
  description: 'Dashboard CATEC'
}

const CatecDashboardPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_PAINEL} title='Dashboard'>
      <PainelView />
    </RequireCatecPermission>
  )
}

export default CatecDashboardPage
