'use client'

import { useMemo } from 'react'

import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'

import classnames from 'classnames'

import type { CatecAtividade } from '@/types/catec/atividadeTypes'
import { PRIORIDADE_ATIVIDADE_COR, PRIORIDADE_ATIVIDADE_ROTULO } from '@/types/catec/atividadeTypes'

import { useAtividadesStore } from './useAtividadesStore'
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

function formatarPrazoCurto(iso: string): string {
  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return ''

  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const ano = String(d.getFullYear()).slice(-2)

  return `${dia}/${mes}/${ano}`
}

function formatarPrazoTooltip(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function prioridadeIcone(prioridade: CatecAtividade['prioridade']): string {
  if (prioridade === 'ALTA') return 'tabler-chevrons-up'
  if (prioridade === 'BAIXA') return 'tabler-chevrons-down'

  return 'tabler-equal'
}

const AtividadeCard = ({ atividade, onOpen, podeMover }: Props) => {
  const { board } = useAtividadesStore()
  const prazo = atividade.prazoEm ? formatarPrazoCurto(atividade.prazoEm) : null
  const prazoTooltip = atividade.prazoEm ? formatarPrazoTooltip(atividade.prazoEm) : null

  const progresso = useMemo(() => {
    if (atividade.nivel !== 1) return null

    const filhas = board.flatMap(coluna => coluna.atividades).filter(item => item.paiId === atividade.id)

    if (filhas.length === 0) return null

    const concluidas = filhas.filter(f => f.status === 'CONCLUIDA').length
    const percentual = Math.round((concluidas / filhas.length) * 100)

    return { concluidas, total: filhas.length, percentual }
  }, [board, atividade.id, atividade.nivel])

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
          title={atividade.titulo}
          className={`is-full wrap-break-word line-clamp-2 ${styles.cardTitulo}`}
        >
          {atividade.titulo}
        </Typography>

        <div className={styles.cardMetaLinha}>
          <Chip
            variant='tonal'
            size='small'
            label={
              <span className='inline-flex items-center gap-1'>
                <i className={`${prioridadeIcone(atividade.prioridade)} text-sm`} />
                {PRIORIDADE_ATIVIDADE_ROTULO[atividade.prioridade]}
              </span>
            }
            color={PRIORIDADE_ATIVIDADE_COR[atividade.prioridade]}
          />

          {prazo && prazoTooltip ? (
            <Tooltip title={`A ser entregue em ${prazoTooltip}`}>
              <span className={styles.cardPrazo}>
                <i className='tabler-calendar text-base' />
                <Typography variant='caption' color='text.secondary' component='span'>
                  {prazo}
                </Typography>
              </span>
            </Tooltip>
          ) : (
            <span aria-hidden />
          )}
        </div>

        {progresso ? (
          <div
            className={styles.cardProgresso}
            aria-label={`${progresso.percentual}% concluído (${progresso.concluidas}/${progresso.total} subatividades)`}
            title={`${progresso.percentual}% · ${progresso.concluidas}/${progresso.total} subatividades concluídas`}
          >
            <div className={styles.cardProgressoBarra}>
              <div
                className={styles.cardProgressoPreenchimento}
                style={{ width: `${progresso.percentual}%` }}
              />
            </div>
            <span className={styles.cardProgressoTexto}>
              {progresso.percentual}% ({progresso.concluidas}/{progresso.total})
            </span>
          </div>
        ) : null}

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
          ) : (
            <Tooltip title='Não atribuído'>
              <Avatar className={`bs-6 is-6 text-xs ${styles.avatarNaoAtribuido}`}>
                <i className='tabler-user text-sm' />
              </Avatar>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AtividadeCard
