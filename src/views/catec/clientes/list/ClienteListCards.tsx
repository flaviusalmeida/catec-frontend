'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'

import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

import type { CatecCliente, CatecClienteResumo, CatecClienteResumoCardTipo } from '@/types/catec/clienteTypes'
import { formatVariacaoPercentual, trendFromVariacao } from '@/utils/catec/resumoFormatters'

type Props = {
  lista: CatecCliente[]
  resumo: CatecClienteResumo | null
}

type CardDef = {
  tipo: CatecClienteResumoCardTipo
  title: string
  avatarIcon: string
  avatarColor: UserDataType['avatarColor']
  subtitle: string
  fallbackCount: (lista: CatecCliente[]) => number
}

const CARD_DEFS: CardDef[] = [
  {
    tipo: 'TOTAL',
    title: 'Total',
    avatarIcon: 'tabler-building',
    avatarColor: 'primary',
    subtitle: 'Comparativo com o início do trimestre',
    fallbackCount: lista => lista.length
  },
  {
    tipo: 'PF',
    title: 'Pessoa Física',
    avatarIcon: 'tabler-user',
    avatarColor: 'info',
    subtitle: 'Comparativo com o início do trimestre',
    fallbackCount: lista => lista.filter(c => c.tipoPessoa === 'PF').length
  },
  {
    tipo: 'PJ',
    title: 'Pessoa Jurídica',
    avatarIcon: 'tabler-building-skyscraper',
    avatarColor: 'success',
    subtitle: 'Comparativo com o início do trimestre',
    fallbackCount: lista => lista.filter(c => c.tipoPessoa === 'PJ').length
  },
  {
    tipo: 'COM_RESPONSAVEL',
    title: 'Com responsável',
    avatarIcon: 'tabler-user-check',
    avatarColor: 'warning',
    subtitle: 'Comparativo com o início do trimestre',
    fallbackCount: lista => lista.filter(c => c.responsaveis.length > 0).length
  }
]

const ClienteListCards = ({ lista, resumo }: Props) => {
  const data = useMemo<UserDataType[]>(() => {
    return CARD_DEFS.map(def => {
      const cardResumo = resumo?.cards.find(c => c.tipo === def.tipo)
      const total = cardResumo?.total ?? def.fallbackCount(lista)
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

export default ClienteListCards
