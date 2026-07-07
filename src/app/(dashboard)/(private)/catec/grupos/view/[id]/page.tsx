import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import GrupoView from '@views/catec/grupos/view'

export const metadata: Metadata = {
  title: 'Grupo de acesso — CATEC',
  description: 'Edição de grupo e permissões CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecGrupoViewPage = async ({ params }: Props) => {
  const { id } = await params

  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_GRUPOS}>
      <GrupoView id={id} />
    </RequireCatecPermission>
  )
}

export default CatecGrupoViewPage
