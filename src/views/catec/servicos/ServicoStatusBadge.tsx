'use client'

import type { CatecServicoStatus } from '@/types/catec/servicoTypes'
import { STATUS_SERVICO_ROTULO_BADGE } from '@/types/catec/servicoTypes'
import { semanticaServicoStatus } from '@/utils/catec/fluxoStatusBadge'

import FluxoStatusChip from './FluxoStatusChip'

type Props = {
  status: CatecServicoStatus
}

const ServicoStatusBadge = ({ status }: Props) => {
  return (
    <FluxoStatusChip
      label={STATUS_SERVICO_ROTULO_BADGE[status]}
      semantica={semanticaServicoStatus(status)}
    />
  )
}

export default ServicoStatusBadge
