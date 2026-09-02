'use client'

import { useEffect, useState } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import type { CatecServico } from '@/types/catec/servicoTypes'
import type {
  CatecAssinaturaConfig,
  CatecSignatarioDisponivel,
  CatecUsuarioCandidatoSignatario
} from '@/types/catec/assinaturaTypes'
import { isFalhaUltimaIteracao } from '@/types/catec/assinaturaTypes'
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_CONTRATO_ROTULO,
  STATUS_CONTRATO_UPLOAD,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  type CatecTipoInteracaoFluxo
} from '@/types/catec/servicoFluxoTypes'

import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'
import {
  listarUsuariosCandidatosAssinaturaCatec,
  obterAssinaturaConfigCatec
} from '@/libs/catecAssinaturaConfigApi'
import { listarSignatariosAssinaturaCatec } from '@/libs/catecServicosApi'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'

import { servicoPermiteEditarContrato, servicoPermiteVisualizarContrato } from '../servicoFluxoHelpers'
import ContratoStatusBadge from '../ContratoStatusBadge'
import type { UseServicoFluxoStore } from '../useServicoFluxoStore'
import { buildContratoDocumentoMetaItens, metaDocumentoResumo, resolverPrazosContratoMeta } from './contratoDocumentoHelpers'
import ServicoFileRow from './ServicoFileRow'
import ServicoStateCard from './ServicoStateCard'
import ServicoUploadCard from './ServicoUploadCard'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  servico: CatecServico
  fluxo: UseServicoFluxoStore
}

type DialogInteracaoCliente = CatecTipoInteracaoFluxo | null

function rotuloContadorSelecionados(quantidade: number): string {
  return quantidade === 1 ? '1 selecionado' : `${quantidade} selecionados`
}

function rotuloContadorResponsaveis(quantidade: number): string {
  return quantidade === 1 ? '1 responsável' : `${quantidade} responsáveis`
}

