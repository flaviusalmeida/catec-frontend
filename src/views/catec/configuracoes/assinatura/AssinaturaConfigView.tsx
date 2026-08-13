'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import CanPermission from '@/components/catec/CanPermission'
import CustomTextField from '@core/components/mui/TextField'
import {
  adicionarSignatarioCatec,
  atualizarAssinaturaConfigCatec,
  atualizarSignatarioCatec,
  listarUsuariosDisponiveisSignatarioCatec,
  obterAssinaturaConfigCatec,
  removerSignatarioCatec
} from '@/libs/catecAssinaturaConfigApi'
import type {
  CatecAssinaturaConfig,
  CatecUsuarioCandidatoSignatario
} from '@/types/catec/assinaturaTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'

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

function resolverDiagnosticoProvedor(config: CatecAssinaturaConfig | null) {
  const codigo = (config?.providerCodigo ?? 'none').toLowerCase()
  const webhookPath =
    config?.webhookPath?.trim() ||
    (codigo !== 'none' ? `/api/v1/webhooks/assinatura/${codigo}` : '')
  const webhookUrl =
    config?.webhookUrl?.trim() ||
    (webhookPath ? `http://localhost:8080${webhookPath}` : '')

  let ambiente = config?.ambiente ?? 'desconhecido'
  const apiBaseUrl = config?.apiBaseUrl?.trim() || null

  if ((!ambiente || ambiente === 'desconhecido') && apiBaseUrl) {
    const lower = apiBaseUrl.toLowerCase()

    if (lower.includes('sandbox')) ambiente = 'sandbox'
    else if (lower.includes('app.clicksign.com') || lower.includes('api.clicksign.com')) ambiente = 'producao'
  }

  if ((!ambiente || ambiente === 'desconhecido') && codigo === 'clicksign' && config?.providerAtivo) {
    ambiente = 'sandbox'
  }

  const tokenOk =
    codigo === 'clicksign' ? Boolean(config?.accessTokenConfigurado || config?.providerAtivo) : false
  const secretOk = Boolean(config?.webhookSecretConfigurado)
  const diagnosticoCompleto = Boolean(config?.webhookPath || config?.webhookUrl)

  return {
    codigo,
    webhookPath,
    webhookUrl,
    webhookUrlPublica: Boolean(config?.webhookUrlPublica),
    apiBaseUrl:
      apiBaseUrl ||
      (codigo === 'clicksign' ? 'https://sandbox.clicksign.com/api/v3' : null),
    ambiente,
    tokenOk,
    secretOk,
    diagnosticoCompleto,
    eventos: config?.webhookEventosEsperados ?? []
  }
}

