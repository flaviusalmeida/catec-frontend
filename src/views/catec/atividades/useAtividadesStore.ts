'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  alterarStatusAtividadeCatec,
  atualizarAtividadeCatec,
  criarAtividadeFilhaCatec,
  criarAtividadeRaizCatec,
  excluirAtividadeCatec,
  obterBoardAtividadesCatec
} from '@/libs/catecAtividadesApi'
import type {
  CatecAtividade,
  CatecAtividadeBoardColuna,
  CatecAtividadeBoardFiltros,
  CatecAtividadeCreateInput,
  CatecAtividadeStatus,
  CatecAtividadeUpdateInput
} from '@/types/catec/atividadeTypes'
import { boardColunasVazias } from '@/types/catec/atividadeTypes'

type StoreState = {
  board: CatecAtividadeBoardColuna[]
  filtros: CatecAtividadeBoardFiltros
  carregando: boolean
  erro: string | null
  inicializado: boolean
}

const initialState: StoreState = {
  board: boardColunasVazias(),
  filtros: {},
  carregando: false,
  erro: null,
  inicializado: false
}

let state: StoreState = { ...initialState }
const listeners = new Set<() => void>()
let carregarPromise: Promise<void> | null = null
let filtrosPendentes: CatecAtividadeBoardFiltros | null = null

function emit() {
  for (const listener of listeners) listener()
}

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

function sameFiltros(a: CatecAtividadeBoardFiltros, b: CatecAtividadeBoardFiltros): boolean {
  return (
    (a.projetoId ?? null) === (b.projetoId ?? null) &&
    (a.responsavelId ?? null) === (b.responsavelId ?? null) &&
    (a.q ?? '') === (b.q ?? '')
  )
}

async function carregarBoardStore(filtros?: CatecAtividadeBoardFiltros) {
  const nextFiltros = filtros ?? state.filtros

  filtrosPendentes = nextFiltros

  if (carregarPromise) {
    await carregarPromise

    if (filtrosPendentes && !sameFiltros(filtrosPendentes, state.filtros)) {
      return carregarBoardStore(filtrosPendentes)
    }

    return
  }

  carregarPromise = (async () => {
    setState({ carregando: true, erro: null, filtros: nextFiltros })

    try {
      const board = await obterBoardAtividadesCatec(nextFiltros)

      setState({ board, carregando: false, erro: null, inicializado: true })
    } catch (err) {
      setState({
        board: boardColunasVazias(),
        carregando: false,
        erro: err instanceof Error ? err.message : 'Não foi possível carregar o board de atividades.',
        inicializado: true
      })
    } finally {
      carregarPromise = null
    }
  })()

  return carregarPromise
}

function moverNoBoardOptimistic(id: number, status: CatecAtividadeStatus, ordem?: number | null) {
  let movida: CatecAtividade | undefined

  const semItem = state.board.map(coluna => {
    const found = coluna.atividades.find(a => a.id === id)

    if (!found) return coluna

    movida = found

    return {
      ...coluna,
      atividades: coluna.atividades.filter(a => a.id !== id)
    }
  })

  if (!movida) return

  const base = movida
  const atualizada: CatecAtividade = {
    ...base,
    status,
    ordem: ordem ?? base.ordem
  }

  setState({
    board: semItem.map(coluna => {
      if (coluna.status !== status) return coluna

      return { ...coluna, atividades: [...coluna.atividades, atualizada] }
    })
  })
}

async function alterarStatusStore(
  id: number,
  status: CatecAtividadeStatus,
  ordem?: number | null
): Promise<CatecAtividade> {
  moverNoBoardOptimistic(id, status, ordem)

  try {
    const atualizada = await alterarStatusAtividadeCatec(id, { status, ordem: ordem ?? undefined })

    void carregarBoardStore()

    return atualizada
  } catch (err) {
    await carregarBoardStore()
    throw err
  }
}

async function criarRaizStore(projetoId: number, body: CatecAtividadeCreateInput): Promise<CatecAtividade> {
  const criada = await criarAtividadeRaizCatec(projetoId, body)

  await carregarBoardStore()

  return criada
}

async function criarFilhaStore(paiId: number, body: CatecAtividadeCreateInput): Promise<CatecAtividade> {
  const criada = await criarAtividadeFilhaCatec(paiId, body)

  await carregarBoardStore()

  return criada
}

async function atualizarStore(id: number, body: CatecAtividadeUpdateInput): Promise<CatecAtividade> {
  const atualizada = await atualizarAtividadeCatec(id, body)

  await carregarBoardStore()

  return atualizada
}

async function excluirStore(id: number): Promise<void> {
  await excluirAtividadeCatec(id)
  await carregarBoardStore()
}

function encontrarAtividade(id: number): CatecAtividade | null {
  for (const coluna of state.board) {
    const found = coluna.atividades.find(a => a.id === id)

    if (found) return found
  }

  return null
}

export function useAtividadesStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!snapshot.inicializado && !snapshot.carregando) {
      void carregarBoardStore()
    }
  }, [snapshot.inicializado, snapshot.carregando])

  const carregar = useCallback(async (filtros?: CatecAtividadeBoardFiltros) => {
    await carregarBoardStore(filtros)
  }, [])

  const alterarStatus = useCallback(
    async (id: number, status: CatecAtividadeStatus, ordem?: number | null) =>
      alterarStatusStore(id, status, ordem),
    []
  )

  const criarRaiz = useCallback(
    async (projetoId: number, body: CatecAtividadeCreateInput) => criarRaizStore(projetoId, body),
    []
  )

  const criarFilha = useCallback(
    async (paiId: number, body: CatecAtividadeCreateInput) => criarFilhaStore(paiId, body),
    []
  )

  const atualizar = useCallback(
    async (id: number, body: CatecAtividadeUpdateInput) => atualizarStore(id, body),
    []
  )

  const excluir = useCallback(async (id: number) => excluirStore(id), [])

  const obter = useCallback((id: number) => encontrarAtividade(id), [])

  return {
    board: snapshot.board,
    filtros: snapshot.filtros,
    carregando: snapshot.carregando,
    erro: snapshot.erro,
    carregar,
    alterarStatus,
    criarRaiz,
    criarFilha,
    atualizar,
    excluir,
    obter
  }
}
