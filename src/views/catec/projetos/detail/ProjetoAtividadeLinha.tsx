'use client'

import { useState } from 'react'
import type { MouseEvent } from 'react'

import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

import type { CatecAtividade, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'
import {
  ORDEM_STATUS_ATIVIDADE,
  PRIORIDADE_ATIVIDADE_COR,
  PRIORIDADE_ATIVIDADE_ROTULO,
  STATUS_ATIVIDADE_COR,
  STATUS_ATIVIDADE_ROTULO
} from '@/types/catec/atividadeTypes'

import AtividadeTipoIcone from '@/views/catec/atividades/AtividadeTipoIcone'

import styles from './projetoAtividades.module.css'

export type ProjetoAtividadeLinhaVariant = 'etapa' | 'atividade' | 'subatividade'

type Props = {
  atividade: CatecAtividade
  variant: ProjetoAtividadeLinhaVariant
  expansivel?: boolean
  aberta?: boolean
  onToggle?: () => void
  metaFilhos?: string | null
  onOpenBoard: () => void
  showMenu?: boolean
  podeEditar?: boolean
  podeMoverStatus?: boolean
  podeExcluir?: boolean
  onEditar?: () => void
  onAlterarStatus?: (status: CatecAtividadeStatus) => void
  onAlterarResponsavel?: () => void
  onAlterarPrazo?: () => void
  onExcluir?: () => void
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

const ProjetoAtividadeLinha = ({
  atividade,
  variant,
  expansivel = false,
  aberta = false,
  onToggle,
  metaFilhos = null,
  onOpenBoard,
  showMenu = false,
  podeEditar = false,
  podeMoverStatus = false,
  podeExcluir = false,
  onEditar,
  onAlterarStatus,
  onAlterarResponsavel,
  onAlterarPrazo,
  onExcluir
}: Props) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null)

  const isEtapa = variant === 'etapa'
  const isSub = variant === 'subatividade'
  const temMenu = showMenu && (podeEditar || podeMoverStatus || podeExcluir)

  const handlePrimaryClick = () => {
    if (isEtapa && expansivel) {
      onToggle?.()

      return
    }

    onOpenBoard()
  }

  const fecharMenus = () => {
    setMenuAnchor(null)
    setStatusAnchor(null)
  }

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

          <button type='button' className={styles.linhaConteudo} onClick={handlePrimaryClick}>
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
                variant='tonal'
                color={STATUS_ATIVIDADE_COR[atividade.status]}
                label={STATUS_ATIVIDADE_ROTULO[atividade.status]}
                className={styles.chipCompacto}
              />
              <Chip
                size='small'
                variant='tonal'
                color={PRIORIDADE_ATIVIDADE_COR[atividade.prioridade]}
                label={PRIORIDADE_ATIVIDADE_ROTULO[atividade.prioridade]}
                className={styles.chipCompacto}
              />
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

          {temMenu ? (
            <>
              <IconButton
                size='small'
                aria-label='Ações'
                onClick={(e: MouseEvent<HTMLElement>) => {
                  e.stopPropagation()
                  setMenuAnchor(e.currentTarget)
                }}
              >
                <i className='tabler-dots-vertical' />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={fecharMenus}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {podeEditar ? (
                  <MenuItem
                    onClick={() => {
                      fecharMenus()
                      onEditar?.()
                    }}
                  >
                    <ListItemIcon>
                      <i className='tabler-edit text-xl' />
                    </ListItemIcon>
                    <ListItemText>Editar</ListItemText>
                  </MenuItem>
                ) : null}
                {podeMoverStatus ? (
                  <MenuItem
                    onClick={e => {
                      setStatusAnchor(e.currentTarget)
                    }}
                  >
                    <ListItemIcon>
                      <i className='tabler-status-change text-xl' />
                    </ListItemIcon>
                    <ListItemText>Alterar status</ListItemText>
                    <i className='tabler-chevron-right text-xl text-textSecondary' />
                  </MenuItem>
                ) : null}
                {podeEditar ? (
                  <MenuItem
                    onClick={() => {
                      fecharMenus()
                      onAlterarResponsavel?.()
                    }}
                  >
                    <ListItemIcon>
                      <i className='tabler-user text-xl' />
                    </ListItemIcon>
                    <ListItemText>Alterar responsável</ListItemText>
                  </MenuItem>
                ) : null}
                {podeEditar ? (
                  <MenuItem
                    onClick={() => {
                      fecharMenus()
                      onAlterarPrazo?.()
                    }}
                  >
                    <ListItemIcon>
                      <i className='tabler-calendar text-xl' />
                    </ListItemIcon>
                    <ListItemText>Alterar prazo</ListItemText>
                  </MenuItem>
                ) : null}
                {podeExcluir ? (
                  <>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        fecharMenus()
                        onExcluir?.()
                      }}
                    >
                      <ListItemIcon>
                        <i className='tabler-trash text-xl text-error' />
                      </ListItemIcon>
                      <ListItemText className='text-error'>Excluir</ListItemText>
                    </MenuItem>
                  </>
                ) : null}
              </Menu>
              <Menu
                anchorEl={statusAnchor}
                open={Boolean(statusAnchor)}
                onClose={() => setStatusAnchor(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                {ORDEM_STATUS_ATIVIDADE.map(status => (
                  <MenuItem
                    key={status}
                    selected={atividade.status === status}
                    disabled={atividade.status === status}
                    onClick={() => {
                      fecharMenus()
                      onAlterarStatus?.(status)
                    }}
                  >
                    {STATUS_ATIVIDADE_ROTULO[status]}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ProjetoAtividadeLinha
