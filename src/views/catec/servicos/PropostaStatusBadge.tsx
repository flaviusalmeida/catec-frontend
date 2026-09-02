'use client'

import type { CatecPropostaStatus } from '@/types/catec/servicoFluxoTypes'
import { STATUS_PROPOSTA_ROTULO_BADGE } from '@/types/catec/servicoFluxoTypes'
import { semanticaPropostaStatus } from '@/utils/catec/fluxoStatusBadge'

import FluxoStatusChip from './FluxoStatusChip'

type Props = {
  status: CatecPropostaStatus
}

const PropostaStatusBadge = ({ status }: Props) => {
  return (
    <FluxoStatusChip
      label={STATUS_PROPOSTA_ROTULO_BADGE[status]}
      semantica={semanticaPropostaStatus(status)}
    />
  )
}

export default PropostaStatusBadge
