'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  acaoPropostaCatec,
  atualizarStatusAssinaturaContratoCatec,
  carregarContratoComDocumentosCatec,
  carregarPropostasComDocumentosCatec,
  enviarAssinaturaContratoCatec,
  enviarContratoClienteCatec,
  listarHistoricoServicoCatec,
  obterAssinaturaContratoCatec,
  obterAssinaturaProviderInfoCatec,
  registrarInteracaoContratoCatec,
  registrarInteracaoPropostaCatec,
  uploadDocumentoContratoCatec,
  uploadDocumentoPropostaCatec
} from '@/libs/catecServicosApi'
import type { CatecAssinatura, CatecEnviarAssinaturaPayload } from '@/types/catec/assinaturaTypes'
import type {
  CatecHistoricoPage,
  CatecServicoFluxoData,
  CatecPropostaWorkflowActionKey,
  CatecTipoInteracaoFluxo
} from '@/types/catec/servicoFluxoTypes'
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE
} from '@/types/catec/servicoFluxoTypes'

import {
  computeServicoFluxoResumo,
  propostaMaisRecente
} from './servicoFluxoHelpers'

const HISTORICO_SIZE = 20

const emptyData: CatecServicoFluxoData = {
  propostas: [],
  contrato: null,
  interacoes: [],
  historico: []
}

