'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  associarClienteProjetoCatec,
  atualizarProjetoCatec,
  criarProjetoCatec,
  excluirProjetoCatec,
  listarProjetosCatec,
  obterProjetoCatec,
  obterProjetosResumoCatec
} from '@/libs/catecProjetosApi'
import type { CatecProjeto, CatecProjetoCreateInput, CatecProjetoResumo, CatecProjetoUpdateInput } from '@/types/catec/projetoTypes'

type StoreState = {
  lista: CatecProjeto[]
  resumo: CatecProjetoResumo | null
  carregando: boolean
  erro: string | null
  inicializado: boolean
}

const initialState: StoreState = { lista: [], resumo: null, carregando: false, erro: null, inicializado: false }

let state: StoreState = { ...initialState }
const listeners = new Set<() => void>()
let carregarPromise: Promise<void> | null = null

function emit() {
  for (const listener of listeners) listener()
}

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

async function carregarStore() {
  if (carregarPromise) return carregarPromise

  carregarPromise = (async () => {
    setState({ carregando: true, erro: null })

    try {
      const [lista, resumo] = await Promise.all([listarProjetosCatec(), obterProjetosResumoCatec()])

      setState({ lista, resumo, carregando: false, erro: null, inicializado: true })
    } catch (err) {
      setState({
        lista: [],
        resumo: null,
        carregando: false,
        erro: err instanceof Error ? err.message : 'Não foi possível carregar os projetos.',
        inicializado: true
      })
    } finally {
      carregarPromise = null
    }
  })()

  return carregarPromise
}

async function addProjetoStore(input: CatecProjetoCreateInput): Promise<CatecProjeto> {
  const criado = await criarProjetoCatec(input)

  await carregarStore()

  return criado
}

async function atualizarStatusProjetoStore(id: number, status: CatecProjeto['status']): Promise<CatecProjeto> {
  const atualizado = await atualizarProjetoCatec(id, { status })
  const exists = state.lista.some(p => p.id === id)

  setState({
    lista: exists ? state.lista.map(p => (p.id === id ? atualizado : p)) : [...state.lista, atualizado]
  })

  void carregarStore()

  return atualizado
}

async function updateProjetoStore(id: number, patch: Partial<CatecProjeto>): Promise<CatecProjeto> {
  const atual = state.lista.find(p => p.id === id)
  const base = atual ?? (await obterProjetoCatec(id))
  const merged = { ...base, ...patch }

  const body: CatecProjetoUpdateInput = {
    clienteId: merged.clienteId,
    titulo: merged.titulo,
    escopo: merged.escopo,
    status: merged.status
  }

  const atualizado = await atualizarProjetoCatec(id, body)
  const exists = state.lista.some(p => p.id === id)

  setState({
    lista: exists ? state.lista.map(p => (p.id === id ? atualizado : p)) : [...state.lista, atualizado]
  })

  void carregarStore()

  return atualizado
}

async function associarClienteStore(id: number, clienteId: number): Promise<CatecProjeto> {
  const atualizado = await associarClienteProjetoCatec(id, clienteId)
  const exists = state.lista.some(p => p.id === id)

  setState({
    lista: exists ? state.lista.map(p => (p.id === id ? atualizado : p)) : [...state.lista, atualizado]
  })

  void carregarStore()

  return atualizado
}

async function removeProjetoStore(id: number): Promise<void> {
  await excluirProjetoCatec(id)

  setState({ lista: state.lista.filter(p => p.id !== id) })

  void carregarStore()
}

async function refreshProjetoStore(id: number): Promise<CatecProjeto | null> {
  try {
    const projeto = await obterProjetoCatec(id)
    const exists = state.lista.some(p => p.id === id)

    setState({
      lista: exists ? state.lista.map(p => (p.id === id ? projeto : p)) : [...state.lista, projeto]
    })

    return projeto
  } catch {
    return null
  }
}

async function obterProjetoStore(id: number): Promise<CatecProjeto | null> {
  const cached = state.lista.find(p => p.id === id)

  if (cached) return cached

  try {
    const projeto = await obterProjetoCatec(id)

    if (!state.lista.some(p => p.id === projeto.id)) {
      setState({ lista: [...state.lista, projeto] })
    }

    return projeto
  } catch {
    return null
  }
}

export function useProjetosStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!snapshot.inicializado && !snapshot.carregando) {
      void carregarStore()
    }
  }, [snapshot.inicializado, snapshot.carregando])

  const carregar = useCallback(async () => {
    await carregarStore()
  }, [])

  const addProjeto = useCallback(async (input: CatecProjetoCreateInput) => addProjetoStore(input), [])

  const updateProjeto = useCallback(
    async (id: number, patch: Partial<CatecProjeto>) => updateProjetoStore(id, patch),
    []
  )

  const atualizarStatusProjeto = useCallback(
    async (id: number, status: CatecProjeto['status']) => atualizarStatusProjetoStore(id, status),
    []
  )

  const associarCliente = useCallback(
    async (id: number, clienteId: number) => associarClienteStore(id, clienteId),
    []
  )

  const removeProjeto = useCallback(async (id: number) => removeProjetoStore(id), [])

  const obterProjeto = useCallback(async (id: number) => obterProjetoStore(id), [])

  const refreshProjeto = useCallback(async (id: number) => refreshProjetoStore(id), [])

  return {
    lista: snapshot.lista,
    resumo: snapshot.resumo,
    carregando: snapshot.carregando,
    erro: snapshot.erro,
    carregar,
    addProjeto,
    updateProjeto,
    atualizarStatusProjeto,
    associarCliente,
    removeProjeto,
    obterProjeto,
    refreshProjeto
  }
}
