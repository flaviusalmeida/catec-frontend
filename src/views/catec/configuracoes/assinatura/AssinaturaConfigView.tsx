'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import {
  atualizarAssinaturaConfigCatec,
  obterAssinaturaConfigCatec,
  testarConexaoAssinaturaCatec
} from '@/libs/catecAssinaturaConfigApi'
import type { CatecAssinaturaAmbiente, CatecAssinaturaConfig, CatecAssinaturaConfigUpdate } from '@/types/catec/assinaturaTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'
import { useCatecPermission } from '@/hooks/useCatecPermission'

type StatusIntegracao = 'ativo' | 'inativo' | 'erro'

function normalizarAmbienteClicksign(ambiente: string | undefined): CatecAssinaturaAmbiente {
  return ambiente === 'producao' ? 'producao' : 'sandbox'
}

function rotuloAmbiente(ambiente: string | undefined): string {
  switch (ambiente) {
    case 'sandbox':
      return 'Sandbox'
    case 'producao':
      return 'Produção'
    case 'local':
      return 'Local'
    case 'desligado':
      return 'Desligado'
    default:
      return ambiente && ambiente.length > 0 && ambiente !== 'desconhecido'
        ? ambiente
        : 'Desconhecido'
  }
}

function corAmbiente(ambiente: string): 'success' | 'error' | 'default' | 'info' {
  switch (ambiente) {
    case 'sandbox':
      return 'success'
    case 'producao':
      return 'error'
    case 'local':
      return 'info'
    default:
      return 'default'
  }
}

function rotuloProvedor(codigo: string): string {
  switch (codigo) {
    case 'clicksign':
      return 'ClickSign'
    case 'stub':
      return 'Stub (desenvolvimento)'
    case 'none':
      return 'Nenhum'
    default:
      return codigo
  }
}

function resolverDiagnosticoProvedor(config: CatecAssinaturaConfig | null) {
  const codigo = (config?.providerCodigo ?? 'none').toLowerCase()

  const webhookPath =
    config?.webhookPath?.trim() ||
    (codigo !== 'none' ? `/api/v1/webhooks/assinatura/${codigo}` : '')

  const webhookUrl =
    config?.webhookUrl?.trim() ||
    (webhookPath ? `http://localhost:8080${webhookPath}` : '')

  const ambienteAtivo = normalizarAmbienteClicksign(config?.ambiente)
  const ambiente = config?.ambiente?.trim() || ambienteAtivo
  const apiBaseUrl = config?.apiBaseUrl?.trim() || null

  const tokenOk = codigo === 'clicksign' ? Boolean(config?.accessTokenConfigurado) : false
  const secretOk = Boolean(config?.webhookSecretConfigurado)

  return {
    codigo,
    webhookPath,
    webhookUrl,
    apiBaseUrl,
    ambiente,
    ambienteAtivo,
    ambienteSandboxConfigurado: config?.ambienteSandboxConfigurado === true,
    ambienteProducaoConfigurado: config?.ambienteProducaoConfigurado === true,
    tokenOk,
    secretOk,
    aplicaCredenciais: codigo === 'clicksign' || codigo === 'stub'
  }
}

function resolverStatusIntegracao(providerAtivo: boolean, erroTeste: string | null): StatusIntegracao {
  if (erroTeste) {
    return 'erro'
  }

  return providerAtivo ? 'ativo' : 'inativo'
}

function chipStatusIntegracao(status: StatusIntegracao) {
  switch (status) {
    case 'ativo':
      return { label: '● Ativo', color: 'success' as const }
    case 'erro':
      return { label: '● Erro', color: 'error' as const }
    default:
      return { label: '● Inativo', color: 'default' as const }
  }
}

async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success('Copiado para a área de transferência.')
  } catch {
    toast.error('Não foi possível copiar.')
  }
}

