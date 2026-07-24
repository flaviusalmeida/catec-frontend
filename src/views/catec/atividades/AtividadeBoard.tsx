'use client'

import { useCallback, useState } from 'react'

import { toast } from 'react-toastify'

import { obterAtividadeCatec } from '@/libs/catecAtividadesApi'
import type { CatecAtividade, CatecAtividadeBoardColuna, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'

import AtividadeColuna from './AtividadeColuna'
import AtividadeDrawer from './AtividadeDrawer'
import { useAtividadesStore } from './useAtividadesStore'
import styles from './styles.module.css'

type Props = {
  board: CatecAtividadeBoardColuna[]
  podeMover: boolean
  podeCriar: boolean
  podeCriarNaColuna: boolean
  onCriarNaColuna?: (titulo: string, status: CatecAtividadeStatus) => Promise<void>
  onPedirProjetoParaCriar?: () => void
}

const AtividadeBoard = ({
  board,
  podeMover,
  podeCriar,
  podeCriarNaColuna,
  onCriarNaColuna,
  onPedirProjetoParaCriar
}: Props) => {
  const { alterarStatus, atualizar, criarFilha, excluir, obter } = useAtividadesStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [atividadeAtual, setAtividadeAtual] = useState<CatecAtividade | null>(null)

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

  return (
    <>
      <div className={styles.board}>
        {board.map(coluna => (
          <AtividadeColuna
            key={coluna.status}
            status={coluna.status}
            rotulo={coluna.rotulo}
            atividades={coluna.atividades}
            onOpen={handleOpen}
            onMoverStatus={handleMover}
            onCriarNaColuna={onCriarNaColuna}
            onPedirProjetoParaCriar={onPedirProjetoParaCriar}
            podeMover={podeMover}
            podeCriar={podeCriar}
            podeCriarNaColuna={podeCriarNaColuna}
          />
        ))}
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
