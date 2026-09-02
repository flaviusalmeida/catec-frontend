import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import ServicoDetalhe from '@views/catec/servicos/detail'

export const metadata: Metadata = {
  title: 'Detalhe do serviço — CATEC',
  description: 'Fluxo comercial e execução do serviço CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecServicoDetalhePage = async ({ params }: Props) => {
  const { id } = await params

  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_SERVICO_DETALHE}>
      <ServicoDetalhe id={id} />
    </RequireCatecPermission>
  )
}

export default CatecServicoDetalhePage
