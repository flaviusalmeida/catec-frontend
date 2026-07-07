'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  atualizarUsuarioCatec,
  criarUsuarioCatec,
  listarUsuariosCatec,
  obterUsuarioCatec,
  resetarSenhaUsuarioCatec
} from '@/libs/catecUsuariosApi'
import type { CatecAdminUsuario, CatecUsuarioCreateInput } from '@/types/catec/usuarioTypes'

type StoreState = {
  lista: CatecAdminUsuario[]
  carregando: boolean
  erro: string | null
  inicializado: boolean
}

const initialState: StoreState = { lista: [], carregando: false, erro: null, inicializado: false }

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
      const lista = await listarUsuariosCatec()

      setState({ lista, carregando: false, erro: null, inicializado: true })
    } catch (err) {
      setState({
        lista: [],
        carregando: false,
        erro: err instanceof Error ? err.message : 'Não foi possível carregar os usuários.',
        inicializado: true
      })
    } finally {
      carregarPromise = null
    }
  })()

  return carregarPromise
}

async function addUsuarioStore(input: CatecUsuarioCreateInput): Promise<CatecAdminUsuario> {
  const criado = await criarUsuarioCatec(input)

  setState({ lista: [...state.lista, criado] })

  return criado
}

async function updateUsuarioStore(id: number, patch: Partial<CatecAdminUsuario>): Promise<CatecAdminUsuario> {
  const atual = state.lista.find(u => u.id === id)
  const base = atual ?? (await obterUsuarioCatec(id))
  const merged = { ...base, ...patch }

  const atualizado = await atualizarUsuarioCatec(id, {
    nome: merged.nome,
    email: merged.email,
    telefone: merged.telefone,
    ativo: merged.ativo,
    grupos: merged.grupos
  })

  const exists = state.lista.some(u => u.id === id)

  setState({
    lista: exists ? state.lista.map(u => (u.id === id ? atualizado : u)) : [...state.lista, atualizado]
  })

  return atualizado
}

async function resetarSenhaStore(id: number): Promise<CatecAdminUsuario> {
  await resetarSenhaUsuarioCatec(id)

  return updateUsuarioStore(id, { ativo: false, requerTrocaSenha: true })
}

async function obterUsuarioStore(id: number): Promise<CatecAdminUsuario | null> {
  const cached = state.lista.find(u => u.id === id)

  if (cached) return cached

  try {
    const usuario = await obterUsuarioCatec(id)

    if (!state.lista.some(u => u.id === usuario.id)) {
      setState({ lista: [...state.lista, usuario] })
    }

    return usuario
  } catch {
    return null
  }
}

export function useUsuarios2Store() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!snapshot.inicializado && !snapshot.carregando) {
      void carregarStore()
    }
  }, [snapshot.inicializado, snapshot.carregando])

  const carregar = useCallback(async () => {
    await carregarStore()
  }, [])

  const addUsuario = useCallback(async (input: CatecUsuarioCreateInput) => addUsuarioStore(input), [])

  const updateUsuario = useCallback(
    async (id: number, patch: Partial<CatecAdminUsuario>) => updateUsuarioStore(id, patch),
    []
  )

  const resetarSenha = useCallback(async (id: number) => resetarSenhaStore(id), [])
  const obterUsuario = useCallback(async (id: number) => obterUsuarioStore(id), [])

  return {
    lista: snapshot.lista,
    carregando: snapshot.carregando,
    erro: snapshot.erro,
    carregar,
    addUsuario,
    updateUsuario,
    resetarSenha,
    obterUsuario
  }
}