const AssinaturaConfigView = () => {
  const [config, setConfig] = useState<CatecAssinaturaConfig | null>(null)
  const [candidatos, setCandidatos] = useState<CatecUsuarioCandidatoSignatario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState('')

  const [exigeSignatarioCatec, setExigeSignatarioCatec] = useState(true)
  const [clientePapelPreferido, setClientePapelPreferido] = useState<'EMPRESA' | 'RESPONSAVEL'>('RESPONSAVEL')

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      const data = await obterAssinaturaConfigCatec()

      setConfig(data)
      setExigeSignatarioCatec(data.exigeSignatarioCatec)
      setClientePapelPreferido(data.clientePapelPreferido)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao carregar configuração.')
    } finally {
      setCarregando(false)
    }
  }, [])

  const carregarCandidatos = useCallback(async () => {
    try {
      const lista = await listarUsuariosDisponiveisSignatarioCatec()

      setCandidatos(lista)
    } catch {
      setCandidatos([])
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  useEffect(() => {
    void carregarCandidatos()
  }, [carregarCandidatos, config?.signatariosCatec.length])

  const signatariosOrdenados = useMemo(() => {
    if (!config) return []

    return [...config.signatariosCatec].sort((a, b) => a.ordem - b.ordem || a.id - b.id)
  }, [config])

  const ativosNoEnvio = useMemo(
    () => signatariosOrdenados.filter(s => s.ativo && s.usuarioAtivo),
    [signatariosOrdenados]
  )

  const provedorDiag = useMemo(() => resolverDiagnosticoProvedor(config), [config])

  async function salvarParametros() {
    setSalvando(true)

    try {
      const atualizado = await atualizarAssinaturaConfigCatec({
        exigeSignatarioCatec,
        clientePapelPreferido
      })

      setConfig(atualizado)
      toast.success('Configuração salva.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleAdicionar() {
    if (!usuarioSelecionadoId) {
      toast.error('Selecione um usuário.')

      return
    }

    setSalvando(true)

    try {
      await adicionarSignatarioCatec(Number(usuarioSelecionadoId))
      setUsuarioSelecionadoId('')
      toast.success('Responsável CATEC adicionado.')
      await carregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao adicionar.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleToggleAtivo(id: number, ativo: boolean) {
    setSalvando(true)

    try {
      await atualizarSignatarioCatec(id, { ativo })
      await carregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemover(id: number) {
    setSalvando(true)

    try {
      await removerSignatarioCatec(id)
      toast.success('Responsável removido do pool.')
      await carregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover.')
    } finally {
      setSalvando(false)
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
          Parâmetros do fluxo e responsáveis CATEC que assinam junto com o cliente.
        </Typography>
      </Grid>

      {erro ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' variant='outlined'>
            {erro}
          </Alert>
        </Grid>
      ) : null}

      <Grid size={{ xs: 12, md: 7 }}>
        <Card>
          <CardHeader title='Provedor' />
          <CardContent className='flex flex-col gap-3'>
            {!provedorDiag.diagnosticoCompleto && config?.providerAtivo ? (
              <Alert severity='warning' variant='outlined'>
                A API ainda não devolveu o diagnóstico completo (token/secret/URL). Reinicie o backend
                CATEC para atualizar estes dados.
              </Alert>
            ) : null}

            <div className='flex flex-wrap items-center gap-2'>
              <Chip
                size='small'
                color={config?.providerAtivo ? 'success' : 'default'}
                label={config?.providerAtivo ? 'Ativo' : 'Inativo'}
              />
              <Chip size='small' variant='outlined' label={`Código: ${provedorDiag.codigo}`} />
              <Chip
                size='small'
                variant='outlined'
                label={`Ambiente: ${rotuloAmbiente(provedorDiag.ambiente)}`}
              />
            </div>

            {provedorDiag.apiBaseUrl ? (
              <Typography variant='body2'>
                API ClickSign:{' '}
                <Typography component='span' variant='body2' sx={{ fontFamily: 'monospace' }}>
                  {provedorDiag.apiBaseUrl}
                </Typography>
              </Typography>
            ) : null}

            <div className='flex flex-col gap-1'>
              <Typography variant='body2' fontWeight={600}>
                URL do webhook
              </Typography>
              <Typography variant='body2' sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {provedorDiag.webhookUrl || provedorDiag.webhookPath || '—'}
              </Typography>
            </div>

            <div className='flex flex-wrap gap-2'>
              {provedorDiag.codigo === 'clicksign' ? (
                <Chip
                  size='small'
                  color={provedorDiag.tokenOk ? 'success' : 'warning'}
                  label={
                    provedorDiag.tokenOk
                      ? 'Token de API: configurado'
                      : 'Token de API: faltando (APP_CLICKSIGN_ACCESS_TOKEN)'
                  }
                />
              ) : (
                <Chip size='small' variant='outlined' label='Token de API: não se aplica' />
              )}
              {provedorDiag.codigo === 'none' ? (
                <Chip size='small' variant='outlined' label='Segredo do webhook: não se aplica' />
              ) : (
                <Chip
                  size='small'
                  color={
                    provedorDiag.secretOk ? 'success' : provedorDiag.diagnosticoCompleto ? 'warning' : 'default'
                  }
                  label={
                    provedorDiag.secretOk
                      ? 'Segredo do webhook: configurado'
                      : provedorDiag.diagnosticoCompleto
                        ? provedorDiag.codigo === 'clicksign'
                          ? 'Segredo do webhook: faltando (APP_CLICKSIGN_WEBHOOK_SECRET)'
                          : 'Segredo do webhook: faltando (APP_ASSINATURA_STUB_WEBHOOK_SECRET)'
                        : 'Segredo do webhook: confirme após reiniciar a API'
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <CardHeader title='Resumo do envio' />
          <CardContent className='flex flex-col gap-3'>
            <Typography variant='body2'>
              <strong>Quem assina:</strong> 1 e-mail do cliente (escolhido no envio) +{' '}
              {ativosNoEnvio.length} responsável(is) CATEC ativo(s) (automático).
            </Typography>

            <Typography variant='body2'>
              <strong>Preferência do cliente:</strong>{' '}
              {clientePapelPreferido === 'EMPRESA' ? 'Empresa (contato)' : 'Responsável'}
            </Typography>

            <Typography variant='body2'>
              <strong>Exige CATEC:</strong> {exigeSignatarioCatec ? 'sim' : 'não'}
            </Typography>

            {exigeSignatarioCatec && ativosNoEnvio.length === 0 ? (
              <Alert severity='warning' variant='outlined'>
                Envio de contratos bloqueado até haver ao menos um CATEC ativo.
              </Alert>
            ) : null}

            {!config?.providerAtivo ? (
              <Alert severity='info' variant='outlined'>
                Provedor inativo — o botão de envio fica indisponível nos contratos.
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Card>
          <CardHeader title='Responsáveis CATEC' />
          <CardContent className='flex flex-col gap-4'>
            <CanPermission code={PermissaoCodigo.ACAO_CONFIG_ASSINATURA_GERIR}>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
                <CustomTextField
                  select
                  fullWidth
                  size='small'
                  label='Adicionar usuário'
                  value={usuarioSelecionadoId}
                  onChange={e => setUsuarioSelecionadoId(String(e.target.value))}
                >
                  <MenuItem value=''>
                    <em>Selecione</em>
                  </MenuItem>
                  {candidatos.map(u => (
                    <MenuItem key={u.id} value={String(u.id)}>
                      {u.nome} ({u.email})
                    </MenuItem>
                  ))}
                </CustomTextField>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => void handleAdicionar()}
                  disabled={salvando}
                  sx={{ height: 38, minHeight: 38, whiteSpace: 'nowrap' }}
                >
                  Adicionar
                </Button>
              </div>
            </CanPermission>

            {signatariosOrdenados.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                Nenhum responsável CATEC configurado.
              </Typography>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {signatariosOrdenados.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.nome}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell align='right'>
                        <CanPermission code={PermissaoCodigo.ACAO_CONFIG_ASSINATURA_GERIR}>
                          <FormControlLabel
                            control={
                              <Switch
                                size='small'
                                checked={s.ativo}
                                disabled={salvando}
                                onChange={e => void handleToggleAtivo(s.id, e.target.checked)}
                              />
                            }
                            label=''
                          />
                          <IconButton
                            size='small'
                            color='error'
                            disabled={salvando}
                            onClick={() => void handleRemover(s.id)}
                            aria-label='Remover'
                          >
                            <i className='tabler-trash' />
                          </IconButton>
                        </CanPermission>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <CardHeader title='Parâmetros do fluxo' />
          <CardContent className='flex flex-col gap-4'>
            <FormControlLabel
              control={
                <Switch
                  checked={exigeSignatarioCatec}
                  onChange={e => setExigeSignatarioCatec(e.target.checked)}
                />
              }
              label='Exigir ao menos um responsável CATEC ativo no envio'
            />

            <FormControl fullWidth>
              <InputLabel id='papel-preferido-label'>Papel preferido do cliente</InputLabel>
              <Select
                labelId='papel-preferido-label'
                label='Papel preferido do cliente'
                value={clientePapelPreferido}
                onChange={e => setClientePapelPreferido(e.target.value as 'EMPRESA' | 'RESPONSAVEL')}
              >
                <MenuItem value='RESPONSAVEL'>Responsável</MenuItem>
                <MenuItem value='EMPRESA'>Empresa (contato)</MenuItem>
              </Select>
            </FormControl>

            <CanPermission code={PermissaoCodigo.ACAO_CONFIG_ASSINATURA_GERIR}>
              <div>
                <Button variant='contained' onClick={() => void salvarParametros()} disabled={salvando}>
                  Salvar parâmetros
                </Button>
              </div>
            </CanPermission>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AssinaturaConfigView
