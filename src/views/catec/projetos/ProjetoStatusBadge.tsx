'use client'

import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { STATUS_PROJETO_ROTULO_BADGE } from '@/types/catec/projetoTypes'
import { semanticaProjetoStatus } from '@/utils/catec/fluxoStatusBadge'

import FluxoStatusChip from './FluxoStatusChip'

type Props = {
  status: CatecProjetoStatus
}

const ProjetoStatusBadge = ({ status }: Props) => {
  return (
    <FluxoStatusChip
      label={STATUS_PROJETO_ROTULO_BADGE[status]}
      semantica={semanticaProjetoStatus(status)}
    />
  )
}

export default ProjetoStatusBadge
