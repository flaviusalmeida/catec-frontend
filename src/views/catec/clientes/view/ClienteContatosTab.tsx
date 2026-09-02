'use client'

import { useEffect, useState } from 'react'

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecCliente, CatecClienteResponsavelFormState } from '@/types/catec/clienteTypes'
import { EMPTY_RESPONSAVEL_FORM } from '@/types/catec/clienteTypes'

import CustomTextField from '@core/components/mui/TextField'
import { formatTelefoneBrasil, onlyDigits } from '@/utils/catec/brFormat'

type ContatoFormItem = CatecClienteResponsavelFormState & {
  key: string
  persistido: boolean
}

type Props = {
  cliente: CatecCliente
  onSave: (patch: Partial<CatecCliente>) => Promise<void>
}

function novoKey(): string {
  return `novo-${crypto.randomUUID()}`
}

function contatosFromCliente(cliente: CatecCliente): ContatoFormItem[] {
  if (cliente.responsaveis.length === 0) {
    return [{ key: novoKey(), persistido: false, ...EMPTY_RESPONSAVEL_FORM }]
  }

  return cliente.responsaveis.map(r => {
    const digitos = onlyDigits(r.telefone)

    return {
      key: `id-${r.id}`,
      persistido: true,
      nome: r.nome,
      email: r.email,
      telefone: digitos ? formatTelefoneBrasil(digitos) : ''
    }
  })
}

function contatoIncompleto(c: ContatoFormItem): boolean {
  return !c.nome.trim() || !c.email.trim() || !onlyDigits(c.telefone)
}

function toResponsaveisPatch(lista: ContatoFormItem[]) {
  return lista.map((c, index) => {
    const idFromKey = c.key.startsWith('id-') ? Number(c.key.slice(3)) : NaN

    return {
      id: Number.isFinite(idFromKey) ? idFromKey : index + 1,
      nome: c.nome.trim(),
      email: c.email.trim(),
      telefone: onlyDigits(c.telefone)
    }
  })
}

function rotuloOrdem(index: number): string {
  return String(index + 1).padStart(2, '0')
}

function tituloContato(contato: ContatoFormItem): string {
  const nome = contato.nome.trim()

  return nome || 'Novo contato'
}

function resumoSecundario(contato: ContatoFormItem): string {
  const partes = [contato.email.trim(), contato.telefone.trim()].filter(Boolean)

  return partes.length > 0 ? partes.join('  ·  ') : 'Sem e-mail e telefone'
}

