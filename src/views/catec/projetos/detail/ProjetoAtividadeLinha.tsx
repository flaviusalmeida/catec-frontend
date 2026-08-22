'use client'

import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import type { CatecAtividade, CatecAtividadePrioridade } from '@/types/catec/atividadeTypes'
import {
  PRIORIDADE_ATIVIDADE_ROTULO,
  STATUS_ATIVIDADE_COR,
  STATUS_ATIVIDADE_ROTULO
} from '@/types/catec/atividadeTypes'

import AtividadeTipoIcone from '@/views/catec/atividades/AtividadeTipoIcone'
import drawerStyles from '@/views/catec/atividades/styles.module.css'

import styles from './projetoAtividades.module.css'

export type ProjetoAtividadeLinhaVariant = 'etapa' | 'atividade' | 'subatividade'

type Props = {
  atividade: CatecAtividade
  variant: ProjetoAtividadeLinhaVariant
  expansivel?: boolean
  aberta?: boolean
  onToggle?: () => void
  metaFilhos?: string | null
  onAbrir: () => void
}

function formatarPrazo(iso: string | null): string {
  if (!iso) return '—'

  return new Date(iso).toLocaleDateString('pt-BR')
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) return '?'

  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function prioridadeIcone(prioridade: CatecAtividadePrioridade): string {
  if (prioridade === 'ALTA') return 'tabler-chevrons-up'
  if (prioridade === 'BAIXA') return 'tabler-chevrons-down'

  return 'tabler-equal'
}

function prioridadeCorClass(prioridade: CatecAtividadePrioridade): string {
  if (prioridade === 'ALTA') return drawerStyles.prioAlta
  if (prioridade === 'BAIXA') return drawerStyles.prioBaixa

  return drawerStyles.prioMedia
}

const ProjetoAtividadeLinha = ({
  atividade,
  variant,
  expansivel = false,
  aberta = false,
  onToggle,
  metaFilhos = null,
  onAbrir
}: Props) => {
  const isEtapa = variant === 'etapa'
  const isSub = variant === 'subatividade'

  return (
    <div
      className={`${styles.linha} ${isEtapa ? styles.linhaEtapa : ''} ${isSub ? styles.linhaSub : ''} ${variant === 'atividade' ? styles.linhaAtividade : ''}`}
    >
      <div className={styles.linhaMain}>
        <div className={styles.linhaEsquerda}>
          {expansivel ? (
            <IconButton
              size='small'
              aria-label={aberta ? 'Recolher' : 'Expandir'}
              aria-expanded={aberta}
              onClick={e => {
                e.stopPropagation()
                onToggle?.()
              }}
              className={styles.chevronBtn}
            >
              <i className={aberta ? 'tabler-chevron-down' : 'tabler-chevron-right'} />
            </IconButton>
          ) : (
            <span className={styles.chevronSpacer} aria-hidden />
          )}

          <button type='button' className={styles.linhaConteudo} onClick={onAbrir}>
            <div className={styles.tituloLinha}>
              <AtividadeTipoIcone
                tipo={atividade.tipo}
                className={isSub ? styles.iconeMenor : undefined}
                comTooltip={!isSub}
              />
              <Typography component='span' variant='caption' color='text.secondary' className={styles.codigo}>
                {atividade.codigo}
              </Typography>
              <Typography
                component='span'
                className={`${styles.titulo} ${isEtapa ? styles.tituloEtapa : ''} ${isSub ? styles.tituloSub : ''}`}
              >
                {atividade.titulo}
              </Typography>
            </div>

            <div className={styles.metaLinha}>
              <Chip
                size='small'
                label={STATUS_ATIVIDADE_ROTULO[atividade.status]}
                variant={
                  atividade.status === 'A_FAZER' || atividade.status === 'EM_ANDAMENTO' ? 'filled' : 'tonal'
                }
                color={atividade.status === 'A_FAZER' ? 'secondary' : STATUS_ATIVIDADE_COR[atividade.status]}
                className={[
                  drawerStyles.subatividadeStatusChip,
                  atividade.status === 'A_FAZER' ? drawerStyles.detalheStatusAFazer : '',
                  atividade.status === 'EM_ANDAMENTO' ? drawerStyles.detalheStatusEmAndamento : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              <span className={styles.prioridadeLinha}>
                <i
                  className={`${prioridadeIcone(atividade.prioridade)} text-base ${prioridadeCorClass(atividade.prioridade)}`}
                />
                <Typography component='span' variant='caption' className={prioridadeCorClass(atividade.prioridade)}>
                  {PRIORIDADE_ATIVIDADE_ROTULO[atividade.prioridade]}
                </Typography>
              </span>
              {metaFilhos ? (
                <Typography variant='caption' color='text.secondary'>
                  {metaFilhos}
                </Typography>
              ) : null}
            </div>
          </button>
        </div>

        <div className={styles.linhaDireita}>
          <div className={styles.responsavelBloco}>
            {atividade.responsavelNome ? (
              <div className={styles.responsavelLinha}>
                <Avatar className={styles.avatar} sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                  {iniciais(atividade.responsavelNome)}
                </Avatar>
                <Typography variant='body2' color='text.secondary' className={styles.responsavelNome}>
                  {atividade.responsavelNome}
                </Typography>
              </div>
            ) : (
              <Typography variant='body2' color='text.disabled' className={styles.responsavelNome}>
                Sem responsável
              </Typography>
            )}
            <Typography variant='caption' color='text.secondary'>
              Prazo: {formatarPrazo(atividade.prazoEm)}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjetoAtividadeLinha
