'use client'

import type { CatecContratoStatus, CatecPropostaStatus } from '@/types/catec/servicoFluxoTypes'
import type { CatecServico } from '@/types/catec/servicoTypes'

import ServicoDetails from './ServicoDetails'

type Props = {
  servico: CatecServico
  propostaStatus?: CatecPropostaStatus | null
  contratoStatus?: CatecContratoStatus | null
  onStatusAlterado?: () => Promise<void>
}

const ServicoLeftOverview = ({ servico, propostaStatus, contratoStatus, onStatusAlterado }: Props) => {
  return (
    <ServicoDetails
      servico={servico}
      propostaStatus={propostaStatus}
      contratoStatus={contratoStatus}
      onStatusAlterado={onStatusAlterado}
    />
  )
}

export default ServicoLeftOverview
