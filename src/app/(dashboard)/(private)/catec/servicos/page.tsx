import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import ServicoList from '@views/catec/servicos/list'

export const metadata: Metadata = {
  title: 'Serviços — CATEC',
  description: 'Gestão de serviços CATEC'
}

const CatecServicosPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_SERVICOS} title='Serviços'>
      <ServicoList />
    </RequireCatecPermission>
  )
}

export default CatecServicosPage
