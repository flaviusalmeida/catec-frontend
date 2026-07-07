'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecCliente, CatecClienteFormState, CatecClienteRequest, TipoPessoa } from '@/types/catec/clienteTypes'
import { EMPTY_CLIENTE_FORM } from '@/types/catec/clienteTypes'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'
import { formatDocumentoByTipo, formatTelefoneBrasil, onlyDigits } from '@/utils/catec/brFormat'

import { formStateToClienteRequest, validateClienteForm } from '../clienteFormHelpers'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onAdd: (body: CatecClienteRequest) => Promise<CatecCliente>
}

const emptyForm = (): CatecClienteFormState => ({
  ...EMPTY_CLIENTE_FORM,
  responsavel: { ...EMPTY_CLIENTE_FORM.responsavel }
})

const ClienteAddDialog = ({ open, setOpen, onAdd }: Props) => {
  const [form, setForm] = useState<CatecClienteFormState>(emptyForm)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open])

  function handleClose() {
    setOpen(false)
    setForm(emptyForm())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const erro = validateClienteForm(form)

    if (erro) {
      toast.error(erro)

      return
    }

    setSalvando(true)

    try {
      await onAdd(formStateToClienteRequest(form))
      toast.success('Cliente criado.')
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar o cliente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Novo cliente
        <Typography component='span' className='flex flex-col text-center' color='text.secondary'>
          Nome fantasia, endereço e observações são opcionais e podem ser preenchidos na página de
          detalhe.
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                required
                label='Tipo de pessoa'
                value={form.tipoPessoa}
                onChange={e => {
                  const tipo = e.target.value as TipoPessoa
                  const d = onlyDigits(form.documento).slice(0, tipo === 'PF' ? 11 : 14)

                  setForm(f => ({
                    ...f,
                    tipoPessoa: tipo,
                    documento: d ? formatDocumentoByTipo(tipo, d) : ''
                  }))
                }}
              >
                <MenuItem value='PF'>Pessoa Física</MenuItem>
                <MenuItem value='PJ'>Pessoa Jurídica</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                label='CPF/CNPJ'
                value={form.documento}
                onChange={e => {
                  const max = form.tipoPessoa === 'PF' ? 11 : 14
                  const d = onlyDigits(e.target.value).slice(0, max)

                  setForm(f => ({ ...f, documento: d ? formatDocumentoByTipo(f.tipoPessoa, d) : '' }))
                }}
                placeholder={form.tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                required
                label='Nome / Razão social'
                value={form.razaoSocialOuNome}
                onChange={e => setForm(f => ({ ...f, razaoSocialOuNome: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                type='email'
                label='E-mail'
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                label='Telefone'
                value={form.telefone}
                onChange={e => {
                  const d = onlyDigits(e.target.value).slice(0, 11)

                  setForm(f => ({ ...f, telefone: d ? formatTelefoneBrasil(d) : '' }))
                }}
                placeholder='(00) 00000-0000'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                required
                label='Período de faturamento'
                value={form.periodoFaturamento}
                onChange={e => setForm(f => ({ ...f, periodoFaturamento: e.target.value }))}
                placeholder='Ex.: Até todo dia 15'
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle1' className='font-medium'>
                Responsável
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                required
                label='Nome do responsável'
                value={form.responsavel.nome}
                onChange={e =>
                  setForm(f => ({ ...f, responsavel: { ...f.responsavel, nome: e.target.value } }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                type='email'
                label='E-mail do responsável'
                value={form.responsavel.email}
                onChange={e =>
                  setForm(f => ({ ...f, responsavel: { ...f.responsavel, email: e.target.value } }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                label='Telefone do responsável'
                value={form.responsavel.telefone}
                onChange={e => {
                  const d = onlyDigits(e.target.value).slice(0, 11)

                  setForm(f => ({
                    ...f,
                    responsavel: { ...f.responsavel, telefone: d ? formatTelefoneBrasil(d) : '' }
                  }))
                }}
                placeholder='(00) 00000-0000'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit'>
            Criar
          </Button>
          <Button variant='tonal' color='secondary' type='button' onClick={handleClose}>
            Cancelar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ClienteAddDialog
