'use client'

import type { CatecContratoStatus, CatecHistoricoFluxoItem, CatecPropostaStatus } from '@/types/catec/servicoFluxoTypes'
import { STATUS_CONTRATO_ROTULO_BADGE, STATUS_PROPOSTA_ROTULO_BADGE } from '@/types/catec/servicoFluxoTypes'
import type { CatecServicoStatus } from '@/types/catec/servicoTypes'
import { STATUS_SERVICO_ROTULO_BADGE } from '@/types/catec/servicoTypes'

import ContratoStatusBadge from '../ContratoStatusBadge'
import { historicoTemTransicaoStatus, statusHistoricoParaExibicao } from '../historicoFluxoHelpers'
import ServicoStatusBadge from '../ServicoStatusBadge'
import PropostaStatusBadge from '../PropostaStatusBadge'

type Props = {
  item: CatecHistoricoFluxoItem
}

function renderBadge(item: CatecHistoricoFluxoItem, status: string, papel: 'anterior' | 'novo') {
  const ent = item.tipoEntidade.toUpperCase()
  const normalizado = statusHistoricoParaExibicao(item, status, papel)

  if (ent === 'SERVICO' && normalizado in STATUS_SERVICO_ROTULO_BADGE) {
    return <ServicoStatusBadge status={normalizado as CatecServicoStatus} />
  }

  if (ent === 'PROPOSTA' && normalizado in STATUS_PROPOSTA_ROTULO_BADGE) {
    return <PropostaStatusBadge status={normalizado as CatecPropostaStatus} />
  }

  if (ent === 'CONTRATO' && normalizado in STATUS_CONTRATO_ROTULO_BADGE) {
    return <ContratoStatusBadge status={normalizado as CatecContratoStatus} />
  }

  return null
}

const HistoricoStatusTransicao = ({ item }: Props) => {
  if (!historicoTemTransicaoStatus(item)) return null

  const hasAnterior = Boolean(item.statusAnterior)
  const hasNovo = Boolean(item.statusNovo)

  return (
    <div className='mts-2 flex flex-wrap items-center gap-2'>
      {hasAnterior && item.statusAnterior ? renderBadge(item, item.statusAnterior, 'anterior') : null}
      {hasAnterior && hasNovo ? (
        <i className='tabler-arrow-right text-base text-textSecondary' aria-hidden />
      ) : null}
      {hasNovo && item.statusNovo ? renderBadge(item, item.statusNovo, 'novo') : null}
    </div>
  )
}

export default HistoricoStatusTransicao
