'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import Typography from '@mui/material/Typography'

import { animations } from '@formkit/drag-and-drop'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { toast } from 'react-toastify'

import { ORDEM_STATUS_ATIVIDADE, type CatecAtividade, type CatecAtividadeStatus } from '@/types/catec/atividadeTypes'

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

/**
 * FormKit só dispara onDragstart/onDragend na coluna de origem.
 * Flag compartilhada para todas as colunas do board ignorarem sync/commit mid-drag.
 */
let boardArrastando = false

function isStatusColuna(value: unknown): value is CatecAtividadeStatus {
  return typeof value === 'string' && (ORDEM_STATUS_ATIVIDADE as string[]).includes(value)
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
  const onMoverStatusRef = useRef(onMoverStatus)
  const podeMoverRef = useRef(podeMover)
  const statusRef = useRef(status)

  onMoverStatusRef.current = onMoverStatus
  podeMoverRef.current = podeMover
  statusRef.current = status

  const commitMovimentos = (itens: CatecAtividade[], statusDestino: CatecAtividadeStatus) => {
    if (!podeMoverRef.current) return

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i]

      if (!item || item.status === statusDestino) continue
      if (processandoRef.current.has(item.id)) continue

      processandoRef.current.add(item.id)

      void onMoverStatusRef
        .current(item.id, statusDestino, i)
        .catch(err => {
          toast.error(err instanceof Error ? err.message : 'Não foi possível mover a atividade.')
        })
        .finally(() => {
          processandoRef.current.delete(item.id)
        })
    }
  }

  const [listaRef, lista, setLista] = useDragAndDrop<HTMLDivElement, CatecAtividade>(atividades, {
    group: 'atividades',
    name: status,
    plugins: [animations()],
    draggable: el => podeMoverRef.current && el.classList.contains('item-draggable'),
    draggingClass: styles.cardDragging,
    dropZoneParentClass: styles.columnDropTarget,
    dragPlaceholderClass: styles.cardPlaceholder,
    onDragstart: () => {
      boardArrastando = true
    },
    onDragend: data => {
      boardArrastando = false

      const statusDestino = isStatusColuna(data.parent.data.config.name)
        ? data.parent.data.config.name
        : statusRef.current

      commitMovimentos(data.values as CatecAtividade[], statusDestino)
    }
  })

  useEffect(() => {
    if (boardArrastando) return

    setLista(atividades)
  }, [atividades, setLista])

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
