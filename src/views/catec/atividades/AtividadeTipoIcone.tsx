'use client'

import Tooltip from '@mui/material/Tooltip'
import classnames from 'classnames'

import type { CatecAtividadeTipo } from '@/types/catec/atividadeTypes'
import { TIPO_ATIVIDADE_ROTULO } from '@/types/catec/atividadeTypes'

import styles from './styles.module.css'

type Props = {
  tipo: CatecAtividadeTipo
  className?: string

  /** Se false, não envolve com Tooltip (útil quando o pai já tem title). */
  comTooltip?: boolean
}

/** Ícones no padrão Jira: raio = Etapa, check no quadrado = Atividade, dois quadrados = Subatividade. */
function SvgTipo({ tipo }: { tipo: CatecAtividadeTipo }) {
  switch (tipo) {
    case 'ETAPA':
      return (
        <svg viewBox='0 0 16 16' width='1em' height='1em' aria-hidden className={styles.tipoIconeSvg}>
          <path
            fill='currentColor'
            d='M8.95 1.35 3.4 9.1h3.35l-.95 5.55 6.05-8.35H8.4l.55-4.95Z'
          />
        </svg>
      )
    case 'ATIVIDADE':
      return (
        <svg viewBox='0 0 16 16' width='1em' height='1em' aria-hidden className={styles.tipoIconeSvg}>
          <rect x='1.5' y='1.5' width='13' height='13' rx='2.25' fill='currentColor' />
          <path
            fill='#fff'
            d='M6.85 11.05 3.9 8.1l1.05-1.05 1.9 1.9 4.2-4.2 1.05 1.05-5.25 5.25Z'
          />
        </svg>
      )
    case 'SUBATIVIDADE':
      return (
        <svg viewBox='0 0 16 16' width='1em' height='1em' aria-hidden className={styles.tipoIconeSvg}>
          <rect
            x='1.75'
            y='1.75'
            width='7'
            height='7'
            rx='1.25'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
          />
          <rect
            x='7.25'
            y='7.25'
            width='7'
            height='7'
            rx='1.25'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
          />
        </svg>
      )
  }
}

const TIPO_ICONE_CLASSE: Record<CatecAtividadeTipo, string> = {
  ETAPA: styles.tipoIconeEtapa,
  ATIVIDADE: styles.tipoIconeAtividade,
  SUBATIVIDADE: styles.tipoIconeSubatividade
}

const AtividadeTipoIcone = ({ tipo, className, comTooltip = true }: Props) => {
  const icone = (
    <span className={classnames(styles.tipoIcone, TIPO_ICONE_CLASSE[tipo], className)} aria-hidden>
      <SvgTipo tipo={tipo} />
    </span>
  )

  if (!comTooltip) return icone

  return (
    <Tooltip title={TIPO_ATIVIDADE_ROTULO[tipo]}>
      <span className={styles.tipoIconeWrap}>{icone}</span>
    </Tooltip>
  )
}

export default AtividadeTipoIcone
