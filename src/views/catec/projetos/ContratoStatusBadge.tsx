'use client'

import type { CatecContratoStatus } from '@/types/catec/projetoFluxoTypes'
import { STATUS_CONTRATO_ROTULO_BADGE } from '@/types/catec/projetoFluxoTypes'
import { semanticaContratoStatus } from '@/utils/catec/fluxoStatusBadge'

import FluxoStatusChip from './FluxoStatusChip'

type Props = {
  status: CatecContratoStatus
}

const ContratoStatusBadge = ({ status }: Props) => {
  return (
    <FluxoStatusChip
      label={STATUS_CONTRATO_ROTULO_BADGE[status]}
      semantica={semanticaContratoStatus(status)}
    />
  )
}

export default ContratoStatusBadge
