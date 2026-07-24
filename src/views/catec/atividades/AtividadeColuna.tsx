'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import Typography from '@mui/material/Typography'

import { animations } from '@formkit/drag-and-drop'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { toast } from 'react-toastify'

import type { CatecAtividade, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'

import AtividadeCard from './AtividadeCard'
import AtividadeNovaNaColuna from './AtividadeNovaNaColuna'
import styles from './styles.module.css'

type Props = {
  status: CatecAtividadeStatus
  rotulo: string
  atividades: CatecAtividade[]
  onOpen: (atividade: CatecAtividade) => void
  onMoverStatus: (id: number, status: CatecAtividadeStatus, ordem?: number) => Promise<void>
  onCriarNaColuna?: (titulo: string, status: CatecAtividadeStatus) => Promise<void>
  onPedirProjetoParaCriar?: () => void
  podeMover: boolean
  podeCriar: boolean
  podeCriarNaColuna: boolean
}

const AtividadeColuna = ({
  status,
  rotulo,
  atividades,
  onOpen,
  onMoverStatus,
  onCriarNaColuna,
  onPedirProjetoParaCriar,
  podeMover,
  podeCriar,
  podeCriarNaColuna
}: Props) => {
  const processandoRef = useRef<Set<number>>(new Set())
  const syncingRef = useRef(false)

  const [listaRef, lista, setLista] = useDragAndDrop<HTMLDivElement, CatecAtividade>(atividades, {
    group: 'atividades',
    plugins: [animations()],
    draggable: el => podeMover && el.classList.contains('item-draggable'),
    draggingClass: styles.cardDragging,
    dropZoneParentClass: styles.columnDropTarget,
    dragPlaceholderClass: styles.cardPlaceholder
  })

  useEffect(() => {
    syncingRef.current = true
    setLista(atividades)
    queueMicrotask(() => {
      syncingRef.current = false
    })
  }, [atividades, setLista])

  useEffect(() => {
    if (syncingRef.current || !podeMover) return

    for (let i = 0; i < lista.length; i++) {
      const item = lista[i]

      if (!item || item.status === status) continue
      if (processandoRef.current.has(item.id)) continue

      processandoRef.current.add(item.id)

      void onMoverStatus(item.id, status, i)
        .catch(err => {
          toast.error(err instanceof Error ? err.message : 'Não foi possível mover a atividade.')
        })
        .finally(() => {
          processandoRef.current.delete(item.id)
        })
    }
  }, [lista, status, onMoverStatus, podeMover])

  return (
    <div className={styles.column}>
      <div id='no-drag' className={styles.columnHeader}>
        <span className={styles.columnTitle}>{rotulo}</span>
        <span className={styles.columnCount}>{lista.length}</span>
      </div>

      <div ref={listaRef as RefObject<HTMLDivElement>} className={styles.columnCards}>
        {lista.map(atividade =>
          atividade ? (
            <AtividadeCard key={atividade.id} atividade={atividade} onOpen={onOpen} podeMover={podeMover} />
          ) : null
        )}
      </div>

      {podeCriar ? (
        <div id='no-drag' className={styles.columnFooter}>
          {podeCriarNaColuna && onCriarNaColuna ? (
            <AtividadeNovaNaColuna onAdd={titulo => onCriarNaColuna(titulo, status)} />
          ) : (
            <Typography
              onClick={() => onPedirProjetoParaCriar?.()}
              color='text.primary'
              className='flex items-center gap-1 cursor-pointer'
            >
              <i className='tabler-plus text-base' />
              <span>Nova atividade</span>
            </Typography>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default AtividadeColuna
