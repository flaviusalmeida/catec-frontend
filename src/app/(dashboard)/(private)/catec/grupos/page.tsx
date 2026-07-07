import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import GrupoList from '@views/catec/grupos/list'

export const metadata: Metadata = {
  title: 'Grupos — CATEC',
  description: 'Gestão de grupos de acesso CATEC'
}

const CatecGruposPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_GRUPOS} title='Grupos'>
      <GrupoList />
    </RequireCatecPermission>
  )
}

export default CatecGruposPage
