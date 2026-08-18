'use client'

import type { CatecPropostaStatus } from '@/types/catec/projetoFluxoTypes'
import type { CatecProjeto } from '@/types/catec/projetoTypes'

import ProjetoDetails from './ProjetoDetails'

type Props = {
  projeto: CatecProjeto
  propostaStatus?: CatecPropostaStatus | null
  onStatusAlterado?: () => Promise<void>
}

const ProjetoLeftOverview = ({ projeto, propostaStatus, onStatusAlterado }: Props) => {
  return <ProjetoDetails projeto={projeto} propostaStatus={propostaStatus} onStatusAlterado={onStatusAlterado} />
}

export default ProjetoLeftOverview
