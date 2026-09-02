'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  associarClienteServicoCatec,
  atualizarServicoCatec,
  criarServicoCatec,
  excluirServicoCatec,
  listarServicosCatec,
  obterServicoCatec,
  obterServicosResumoCatec
} from '@/libs/catecServicosApi'
import type { CatecServico, CatecServicoCreateInput, CatecServicoResumo, CatecServicoUpdateInput } from '@/types/catec/servicoTypes'

type StoreState = {
  lista: CatecServico[]
  resumo: CatecServicoResumo | null
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
      const [lista, resumo] = await Promise.all([listarServicosCatec(), obterServicosResumoCatec()])

      setState({ lista, resumo, carregando: false, erro: null, inicializado: true })
    } catch (err) {
      setState({
        lista: [],
        resumo: null,
        carregando: false,
        erro: err instanceof Error ? err.message : 'Não foi possível carregar os servicos.',
        inicializado: true
      })
    } finally {
      carregarPromise = null
    }
  })()

  return carregarPromise
}

async function addServicoStore(input: CatecServicoCreateInput): Promise<CatecServico> {
  const criado = await criarServicoCatec(input)

  await carregarStore()

  return criado
}

async function atualizarStatusServicoStore(id: number, status: CatecServico['status']): Promise<CatecServico> {
  const atualizado = await atualizarServicoCatec(id, { status })
  const exists = state.lista.some(p => p.id === id)

  setState({
    lista: exists ? state.lista.map(p => (p.id === id ? atualizado : p)) : [...state.lista, atualizado]
  })

  void carregarStore()

  return atualizado
}

async function updateServicoStore(id: number, patch: Partial<CatecServico>): Promise<CatecServico> {
  const atual = state.lista.find(p => p.id === id)
  const base = atual ?? (await obterServicoCatec(id))
  const merged = { ...base, ...patch }

  const body: CatecServicoUpdateInput = {
    clienteId: merged.clienteId,
    titulo: merged.titulo,
    escopo: merged.escopo,
    status: merged.status
  }

  const atualizado = await atualizarServicoCatec(id, body)
  const exists = state.lista.some(p => p.id === id)

  setState({
    lista: exists ? state.lista.map(p => (p.id === id ? atualizado : p)) : [...state.lista, atualizado]
  })

  void carregarStore()

  return atualizado
}

async function associarClienteStore(id: number, clienteId: number): Promise<CatecServico> {
  const atualizado = await associarClienteServicoCatec(id, clienteId)
  const exists = state.lista.some(p => p.id === id)

  setState({
    lista: exists ? state.lista.map(p => (p.id === id ? atualizado : p)) : [...state.lista, atualizado]
  })

  void carregarStore()

  return atualizado
}

async function removeServicoStore(id: number): Promise<void> {
  await excluirServicoCatec(id)

  setState({ lista: state.lista.filter(p => p.id !== id) })

  void carregarStore()
}

async function refreshServicoStore(id: number): Promise<CatecServico | null> {
  try {
    const servico = await obterServicoCatec(id)
    const exists = state.lista.some(p => p.id === id)

    setState({
      lista: exists ? state.lista.map(p => (p.id === id ? servico : p)) : [...state.lista, servico]
    })

    return servico
  } catch {
    return null
  }
}

async function obterServicoStore(id: number): Promise<CatecServico | null> {
  const cached = state.lista.find(p => p.id === id)

  if (cached) return cached

  try {
    const servico = await obterServicoCatec(id)

    if (!state.lista.some(p => p.id === servico.id)) {
      setState({ lista: [...state.lista, servico] })
    }

    return servico
  } catch {
    return null
  }
}

export function useServicosStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!snapshot.inicializado && !snapshot.carregando) {
      void carregarStore()
    }
  }, [snapshot.inicializado, snapshot.carregando])

  const carregar = useCallback(async () => {
    await carregarStore()
  }, [])

  const addServico = useCallback(async (input: CatecServicoCreateInput) => addServicoStore(input), [])

  const updateServico = useCallback(
    async (id: number, patch: Partial<CatecServico>) => updateServicoStore(id, patch),
    []
  )

  const atualizarStatusServico = useCallback(
    async (id: number, status: CatecServico['status']) => atualizarStatusServicoStore(id, status),
    []
  )

  const associarCliente = useCallback(
    async (id: number, clienteId: number) => associarClienteStore(id, clienteId),
    []
  )

  const removeServico = useCallback(async (id: number) => removeServicoStore(id), [])

  const obterServico = useCallback(async (id: number) => obterServicoStore(id), [])

  const refreshServico = useCallback(async (id: number) => refreshServicoStore(id), [])

  return {
    lista: snapshot.lista,
    resumo: snapshot.resumo,
    carregando: snapshot.carregando,
    erro: snapshot.erro,
    carregar,
    addServico,
    updateServico,
    atualizarStatusServico,
    associarCliente,
    removeServico,
    obterServico,
    refreshServico
  }
}
