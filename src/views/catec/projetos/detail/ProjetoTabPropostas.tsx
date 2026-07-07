'use client'

import { useEffect, useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecProjeto } from '@/types/catec/projetoTypes'
import type { CatecPropostaWorkflowActionKey } from '@/types/catec/projetoFluxoTypes'
import {
  STATUS_PROPOSTA_ENVIADA,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  STATUS_PROPOSTA_ROTULO,
  STATUS_PROPOSTA_UPLOAD,
  TIPO_INTERACAO_ROTULO_PROPOSTA,
  propostaAguardandoEnvioAoCliente,
  type CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'

import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'

import {
  formatarDataCurta,
  formatarDataHora,
  resolvePropostaWorkflowActions
} from '../projetoFluxoHelpers'
import PropostaStatusBadge from '../PropostaStatusBadge'
import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoFileRow from './ProjetoFileRow'
import ProjetoStateCard from './ProjetoStateCard'
import ProjetoUploadCard from './ProjetoUploadCard'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  projeto: CatecProjeto
  fluxo: UseProjetoFluxoStore
}

type DialogParecerMode = 'aprovar-socio' | 'reprovar-socio' | null
type DialogInteracaoCliente = CatecTipoInteracaoFluxo | null

const ProjetoTabPropostas = ({ projeto, fluxo }: Props) => {
  const { data, propostaAtual, uploadProposta, acaoProposta, registrarInteracao, processando } = fluxo
  const { hasPermission } = useCatecPermission()
  const [dialogParecer, setDialogParecer] = useState<DialogParecerMode>(null)
  const [dialogInteracaoCliente, setDialogInteracaoCliente] = useState<DialogInteracaoCliente>(null)
  const [observacao, setObservacao] = useState('')
  const [textoInteracaoCliente, setTextoInteracaoCliente] = useState('')
  const [arquivoSubstituidoNoAjuste, setArquivoSubstituidoNoAjuste] = useState(false)
  const projetoTemCliente = projeto.clienteId != null

  const documentoAtual = propostaAtual?.documentos[0] ?? null
  const temAnexo = Boolean(documentoAtual)
  const temPropostaAtiva = data.propostas.some(
    p =>
      p.status === 'RASCUNHO' ||
      p.status === 'PENDENTE_AVALIACAO' ||
      p.status === 'AGUARDANDO_ENVIO' ||
      p.status === 'AGUARDANDO_AJUSTE'
  )

  const propostaAguardandoEnvio = propostaAtual != null && propostaAguardandoEnvioAoCliente(propostaAtual)

  const ajustandoProposta =
    propostaAtual?.status === 'AGUARDANDO_AJUSTE' ||
    (propostaAtual?.status === 'RASCUNHO' &&
      Boolean(propostaAtual.parecerSocio || propostaAtual.consideracoesPendentes))

  useEffect(() => {
    if (!ajustandoProposta) {
      setArquivoSubstituidoNoAjuste(false)
    }
  }, [propostaAtual?.id, ajustandoProposta])

  const aguardandoAjusteCliente = data.propostas.some(
    p => p.consideracoesPendentes && p.status !== 'AGUARDANDO_AJUSTE'
  )

  const podeIniciarProposta =
    projetoTemCliente &&
    !temPropostaAtiva &&
    (data.propostas.length === 0 || aguardandoAjusteCliente)

  const podeUploadExistente =
    propostaAtual != null && STATUS_PROPOSTA_UPLOAD.includes(propostaAtual.status)

  const mostrarUpload = projetoTemCliente && (podeUploadExistente || podeIniciarProposta)
  const mostrarUploadCard =
    mostrarUpload &&
    (propostaAtual == null ||
      propostaAtual.status === 'AGUARDANDO_AJUSTE' ||
      propostaAtual.status === 'RASCUNHO')

  const versoesAnteriores = useMemo(() => {
    if (!propostaAtual) return data.propostas

    return data.propostas.filter(
      p => p.id !== propostaAtual.id && STATUS_PROPOSTA_ENVIADA.includes(p.status) && p.documentos.length > 0
    )
  }, [data.propostas, propostaAtual])

  const workflowActions = propostaAtual
    ? resolvePropostaWorkflowActions(propostaAtual.status, {
        hasAttachment: temAnexo,
        podeAprovarSocio: hasPermission(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR),
        podeDevolverSocio: hasPermission(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_DEVOLVER)
      })
    : []

  const acoesElaboracao = workflowActions.filter(acao => acao.key === 'solicitar-revisao')
  const acoesEnviarCliente = workflowActions.filter(acao => acao.key === 'enviar-cliente')

  const mostrarEnviarParaRevisao =
    temAnexo &&
    ((!ajustandoProposta && propostaAtual?.status === 'RASCUNHO') ||
      (ajustandoProposta &&
        (propostaAtual?.status === 'RASCUNHO' || arquivoSubstituidoNoAjuste)))

  const acoesAjustarPropostaCard = mostrarEnviarParaRevisao
    ? acoesElaboracao.map(acao => ({
        ...acao,
        onClick: () => handleAcaoWorkflow(acao.key as CatecPropostaWorkflowActionKey, acao.label)
      }))
    : undefined

  const acoesWorkflowRestantes = workflowActions.filter(
    acao => acao.key !== 'solicitar-revisao' && acao.key !== 'enviar-cliente'
  )

  const mostrarRevisaoSocioCard = propostaAtual?.status === 'PENDENTE_AVALIACAO' && temAnexo

  const mostrarEnviarClienteCard = propostaAguardandoEnvio && temAnexo

  const mostrarRespostaClienteCard = propostaAtual?.status === 'ENVIADA_AO_CLIENTE' && temAnexo

  const mostrarPropostaAceitaCard = propostaAtual?.status === 'ACEITA' && temAnexo

  const mostrarPropostaNegadaCard = propostaAtual?.status === 'NEGADA' && temAnexo

  const acoesRevisaoSocio = [...acoesWorkflowRestantes]
    .sort((a, b) => {
      if (a.key === 'reprovar-socio') return -1
      if (b.key === 'reprovar-socio') return 1

      return 0
    })
    .map(acao => ({
      ...acao,
      onClick: () => handleAcaoWorkflow(acao.key as CatecPropostaWorkflowActionKey, acao.label)
    }))

  const acoesEnviarClienteCard = acoesEnviarCliente.map(acao => ({
    ...acao,
    onClick: () => handleAcaoWorkflow(acao.key as CatecPropostaWorkflowActionKey, acao.label)
  }))

  const aguardandoRespostaCliente =
    propostaAtual != null && STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(propostaAtual.status)

  const podeRegistrarRespostaCliente =
    aguardandoRespostaCliente && hasPermission(PermissaoCodigo.ACAO_INTERACAO_REGISTRAR)

  const acoesRespostaCliente: Array<{
    tipo: CatecTipoInteracaoFluxo
    label: string
    color: 'primary' | 'success' | 'error' | 'secondary'
    variant: 'contained' | 'tonal'
  }> =
    propostaAtual?.status === 'AGUARDANDO_AJUSTE'
      ? [
          { tipo: 'ACEITE_CLIENTE', label: TIPO_INTERACAO_ROTULO_PROPOSTA.ACEITE_CLIENTE, color: 'success', variant: 'contained' },
          { tipo: 'RECUSA_CLIENTE', label: TIPO_INTERACAO_ROTULO_PROPOSTA.RECUSA_CLIENTE, color: 'error', variant: 'tonal' }
        ]
      : [
          {
            tipo: 'CONSIDERACOES_CLIENTE',
            label: TIPO_INTERACAO_ROTULO_PROPOSTA.CONSIDERACOES_CLIENTE,
            color: 'secondary',
            variant: 'tonal'
          },
          { tipo: 'ACEITE_CLIENTE', label: TIPO_INTERACAO_ROTULO_PROPOSTA.ACEITE_CLIENTE, color: 'success', variant: 'contained' },
          { tipo: 'RECUSA_CLIENTE', label: TIPO_INTERACAO_ROTULO_PROPOSTA.RECUSA_CLIENTE, color: 'error', variant: 'tonal' }
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

  function executarAcaoProposta(
    key: CatecPropostaWorkflowActionKey,
    label: string,
    parecer?: string
  ) {
    void acaoProposta(key, parecer)
      .then(() => toast.success(`Ação "${label}" executada.`))
      .catch(err => toast.error(err instanceof Error ? err.message : 'Ação não concluída.'))
  }

  function abrirDialogParecer(mode: Exclude<DialogParecerMode, null>) {
    setDialogParecer(mode)
    setObservacao('')
  }

  function fecharDialogParecer() {
    if (processando) return

    setDialogParecer(null)
    setObservacao('')
  }

  function confirmarDialogParecer() {
    if (!dialogParecer) return

    if (dialogParecer === 'reprovar-socio' && !observacao.trim()) {
      toast.error('Informe o parecer ao reprovar a proposta para elaboração.')

      return
    }

    const label = dialogParecer === 'aprovar-socio' ? 'Aprovar' : 'Reprovar'

    void acaoProposta(dialogParecer, observacao.trim() || undefined)
      .then(() => {
        toast.success(`Ação "${label}" executada.`)
        setDialogParecer(null)
        setObservacao('')
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Ação não concluída.'))
  }

  function handleAcaoWorkflow(key: CatecPropostaWorkflowActionKey, label: string) {
    if (key === 'aprovar-socio' || key === 'reprovar-socio') {
      abrirDialogParecer(key)

      return
    }

    executarAcaoProposta(key, label)
  }

  async function handleUploadProposta(file: File) {
    const eraAjustePendente = ajustandoProposta && propostaAtual?.status === 'AGUARDANDO_AJUSTE'

    await uploadProposta(file)

    if (eraAjustePendente) {
      setArquivoSubstituidoNoAjuste(true)
    }
  }

  if (!projetoTemCliente) {
    return (
      <ProjetoStateCard
        titulo='Nenhuma proposta cadastrada.'
        descricao='Associe um cliente ao projeto.'
      />
    )
  }

  if (data.propostas.length === 0 && !mostrarUpload) {
    return <ProjetoStateCard titulo='Nenhuma proposta cadastrada.' />
  }

  const previewPropostaSubtitulo = propostaAtual
    ? `${projeto.titulo} · v${propostaAtual.versao}`
    : projeto.titulo

  return (
    <Grid container spacing={6}>
      {mostrarUploadCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo={ajustandoProposta ? 'Ajustar proposta' : 'Enviar proposta'}
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={
              documentoAtual
                ? `Versão ${propostaAtual?.versao ?? '—'}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}`
                : undefined
            }
            arquivoExtra={
              propostaAtual?.status === 'AGUARDANDO_AJUSTE' ? (
                <PropostaStatusBadge status={propostaAtual.status} />
              ) : undefined
            }
            onUpload={handleUploadProposta}
            disabled={processando}
            documentoId={documentoAtual?.id}
            previewTitulo='Proposta comercial'
            previewSubtitulo={previewPropostaSubtitulo}
            onDownload={
              documentoAtual
                ? () =>
                    void downloadDocumentoCatec(documentoAtual.id, documentoAtual.nomeOriginal).catch(err =>
                      toast.error(err instanceof Error ? err.message : 'Download falhou.')
                    )
                : undefined
            }
            acoes={acoesAjustarPropostaCard}
          />
        </Grid>
      ) : null}

      {propostaAtual?.parecerSocio ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader
              title='Parecer do sócio'
              subheader='Ajuste a proposta conforme os comentários abaixo e reenvie para revisão.'
            />
            <CardContent className='pts-0'>
              <Typography variant='body1' color='text.primary' sx={{ whiteSpace: 'pre-wrap' }}>
                {propostaAtual.parecerSocio}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {propostaAtual?.consideracoesCliente ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader
              title='Considerações do cliente'
              subheader='Ajuste a proposta conforme os comentários abaixo e reenvie para revisão.'
            />
            <CardContent className='pts-0'>
              <Typography variant='body1' color='text.primary' sx={{ whiteSpace: 'pre-wrap' }}>
                {propostaAtual.consideracoesCliente}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {mostrarRevisaoSocioCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Revisar proposta'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={
              documentoAtual
                ? `Versão ${propostaAtual?.versao ?? '—'}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}`
                : undefined
            }
            arquivoExtra={
              propostaAtual ? (
                <PropostaStatusBadge status={propostaAtual.status} />
              ) : undefined
            }
            permitirSubstituir={false}
            disabled={processando}
            documentoId={documentoAtual?.id}
            previewTitulo='Proposta comercial'
            previewSubtitulo={previewPropostaSubtitulo}
            onUpload={uploadProposta}
            onDownload={() =>
              void downloadDocumentoCatec(documentoAtual!.id, documentoAtual!.nomeOriginal).catch(err =>
                toast.error(err instanceof Error ? err.message : 'Download falhou.')
              )
            }
            acoes={acoesRevisaoSocio.length > 0 ? acoesRevisaoSocio : undefined}
          />
        </Grid>
      ) : null}

      {mostrarEnviarClienteCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Proposta aprovada'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={
              documentoAtual
                ? `Versão ${propostaAtual?.versao ?? '—'}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}`
                : undefined
            }
            arquivoExtra={
              propostaAtual ? (
                <PropostaStatusBadge status={propostaAtual.status} />
              ) : undefined
            }
            permitirSubstituir={false}
            disabled={processando}
            documentoId={documentoAtual?.id}
            previewTitulo='Proposta comercial'
            previewSubtitulo={previewPropostaSubtitulo}
            onUpload={uploadProposta}
            onDownload={() =>
              void downloadDocumentoCatec(documentoAtual!.id, documentoAtual!.nomeOriginal).catch(err =>
                toast.error(err instanceof Error ? err.message : 'Download falhou.')
              )
            }
            acoes={acoesEnviarClienteCard.length > 0 ? acoesEnviarClienteCard : undefined}
          />
        </Grid>
      ) : null}

      {mostrarRespostaClienteCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Resposta do cliente'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={
              documentoAtual
                ? `Versão ${propostaAtual?.versao ?? '—'}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}`
                : undefined
            }
            arquivoExtra={
              propostaAtual ? (
                <PropostaStatusBadge status={propostaAtual.status} />
              ) : undefined
            }
            permitirSubstituir={false}
            disabled={processando}
            documentoId={documentoAtual?.id}
            previewTitulo='Proposta comercial'
            previewSubtitulo={previewPropostaSubtitulo}
            onUpload={uploadProposta}
            onDownload={() =>
              void downloadDocumentoCatec(documentoAtual!.id, documentoAtual!.nomeOriginal).catch(err =>
                toast.error(err instanceof Error ? err.message : 'Download falhou.')
              )
            }
            acoes={acoesRespostaClienteCard.length > 0 ? acoesRespostaClienteCard : undefined}
          />
        </Grid>
      ) : null}

      {mostrarPropostaAceitaCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Proposta aceita'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={
              documentoAtual
                ? `Versão ${propostaAtual?.versao ?? '—'}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}`
                : undefined
            }
            arquivoExtra={
              propostaAtual ? (
                <PropostaStatusBadge status={propostaAtual.status} />
              ) : undefined
            }
            permitirSubstituir={false}
            disabled={processando}
            documentoId={documentoAtual?.id}
            previewTitulo='Proposta comercial'
            previewSubtitulo={previewPropostaSubtitulo}
            onUpload={uploadProposta}
            onDownload={() =>
              void downloadDocumentoCatec(documentoAtual!.id, documentoAtual!.nomeOriginal).catch(err =>
                toast.error(err instanceof Error ? err.message : 'Download falhou.')
              )
            }
          />
        </Grid>
      ) : null}

      {mostrarPropostaNegadaCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Documento da proposta'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={
              documentoAtual
                ? `Versão ${propostaAtual?.versao ?? '—'}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}`
                : undefined
            }
            arquivoExtra={
              propostaAtual ? (
                <PropostaStatusBadge status={propostaAtual.status} />
              ) : undefined
            }
            permitirSubstituir={false}
            disabled={processando}
            documentoId={documentoAtual?.id}
            previewTitulo='Proposta comercial'
            previewSubtitulo={previewPropostaSubtitulo}
            onUpload={uploadProposta}
            onDownload={() =>
              void downloadDocumentoCatec(documentoAtual!.id, documentoAtual!.nomeOriginal).catch(err =>
                toast.error(err instanceof Error ? err.message : 'Download falhou.')
              )
            }
          />
        </Grid>
      ) : null}

      {propostaAtual &&
      !mostrarUploadCard &&
      !mostrarRevisaoSocioCard &&
      !mostrarEnviarClienteCard &&
      !mostrarRespostaClienteCard &&
      !mostrarPropostaAceitaCard &&
      !mostrarPropostaNegadaCard &&
      temAnexo ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader
              title={
                propostaAguardandoEnvio || STATUS_PROPOSTA_ENVIADA.includes(propostaAtual.status)
                  ? 'Documento da proposta'
                  : 'Documento da proposta em elaboração'
              }
            />
            <CardContent className='flex flex-col gap-3'>
              {propostaAtual.documentos.map(doc => (
                <ProjetoFileRow
                  key={doc.id}
                  nomeArquivo={doc.nomeOriginal}
                  meta={`Versão ${propostaAtual.versao}${doc.criadoEm ? ` • ${formatarDataCurta(doc.criadoEm)}` : ''}`}
                  documentoId={doc.id}
                  previewTitulo='Proposta comercial'
                  previewSubtitulo={previewPropostaSubtitulo}
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

      {versoesAnteriores.length > 0 ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader title='Versões anteriores' />
            <CardContent className='flex flex-col gap-3'>
              {versoesAnteriores.map(proposta => {
                const doc = proposta.documentos[0]

                if (!doc) return null

                const titulo = proposta.enviadaClienteEm
                  ? `v${proposta.versao} — enviada em ${formatarDataHora(proposta.enviadaClienteEm)}`
                  : `v${proposta.versao} — ${STATUS_PROPOSTA_ROTULO[proposta.status]}`

                return (
                  <ProjetoFileRow
                    key={proposta.id}
                    nomeArquivo={doc.nomeOriginal}
                    meta={`Versão ${proposta.versao} • ${titulo}`}
                    documentoId={doc.id}
                    previewTitulo='Proposta comercial'
                    previewSubtitulo={`${projeto.titulo} · v${proposta.versao}`}
                    onDownload={() =>
                    void downloadDocumentoCatec(doc.id, doc.nomeOriginal).catch(err =>
                      toast.error(err instanceof Error ? err.message : 'Download falhou.')
                    )
                  }
                  />
                )
              })}
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {acoesWorkflowRestantes.length > 0 && !mostrarRevisaoSocioCard ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardContent className='flex flex-wrap gap-3'>
              {acoesWorkflowRestantes.map(acao => (
                <Button
                  key={acao.key}
                  variant={acao.color === 'primary' ? 'contained' : 'tonal'}
                  color={acao.color === 'error' ? 'error' : acao.color === 'secondary' ? 'secondary' : 'primary'}
                  onClick={() => handleAcaoWorkflow(acao.key as CatecPropostaWorkflowActionKey, acao.label)}
                  disabled={processando}
                >
                  {acao.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      <Dialog open={dialogInteracaoCliente != null} onClose={fecharDialogInteracaoCliente} fullWidth maxWidth='sm'>
        <DialogTitle>
          {dialogInteracaoCliente ? TIPO_INTERACAO_ROTULO_PROPOSTA[dialogInteracaoCliente] : 'Registrar resposta'}
        </DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          {propostaAtual ? (
            <Typography variant='body2' color='text.secondary'>
              {projeto.titulo} · v{propostaAtual.versao} · {STATUS_PROPOSTA_ROTULO[propostaAtual.status]}
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

      <Dialog open={dialogParecer != null} onClose={fecharDialogParecer} fullWidth maxWidth='sm'>
        <DialogTitle>{dialogParecer === 'aprovar-socio' ? 'Aprovar proposta' : 'Reprovar proposta'}</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          {propostaAtual ? (
            <Typography variant='body2' color='text.secondary'>
              {projeto.titulo} · v{propostaAtual.versao}
            </Typography>
          ) : null}
          <CustomTextField
            fullWidth
            multiline
            minRows={3}
            label={dialogParecer === 'reprovar-socio' ? 'Parecer (obrigatório)' : 'Observação (opcional)'}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            placeholder={
              dialogParecer === 'reprovar-socio'
                ? 'Descreva os ajustes necessários na proposta.'
                : 'Comentário opcional sobre a aprovação.'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={fecharDialogParecer} disabled={processando}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color={dialogParecer === 'aprovar-socio' ? 'success' : 'error'}
            onClick={confirmarDialogParecer}
            disabled={processando || (dialogParecer === 'reprovar-socio' && !observacao.trim())}
          >
            {dialogParecer === 'aprovar-socio' ? 'Confirmar aprovação' : 'Confirmar reprovação'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ProjetoTabPropostas