function InfoLinha({
  rotulo,
  valor,
  monospace = false,
  acao
}: {
  rotulo: string
  valor: ReactNode
  monospace?: boolean
  acao?: ReactNode
}) {
  return (
    <Box className='flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-3'>
      <Typography variant='body2' color='text.secondary' sx={{ minWidth: 72, flexShrink: 0 }}>
        {rotulo}
      </Typography>
      <Box className='flex min-is-0 flex-1 flex-wrap items-center gap-1'>
        {typeof valor === 'string' ? (
          <Typography
            variant='body2'
            color='text.primary'
            sx={{ fontFamily: monospace ? 'monospace' : undefined, wordBreak: 'break-all' }}
          >
            {valor}
          </Typography>
        ) : (
          valor
        )}
        {acao}
      </Box>
    </Box>
  )
}

function CredencialEstado({ ok, rotuloOk, rotuloFaltando }: { ok: boolean; rotuloOk: string; rotuloFaltando: string }) {
  return (
    <Typography variant='body2' className='flex items-start gap-2'>
      <i
        className={
          ok ? 'tabler-circle-check-filled text-success mt-0.5' : 'tabler-alert-triangle-filled text-warning mt-0.5'
        }
      />
      <span>{ok ? rotuloOk : rotuloFaltando}</span>
    </Typography>
  )
}

function RegraFluxoItem({
  titulo,
  descricao,
  icon,
  checked,
  disabled,
  onChange
}: {
  titulo: string
  descricao: string
  icon: string
  checked: boolean
  disabled: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1
      }}
    >
      <Box className='flex min-is-0 items-start gap-2.5'>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 1,
            flexShrink: 0,
            bgcolor: 'action.hover',
            color: 'text.secondary'
          }}
        >
          <i className={`${icon} text-lg`} />
        </Box>
        <Box className='flex min-is-0 flex-col gap-0.5'>
          <Typography variant='body2' fontWeight={600}>
            {titulo}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {descricao}
          </Typography>
        </Box>
      </Box>
      <Box className='flex shrink-0 items-center gap-1'>
        <Typography variant='caption' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
          {checked ? 'Ativado' : 'Desativado'}
        </Typography>
        <Switch size='small' checked={checked} disabled={disabled} onChange={onChange} />
      </Box>
    </Box>
  )
}

