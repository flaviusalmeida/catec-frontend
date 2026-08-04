'use client'

import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'

import { obterAtividadeCatec } from '@/libs/catecAtividadesApi'
import type {
  CatecAtividade,
  CatecAtividadeBoard,
  CatecAtividadeBoardAgrupar,
  CatecAtividadeBoardFaixa,
  CatecAtividadeStatus,
  CatecAtividadeTipo
} from '@/types/catec/atividadeTypes'
import {
  AGRUPAR_BOARD_ROTULO,
  contagemItensFaixa,
  ORDEM_AGRUPAR_BOARD,
  STATUS_ATIVIDADE_COR,
  STATUS_ATIVIDADE_ROTULO
} from '@/types/catec/atividadeTypes'

import AtividadeColuna from './AtividadeColuna'
import AtividadeDrawer from './AtividadeDrawer'
import AtividadeTipoIcone from './AtividadeTipoIcone'
import { MSG_CONCLUSAO_COM_FILHAS, temFilhasNaoConcluidas } from './atividadeFluxoRules'
import { useAtividadesStore } from './useAtividadesStore'
import styles from './styles.module.css'

export type CatecAtividadeNovaNaColunaOpts = {
  status: CatecAtividadeStatus

  /** Pai pré-fixido: etapa (criar ATIVIDADE) ou atividade (criar SUBATIVIDADE). */
  paiId?: number | null
  projetoId?: number | null
  tipo?: CatecAtividadeTipo | null
}

type Props = {
  board: CatecAtividadeBoard
  agrupar: CatecAtividadeBoardAgrupar
  onAgruparChange: (agrupar: CatecAtividadeBoardAgrupar) => void
  podeMover: boolean
  podeCriar: boolean

  /** Projetos em AGUARDANDO_EXECUCAO / EM_EXECUCAO — criação contextual só nestes. */
  projetoIdsCriacao?: ReadonlySet<number>
  onNovaNaColuna?: (opts: CatecAtividadeNovaNaColunaOpts) => void
  onNovaEtapa?: (projetoId: number) => void

  /** Modal livre (mesmo comportamento do Agrupar=Responsável). */
  onNovaAtividade?: () => void
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) return '?'

  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function projetoIdDaFaixa(
  faixa: CatecAtividadeBoardFaixa,
  obter: (id: number) => CatecAtividade | null
): number | null {
  if (faixa.atividadeId != null) {
    const doCatalogo = obter(faixa.atividadeId)?.projetoId

    if (doCatalogo != null && doCatalogo > 0) return doCatalogo
  }

  for (const coluna of faixa.colunas) {
    for (const atividade of coluna.atividades) {
      if (atividade.projetoId > 0) return atividade.projetoId
    }
  }

  for (const sub of faixa.subFaixas) {
    const pid = projetoIdDaFaixa(sub, obter)

    if (pid != null) return pid
  }

  return null
}

