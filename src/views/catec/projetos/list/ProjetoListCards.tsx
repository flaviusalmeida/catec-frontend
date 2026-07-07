'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'

import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

import type { CatecProjeto, CatecProjetoResumo, CatecProjetoResumoCardStatus } from '@/types/catec/projetoTypes'

import { formatVariacaoPercentual, trendFromVariacao } from '@/utils/catec/resumoFormatters'

type Props = {
  lista: CatecProjeto[]
  resumo: CatecProjetoResumo | null
}

type CardDef = {
  status: CatecProjetoResumoCardStatus
  title: string
  avatarIcon: string
  avatarColor: UserDataType['avatarColor']
  subtitle: string
}

const CARD_DEFS: CardDef[] = [
  {
    status: 'ELABORANDO_PROPOSTA',
    title: 'Rev. proposta',
    avatarIcon: 'tabler-file-pencil',
    avatarColor: 'info',
    subtitle: 'Comparativo com 30 dias atrás'
  },
  {
    status: 'AGUARDANDO_ACEITE_PROPOSTA',
    title: 'Aguard. cliente',
    avatarIcon: 'tabler-user-check',
    avatarColor: 'warning',
    subtitle: 'Comparativo com 30 dias atrás'
  },
  {
    status: 'AGUARDANDO_EXECUCAO',
    title: 'Aguard. execução',
    avatarIcon: 'tabler-hourglass',
    avatarColor: 'primary',
    subtitle: 'Comparativo com 30 dias atrás'
  },
  {
    status: 'EM_EXECUCAO',
    title: 'Em execução',
    avatarIcon: 'tabler-player-play',
    avatarColor: 'success',
    subtitle: 'Comparativo com 30 dias atrás'
  }
]

const ProjetoListCards = ({ lista, resumo }: Props) => {
  const data = useMemo<UserDataType[]>(() => {
    return CARD_DEFS.map(def => {
      const cardResumo = resumo?.cards.find(c => c.status === def.status)
      const totalFallback = lista.filter(p => p.status === def.status).length
      const total = cardResumo?.total ?? totalFallback
      const variacao = cardResumo?.variacaoPercentual

      return {
        title: def.title,
        stats: String(total),
        avatarIcon: def.avatarIcon,
        avatarColor: def.avatarColor,
        trend: variacao == null ? 'positive' : trendFromVariacao(variacao),
        trendNumber: variacao == null ? '—' : formatVariacaoPercentual(variacao),
        subtitle: def.subtitle
      }
    })
  }, [lista, resumo])

  return (
    <Grid container spacing={6}>
      {data.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default ProjetoListCards
