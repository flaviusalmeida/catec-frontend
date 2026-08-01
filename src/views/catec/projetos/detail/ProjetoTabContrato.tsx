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
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecProjeto } from '@/types/catec/projetoTypes'
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_CONTRATO_ROTULO,
  STATUS_CONTRATO_UPLOAD,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  type CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'

import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'

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
  const { data, assinatura, assinaturaProviderAtivo, uploadContrato, enviarContratoCliente, enviarAssinatura, atualizarStatusAssinatura, registrarInteracao, processando } = fluxo
  const { hasPermission } = useCatecPermission()
  const [dialogInteracaoCliente, setDialogInteracaoCliente] = useState<DialogInteracaoCliente>(null)
  const [textoInteracaoCliente, setTextoInteracaoCliente] = useState('')
  const [dialogAssinaturaAberto, setDialogAssinaturaAberto] = useState(false)
  const [signatarioNome, setSignatarioNome] = useState('')
  const [signatarioEmail, setSignatarioEmail] = useState('')

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

  function handleEnviarContratoCliente() {
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
      .then(() => toast.success('Contrato enviado ao cliente.'))
      .catch(err => toast.error(err instanceof Error ? err.message : 'Envio falhou.'))
  }

  function abrirDialogAssinatura() {
    setSignatarioNome('')
    setSignatarioEmail('')
    setDialogAssinaturaAberto(true)
  }

  function confirmarEnvioAssinatura() {
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

    if (!signatarioNome.trim() || !signatarioEmail.trim()) {
      toast.error('Informe nome e e-mail do signatário.')

      return
    }

    void enviarAssinatura({
      prazoInicioExecucaoDias: diasInicio,
      prazoConclusaoDias: diasConclusao,
      signatarios: [{ nome: signatarioNome.trim(), email: signatarioEmail.trim(), papel: 'CLIENTE' }]
    })
      .then(() => {
        toast.success('Contrato enviado para assinatura eletrônica.')
        setDialogAssinaturaAberto(false)
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

  const podeEnviarCliente = podeEditarContrato && contrato?.status === 'RASCUNHO' && temAnexo

  const mostrarEnviarContratoCard = Boolean(
    contrato && contrato.status === 'RASCUNHO' && temAnexo && podeEnviarCliente && !contrato.consideracoesPendentes
  )

  const mostrarRespostaClienteCard =
    (contrato?.status === 'ENVIADO_AO_CLIENTE' || contrato?.status === 'AGUARDANDO_ASSINATURA') && temAnexo

  const mostrarAssinaturaDiagnostico = contrato?.status === 'AGUARDANDO_ASSINATURA' && assinatura?.id != null

  const mostrarContratoAceitoCard = contrato?.status === 'ACEITO' && temAnexo

  const mostrarContratoRecusadoCard = contrato?.status === 'RECUSADO' && temAnexo

  const mostrarUploadCard = Boolean(
    podeIniciarContrato ||
      (podeUploadExistente &&
        (ajustandoContratoCliente || (contrato?.status === 'RASCUNHO' && !temAnexo)))
  )

  const acoesAjustarContratoCard =
    contrato?.status === 'RASCUNHO' && contrato.consideracoesPendentes && temAnexo
      ? [
          {
            key: 'enviar-cliente',
            label: 'Enviar ao cliente',
            color: 'primary' as const,
            alinhamento: 'fim' as const,
            onClick: handleEnviarContratoCliente
          }
        ]
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
            areaEntreArquivoEAcoes={campoPrazos}
            acoes={acoesAjustarContratoCard}
          />
        </Grid>
      ) : null}

      {contrato?.consideracoesCliente ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader
              title='Considerações do cliente'
              subheader='Ajuste o contrato conforme os comentários abaixo e reenvie ao cliente.'
            />
            <CardContent className='pts-0'>
              <Typography variant='body1' color='text.primary' sx={{ whiteSpace: 'pre-wrap' }}>
                {contrato.consideracoesCliente}
              </Typography>
            </CardContent>
          </Card>
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
            areaEntreArquivoEAcoes={campoPrazos}
            acoes={[
              {
                key: 'enviar-cliente',
                label: 'Enviar ao cliente',
                color: 'primary',
                alinhamento: 'fim',
                onClick: handleEnviarContratoCliente
              },
              ...(podeEnviarAssinatura
                ? [
                    {
                      key: 'enviar-assinatura',
                      label: 'Enviar para assinatura',
                      color: 'secondary' as const,
                      alinhamento: 'fim' as const,
                      onClick: abrirDialogAssinatura
                    }
                  ]
                : [])
            ]}
          />
        </Grid>
      ) : null}

      {mostrarAssinaturaDiagnostico && assinatura ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader
              title='Assinatura eletrônica'
              subheader='Diagnóstico do ciclo com o provedor (sem secrets).'
              action={
                <Button
                  size='small'
                  variant='tonal'
                  disabled={processando}
                  onClick={() =>
                    void atualizarStatusAssinatura()
                      .then(() => toast.success('Status atualizado.'))
                      .catch(err =>
                        toast.error(err instanceof Error ? err.message : 'Falha ao atualizar status.')
                      )
                  }
                >
                  Atualizar status
                </Button>
              }
            />
            <CardContent className='flex flex-col gap-2'>
              <Typography variant='body2'>
                Provedor: {assinatura.providerCodigo} · Status interno: {assinatura.statusInterno ?? '—'}
              </Typography>
              <Typography variant='body2'>Status externo: {assinatura.statusExterno ?? '—'}</Typography>
              <Typography variant='body2'>Envelope: {assinatura.externalEnvelopeId ?? '—'}</Typography>
              {assinatura.ultimoErro ? (
                <Typography variant='body2' color='error'>
                  Último erro: {assinatura.ultimoErro}
                </Typography>
              ) : null}
            </CardContent>
          </Card>
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

      <Dialog open={dialogAssinaturaAberto} onClose={() => !processando && setDialogAssinaturaAberto(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Enviar para assinatura eletrônica</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          <Typography variant='body2' color='text.secondary'>
            Informe o signatário do cliente. O PDF anexado será enviado ao provedor configurado.
          </Typography>
          <CustomTextField
            fullWidth
            label='Nome do signatário'
            value={signatarioNome}
            onChange={e => setSignatarioNome(e.target.value)}
            disabled={processando}
          />
          <CustomTextField
            fullWidth
            type='email'
            label='E-mail do signatário'
            value={signatarioEmail}
            onChange={e => setSignatarioEmail(e.target.value)}
            disabled={processando}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => setDialogAssinaturaAberto(false)}
            disabled={processando}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={confirmarEnvioAssinatura}
            disabled={processando || !signatarioNome.trim() || !signatarioEmail.trim()}
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
