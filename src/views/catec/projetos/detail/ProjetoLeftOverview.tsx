'use client'

import type { CatecContratoStatus, CatecPropostaStatus } from '@/types/catec/projetoFluxoTypes'
import type { CatecProjeto } from '@/types/catec/projetoTypes'

import ProjetoDetails from './ProjetoDetails'

type Props = {
  projeto: CatecProjeto
  propostaStatus?: CatecPropostaStatus | null
  contratoStatus?: CatecContratoStatus | null
  onStatusAlterado?: () => Promise<void>
}

const ProjetoLeftOverview = ({ projeto, propostaStatus, contratoStatus, onStatusAlterado }: Props) => {
  return (
    <ProjetoDetails
      projeto={projeto}
      propostaStatus={propostaStatus}
      contratoStatus={contratoStatus}
      onStatusAlterado={onStatusAlterado}
    />
  )
}

export default ProjetoLeftOverview