const ClienteContatosTab = ({ cliente, onSave }: Props) => {
  const [contatos, setContatos] = useState<ContatoFormItem[]>(() => contatosFromCliente(cliente))
  const [expandidoKey, setExpandidoKey] = useState<string | false>(false)
  const [salvando, setSalvando] = useState(false)
  const [excluirKey, setExcluirKey] = useState<string | null>(null)

  useEffect(() => {
    setContatos(contatosFromCliente(cliente))
    setExpandidoKey(false)
    setExcluirKey(null)
  }, [cliente])

  function atualizarContato(key: string, patch: Partial<CatecClienteResponsavelFormState>) {
    setContatos(lista => lista.map(c => (c.key === key ? { ...c, ...patch } : c)))
  }

  function adicionarContato() {
    const key = novoKey()

    setContatos(lista => [...lista, { key, persistido: false, ...EMPTY_RESPONSAVEL_FORM }])
    setExpandidoKey(key)
  }

  function solicitarRemocao(key: string) {
    if (contatos.length <= 1) {
      toast.error('Mantenha ao menos um contato.')

      return
    }

    const alvo = contatos.find(c => c.key === key)

    if (!alvo) return

    if (alvo.persistido) {
      setExcluirKey(key)

      return
    }

    removerContatoLocal(key)
  }

  function removerContatoLocal(key: string) {
    setContatos(lista => {
      if (lista.length <= 1) {
        toast.error('Mantenha ao menos um contato.')

        return lista
      }

      return lista.filter(c => c.key !== key)
    })

    setExpandidoKey(atual => (atual === key ? false : atual))
    setExcluirKey(null)
  }

  async function confirmarExclusaoPersistida() {
    if (!excluirKey) return

    if (contatos.length <= 1) {
      toast.error('Mantenha ao menos um contato.')
      setExcluirKey(null)

      return
    }

    const remaining = contatos.filter(c => c.key !== excluirKey)

    if (remaining.some(contatoIncompleto)) {
      toast.error('Complete ou remova contatos novos incompletos antes de excluir.')

      return
    }

    setSalvando(true)

    try {
      await onSave({ responsaveis: toResponsaveisPatch(remaining) })
      setExcluirKey(null)
      setExpandidoKey(atual => (atual === excluirKey ? false : atual))
      toast.success('Contato excluído.')
    } catch {
      /* erro no pai */
    } finally {
      setSalvando(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (contatos.some(contatoIncompleto)) {
      toast.error('Preencha nome, e-mail e telefone de todos os contatos.')

      return
    }

    setSalvando(true)

    try {
      await onSave({ responsaveis: toResponsaveisPatch(contatos) })
      toast.success('Contatos atualizados.')
    } catch {
      /* erro no pai */
    } finally {
      setSalvando(false)
    }
  }

  const contatoExcluir = excluirKey ? contatos.find(c => c.key === excluirKey) : null

  return (
    <Card>
      <CardHeader
        title='Contatos'
        subheader='Pessoas de referência do cliente (processos, financeiro, técnico, etc.).'
        action={
          <Button
            size='small'
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={adicionarContato}
            disabled={salvando}
          >
            Adicionar contato
          </Button>
        }
      />
      <CardContent>
        <form onSubmit={e => void handleSubmit(e)}>
          <div className='flex flex-col gap-2'>
            {contatos.map((contato, index) => {
              const aberto = expandidoKey === contato.key

              return (
                <Accordion
                  key={contato.key}
                  disableGutters
                  elevation={0}
                  expanded={aberto}
                  onChange={(_event, isExpanded) => {
                    setExpandidoKey(isExpanded ? contato.key : false)
                  }}
                  sx={{
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px !important',
                    '&:before': { display: 'none' },
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary
                    expandIcon={null}
                    sx={{
                      px: 3,
                      py: 1.5,
                      minHeight: 64,
                      '& .MuiAccordionSummary-content': {
                        my: 0,
                        mr: 0,
                        alignItems: 'center',
                        gap: 2,
                        overflow: 'hidden',
                        width: '100%'
                      }
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='text.disabled'
                      className='min-is-6 font-medium tabular-nums'
                    >
                      {rotuloOrdem(index)}
                    </Typography>
                    <div className='flex flex-col gap-0.5 flex-1 min-is-0'>
                      <Typography className='font-medium truncate' color='text.primary'>
                        {tituloContato(contato)}
                      </Typography>
                      {!aberto ? (
                        <Typography variant='body2' color='text.secondary' className='truncate'>
                          {resumoSecundario(contato)}
                        </Typography>
                      ) : null}
                    </div>
                    <div className='flex items-center gap-0.5 flex-shrink-0'>
                      <i
                        className={`tabler-chevron-down text-xl text-textSecondary transition-transform ${aberto ? 'rotate-180' : ''}`}
                      />
                      <IconButton
                        size='small'
                        color='error'
                        aria-label={`Excluir ${tituloContato(contato)}`}
                        disabled={salvando || contatos.length <= 1}
                        onClick={e => {
                          e.stopPropagation()
                          solicitarRemocao(contato.key)
                        }}
                        onFocus={e => e.stopPropagation()}
                      >
                        <i className='tabler-trash' />
                      </IconButton>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 1 }}>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12 }}>
                        <CustomTextField
                          fullWidth
                          label='Nome'
                          value={contato.nome}
                          onChange={e => atualizarContato(contato.key, { nome: e.target.value })}
                          autoFocus={aberto && !contato.persistido && !contato.nome}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                          fullWidth
                          type='email'
                          label='E-mail'
                          value={contato.email}
                          onChange={e => atualizarContato(contato.key, { email: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                          fullWidth
                          label='Telefone'
                          value={contato.telefone}
                          onChange={e => {
                            const d = onlyDigits(e.target.value).slice(0, 11)

                            atualizarContato(contato.key, {
                              telefone: d ? formatTelefoneBrasil(d) : ''
                            })
                          }}
                          placeholder='(00) 00000-0000'
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </div>

          <div className='mbs-6'>
            <Button variant='contained' type='submit' disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </CardContent>

      <Dialog
        open={Boolean(excluirKey)}
        onClose={() => {
          if (!salvando) setExcluirKey(null)
        }}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Excluir contato?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir
            {contatoExcluir?.nome.trim() ? (
              <>
                {' '}
                <strong>{contatoExcluir.nome.trim()}</strong>
              </>
            ) : null}
            ? A exclusão será salva imediatamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='secondary' variant='tonal' disabled={salvando} onClick={() => setExcluirKey(null)}>
            Cancelar
          </Button>
          <Button
            color='error'
            variant='contained'
            disabled={salvando}
            onClick={() => void confirmarExclusaoPersistida()}
          >
            {salvando ? 'Excluindo…' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ClienteContatosTab