export function useServicoFluxoStore(servicoId: number, onAfterMutation?: () => Promise<void>) {
  const [data, setData] = useState<CatecServicoFluxoData>(emptyData)
  const [assinatura, setAssinatura] = useState<CatecAssinatura | null>(null)
  const [assinaturaProviderAtivo, setAssinaturaProviderAtivo] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  const [historicoPage, setHistoricoPage] = useState<CatecHistoricoPage>({
    content: [],
    page: 0,
    size: HISTORICO_SIZE,
    totalElements: 0,
    totalPages: 0
  })

  const [historicoCarregando, setHistoricoCarregando] = useState(false)

  const recarregar = useCallback(async (opts?: { silent?: boolean }) => {
    if (!Number.isFinite(servicoId) || servicoId < 1) {
      setErro('Servico inválido.')
      setCarregando(false)

      return
    }

    if (!opts?.silent) {
      setCarregando(true)
    }

    setErro(null)

    try {
      const [propostas, contrato] = await Promise.all([
        carregarPropostasComDocumentosCatec(servicoId),
        carregarContratoComDocumentosCatec(servicoId)
      ])

      setData(prev => ({ ...prev, propostas, contrato, interacoes: [] }))

      if (contrato) {
        try {
          const [info, ciclo] = await Promise.all([
            obterAssinaturaProviderInfoCatec(servicoId, contrato.id),
            obterAssinaturaContratoCatec(servicoId, contrato.id)
          ])

          setAssinaturaProviderAtivo(info.ativo)
          setAssinatura(ciclo)
        } catch {
          setAssinaturaProviderAtivo(false)
          setAssinatura(null)
        }
      } else {
        setAssinaturaProviderAtivo(false)
        setAssinatura(null)
      }

      if (onAfterMutation) {
        await onAfterMutation()
      }
    } catch (err) {
      if (!opts?.silent) {
        setErro(err instanceof Error ? err.message : 'Falha ao carregar dados do servico.')
        setData(emptyData)
        setAssinatura(null)
        setAssinaturaProviderAtivo(false)
      }
    } finally {
      if (!opts?.silent) {
        setCarregando(false)
      }
    }
  }, [servicoId, onAfterMutation])

  const carregarHistorico = useCallback(
    async (page: number) => {
      setHistoricoCarregando(true)

      try {
        const result = await listarHistoricoServicoCatec(servicoId, page, HISTORICO_SIZE)

        setHistoricoPage(result)
        setData(prev => ({ ...prev, historico: result.content }))
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Falha ao carregar histórico.')
      } finally {
        setHistoricoCarregando(false)
      }
    },
    [servicoId]
  )

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  const resumo = useMemo(() => computeServicoFluxoResumo(servicoId, data), [servicoId, data])
  const propostaAtual = useMemo(() => propostaMaisRecente(data.propostas), [data.propostas])

  const uploadProposta = useCallback(
    async (file: File) => {
      setProcessando(true)

      try {
        await uploadDocumentoPropostaCatec(servicoId, propostaAtual?.id ?? null, file)
        await recarregar()
      } finally {
        setProcessando(false)
      }
    },
    [servicoId, propostaAtual?.id, recarregar]
  )

  const acaoProposta = useCallback(
    async (acao: CatecPropostaWorkflowActionKey, observacao?: string) => {
      if (!propostaAtual) return

      setProcessando(true)

      try {
        await acaoPropostaCatec(servicoId, propostaAtual.id, acao, { observacao })
        await recarregar()
      } finally {
        setProcessando(false)
      }
    },
    [servicoId, propostaAtual, recarregar]
  )

  const uploadContrato = useCallback(
    async (file: File) => {
      setProcessando(true)

      try {
        await uploadDocumentoContratoCatec(servicoId, data.contrato?.id ?? null, file)
        await recarregar()
      } finally {
        setProcessando(false)
      }
    },
    [servicoId, data.contrato?.id, recarregar]
  )

  const enviarContratoCliente = useCallback(
    async (prazos: { prazoInicioExecucaoDias: number; prazoConclusaoDias: number }) => {
      if (!data.contrato) return

      setProcessando(true)

      try {
        await enviarContratoClienteCatec(servicoId, data.contrato.id, prazos)
        await recarregar()
      } finally {
        setProcessando(false)
      }
    },
    [servicoId, data.contrato, recarregar]
  )

  const enviarAssinatura = useCallback(
    async (payload: CatecEnviarAssinaturaPayload) => {
      if (!data.contrato) return

      setProcessando(true)

      try {
        const ciclo = await enviarAssinaturaContratoCatec(servicoId, data.contrato.id, payload)

        setAssinatura(ciclo)
        await recarregar()
      } finally {
        setProcessando(false)
      }
    },
    [servicoId, data.contrato, recarregar]
  )

  const atualizarStatusAssinatura = useCallback(async () => {
    if (!data.contrato) return

    setProcessando(true)

    try {
      const ciclo = await atualizarStatusAssinaturaContratoCatec(servicoId, data.contrato.id)

      setAssinatura(ciclo)
      await recarregar({ silent: true })

      return ciclo
    } finally {
      setProcessando(false)
    }
  }, [servicoId, data.contrato, recarregar])

  const registrarInteracao = useCallback(
    async (tipo: CatecTipoInteracaoFluxo, texto: string) => {
      const cont = data.contrato && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(data.contrato.status)
        ? data.contrato
        : null

      const prop = data.propostas.find(p => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null

      if (!cont && !prop) return

      setProcessando(true)

      try {
        if (cont) {
          await registrarInteracaoContratoCatec(servicoId, cont.id, tipo, texto)
        } else if (prop) {
          await registrarInteracaoPropostaCatec(servicoId, prop.id, tipo, texto)
        }

        await recarregar()
      } finally {
        setProcessando(false)
      }
    },
    [data.contrato, data.propostas, servicoId, recarregar]
  )

  return {
    data,
    assinatura,
    assinaturaProviderAtivo,
    resumo,
    propostaAtual,
    carregando,
    erro,
    processando,
    historicoPage,
    historicoCarregando,
    recarregar,
    carregarHistorico,
    uploadProposta,
    acaoProposta,
    uploadContrato,
    enviarContratoCliente,
    enviarAssinatura,
    atualizarStatusAssinatura,
    registrarInteracao
  }
}

export type UseServicoFluxoStore = ReturnType<typeof useServicoFluxoStore>
