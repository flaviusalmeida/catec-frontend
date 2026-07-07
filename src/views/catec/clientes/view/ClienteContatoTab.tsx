'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import { toast } from 'react-toastify'

import type { CatecCliente, CatecClienteFormState } from '@/types/catec/clienteTypes'

import CustomTextField from '@core/components/mui/TextField'
import { formatTelefoneBrasil, onlyDigits } from '@/utils/catec/brFormat'

import { clienteToFormState } from '../clienteFormHelpers'

type Props = {
  cliente: CatecCliente
  onSave: (patch: Partial<CatecCliente>) => Promise<void>
}

const ClienteContatoTab = ({ cliente, onSave }: Props) => {
  const [form, setForm] = useState<CatecClienteFormState>(() => clienteToFormState(cliente))
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setForm(clienteToFormState(cliente))
  }, [cliente])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.email.trim() || !onlyDigits(form.telefone)) {
      toast.error('Informe e-mail e telefone.')

      return
    }

    setSalvando(true)

    try {
      await onSave({
        email: form.email.trim(),
        telefone: onlyDigits(form.telefone) || null
      })
      toast.success('Contato atualizado.')
    } catch {
      /* erro no pai */
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Contato' />
      <CardContent>
        <form onSubmit={e => void handleSubmit(e)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                type='email'
                label='E-mail'
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
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
              <Button variant='contained' type='submit' disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ClienteContatoTab
