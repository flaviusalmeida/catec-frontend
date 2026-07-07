'use client'

import type { CatecProjeto } from '@/types/catec/projetoTypes'

import ProjetoDetails from './ProjetoDetails'

type Props = {
  projeto: CatecProjeto
  onStatusAlterado?: () => Promise<void>
}

const ProjetoLeftOverview = ({ projeto, onStatusAlterado }: Props) => {
  return <ProjetoDetails projeto={projeto} onStatusAlterado={onStatusAlterado} />
}

export default ProjetoLeftOverview