const ServicoTabContrato = ({ servico, fluxo }: Props) => {
  const {
    data,
    assinatura,
    assinaturaProviderAtivo,
    uploadContrato,
    enviarAssinatura,
    enviarContratoCliente,
    atualizarStatusAssinatura,
    registrarInteracao,
    recarregar,
    carregarHistorico,
    processando
  } = fluxo

  const { hasPermission } = useCatecPermission()
  const [dialogInteracaoCliente, setDialogInteracaoCliente] = useState<DialogInteracaoCliente>(null)
  const [textoInteracaoCliente, setTextoInteracaoCliente] = useState('')
  const [dialogEnvioAssinaturaAberto, setDialogEnvioAssinaturaAberto] = useState(false)
  const [signatariosDisponiveis, setSignatariosDisponiveis] = useState<CatecSignatarioDisponivel[]>([])
  const [chavesClienteSelecionadas, setChavesClienteSelecionadas] = useState<string[]>([])

  const [signatariosCatecSelecionados, setSignatariosCatecSelecionados] = useState<
    CatecUsuarioCandidatoSignatario[]
  >([])

  const [buscaCatec, setBuscaCatec] = useState('')
  const [opcoesCatec, setOpcoesCatec] = useState<CatecUsuarioCandidatoSignatario[]>([])
  const [carregandoCatec, setCarregandoCatec] = useState(false)
  const [carregandoSignatarios, setCarregandoSignatarios] = useState(false)
  const [assinaturaConfig, setAssinaturaConfig] = useState<CatecAssinaturaConfig | null>(null)

  const [prazoInicioExecucaoDias, setPrazoInicioExecucaoDias] = useState(
    servico.prazoInicioExecucaoDias != null ? String(servico.prazoInicioExecucaoDias) : ''
  )

  const [prazoConclusaoDias, setPrazoConclusaoDias] = useState(
    servico.prazoConclusaoDias != null ? String(servico.prazoConclusaoDias) : ''
  )

  useEffect(() => {
    if (servico.prazoInicioExecucaoDias != null) {
      setPrazoInicioExecucaoDias(String(servico.prazoInicioExecucaoDias))
    }

    if (servico.prazoConclusaoDias != null) {
      setPrazoConclusaoDias(String(servico.prazoConclusaoDias))
    }
  }, [servico.id, servico.prazoInicioExecucaoDias, servico.prazoConclusaoDias])

  useEffect(() => {
    void obterAssinaturaConfigCatec()
      .then(cfg => {
        setAssinaturaConfig(cfg)
      })
      .catch(() => {
        setAssinaturaConfig(null)
      })
  }, [servico.id])

  const contrato = data.contrato
  const documentoAtual = contrato?.documentos[0] ?? null
  const temAnexo = Boolean(documentoAtual)

  useEffect(() => {
    if (contrato?.status !== 'AGUARDANDO_ASSINATURA') return

    const tick = () => {
      void recarregar({ silent: true }).then(() => {
        void carregarHistorico(0)
      })
    }

    const intervalId = window.setInterval(tick, 20_000)

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        tick()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityOrFocus)
    window.addEventListener('focus', onVisibilityOrFocus)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityOrFocus)
      window.removeEventListener('focus', onVisibilityOrFocus)
    }
  }, [contrato?.status, recarregar, carregarHistorico])

  const podeEditarContrato = servicoPermiteEditarContrato(servico.status)
  const podeVisualizarContrato = servicoPermiteVisualizarContrato(servico.status, contrato != null)

  const aguardandoRespostaCliente =
    contrato != null && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(contrato.status)

  const podeRegistrarRespostaCliente =
    aguardandoRespostaCliente &&
    hasPermission(PermissaoCodigo.ACAO_INTERACAO_REGISTRAR) &&
    (contrato?.status === 'ENVIADO_AO_CLIENTE' ||
      Boolean(assinaturaConfig?.permiteInteracaoManualContrato))

  const desativaAssinaturaViaApi = Boolean(assinaturaConfig?.desativaAssinaturaViaApi)

  const podeEnviarAssinatura =
    podeEditarContrato &&
    contrato?.status === 'RASCUNHO' &&
    temAnexo &&
    assinaturaProviderAtivo &&
    !desativaAssinaturaViaApi &&
    hasPermission(PermissaoCodigo.ACAO_CONTRATO_ASSINATURA_ENVIAR)

  const podeEnviarContratoManual =
    podeEditarContrato &&
    contrato?.status === 'RASCUNHO' &&
    temAnexo &&
    desativaAssinaturaViaApi &&
    (hasPermission(PermissaoCodigo.ACAO_CONTRATO_ENVIAR) ||
      hasPermission(PermissaoCodigo.ACAO_CONTRATO_ASSINATURA_ENVIAR))

  const acoesRespostaCliente: Array<{
    tipo: CatecTipoInteracaoFluxo
    label: string
    color: 'primary' | 'success' | 'error' | 'secondary'
    variant: 'contained' | 'tonal'
  }> = [
    {
      tipo: 'CONSIDERACOES_CLIENTE',
      label: TIPO_INTERACAO_ROTULO_CONTRATO.CONSIDERACOES_CLIENTE,
      color: 'secondary',
      variant: 'tonal'
    },
    {
      tipo: 'ACEITE_CLIENTE',
      label: TIPO_INTERACAO_ROTULO_CONTRATO.ACEITE_CLIENTE,
      color: 'success',
      variant: 'contained'
    },
    {
      tipo: 'RECUSA_CLIENTE',
      label: TIPO_INTERACAO_ROTULO_CONTRATO.RECUSA_CLIENTE,
      color: 'error',
      variant: 'tonal'
    }
  ]

  const acoesRespostaClienteCard = podeRegistrarRespostaCliente
    ? acoesRespostaCliente.map(acao => ({
        key: acao.tipo,
        label: acao.label,
        color: acao.color,
        onClick: () => abrirDialogInteracaoCliente(acao.tipo)
      }))
    : []

  function abrirDialogInteracaoCliente(tipo: CatecTipoInteracaoFluxo) {
    setDialogInteracaoCliente(tipo)
    setTextoInteracaoCliente('')
  }

  function fecharDialogInteracaoCliente() {
    if (processando) return

    setDialogInteracaoCliente(null)
    setTextoInteracaoCliente('')
  }

  function confirmarInteracaoCliente() {
    if (!dialogInteracaoCliente) return

    if (!textoInteracaoCliente.trim()) {
      toast.error('Informe o texto da interação.')

      return
    }

    void registrarInteracao(dialogInteracaoCliente, textoInteracaoCliente.trim())
      .then(() => {
        toast.success('Resposta do cliente registrada.')
        setDialogInteracaoCliente(null)
        setTextoInteracaoCliente('')
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Erro ao registrar interação.'))
  }

  function handleEnviarAssinatura() {
    const diasInicio = Number.parseInt(prazoInicioExecucaoDias.trim(), 10)
    const diasConclusao = Number.parseInt(prazoConclusaoDias.trim(), 10)

    if (!Number.isFinite(diasInicio) || diasInicio < 1) {
      toast.error('Informe o prazo para início da execução em dias.')

      return
    }

    if (!Number.isFinite(diasConclusao) || diasConclusao < 1) {
      toast.error('Informe o prazo para conclusão do servico em dias.')

      return
    }

    if (!contrato) {
      return
    }

    setCarregandoSignatarios(true)
    setDialogEnvioAssinaturaAberto(true)
    setChavesClienteSelecionadas([])
    setSignatariosCatecSelecionados([])
    setBuscaCatec('')
    setOpcoesCatec([])

    void Promise.all([
      listarSignatariosAssinaturaCatec(servico.id, contrato.id),
      obterAssinaturaConfigCatec().catch(() => assinaturaConfig)
    ])
      .then(([lista, cfg]) => {
        if (cfg) {
          setAssinaturaConfig(cfg)
        }

        const ordenada = [...lista].sort((a, b) => {
          if (a.papel === 'EMPRESA' && b.papel !== 'EMPRESA') return -1
          if (b.papel === 'EMPRESA' && a.papel !== 'EMPRESA') return 1

          return 0
        })

        setSignatariosDisponiveis(ordenada)

        if (ordenada.length === 0) {
          toast.error('Cadastre o e-mail da empresa e/ou dos contatos no cliente.')
          setDialogEnvioAssinaturaAberto(false)
        }
      })
      .catch(err => {
        toast.error(err instanceof Error ? err.message : 'Não foi possível carregar os e-mails.')
        setDialogEnvioAssinaturaAberto(false)
      })
      .finally(() => setCarregandoSignatarios(false))
  }

  function fecharDialogEnvioAssinatura() {
    if (processando || carregandoSignatarios) {
      return
    }

    setDialogEnvioAssinaturaAberto(false)
  }

  function alternarClienteSignatario(chave: string, marcado: boolean) {
    setChavesClienteSelecionadas(prev => {
      if (marcado) {
        return prev.includes(chave) ? prev : [...prev, chave]
      }

      return prev.filter(c => c !== chave)
    })
  }

  function adicionarSignatarioCatec(usuario: CatecUsuarioCandidatoSignatario | null) {
    if (!usuario) return

    setSignatariosCatecSelecionados(prev => {
      if (prev.some(u => u.id === usuario.id)) {
        return prev
      }

      return [...prev, usuario]
    })
    setBuscaCatec('')
  }

  function removerSignatarioCatec(usuarioId: number) {
    setSignatariosCatecSelecionados(prev => prev.filter(u => u.id !== usuarioId))
  }

  function buscarUsuariosCatec(termo: string) {
    setBuscaCatec(termo)
    setCarregandoCatec(true)

    void listarUsuariosCandidatosAssinaturaCatec(termo)
      .then(lista => {
        const idsSelecionados = new Set(signatariosCatecSelecionados.map(u => u.id))

        setOpcoesCatec(lista.filter(u => !idsSelecionados.has(u.id)))
      })
      .catch(() => setOpcoesCatec([]))
      .finally(() => setCarregandoCatec(false))
  }

  function confirmarEnvioAssinatura() {
    const diasInicio = Number.parseInt(prazoInicioExecucaoDias.trim(), 10)
    const diasConclusao = Number.parseInt(prazoConclusaoDias.trim(), 10)

    if (chavesClienteSelecionadas.length === 0) {
      toast.error('Selecione ao menos um destinatário do cliente.')

      return
    }

    if (signatariosCatecSelecionados.length === 0) {
      toast.error('Selecione ao menos um responsável CATEC para assinar.')

      return
    }

    void enviarAssinatura({
      prazoInicioExecucaoDias: diasInicio,
      prazoConclusaoDias: diasConclusao,
      chavesCliente: chavesClienteSelecionadas,
      usuariosCatecIds: signatariosCatecSelecionados.map(u => u.id)
    })
      .then(() => {
        toast.success('Contrato enviado para assinatura eletrônica.')
        setDialogEnvioAssinaturaAberto(false)
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Envio para assinatura falhou.'))
  }

  function handleEnviarContratoManual() {
    const diasInicio = Number.parseInt(prazoInicioExecucaoDias.trim(), 10)
    const diasConclusao = Number.parseInt(prazoConclusaoDias.trim(), 10)

    if (!Number.isFinite(diasInicio) || diasInicio < 1) {
      toast.error('Informe o prazo para início da execução em dias.')

      return
    }

    if (!Number.isFinite(diasConclusao) || diasConclusao < 1) {
      toast.error('Informe o prazo para conclusão do servico em dias.')

      return
    }

    void enviarContratoCliente({
      prazoInicioExecucaoDias: diasInicio,
      prazoConclusaoDias: diasConclusao
    })
      .then(() => {
        toast.success('Contrato enviado. Aceite e recusa são manuais (sem e-mail da ClickSign).')
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Não foi possível enviar o contrato.'))
  }

  if (!podeVisualizarContrato) {
    return (
      <ServicoStateCard
        titulo='Contrato indisponível no momento.'
        descricao='Disponível em etapas posteriores.'
        tipo='locked'
      />
    )
  }

  const podeIniciarContrato = podeEditarContrato && !contrato

  const podeUploadExistente =
    podeEditarContrato && contrato != null && STATUS_CONTRATO_UPLOAD.includes(contrato.status)

  const ajustandoContratoCliente =
    contrato?.status === 'AGUARDANDO_AJUSTE' ||
    (contrato?.status === 'RASCUNHO' && contrato.consideracoesPendentes)

  const mostrarEnviarContratoCard = Boolean(
    contrato &&
      contrato.status === 'RASCUNHO' &&
      temAnexo &&
      podeEditarContrato &&
      !contrato.consideracoesPendentes
  )

  const mostrarRespostaClienteCard =
    (contrato?.status === 'ENVIADO_AO_CLIENTE' || contrato?.status === 'AGUARDANDO_ASSINATURA') && temAnexo

  const precisaRecuperarPdfAssinado =
    contrato?.status === 'ACEITO' &&
    assinatura?.id != null &&
    Boolean(assinatura.externalEnvelopeId)

  const mostrarAssinaturaDiagnostico =
    !assinaturaConfig?.permiteInteracaoManualContrato &&
    assinatura?.id != null &&
    Boolean(assinatura.externalEnvelopeId) &&
    (contrato?.status === 'AGUARDANDO_ASSINATURA' || precisaRecuperarPdfAssinado)

  const mostrarContratoAceitoCard = contrato?.status === 'ACEITO' && temAnexo

  const mostrarContratoRecusadoCard = contrato?.status === 'RECUSADO' && temAnexo

  const motivoCliente = contrato?.comentarioCliente?.trim() || null

  const mostrarUploadCard = Boolean(
    podeIniciarContrato ||
      (podeUploadExistente &&
        (ajustandoContratoCliente || (contrato?.status === 'RASCUNHO' && !temAnexo)))
  )

  const acaoEnviarAssinatura = podeEnviarAssinatura
    ? [
        {
          key: 'enviar-assinatura',
          label: 'Enviar para assinatura',
          color: 'primary' as const,
          alinhamento: 'fim' as const,
          onClick: handleEnviarAssinatura
        }
      ]
    : podeEnviarContratoManual
      ? [
          {
            key: 'enviar-cliente',
            label: 'Enviar ao cliente',
            color: 'primary' as const,
            alinhamento: 'fim' as const,
            onClick: handleEnviarContratoManual
          }
        ]
      : []

  const acoesAjustarContratoCard =
    contrato?.status === 'RASCUNHO' && contrato.consideracoesPendentes && temAnexo
      ? acaoEnviarAssinatura
      : undefined

  const mostrarCampoPrazos =
    temAnexo &&
    (mostrarEnviarContratoCard ||
      (ajustandoContratoCliente && contrato?.status === 'RASCUNHO' && contrato.consideracoesPendentes))

  const campoPrazos = mostrarCampoPrazos ? (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <Typography variant='body2' color='text.primary'>
          Prazo para início da execução
        </Typography>
        <div className='flex flex-wrap items-center gap-2'>
          <CustomTextField
            type='number'
            inputProps={{ min: 1, step: 1 }}
            placeholder='Ex.: 15'
            value={prazoInicioExecucaoDias}
            onChange={e => setPrazoInicioExecucaoDias(e.target.value)}
            disabled={processando}
            sx={{ width: 130, flexShrink: 0 }}
          />
          <Typography variant='body1' color='text.secondary'>
            dias
          </Typography>
        </div>
        <Typography variant='body2' color='text.secondary'>
          Contado a partir do aceite do contrato pelo cliente (enquanto o servico aguarda execução).
        </Typography>
      </div>
      <div className='flex flex-col gap-2'>
        <Typography variant='body2' color='text.primary'>
          Prazo para conclusão do servico
        </Typography>
        <div className='flex flex-wrap items-center gap-2'>
          <CustomTextField
            type='number'
            inputProps={{ min: 1, step: 1 }}
            placeholder='Ex.: 90'
            value={prazoConclusaoDias}
            onChange={e => setPrazoConclusaoDias(e.target.value)}
            disabled={processando}
            sx={{ width: 130, flexShrink: 0 }}
          />
          <Typography variant='body1' color='text.secondary'>
            dias
          </Typography>
        </div>
        <Typography variant='body2' color='text.secondary'>
          Começa a contar apenas quando o servico for marcado como em execução.
        </Typography>
      </div>
    </div>
  ) : null

  const metaDocumento = documentoAtual ? metaDocumentoResumo(documentoAtual) : undefined

  const usaLayoutContratoEstruturado =
    contrato != null &&
    ['ENVIADO_AO_CLIENTE', 'AGUARDANDO_ASSINATURA', 'ACEITO', 'RECUSADO', 'AGUARDANDO_AJUSTE'].includes(
      contrato.status
    )

  const prazosMeta = resolverPrazosContratoMeta(servico, prazoInicioExecucaoDias, prazoConclusaoDias)

  const propsDocumentoEstruturado =
    documentoAtual && usaLayoutContratoEstruturado && contrato
      ? {
          metaItens: buildContratoDocumentoMetaItens(servico, contrato, prazosMeta),
          statusDocumento: <ContratoStatusBadge status={contrato.status} />
        }
      : {}

  const downloadDocumento = documentoAtual
    ? () =>
        void downloadDocumentoCatec(documentoAtual.id, documentoAtual.nomeOriginal).catch(err =>
          toast.error(err instanceof Error ? err.message : 'Download falhou.')
        )
    : undefined

  const previewContratoSubtitulo = documentoAtual
    ? `${servico.titulo} · v${documentoAtual.versao}`
    : servico.titulo

  const previewDocumentoProps = documentoAtual
    ? {
        documentoId: documentoAtual.id,
        previewTitulo: 'Contrato' as const,
        previewSubtitulo: previewContratoSubtitulo
      }
    : {}

  if (!contrato && !mostrarUploadCard) {
    return <ServicoStateCard titulo='Nenhum contrato cadastrado.' />
  }

  return (
    <Grid container spacing={6}>
      {mostrarUploadCard ? (
        <Grid size={{ xs: 12 }}>
          <ServicoUploadCard
            titulo={ajustandoContratoCliente ? 'Ajustar contrato' : 'Enviar contrato'}
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={metaDocumento}
            {...propsDocumentoEstruturado}
            onUpload={uploadContrato}
            disabled={processando}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
            areaEntreArquivoEAcoes={
              <>
                {campoPrazos}
                {ajustandoContratoCliente && desativaAssinaturaViaApi ? (
                  <Typography variant='body2' color='text.secondary'>
                    Assinatura via API ClickSign desativada. Reenvie o contrato nesta tela; aceite e recusa
                    continuam manuais, sem e-mail do provedor.
                  </Typography>
                ) : ajustandoContratoCliente && !assinaturaProviderAtivo ? (
                  <Typography variant='body2' color='text.secondary'>
                    Ative o provedor de assinatura (`stub` ou `clicksign`) para reenviar o contrato. Não há envio
                    manual.
                  </Typography>
                ) : null}
              </>
            }
            acoes={acoesAjustarContratoCard}
          />
        </Grid>
      ) : null}

      {mostrarEnviarContratoCard ? (
        <Grid size={{ xs: 12 }}>
          <ServicoUploadCard
            titulo='Enviar contrato'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={metaDocumento}
            onUpload={uploadContrato}
            disabled={processando}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
            areaEntreArquivoEAcoes={
              <>
                {campoPrazos}
                {desativaAssinaturaViaApi ? (
                  <Typography variant='body2' color='text.secondary'>
                    Assinatura via API ClickSign desativada. O envio não dispara e-mail; registre aceite ou recusa
                    na aba Contrato.
                  </Typography>
                ) : !assinaturaProviderAtivo ? (
                  <Typography variant='body2' color='text.secondary'>
                    Ative o provedor de assinatura (`stub` ou `clicksign`) para enviar o contrato. Não há envio
                    manual.
                  </Typography>
                ) : null}
              </>
            }
            acoes={acaoEnviarAssinatura}
          />
        </Grid>
      ) : null}

      {mostrarRespostaClienteCard ? (
        <Grid size={{ xs: 12 }}>
          <ServicoUploadCard
            titulo='Contrato'
            nomeArquivo={documentoAtual?.nomeOriginal}
            {...propsDocumentoEstruturado}
            permitirSubstituir={false}
            disabled={processando}
            onUpload={uploadContrato}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
            acoes={acoesRespostaClienteCard.length > 0 ? acoesRespostaClienteCard : undefined}
          />
        </Grid>
      ) : null}

      {mostrarContratoAceitoCard ? (
        <Grid size={{ xs: 12 }}>
          <ServicoUploadCard
            titulo='Contrato'
            nomeArquivo={documentoAtual?.nomeOriginal}
            {...propsDocumentoEstruturado}
            permitirSubstituir={false}
            disabled={processando}
            onUpload={uploadContrato}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
          />
        </Grid>
      ) : null}

      {mostrarContratoRecusadoCard ? (
        <Grid size={{ xs: 12 }}>
          <ServicoUploadCard
            titulo='Contrato recusado pelo cliente'
            nomeArquivo={documentoAtual?.nomeOriginal}
            {...propsDocumentoEstruturado}
            permitirSubstituir={podeEditarContrato}
            disabled={processando}
            onUpload={uploadContrato}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
          />
        </Grid>
      ) : null}

      {mostrarAssinaturaDiagnostico && assinatura ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader
              title='Assinatura eletrônica'
              action={
                contrato?.status === 'AGUARDANDO_ASSINATURA' || precisaRecuperarPdfAssinado ? (
                  <Button
                    size='small'
                    variant='tonal'
                    disabled={processando}
                    onClick={() =>
                      void atualizarStatusAssinatura()
                        .then(ciclo => {
                          if (isFalhaUltimaIteracao(ciclo?.ultimaIteracao)) {
                            toast.error(ciclo?.ultimaIteracao ?? 'Falha ao atualizar status.')

                            return
                          }

                          toast.success(
                            precisaRecuperarPdfAssinado
                              ? 'PDF assinado atualizado.'
                              : 'Status atualizado.'
                          )
                        })
                        .catch(err =>
                          toast.error(err instanceof Error ? err.message : 'Falha ao atualizar status.')
                        )
                    }
                  >
                    {precisaRecuperarPdfAssinado ? 'Buscar PDF assinado' : 'Atualizar status'}
                  </Button>
                ) : undefined
              }
            />
            <CardContent className='flex flex-col gap-2'>
              <Typography variant='body2'>
                Provedor: {assinatura.providerCodigo} · Status interno: {assinatura.statusInterno ?? '—'}
              </Typography>
              <Typography variant='body2'>Status externo: {assinatura.statusExterno ?? '—'}</Typography>
              <Typography variant='body2'>Envelope: {assinatura.externalEnvelopeId ?? '—'}</Typography>
              {assinatura.signatarios.length > 0 ? (
                <Typography variant='body2'>
                  Signatários:{' '}
                  {assinatura.signatarios.map(s => `${s.rotulo} — ${s.nome} (${s.email})`).join('; ')}
                </Typography>
              ) : null}
              {assinatura.ultimaIteracao ? (
                <Typography
                  variant='body2'
                  color={isFalhaUltimaIteracao(assinatura.ultimaIteracao) ? 'error' : 'text.secondary'}
                >
                  Última iteração: {assinatura.ultimaIteracao}
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {contrato &&
      !mostrarUploadCard &&
      !ajustandoContratoCliente &&
      !mostrarEnviarContratoCard &&
      !mostrarRespostaClienteCard &&
      !mostrarContratoAceitoCard &&
      !mostrarContratoRecusadoCard &&
      temAnexo ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader title='Contrato' />
            <CardContent className='flex flex-col gap-3'>
              {contrato.documentos.map(doc => (
                <ServicoFileRow
                  key={doc.id}
                  nomeArquivo={doc.nomeOriginal}
                  metaItens={buildContratoDocumentoMetaItens(servico, contrato, prazosMeta)}
                  status={<ContratoStatusBadge status={contrato.status} />}
                  documentoId={doc.id}
                  previewTitulo='Contrato'
                  previewSubtitulo={previewContratoSubtitulo}
                  onDownload={() =>
                    void downloadDocumentoCatec(doc.id, doc.nomeOriginal).catch(err =>
                      toast.error(err instanceof Error ? err.message : 'Download falhou.')
                    )
                  }
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {motivoCliente ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader title='Comentários' />
            <CardContent className='pts-0'>
              <Typography variant='body1' color='text.primary' sx={{ whiteSpace: 'pre-wrap' }}>
                {motivoCliente}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      <Dialog
        open={dialogEnvioAssinaturaAberto}
        onClose={fecharDialogEnvioAssinatura}
        fullWidth
        maxWidth={false}
        scroll='body'
        closeAfterTransition={false}
        slotProps={{ paper: { sx: { width: '100%', maxWidth: 680, overflow: 'visible' } } }}
      >
        <DialogCloseButton onClick={fecharDialogEnvioAssinatura} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle>Enviar para assinatura</DialogTitle>
        <DialogContent className='flex flex-col gap-5 pbs-2'>
          <Typography variant='body2' color='text.secondary'>
            Selecione os destinatários do cliente e os responsáveis CATEC que assinarão o contrato.
          </Typography>
          {carregandoSignatarios ? (
            <Typography variant='body2' color='text.secondary'>
              Carregando destinatários…
            </Typography>
          ) : (
            <>
              <Box className='flex flex-col gap-3'>
                <Box className='flex items-center justify-between gap-3'>
                  <Typography variant='subtitle2'>Assinatura do cliente</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {rotuloContadorSelecionados(chavesClienteSelecionadas.length)}
                  </Typography>
                </Box>
                <Box
                  role='group'
                  aria-label='Destinatários do cliente'
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    maxHeight: { xs: 220, sm: 260 },
                    overflowY: 'auto',
                    pr: 0.5
                  }}
                >
                  {signatariosDisponiveis.map(s => {
                    const selecionado = chavesClienteSelecionadas.includes(s.chave)

                    return (
                      <Box
                        key={s.chave}
                        component='label'
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          p: 2,
                          border: 1,
                          borderColor: selecionado ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                      >
                        <Checkbox
                          checked={selecionado}
                          onChange={e => alternarClienteSignatario(s.chave, e.target.checked)}
                          sx={{ p: 0.5, mt: -0.25 }}
                        />
                        <Box className='min-is-0 flex flex-col gap-0.5'>
                          <Typography variant='body1' fontWeight={600} className='break-words'>
                            {s.nome}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' className='break-all'>
                            {s.email}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              <Box className='flex flex-col gap-3'>
                <Box className='flex items-center justify-between gap-3'>
                  <Typography variant='subtitle2'>Assinatura da CATEC</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {rotuloContadorResponsaveis(signatariosCatecSelecionados.length)}
                  </Typography>
                </Box>
                <Autocomplete
                  options={opcoesCatec}
                  loading={carregandoCatec}
                  inputValue={buscaCatec}
                  value={null}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input' || reason === 'clear') {
                      buscarUsuariosCatec(value)
                    }
                  }}
                  onChange={(_, value) => adicionarSignatarioCatec(value)}
                  onOpen={() => {
                    if (opcoesCatec.length === 0) {
                      buscarUsuariosCatec(buscaCatec)
                    }
                  }}
                  getOptionLabel={o => `${o.nome} (${o.email})`}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  noOptionsText={buscaCatec.trim() ? 'Nenhum usuário encontrado' : 'Digite para pesquisar'}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label='Adicionar responsável CATEC'
                      placeholder='Nome ou e-mail'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {carregandoCatec ? <CircularProgress color='inherit' size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
                {signatariosCatecSelecionados.length > 0 ? (
                  <Box className='flex flex-wrap gap-2'>
                    {signatariosCatecSelecionados.map(u => (
                      <Chip
                        key={u.id}
                        size='small'
                        label={`${u.nome} (${u.email})`}
                        onDelete={() => removerSignatarioCatec(u.id)}
                        sx={{ maxWidth: '100%', '& .MuiChip-label': { whiteSpace: 'normal' } }}
                      />
                    ))}
                  </Box>
                ) : null}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant='tonal'
            color='secondary'
            onClick={fecharDialogEnvioAssinatura}
            disabled={processando || carregandoSignatarios}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={confirmarEnvioAssinatura}
            disabled={
              processando ||
              carregandoSignatarios ||
              chavesClienteSelecionadas.length === 0 ||
              signatariosCatecSelecionados.length === 0
            }
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogInteracaoCliente != null} onClose={fecharDialogInteracaoCliente} fullWidth maxWidth='sm'>
        <DialogTitle>
          {dialogInteracaoCliente ? TIPO_INTERACAO_ROTULO_CONTRATO[dialogInteracaoCliente] : 'Registrar resposta'}
        </DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          {contrato ? (
            <Typography variant='body2' color='text.secondary'>
              {servico.titulo} · {STATUS_CONTRATO_ROTULO[contrato.status]}
            </Typography>
          ) : null}
          <CustomTextField
            fullWidth
            multiline
            minRows={3}
            label='Texto'
            value={textoInteracaoCliente}
            onChange={e => setTextoInteracaoCliente(e.target.value)}
            placeholder='Descreva a resposta ou considerações do cliente.'
          />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={fecharDialogInteracaoCliente} disabled={processando}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color={
              dialogInteracaoCliente === 'RECUSA_CLIENTE'
                ? 'error'
                : dialogInteracaoCliente === 'ACEITE_CLIENTE'
                  ? 'success'
                  : 'primary'
            }
            onClick={confirmarInteracaoCliente}
            disabled={processando || !textoInteracaoCliente.trim()}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ServicoTabContrato
