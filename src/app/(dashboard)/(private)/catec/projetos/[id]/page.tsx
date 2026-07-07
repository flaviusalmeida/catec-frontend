import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import ProjetoDetalhe from '@views/catec/projetos/detail'

export const metadata: Metadata = {
  title: 'Detalhe do projeto — CATEC',
  description: 'Fluxo comercial e execução do projeto CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecProjetoDetalhePage = async ({ params }: Props) => {
  const { id } = await params

  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_PROJETO_DETALHE}>
      <ProjetoDetalhe id={id} />
    </RequireCatecPermission>
  )
}

export default CatecProjetoDetalhePage