const AtividadeBoard = ({
  board,
  agrupar,
  onAgruparChange,
  podeMover,
  podeCriar,
  projetoIdsCriacao,
  onNovaNaColuna,
  onNovaEtapa,
  onNovaAtividade
}: Props) => {
  const { alterarStatus, atualizar, criarFilha, excluir, obter, catalogo, carregar } = useAtividadesStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [atividadeAtual, setAtividadeAtual] = useState<CatecAtividade | null>(null)
  const [menuAgrupar, setMenuAgrupar] = useState<null | HTMLElement>(null)

  /** true = colapsada. Projeto: default expandido; sub-faixa Etapa: default colapsada. */
  const [faixasColapsadas, setFaixasColapsadas] = useState<Record<string, boolean>>({})

  const permiteCriarNoProjeto = useCallback(
    (projetoId: number | null | undefined) => {
      if (projetoId == null || projetoId <= 0) return true
      if (!projetoIdsCriacao) return true

      return projetoIdsCriacao.has(projetoId)
    },
    [projetoIdsCriacao]
  )

  const handleOpen = useCallback((atividade: CatecAtividade) => {
    setAtividadeAtual(atividade)
    setDrawerOpen(true)
  }, [])

  const handleAbrirAtividade = useCallback(
    async (id: number) => {
      const noBoard = obter(id)

      if (noBoard) {
        setAtividadeAtual(noBoard)
        setDrawerOpen(true)

        return
      }

      try {
        const carregada = await obterAtividadeCatec(id)

        setAtividadeAtual(carregada)
        setDrawerOpen(true)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível abrir a atividade.')
      }
    },
    [obter]
  )

  const handleMover = useCallback(
    async (id: number, status: CatecAtividadeStatus, ordem?: number) => {
      if (temFilhasNaoConcluidas(id, catalogo, status)) {
        await carregar()
        throw new Error(MSG_CONCLUSAO_COM_FILHAS)
      }

      await alterarStatus(id, status, ordem)
    },
    [alterarStatus, catalogo, carregar]
  )

  const isColapsada = useCallback(
    (collapseKey: string, defaultColapsada: boolean) => {
      if (collapseKey in faixasColapsadas) {
        return faixasColapsadas[collapseKey]
      }

      return defaultColapsada
    },
    [faixasColapsadas]
  )

  const toggleFaixa = useCallback((collapseKey: string, defaultColapsada: boolean) => {
    setFaixasColapsadas(prev => {
      const atual = collapseKey in prev ? prev[collapseKey] : defaultColapsada

      return { ...prev, [collapseKey]: !atual }
    })
  }, [])

  const renderKanban = (
    faixa: CatecAtividadeBoardFaixa,
    collapseKey: string,
    opts: {
      paiId?: number | null
      projetoId?: number | null
      tipo?: CatecAtividadeTipo | null
    } = {}
  ) => {
    const podeCriarAqui =
      podeCriar &&
      Boolean(onNovaNaColuna) &&
      (opts.projetoId == null || permiteCriarNoProjeto(opts.projetoId))

    return (
      <div className={styles.board}>
        {faixa.colunas.map(coluna => (
          <AtividadeColuna
            key={`${collapseKey}-${coluna.status}`}
            status={coluna.status}
            rotulo={coluna.rotulo}
            atividades={coluna.atividades}
            onOpen={handleOpen}
            onMoverStatus={handleMover}
            onNovaNaColuna={
              podeCriarAqui && onNovaNaColuna
                ? status =>
                    onNovaNaColuna({
                      status,
                      paiId: opts.paiId ?? null,
                      projetoId: opts.projetoId ?? null,
                      tipo: opts.tipo ?? null
                    })
                : undefined
            }
            rotuloNova={opts.tipo === 'SUBATIVIDADE' ? 'Nova subatividade' : 'Nova atividade'}
            podeMover={podeMover}
            podeCriar={podeCriarAqui}
          />
        ))}
      </div>
    )
  }

  const renderFaixaHeader = ({
    faixa,
    collapseKey,
    colapsada,
    defaultColapsada,
    porProjeto,
    porResponsavel,
    mostrarMetaFaixa,
    totalItens,
    extraActions
  }: {
    faixa: CatecAtividadeBoardFaixa
    collapseKey: string
    colapsada: boolean
    defaultColapsada: boolean
    porProjeto: boolean
    porResponsavel: boolean
    mostrarMetaFaixa: boolean
    totalItens: number
    extraActions?: ReactNode
  }) => {
    const semResponsavel = porResponsavel && faixa.responsavelId == null

    return (
      <div className={styles.boardFaixaHeader}>
        <button
          type='button'
          className={styles.boardFaixaToggle}
          aria-label={colapsada ? 'Expandir faixa' : 'Recolher faixa'}
          onClick={() => toggleFaixa(collapseKey, defaultColapsada)}
        >
          <i className={colapsada ? 'tabler-chevron-right' : 'tabler-chevron-down'} />
        </button>
        {porProjeto ? <i className='tabler-folder text-lg text-primary shrink-0' aria-hidden /> : null}
        {porResponsavel ? (
          semResponsavel ? (
            <Tooltip title='Sem responsável'>
              <Avatar className={`bs-6 is-6 text-xs ${styles.avatarNaoAtribuido}`}>
                <i className='tabler-user text-sm' />
              </Avatar>
            </Tooltip>
          ) : (
            <Tooltip title={faixa.titulo}>
              <Avatar className={`bs-6 is-6 text-xs ${styles.avatarUsuario}`}>{iniciais(faixa.titulo)}</Avatar>
            </Tooltip>
          )
        ) : null}
        {mostrarMetaFaixa && faixa.tipo ? <AtividadeTipoIcone tipo={faixa.tipo} /> : null}
        {mostrarMetaFaixa && faixa.atividadeId != null ? (
          <button
            type='button'
            className={styles.boardFaixaTituloBotao}
            title={`Abrir ${faixa.titulo}`}
            onClick={() => void handleAbrirAtividade(faixa.atividadeId!)}
          >
            <span className={styles.boardFaixaTitulo}>{faixa.titulo}</span>
          </button>
        ) : (
          <span className={styles.boardFaixaTitulo}>{faixa.titulo}</span>
        )}
        <span className={styles.boardFaixaContagem}>
          ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
        </span>
        {mostrarMetaFaixa ? (
          <span className={styles.boardFaixaMeta}>
            {faixa.status ? (
              <Chip
                size='small'
                variant='tonal'
                color={STATUS_ATIVIDADE_COR[faixa.status]}
                label={STATUS_ATIVIDADE_ROTULO[faixa.status]}
              />
            ) : null}
            {faixa.responsavelNome ? (
              <Tooltip title={faixa.responsavelNome}>
                <Avatar className={`bs-6 is-6 text-xs ${styles.avatarUsuario}`}>
                  {iniciais(faixa.responsavelNome)}
                </Avatar>
              </Tooltip>
            ) : (
              <Tooltip title='Não atribuído'>
                <Avatar className={`bs-6 is-6 text-xs ${styles.avatarNaoAtribuido}`}>
                  <i className='tabler-user text-sm' />
                </Avatar>
              </Tooltip>
            )}
          </span>
        ) : null}
        {extraActions}
      </div>
    )
  }

  return (
    <>
      <div className={styles.boardToolbar}>
        {podeCriar && onNovaAtividade ? (
          <Button
            variant='contained'
            size='small'
            startIcon={<i className='tabler-plus text-base' />}
            onClick={onNovaAtividade}
          >
            Nova atividade
          </Button>
        ) : (
          <span />
        )}
        <div className={styles.boardToolbarAcoes}>
          <Button
            variant='contained'
            size='small'
            endIcon={<i className='tabler-chevron-down text-base' />}
            onClick={e => setMenuAgrupar(e.currentTarget)}
          >
            Agrupar: {AGRUPAR_BOARD_ROTULO[agrupar]}
          </Button>
          <Menu anchorEl={menuAgrupar} open={Boolean(menuAgrupar)} onClose={() => setMenuAgrupar(null)}>
            {ORDEM_AGRUPAR_BOARD.map(opcao => (
              <MenuItem
                key={opcao}
                selected={opcao === agrupar}
                onClick={() => {
                  onAgruparChange(opcao)
                  setMenuAgrupar(null)
                }}
              >
                {AGRUPAR_BOARD_ROTULO[opcao]}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>

      <div className={styles.boardFaixas}>
        {board.faixas.map(faixa => {
          const porResponsavel = agrupar === 'RESPONSAVEL'
          const porProjeto = agrupar === 'PROJETO'
          const porAtividade = agrupar === 'ATIVIDADE'
          const porEtapa = agrupar === 'ETAPA'
          const temSubFaixas = porProjeto && faixa.subFaixas.length > 0
          const collapseKey = porProjeto ? `projeto:${faixa.chave}` : faixa.chave
          const defaultColapsada = false
          const colapsada = isColapsada(collapseKey, defaultColapsada)
          const totalItens = contagemItensFaixa(faixa)
          const mostrarMetaFaixa = porAtividade || porEtapa
          const projetoIdNumerico = Number(faixa.chave)
          const projetoIdValido = Number.isFinite(projetoIdNumerico) && projetoIdNumerico > 0

          return (
            <section key={collapseKey} className={styles.boardFaixa}>
              {renderFaixaHeader({
                faixa,
                collapseKey,
                colapsada,
                defaultColapsada,
                porProjeto,
                porResponsavel,
                mostrarMetaFaixa,
                totalItens,
                extraActions:
                  porProjeto &&
                  podeCriar &&
                  onNovaEtapa &&
                  projetoIdValido &&
                  permiteCriarNoProjeto(projetoIdNumerico) ? (
                    <Button
                      size='small'
                      variant='text'
                      className={styles.boardFaixaAcao}
                      startIcon={<i className='tabler-plus text-sm' />}
                      onClick={() => onNovaEtapa(projetoIdNumerico)}
                    >
                      Nova etapa
                    </Button>
                  ) : null
              })}

              {!colapsada && temSubFaixas ? (
                <div className={styles.boardSubFaixas}>
                  {faixa.subFaixas.map(sub => {
                    const subKey = `${collapseKey}/etapa:${sub.chave}`
                    const subDefaultColapsada = true
                    const subColapsada = isColapsada(subKey, subDefaultColapsada)
                    const subTotal = contagemItensFaixa(sub)
                    const etapaId = sub.atividadeId
                    const mostrarMetaSub = sub.tipo === 'ETAPA'

                    return (
                      <section key={subKey} className={styles.boardSubFaixa}>
                        {renderFaixaHeader({
                          faixa: sub,
                          collapseKey: subKey,
                          colapsada: subColapsada,
                          defaultColapsada: subDefaultColapsada,
                          porProjeto: false,
                          porResponsavel: false,
                          mostrarMetaFaixa: mostrarMetaSub,
                          totalItens: subTotal
                        })}
                        {!subColapsada
                          ? renderKanban(sub, subKey, {
                              paiId: etapaId,
                              projetoId: projetoIdValido ? projetoIdNumerico : null,
                              tipo: 'ATIVIDADE'
                            })
                          : null}
                      </section>
                    )
                  })}
                </div>
              ) : null}

              {!colapsada && !temSubFaixas && porProjeto && faixa.subFaixas.length === 0 ? (
                <div className={styles.boardFaixaVazia}>
                  <span>Nenhuma etapa neste projeto.</span>
                  {podeCriar &&
                  onNovaEtapa &&
                  projetoIdValido &&
                  permiteCriarNoProjeto(projetoIdNumerico) ? (
                    <Button size='small' variant='outlined' onClick={() => onNovaEtapa(projetoIdNumerico)}>
                      Nova etapa
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {!colapsada && !porProjeto
                ? renderKanban(faixa, collapseKey, {
                    paiId: porEtapa || porAtividade ? faixa.atividadeId : null,
                    projetoId: porEtapa || porAtividade ? projetoIdDaFaixa(faixa, obter) : null,
                    tipo: porAtividade ? 'SUBATIVIDADE' : porEtapa ? 'ATIVIDADE' : null
                  })
                : null}
            </section>
          )
        })}
      </div>

      <AtividadeDrawer
        open={drawerOpen}
        atividade={atividadeAtual}
        onClose={() => setDrawerOpen(false)}
        onUpdate={async (id, body) => {
          const atualizada = await atualizar(id, body)

          setAtividadeAtual(atualizada)
        }}
        onCreateFilha={async (paiId, body) => {
          await criarFilha(paiId, body)
        }}
        onDelete={async id => {
          await excluir(id)
          setAtividadeAtual(null)
        }}
        onAbrirAtividade={handleAbrirAtividade}
      />
    </>
  )
}

export default AtividadeBoard
