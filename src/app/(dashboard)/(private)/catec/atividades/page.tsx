import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import AtividadesView from '@views/catec/atividades'

export const metadata: Metadata = {
  title: 'Atividades — CATEC',
  description: 'Board Kanban de atividades CATEC'
}

const CatecAtividadesPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_ATIVIDADES} title='Atividades'>
      <AtividadesView />
    </RequireCatecPermission>
  )
}

export default CatecAtividadesPage
