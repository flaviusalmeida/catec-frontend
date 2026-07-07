'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import { obterProjetosPainelCatec } from '@/libs/catecProjetosApi'
import type { CatecProjetoPainel } from '@/types/catec/projetoTypes'

const INTERVALO_ATUALIZACAO_MS = 5 * 60 * 1000

type StoreState = {
  painel: CatecProjetoPainel | null
  carregando: boolean
  erro: string | null
  inicializado: boolean
}

type CarregarOpcoes = {
  silencioso?: boolean
}

const initialState: StoreState = { painel: null, carregando: false, erro: null, inicializado: false }

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

async function carregarStore(opcoes: CarregarOpcoes = {}) {
  const silencioso = opcoes.silencioso ?? false

  if (carregarPromise) return carregarPromise

  carregarPromise = (async () => {
    if (!silencioso) {
      setState({ carregando: true, erro: null })
    }

    try {
      const painel = await obterProjetosPainelCatec()

      setState({ painel, carregando: false, erro: null, inicializado: true })
    } catch (err) {
      if (silencioso) {
        return
      }

      setState({
        painel: null,
        carregando: false,
        erro: err instanceof Error ? err.message : 'Não foi possível carregar o painel.',
        inicializado: true
      })
    } finally {
      carregarPromise = null
    }
  })()

  return carregarPromise
}

export function usePainelStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!snapshot.inicializado && !snapshot.carregando) {
      void carregarStore()
    }
  }, [snapshot.inicializado, snapshot.carregando])

  const carregar = useCallback(async (opcoes?: CarregarOpcoes) => {
    await carregarStore(opcoes)
  }, [])

  return {
    painel: snapshot.painel,
    carregando: snapshot.carregando,
    erro: snapshot.erro,
    carregar
  }
}

/** Atualiza o painel a cada 5 min enquanto a página estiver montada e a aba visível. */
export function usePainelAutoAtualizacao(carregar: (opcoes?: CarregarOpcoes) => Promise<void>) {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    const parar = () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const iniciar = () => {
      parar()
      intervalId = setInterval(() => {
        void carregar({ silencioso: true })
      }, INTERVALO_ATUALIZACAO_MS)
    }

    const onVisibilidade = () => {
      if (document.visibilityState === 'visible') {
        iniciar()
      } else {
        parar()
      }
    }

    if (document.visibilityState === 'visible') {
      iniciar()
    }

    document.addEventListener('visibilitychange', onVisibilidade)

    return () => {
      parar()
      document.removeEventListener('visibilitychange', onVisibilidade)
    }
  }, [carregar])
}
