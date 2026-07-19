'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  atualizarClienteCatec,
  criarClienteCatec,
  excluirClienteCatec,
  listarClientesCatec,
  obterClienteCatec,
  obterClientesResumoCatec
} from '@/libs/catecClientesApi'
import type { CatecCliente, CatecClienteRequest, CatecClienteResumo } from '@/types/catec/clienteTypes'

import { clienteToRequest } from './clienteFormHelpers'

type StoreState = {
  lista: CatecCliente[]
  resumo: CatecClienteResumo | null
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
      const [lista, resumo] = await Promise.all([listarClientesCatec(), obterClientesResumoCatec()])

      setState({ lista, resumo, carregando: false, erro: null, inicializado: true })
    } catch (err) {
      setState({
        lista: [],
        resumo: null,
        carregando: false,
        erro: err instanceof Error ? err.message : 'Não foi possível carregar os clientes.',
        inicializado: true
      })
    } finally {
      carregarPromise = null
    }
  })()

  return carregarPromise
}

async function addClienteStore(body: CatecClienteRequest): Promise<CatecCliente> {
  const criado = await criarClienteCatec(body)

  await carregarStore()

  return criado
}

async function updateClienteStore(id: number, patch: Partial<CatecCliente>): Promise<CatecCliente> {
  const base = await obterClienteCatec(id)
  const merged = { ...base, ...patch }
  const atualizado = await atualizarClienteCatec(id, clienteToRequest(merged))

  const exists = state.lista.some(c => c.id === id)

  setState({
    lista: exists ? state.lista.map(c => (c.id === id ? atualizado : c)) : [...state.lista, atualizado]
  })

  void carregarStore()

  return atualizado
}

async function removeClienteStore(id: number): Promise<void> {
  await excluirClienteCatec(id)
  await carregarStore()
}

async function obterClienteStore(id: number): Promise<CatecCliente | null> {
  try {
    const cliente = await obterClienteCatec(id)
    const exists = state.lista.some(c => c.id === cliente.id)

    setState({
      lista: exists ? state.lista.map(c => (c.id === cliente.id ? cliente : c)) : [...state.lista, cliente]
    })

    return cliente
  } catch {
    return null
  }
}

export function useClientesStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!snapshot.inicializado && !snapshot.carregando) {
      void carregarStore()
    }
  }, [snapshot.inicializado, snapshot.carregando])

  const carregar = useCallback(async () => {
    await carregarStore()
  }, [])

  const addCliente = useCallback(async (body: CatecClienteRequest) => addClienteStore(body), [])

  const updateCliente = useCallback(
    async (id: number, patch: Partial<CatecCliente>) => updateClienteStore(id, patch),
    []
  )

  const removeCliente = useCallback(async (id: number) => removeClienteStore(id), [])
  const obterCliente = useCallback(async (id: number) => obterClienteStore(id), [])

  return {
    lista: snapshot.lista,
    resumo: snapshot.resumo,
    carregando: snapshot.carregando,
    erro: snapshot.erro,
    carregar,
    addCliente,
    updateCliente,
    removeCliente,
    obterCliente
  }
}
