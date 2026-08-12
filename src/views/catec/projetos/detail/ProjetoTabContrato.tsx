'use client'

import { useEffect, useState } from 'react'

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
import type { CatecSignatarioDisponivel } from '@/types/catec/assinaturaTypes'
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_CONTRATO_ROTULO,
  STATUS_CONTRATO_UPLOAD,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  type CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'

import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'
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
  const [emailSignatarioSelecionado, setEmailSignatarioSelecionado] = useState('')
  const [carregandoSignatarios, setCarregandoSignatarios] = useState(false)

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
    aguardandoRespostaCliente && hasPermission(PermissaoCodigo.ACAO_INTERACAO_REGISTRAR)

  const podeEnviarAssinatura =
    podeEditarContrato &&
    contrato?.status === 'RASCUNHO' &&
    temAnexo &&
    assinaturaProviderAtivo &&
    hasPermission(PermissaoCodigo.ACAO_CONTRATO_ASSINATURA_ENVIAR)

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

    setCarregandoSignatarios(true)
    setDialogEnvioAssinaturaAberto(true)
    setEmailSignatarioSelecionado('')

    void listarSignatariosAssinaturaCatec(projeto.id, contrato.id)
      .then(lista => {
        setSignatariosDisponiveis(lista)

        if (lista.length === 0) {
          toast.error('Cadastre o e-mail da empresa e/ou do responsável no cliente.')
          setDialogEnvioAssinaturaAberto(false)

          return
        }

        // Preferência: responsável; senão o primeiro disponível.
        const preferido =
          lista.find(s => s.papel === 'RESPONSAVEL') ?? lista[0]

        setEmailSignatarioSelecionado(preferido.email)
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

    if (!emailSignatarioSelecionado.trim()) {
      toast.error('Selecione para quem enviar a assinatura.')

      return
    }

    void enviarAssinatura({
      prazoInicioExecucaoDias: diasInicio,
      prazoConclusaoDias: diasConclusao,
      emails: [emailSignatarioSelecionado.trim()]
    })
      .then(() => {
        toast.success('Contrato enviado para assinatura eletrônica.')
        setDialogEnvioAssinaturaAberto(false)
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Envio para assinatura falhou.'))
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
    assinatura.documentoAssinadoId == null &&
    Boolean(assinatura.externalEnvelopeId)

  const mostrarAssinaturaDiagnostico =
    assinatura?.id != null &&
    Boolean(assinatura.externalEnvelopeId) &&
    (contrato?.status === 'AGUARDANDO_ASSINATURA' ||
      contrato?.status === 'ACEITO' ||
      contrato?.status === 'RECUSADO')

  const mostrarContratoAceitoCard = contrato?.status === 'ACEITO' && temAnexo

  const mostrarContratoRecusadoCard = contrato?.status === 'RECUSADO' && temAnexo

  const motivoCliente = contrato?.comentarioCliente?.trim() || null

  const mostrarUploadCard = Boolean(
    podeIniciarContrato ||
      (podeUploadExistente &&
        (ajustandoContratoCliente || (contrato?.status === 'RASCUNHO' && !temAnexo)))
  )

  const acaoEnviarAssinatura =
    podeEnviarAssinatura
      ? [
          {
            key: 'enviar-assinatura',
            label: 'Enviar para assinatura',
            color: 'primary' as const,
            alinhamento: 'fim' as const,
            onClick: handleEnviarAssinatura
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
                {ajustandoContratoCliente && !assinaturaProviderAtivo ? (
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
                {!assinaturaProviderAtivo ? (
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

      {mostrarAssinaturaDiagnostico && assinatura ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader
              title='Assinatura eletrônica'
              subheader={
                precisaRecuperarPdfAssinado
                  ? 'Contrato aceito, mas o PDF assinado ainda não foi anexado. Busque no provedor.'
                  : 'Diagnóstico do ciclo com o provedor (sem secrets).'
              }
              action={
                contrato?.status === 'AGUARDANDO_ASSINATURA' || precisaRecuperarPdfAssinado ? (
                  <Button
                    size='small'
                    variant='tonal'
                    disabled={processando}
                    onClick={() =>
                      void atualizarStatusAssinatura()
                        .then(() =>
                          toast.success(
                            precisaRecuperarPdfAssinado
                              ? 'PDF assinado atualizado.'
                              : 'Status atualizado.'
                          )
                        )
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
              {assinatura.documentoAssinadoId != null ? (
                <Typography variant='body2' color='success.main'>
                  PDF assinado anexado (documento #{assinatura.documentoAssinadoId}).
                </Typography>
              ) : null}
              {assinatura.ultimoErro && assinatura.documentoAssinadoId == null ? (
                <Typography variant='body2' color='error'>
                  Último erro: {assinatura.ultimoErro}
                </Typography>
              ) : null}
              <Typography variant='caption' color='text.secondary'>
                {precisaRecuperarPdfAssinado
                  ? 'Isso substitui o PDF do contrato pelo arquivo assinado da ClickSign.'
                  : contrato?.status === 'AGUARDANDO_ASSINATURA'
                    ? 'O status do contrato atualiza automaticamente quando a assinatura for concluída ou recusada.'
                    : 'Histórico do envio ao provedor de assinatura eletrônica.'}
              </Typography>
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
            Escolha um e-mail do cadastro do cliente. Apenas essa pessoa precisará assinar (1 assinatura).
          </Typography>
          {carregandoSignatarios ? (
            <Typography variant='body2' color='text.secondary'>
              Carregando e-mails…
            </Typography>
          ) : (
            <FormControl>
              <FormLabel id='signatario-assinatura-label'>Enviar para</FormLabel>
              <RadioGroup
                aria-labelledby='signatario-assinatura-label'
                name='signatario-assinatura'
                value={emailSignatarioSelecionado}
                onChange={e => setEmailSignatarioSelecionado(e.target.value)}
              >
                {signatariosDisponiveis.map(s => (
                  <FormControlLabel
                    key={s.email}
                    value={s.email}
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
            disabled={processando || carregandoSignatarios || !emailSignatarioSelecionado}
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
