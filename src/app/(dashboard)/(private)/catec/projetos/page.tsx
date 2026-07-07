import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import ProjetoList from '@views/catec/projetos/list'

export const metadata: Metadata = {
  title: 'Projetos — CATEC',
  description: 'Gestão de projetos CATEC'
}

const CatecProjetosPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_PROJETOS} title='Projetos'>
      <ProjetoList />
    </RequireCatecPermission>
  )
}

export default CatecProjetosPage
