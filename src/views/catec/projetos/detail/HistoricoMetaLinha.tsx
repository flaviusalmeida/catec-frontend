'use client'

import Typography from '@mui/material/Typography'

import type { CatecHistoricoFluxoItem, CatecProposta } from '@/types/catec/projetoFluxoTypes'

import {
  iconeEntidadeHistorico,
  metaHistoricoComEntidade,
  tipoEntidadeHistorico
} from '../historicoFluxoHelpers'

type Props = {
  item: CatecHistoricoFluxoItem
  propostas: CatecProposta[]
}

const HistoricoMetaLinha = ({ item, propostas }: Props) => {
  const tipo = tipoEntidadeHistorico(item)
  const icone = iconeEntidadeHistorico(tipo)
  const texto = metaHistoricoComEntidade(item, propostas)

  return (
    <Typography
      component='div'
      className='flex flex-wrap items-center gap-1 mbe-1 text-xs font-normal text-textSecondary'
    >
      <i className={`${icone} shrink-0 text-[13px] opacity-80`} aria-hidden />
      <span>{texto}</span>
    </Typography>
  )
}

export default HistoricoMetaLinha
