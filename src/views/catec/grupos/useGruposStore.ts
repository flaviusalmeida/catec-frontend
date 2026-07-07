'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  atualizarGrupoCatec,
  criarGrupoCatec,
  excluirGrupoCatec,
  listarGruposCatec,
  listarPermissoesCatalogoCatec,
  obterGrupoCatec
} from '@/libs/catecGruposApi'
import type { CatecGrupo, CatecGrupoCreateInput, CatecPermissaoCatalogo } from '@/types/catec/grupoTypes'

type GruposStoreState = {
  lista: CatecGrupo[]
  catalogo: CatecPermissaoCatalogo[]
  carregando: boolean
  erro: string | null
  inicializado: boolean
}

const initialState: GruposStoreState = {
  lista: [],
  catalogo: [],
  carregando: false,
  erro: null,
  inicializado: false
}

let state: GruposStoreState = { ...initialState }
const listeners = new Set<() => void>()
let carregarPromise: Promise<void> | null = null

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function setState(patch: Partial<GruposStoreState>) {
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
      const [grupos, permissoes] = await Promise.all([listarGruposCatec(), listarPermissoesCatalogoCatec()])

      setState({
        lista: grupos,
        catalogo: permissoes,
        carregando: false,
        erro: null,
        inicializado: true
      })
    } catch (err) {
      setState({
        lista: [],
        catalogo: [],
        carregando: false,
        erro: err instanceof Error ? err.message : 'Não foi possível carregar os grupos.',
        inicializado: true
      })
    } finally {
      carregarPromise = null
    }
  })()

  return carregarPromise
}

async function addGrupoStore(input: CatecGrupoCreateInput): Promise<CatecGrupo> {
  const criado = await criarGrupoCatec(input)

  setState({ lista: [...state.lista, criado] })

  return criado
}

async function updateGrupoStore(id: number, patch: Partial<CatecGrupo>): Promise<CatecGrupo> {
  const atual = state.lista.find(g => g.id === id)
  const base = atual ?? (await obterGrupoCatec(id))
  const merged = { ...base, ...patch }

  const atualizado = await atualizarGrupoCatec(id, {
    nome: merged.nome,
    descricao: merged.descricao,
    ativo: merged.ativo,
    permissoes: merged.permissoes
  })

  const exists = state.lista.some(g => g.id === id)

  setState({
    lista: exists ? state.lista.map(g => (g.id === id ? atualizado : g)) : [...state.lista, atualizado]
  })

  return atualizado
}

async function removeGrupoStore(id: number): Promise<void> {
  await excluirGrupoCatec(id)
  setState({ lista: state.lista.filter(g => g.id !== id) })
}

async function obterGrupoStore(id: number): Promise<CatecGrupo | null> {
  const cached = state.lista.find(g => g.id === id)

  if (cached) return cached

  try {
    const grupo = await obterGrupoCatec(id)

    if (!state.lista.some(g => g.id === grupo.id)) {
      setState({ lista: [...state.lista, grupo] })
    }

    return grupo
  } catch {
    return null
  }
}

export function useGruposStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!snapshot.inicializado && !snapshot.carregando) {
      void carregarStore()
    }
  }, [snapshot.inicializado, snapshot.carregando])

  const carregar = useCallback(async () => {
    await carregarStore()
  }, [])

  const addGrupo = useCallback(async (input: CatecGrupoCreateInput) => addGrupoStore(input), [])

  const updateGrupo = useCallback(
    async (id: number, patch: Partial<CatecGrupo>) => updateGrupoStore(id, patch),
    []
  )

  const removeGrupo = useCallback(async (id: number) => removeGrupoStore(id), [])

  const obterGrupo = useCallback(async (id: number) => obterGrupoStore(id), [])

  return {
    lista: snapshot.lista,
    catalogo: snapshot.catalogo,
    carregando: snapshot.carregando,
    erro: snapshot.erro,
    carregar,
    addGrupo,
    updateGrupo,
    removeGrupo,
    obterGrupo
  }
}
