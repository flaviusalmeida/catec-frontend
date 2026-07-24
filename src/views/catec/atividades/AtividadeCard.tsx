'use client'

import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'

import classnames from 'classnames'

import type { CatecAtividade } from '@/types/catec/atividadeTypes'
import { PRIORIDADE_ATIVIDADE_COR, PRIORIDADE_ATIVIDADE_ROTULO } from '@/types/catec/atividadeTypes'

import styles from './styles.module.css'

type Props = {
  atividade: CatecAtividade
  onOpen: (atividade: CatecAtividade) => void
  podeMover: boolean
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) return '?'

  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function formatarPrazo(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const AtividadeCard = ({ atividade, onOpen, podeMover }: Props) => {
  const prazo = atividade.prazoEm ? formatarPrazo(atividade.prazoEm) : null

  return (
    <Card
      className={classnames(
        'overflow-visible z-0',
        styles.card,
        podeMover ? 'item-draggable cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      )}
      onClick={() => onOpen(atividade)}
    >
      <CardContent className='flex flex-col gap-y-2 items-start relative overflow-hidden !p-3'>
        <Typography variant='body2' color='text.secondary' className='leading-none max-is-full truncate'>
          {atividade.projetoTitulo}
        </Typography>

        <Typography
          color='text.primary'
          title={atividade.titulo}
          className='is-full wrap-break-word font-medium line-clamp-2'
        >
          {atividade.titulo}
        </Typography>

        {prazo ? (
          <Tooltip title={`A ser entregue em ${prazo}`}>
            <span
              className={classnames(
                'inline-flex items-center gap-1.5 rounded border border-solid px-2 py-0.5',
                'border-divider text-textSecondary'
              )}
            >
              <i className='tabler-calendar text-base' />
              <Typography variant='caption' color='text.secondary' component='span'>
                {prazo}
              </Typography>
            </span>
          </Tooltip>
        ) : null}

        <div className='flex flex-wrap items-center gap-2 is-full'>
          <Chip
            variant='tonal'
            size='small'
            label={PRIORIDADE_ATIVIDADE_ROTULO[atividade.prioridade]}
            color={PRIORIDADE_ATIVIDADE_COR[atividade.prioridade]}
          />
        </div>

        <div className='flex justify-between items-center gap-2 is-full'>
          <Typography variant='caption' color='text.secondary' className='font-medium leading-none'>
            {atividade.codigo}
          </Typography>

          {atividade.responsavelNome ? (
            <Tooltip title={atividade.responsavelNome}>
              <Avatar className={`bs-6 is-6 text-xs ${styles.avatarUsuario}`}>
                {iniciais(atividade.responsavelNome)}
              </Avatar>
            </Tooltip>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export default AtividadeCard
