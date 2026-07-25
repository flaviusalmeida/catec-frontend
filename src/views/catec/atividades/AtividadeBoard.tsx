'use client'

import { useCallback, useState } from 'react'

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
  CatecAtividadeStatus
} from '@/types/catec/atividadeTypes'
import {
  AGRUPAR_BOARD_ROTULO,
  ORDEM_AGRUPAR_BOARD,
  STATUS_ATIVIDADE_COR,
  STATUS_ATIVIDADE_ROTULO
} from '@/types/catec/atividadeTypes'

import AtividadeColuna from './AtividadeColuna'
import AtividadeDrawer from './AtividadeDrawer'
import AtividadeTipoIcone from './AtividadeTipoIcone'
import { useAtividadesStore } from './useAtividadesStore'
import styles from './styles.module.css'

type Props = {
  board: CatecAtividadeBoard
  agrupar: CatecAtividadeBoardAgrupar
  onAgruparChange: (agrupar: CatecAtividadeBoardAgrupar) => void
  podeMover: boolean
  podeCriar: boolean
  podeCriarNaColuna: boolean
  onCriarNaColuna?: (titulo: string, status: CatecAtividadeStatus) => Promise<void>
  onPedirProjetoParaCriar?: () => void
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) return '?'

  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

const AtividadeBoard = ({
  board,
  agrupar,
  onAgruparChange,
  podeMover,
  podeCriar,
  podeCriarNaColuna,
  onCriarNaColuna,
  onPedirProjetoParaCriar
}: Props) => {
  const { alterarStatus, atualizar, criarFilha, excluir, obter } = useAtividadesStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [atividadeAtual, setAtividadeAtual] = useState<CatecAtividade | null>(null)
  const [menuAgrupar, setMenuAgrupar] = useState<null | HTMLElement>(null)
  const [faixasColapsadas, setFaixasColapsadas] = useState<Record<string, boolean>>({})

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
      await alterarStatus(id, status, ordem)
    },
    [alterarStatus]
  )

  const mostrarCabecalhoFaixa = agrupar !== 'NENHUM' || board.faixas.length > 1

  return (
    <>
      <div className={styles.boardToolbar}>
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

      <div className={styles.boardFaixas}>
        {board.faixas.map(faixa => {
          const colapsada = Boolean(faixasColapsadas[faixa.chave])
          const totalItens = faixa.colunas.reduce((acc, c) => acc + c.atividades.length, 0)
          const porResponsavel = agrupar === 'RESPONSAVEL'
          const porAtividade = agrupar === 'ATIVIDADE'
          const porEpico = agrupar === 'EPICO'
          const mostrarMetaFaixa = porAtividade || porEpico
          const semResponsavel = porResponsavel && faixa.responsavelId == null

          return (
            <section key={faixa.chave} className={styles.boardFaixa}>
              {mostrarCabecalhoFaixa ? (
                <div className={styles.boardFaixaHeader}>
                  <button
                    type='button'
                    className={styles.boardFaixaToggle}
                    aria-label={colapsada ? 'Expandir faixa' : 'Recolher faixa'}
                    onClick={() =>
                      setFaixasColapsadas(prev => ({ ...prev, [faixa.chave]: !prev[faixa.chave] }))
                    }
                  >
                    <i className={colapsada ? 'tabler-chevron-right' : 'tabler-chevron-down'} />
                  </button>
                  {porResponsavel ? (
                    semResponsavel ? (
                      <Tooltip title='Sem responsável'>
                        <Avatar className={`bs-6 is-6 text-xs ${styles.avatarNaoAtribuido}`}>
                          <i className='tabler-user text-sm' />
                        </Avatar>
                      </Tooltip>
                    ) : (
                      <Tooltip title={faixa.titulo}>
                        <Avatar className={`bs-6 is-6 text-xs ${styles.avatarUsuario}`}>
                          {iniciais(faixa.titulo)}
                        </Avatar>
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
                </div>
              ) : null}

              {!colapsada ? (
                <div className={styles.board}>
                  {faixa.colunas.map(coluna => (
                    <AtividadeColuna
                      key={`${faixa.chave}-${coluna.status}`}
                      status={coluna.status}
                      rotulo={coluna.rotulo}
                      atividades={coluna.atividades}
                      onOpen={handleOpen}
                      onMoverStatus={handleMover}
                      onCriarNaColuna={agrupar === 'NENHUM' ? onCriarNaColuna : undefined}
                      onPedirProjetoParaCriar={agrupar === 'NENHUM' ? onPedirProjetoParaCriar : undefined}
                      podeMover={podeMover}
                      podeCriar={podeCriar && agrupar === 'NENHUM'}
                      podeCriarNaColuna={podeCriarNaColuna && agrupar === 'NENHUM'}
                    />
                  ))}
                </div>
              ) : null}
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