const AssinaturaConfigView = () => {
  const { hasPermission } = useCatecPermission()
  const podeGerir = hasPermission(PermissaoCodigo.ACAO_CONFIG_ASSINATURA_GERIR)

  const [config, setConfig] = useState<CatecAssinaturaConfig | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [testandoConexao, setTestandoConexao] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)
  const [erroTesteConexao, setErroTesteConexao] = useState<string | null>(null)
  const [confirmProducaoOpen, setConfirmProducaoOpen] = useState(false)
  const [ambientePendente, setAmbientePendente] = useState<CatecAssinaturaAmbiente | null>(null)

  const [exigeSignatarioCatec, setExigeSignatarioCatec] = useState(true)
  const [permiteInteracaoManualContrato, setPermiteInteracaoManualContrato] = useState(false)
  const [desativaAssinaturaViaApi, setDesativaAssinaturaViaApi] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroCarregamento(null)

    try {
      const data = await obterAssinaturaConfigCatec()

      setConfig(data)
      setExigeSignatarioCatec(data.exigeSignatarioCatec)
      setPermiteInteracaoManualContrato(data.permiteInteracaoManualContrato)
      setDesativaAssinaturaViaApi(data.desativaAssinaturaViaApi)
    } catch (err) {
      setErroCarregamento(err instanceof Error ? err.message : 'Falha ao carregar configuração.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const provedorDiag = useMemo(() => resolverDiagnosticoProvedor(config), [config])
  const statusIntegracao = resolverStatusIntegracao(Boolean(config?.providerAtivo), erroTesteConexao)
  const statusChip = chipStatusIntegracao(statusIntegracao)
  const utilizaAssinaturaViaApi = !desativaAssinaturaViaApi

  async function salvarParametros(payload: CatecAssinaturaConfigUpdate) {
    if (!podeGerir) return

    setSalvando(true)

    try {
      const atualizado = await atualizarAssinaturaConfigCatec(payload)

      setConfig(atualizado)
      setExigeSignatarioCatec(atualizado.exigeSignatarioCatec)
      setPermiteInteracaoManualContrato(atualizado.permiteInteracaoManualContrato)
      setDesativaAssinaturaViaApi(atualizado.desativaAssinaturaViaApi)
      setErroTesteConexao(null)
      toast.success('Configuração salva.')
    } catch (err) {
      if (config) {
        setExigeSignatarioCatec(config.exigeSignatarioCatec)
        setPermiteInteracaoManualContrato(config.permiteInteracaoManualContrato)
        setDesativaAssinaturaViaApi(config.desativaAssinaturaViaApi)
      }

      toast.error(err instanceof Error ? err.message : 'Falha ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  function solicitarTrocaAmbiente(novo: CatecAssinaturaAmbiente | null) {
    if (!novo || !config || salvando) {
      return
    }

    const atual = normalizarAmbienteClicksign(config.ambiente)

    if (novo === atual) {
      return
    }

    if (novo === 'producao' && !provedorDiag.ambienteProducaoConfigurado) {
      toast.error('Ambiente de produção não configurado no servidor (.env).')

      return
    }

    if (novo === 'sandbox' && !provedorDiag.ambienteSandboxConfigurado) {
      toast.error('Ambiente sandbox não configurado no servidor (.env).')

      return
    }

    if (novo === 'producao') {
      setAmbientePendente(novo)
      setConfirmProducaoOpen(true)

      return
    }

    void salvarParametros({
      exigeSignatarioCatec,
      permiteInteracaoManualContrato,
      desativaAssinaturaViaApi,
      ambienteClicksign: novo
    })
  }

  async function confirmarTrocaProducao() {
    if (!ambientePendente) {
      setConfirmProducaoOpen(false)

      return
    }

    setConfirmProducaoOpen(false)

    await salvarParametros({
      exigeSignatarioCatec,
      permiteInteracaoManualContrato,
      desativaAssinaturaViaApi,
      ambienteClicksign: ambientePendente
    })
    setAmbientePendente(null)
  }

  async function handleTestarConexao() {
    if (!podeGerir || testandoConexao) {
      return
    }

    setTestandoConexao(true)
    setErroTesteConexao(null)

    try {
      const resultado = await testarConexaoAssinaturaCatec()

      if (resultado.ok) {
        setErroTesteConexao(null)
        setConfig(prev =>
          prev
            ? {
                ...prev,
                providerAtivo: resultado.providerAtivo
              }
            : prev
        )
        toast.success(resultado.mensagem || 'Conexão estabelecida.')
      } else {
        setErroTesteConexao(resultado.mensagem || 'Falha ao testar a conexão.')
        toast.error(resultado.mensagem || 'Falha ao testar a conexão.')
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Falha ao testar a conexão.'

      setErroTesteConexao(mensagem)
      toast.error(mensagem)
    } finally {
      setTestandoConexao(false)
    }
  }

  if (carregando) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }} className='flex justify-center p-12'>
          <CircularProgress />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Assinatura eletrônica</Typography>
        <Typography variant='body2' color='text.secondary' className='mbs-1'>
          Configuração da integração e regras do fluxo de assinatura.
        </Typography>
      </Grid>

      {erroCarregamento ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' variant='outlined'>
            {erroCarregamento}
          </Alert>
        </Grid>
      ) : null}

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <Box className='flex items-center justify-between gap-3'>
              <Typography variant='h6'>Integração</Typography>
              <Chip size='small' color={statusChip.color} label={statusChip.label} variant='tonal' />
            </Box>

            <Grid container spacing={0}>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{
                  pr: { md: 4 },
                  pb: { xs: 3, md: 0 },
                  borderRight: { md: '1px solid' },
                  borderColor: { md: 'divider' }
                }}
              >
                <Typography variant='subtitle2' className='mbe-2'>
                  Informações da integração
                </Typography>
                <Box className='flex flex-col gap-2'>
                  <InfoLinha rotulo='Provedor' valor={rotuloProvedor(provedorDiag.codigo)} />
                  <InfoLinha rotulo='Código' valor={provedorDiag.codigo} monospace />
                  <InfoLinha
                    rotulo='Ambiente'
                    valor={
                      podeGerir && provedorDiag.codigo === 'clicksign' ? (
                        <ToggleButtonGroup
                          exclusive
                          size='small'
                          color='primary'
                          value={provedorDiag.ambienteAtivo}
                          disabled={salvando}
                          onChange={(_e, value: CatecAssinaturaAmbiente | null) => solicitarTrocaAmbiente(value)}
                        >
                          <ToggleButton
                            value='sandbox'
                            disabled={!provedorDiag.ambienteSandboxConfigurado}
                            aria-label='Sandbox'
                          >
                            Sandbox
                          </ToggleButton>
                          <ToggleButton
                            value='producao'
                            disabled={!provedorDiag.ambienteProducaoConfigurado}
                            aria-label='Produção'
                          >
                            Produção
                          </ToggleButton>
                        </ToggleButtonGroup>
                      ) : (
                        <Chip
                          size='small'
                          variant='tonal'
                          color={corAmbiente(provedorDiag.ambiente)}
                          label={rotuloAmbiente(provedorDiag.ambiente)}
                        />
                      )
                    }
                  />
                  {podeGerir && provedorDiag.codigo === 'clicksign' ? (
                    <Typography variant='caption' color='text.secondary'>
                      Credenciais (token, segredo e URL) ficam no .env do servidor. Novos envios usam o ambiente
                      selecionado; contratos já enviados continuam no ambiente original.
                    </Typography>
                  ) : null}
                  {provedorDiag.apiBaseUrl ? (
                    <InfoLinha
                      rotulo='API'
                      valor={provedorDiag.apiBaseUrl}
                      monospace
                      acao={
                        <IconButton
                          size='small'
                          aria-label='Copiar URL da API'
                          onClick={() => void copiarTexto(provedorDiag.apiBaseUrl ?? '')}
                        >
                          <i className='tabler-copy text-base' />
                        </IconButton>
                      }
                    />
                  ) : null}
                  {provedorDiag.webhookUrl ? (
                    <InfoLinha
                      rotulo='Webhook'
                      valor={provedorDiag.webhookUrl}
                      monospace
                      acao={
                        <IconButton
                          size='small'
                          aria-label='Copiar URL do webhook'
                          onClick={() => void copiarTexto(provedorDiag.webhookUrl)}
                        >
                          <i className='tabler-copy text-base' />
                        </IconButton>
                      }
                    />
                  ) : null}
                </Box>
              </Grid>

              {provedorDiag.aplicaCredenciais ? (
                <Grid size={{ xs: 12, md: 6 }} sx={{ pl: { md: 4 } }}>
                  <Typography variant='subtitle2' className='mbe-2'>
                    Credenciais
                  </Typography>
                  <Box className='flex flex-col gap-2'>
                    {provedorDiag.codigo === 'clicksign' ? (
                      <>
                        <CredencialEstado
                          ok={provedorDiag.tokenOk}
                          rotuloOk='Token de API configurado'
                          rotuloFaltando='Token de API não configurado'
                        />
                        <CredencialEstado
                          ok={provedorDiag.secretOk}
                          rotuloOk='Segredo do webhook configurado'
                          rotuloFaltando='Segredo do webhook não configurado'
                        />
                      </>
                    ) : (
                      <CredencialEstado
                        ok={provedorDiag.secretOk}
                        rotuloOk='Segredo do webhook configurado'
                        rotuloFaltando='Segredo do webhook não configurado'
                      />
                    )}

                    {erroTesteConexao ? (
                      <Alert severity='error' variant='outlined' sx={{ py: 0.5 }}>
                        {erroTesteConexao}
                      </Alert>
                    ) : null}

                    {podeGerir && provedorDiag.codigo !== 'none' ? (
                      <Box className='mbs-1'>
                        <Button
                          size='small'
                          variant='outlined'
                          startIcon={
                            testandoConexao ? (
                              <CircularProgress size={14} color='inherit' />
                            ) : (
                              <i className='tabler-bolt' />
                            )
                          }
                          disabled={testandoConexao || salvando}
                          onClick={() => void handleTestarConexao()}
                        >
                          {testandoConexao ? 'Testando…' : 'Testar conexão'}
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                </Grid>
              ) : null}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={confirmProducaoOpen} onClose={() => setConfirmProducaoOpen(false)}>
        <DialogTitle>Ativar ambiente de produção?</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary'>
            Os próximos contratos serão enviados para a ClickSign de produção. Confirme que o token, o segredo do
            webhook e a URL pública do backend estão corretos no .env.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmProducaoOpen(false)}>Cancelar</Button>
          <Button color='error' variant='contained' onClick={() => void confirmarTrocaProducao()}>
            Usar produção
          </Button>
        </DialogActions>
      </Dialog>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <Typography variant='h6'>Regras do fluxo de assinatura</Typography>

            <Box className='flex flex-col gap-2'>
              <RegraFluxoItem
                titulo='Exigir responsável CATEC'
                descricao='Pelo menos um usuário interno deve participar da assinatura do contrato.'
                icon='tabler-user'
                checked={exigeSignatarioCatec}
                disabled={!podeGerir || salvando}
                onChange={e => {
                  const checked = e.target.checked

                  setExigeSignatarioCatec(checked)
                  void salvarParametros({
                    exigeSignatarioCatec: checked,
                    permiteInteracaoManualContrato,
                    desativaAssinaturaViaApi
                  })
                }}
              />

              <RegraFluxoItem
                titulo='Utilizar assinatura via API ClickSign'
                descricao='Os contratos serão enviados automaticamente para assinatura através da API do ClickSign.'
                icon='tabler-link'
                checked={utilizaAssinaturaViaApi}
                disabled={!podeGerir || salvando}
                onChange={e => {
                  const utilizarApi = e.target.checked
                  const desativaApi = !utilizarApi

                  setDesativaAssinaturaViaApi(desativaApi)

                  if (desativaApi) {
                    setPermiteInteracaoManualContrato(true)
                  }

                  void salvarParametros({
                    exigeSignatarioCatec,
                    permiteInteracaoManualContrato: desativaApi ? true : permiteInteracaoManualContrato,
                    desativaAssinaturaViaApi: desativaApi
                  })
                }}
              />

              <RegraFluxoItem
                titulo='Permitir contingência manual'
                descricao='Permite concluir o fluxo manualmente caso a assinatura eletrônica não esteja disponível.'
                icon='tabler-shield'
                checked={permiteInteracaoManualContrato}
                disabled={!podeGerir || salvando || desativaAssinaturaViaApi}
                onChange={e => {
                  const checked = e.target.checked

                  setPermiteInteracaoManualContrato(checked)
                  void salvarParametros({
                    exigeSignatarioCatec,
                    permiteInteracaoManualContrato: checked,
                    desativaAssinaturaViaApi
                  })
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'action.hover'
              }}
            >
              <i className='tabler-info-circle text-textSecondary text-lg shrink-0' />
              <Box className='flex min-is-0 flex-col gap-0.5'>
                <Typography variant='body2' fontWeight={600}>
                  Como funciona o envio
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Os e-mails do cliente e os responsáveis CATEC são definidos no momento do envio do contrato, na tela
                  de envio.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AssinaturaConfigView
