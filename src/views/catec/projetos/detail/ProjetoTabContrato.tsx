'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Grid from '@mui/material/Grid'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecProjeto } from '@/types/catec/projetoTypes'
import {
  chaveSignatarioCliente,
  isFalhaUltimaIteracao,
  parseChaveSignatarioCliente,
  type CatecAssinaturaConfig,
  type CatecSignatarioDisponivel
} from '@/types/catec/assinaturaTypes'
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_CONTRATO_ROTULO,
  STATUS_CONTRATO_UPLOAD,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  type CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'

import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'
import { obterAssinaturaConfigCatec } from '@/libs/catecAssinaturaConfigApi'
import { listarSignatariosAssinaturaCatec } from '@/libs/catecProjetosApi'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'

import { projetoPermiteEditarContrato, projetoPermiteVisualizarContrato } from '../projetoFluxoHelpers'
import ContratoStatusBadge from '../ContratoStatusBadge'
import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import { buildContratoDocumentoMetaItens, metaDocumentoResumo, resolverPrazosContratoMeta } from './contratoDocumentoHelpers'
import ProjetoFileRow from './ProjetoFileRow'
import ProjetoStateCard from './ProjetoStateCard'
import ProjetoUploadCard from './ProjetoUploadCard'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  projeto: CatecProjeto
  fluxo: UseProjetoFluxoStore
}

type DialogInteracaoCliente = CatecTipoInteracaoFluxo | null

const ProjetoTabContrato = ({ projeto, fluxo }: Props) => {
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
  const [chaveSignatarioSelecionado, setChaveSignatarioSelecionado] = useState('')
  const [carregandoSignatarios, setCarregandoSignatarios] = useState(false)
  const [assinaturaConfig, setAssinaturaConfig] = useState<CatecAssinaturaConfig | null>(null)

  const [prazoInicioExecucaoDias, setPrazoInicioExecucaoDias] = useState(
    projeto.prazoInicioExecucaoDias != null ? String(projeto.prazoInicioExecucaoDias) : ''
  )

  const [prazoConclusaoDias, setPrazoConclusaoDias] = useState(
    projeto.prazoConclusaoDias != null ? String(projeto.prazoConclusaoDias) : ''
  )

  useEffect(() => {
    if (projeto.prazoInicioExecucaoDias != null) {
      setPrazoInicioExecucaoDias(String(projeto.prazoInicioExecucaoDias))
    }

    if (projeto.prazoConclusaoDias != null) {
      setPrazoConclusaoDias(String(projeto.prazoConclusaoDias))
    }
  }, [projeto.id, projeto.prazoInicioExecucaoDias, projeto.prazoConclusaoDias])

  useEffect(() => {
    void obterAssinaturaConfigCatec()
      .then(cfg => {
        setAssinaturaConfig(cfg)
      })
      .catch(() => {
        setAssinaturaConfig(null)
      })
  }, [projeto.id])

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

  const podeEditarContrato = projetoPermiteEditarContrato(projeto.status)
  const podeVisualizarContrato = projetoPermiteVisualizarContrato(projeto.status, contrato != null)

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
      toast.error('Informe o prazo para conclusão do projeto em dias.')

      return
    }

    if (!contrato) {
      return
    }

    const catecAtivos =
      assinaturaConfig?.signatariosCatec.filter(s => s.ativo && s.usuarioAtivo) ?? []

    if (assinaturaConfig?.exigeSignatarioCatec && catecAtivos.length === 0) {
      toast.error(
        'Configure ao menos um responsável CATEC em Configurações → Assinatura eletrônica antes de enviar.'
      )

      return
    }

    setCarregandoSignatarios(true)
    setDialogEnvioAssinaturaAberto(true)
    setChaveSignatarioSelecionado('')

    void Promise.all([
      listarSignatariosAssinaturaCatec(projeto.id, contrato.id),
      obterAssinaturaConfigCatec().catch(() => assinaturaConfig)
    ])
      .then(([lista, cfg]) => {
        if (cfg) {
          setAssinaturaConfig(cfg)
        }

        setSignatariosDisponiveis(lista)

        if (lista.length === 0) {
          toast.error('Cadastre o e-mail da empresa e/ou do responsável no cliente.')
          setDialogEnvioAssinaturaAberto(false)

          return
        }

        const papelPreferido = cfg?.clientePapelPreferido ?? 'RESPONSAVEL'

        const preferido =
          lista.find(s => s.papel === papelPreferido) ??
          lista.find(s => s.papel === 'RESPONSAVEL') ??
          lista[0]

        setChaveSignatarioSelecionado(chaveSignatarioCliente(preferido))
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

  function confirmarEnvioAssinatura() {
    const diasInicio = Number.parseInt(prazoInicioExecucaoDias.trim(), 10)
    const diasConclusao = Number.parseInt(prazoConclusaoDias.trim(), 10)

    if (!chaveSignatarioSelecionado.trim()) {
      toast.error('Selecione para quem enviar a assinatura.')

      return
    }

    const selecionado = parseChaveSignatarioCliente(chaveSignatarioSelecionado)
    const papel =
      selecionado.papel === 'EMPRESA' || selecionado.papel === 'RESPONSAVEL'
        ? selecionado.papel
        : undefined

    void enviarAssinatura({
      prazoInicioExecucaoDias: diasInicio,
      prazoConclusaoDias: diasConclusao,
      emails: [selecionado.email.trim()],
      papel
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
      toast.error('Informe o prazo para conclusão do projeto em dias.')

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
      <ProjetoStateCard
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
          Contado a partir do aceite do contrato pelo cliente (enquanto o projeto aguarda execução).
        </Typography>
      </div>
      <div className='flex flex-col gap-2'>
        <Typography variant='body2' color='text.primary'>
          Prazo para conclusão do projeto
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
          Começa a contar apenas quando o projeto for marcado como em execução.
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

  const prazosMeta = resolverPrazosContratoMeta(projeto, prazoInicioExecucaoDias, prazoConclusaoDias)

  const propsDocumentoEstruturado =
    documentoAtual && usaLayoutContratoEstruturado && contrato
      ? {
          metaItens: buildContratoDocumentoMetaItens(projeto, contrato, prazosMeta),
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
    ? `${projeto.titulo} · v${documentoAtual.versao}`
    : projeto.titulo

  const previewDocumentoProps = documentoAtual
    ? {
        documentoId: documentoAtual.id,
        previewTitulo: 'Contrato' as const,
        previewSubtitulo: previewContratoSubtitulo
      }
    : {}

  if (!contrato && !mostrarUploadCard) {
    return <ProjetoStateCard titulo='Nenhum contrato cadastrado.' />
  }

  return (
    <Grid container spacing={6}>
      {mostrarUploadCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
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
          <ProjetoUploadCard
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
          <ProjetoUploadCard
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
          <ProjetoUploadCard
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
          <ProjetoUploadCard
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
                <ProjetoFileRow
                  key={doc.id}
                  nomeArquivo={doc.nomeOriginal}
                  metaItens={buildContratoDocumentoMetaItens(projeto, contrato, prazosMeta)}
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

      <Dialog open={dialogEnvioAssinaturaAberto} onClose={fecharDialogEnvioAssinatura} fullWidth maxWidth='sm'>
        <DialogTitle>Enviar para assinatura</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          <Typography variant='body2' color='text.secondary'>
            Escolha o e-mail do cliente. Os responsáveis CATEC ativos entram automaticamente no envelope.
          </Typography>
          {carregandoSignatarios ? (
            <Typography variant='body2' color='text.secondary'>
              Carregando e-mails…
            </Typography>
          ) : (
            <>
              <FormControl>
                <FormLabel id='signatario-assinatura-label'>Assinatura do cliente</FormLabel>
                <RadioGroup
                  aria-labelledby='signatario-assinatura-label'
                  name='signatario-assinatura'
                  value={chaveSignatarioSelecionado}
                  onChange={e => setChaveSignatarioSelecionado(e.target.value)}
                >
                  {signatariosDisponiveis.map(s => (
                    <FormControlLabel
                      key={chaveSignatarioCliente(s)}
                      value={chaveSignatarioCliente(s)}
                      control={<Radio />}
                      label={
                        <span>
                          <strong>{s.rotulo}</strong> — {s.nome} ({s.email})
                        </span>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {(() => {
                const catecAtivos =
                  assinaturaConfig?.signatariosCatec.filter(s => s.ativo && s.usuarioAtivo) ?? []

                if (catecAtivos.length === 0) {
                  return (
                    <Alert severity='warning' variant='outlined'>
                      Nenhum responsável CATEC ativo.{' '}
                      <Link href='/catec/configuracoes/assinatura' className='underline'>
                        Abrir configuração
                      </Link>
                    </Alert>
                  )
                }

                return (
                  <Alert severity='info' variant='outlined'>
                    Também assinam (CATEC):{' '}
                    {catecAtivos.map(s => `${s.nome} (${s.email})`).join('; ')}
                  </Alert>
                )
              })()}
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
            disabled={processando || carregandoSignatarios || !chaveSignatarioSelecionado}
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
              {projeto.titulo} · {STATUS_CONTRATO_ROTULO[contrato.status]}
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

export default ProjetoTabContrato
