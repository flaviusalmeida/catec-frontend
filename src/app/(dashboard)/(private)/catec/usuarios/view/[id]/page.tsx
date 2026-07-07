import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import Usuario2View from '@views/catec/usuarios/view'

export const metadata: Metadata = {
  title: 'Perfil do usuário — CATEC',
  description: 'Detalhe do usuário CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecUsuarioViewPage = async ({ params }: Props) => {
  const { id } = await params

  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_USUARIOS}>
      <Usuario2View id={id} />
    </RequireCatecPermission>
  )
}

export default CatecUsuarioViewPage
