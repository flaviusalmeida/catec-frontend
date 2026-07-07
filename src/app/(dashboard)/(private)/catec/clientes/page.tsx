import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import ClienteList from '@views/catec/clientes/list'

export const metadata: Metadata = {
  title: 'Clientes — CATEC',
  description: 'Gestão de clientes CATEC'
}

const CatecClientesPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_CLIENTES} title='Clientes'>
      <ClienteList />
    </RequireCatecPermission>
  )
}

export default CatecClientesPage
