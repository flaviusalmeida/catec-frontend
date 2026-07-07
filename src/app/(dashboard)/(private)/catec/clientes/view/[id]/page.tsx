import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import ClienteView from '@views/catec/clientes/view'

export const metadata: Metadata = {
  title: 'Detalhe do cliente — CATEC',
  description: 'Cadastro do cliente CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecClienteViewPage = async ({ params }: Props) => {
  const { id } = await params

  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_CLIENTES}>
      <ClienteView id={id} />
    </RequireCatecPermission>
  )
}

export default CatecClienteViewPage
