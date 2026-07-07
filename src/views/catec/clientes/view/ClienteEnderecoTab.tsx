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
import { formatCep, onlyDigits } from '@/utils/catec/brFormat'

import { clienteToFormState } from '../clienteFormHelpers'

type Props = {
  cliente: CatecCliente
  onSave: (patch: Partial<CatecCliente>) => Promise<void>
}

const ClienteEnderecoTab = ({ cliente, onSave }: Props) => {
  const [form, setForm] = useState<CatecClienteFormState>(() => clienteToFormState(cliente))
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setForm(clienteToFormState(cliente))
  }, [cliente])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setSalvando(true)

    try {
      await onSave({
        enderecoCep: onlyDigits(form.enderecoCep) || null,
        enderecoCidade: form.enderecoCidade.trim() || null,
        enderecoUf: form.enderecoUf.trim().toUpperCase() || null,
        enderecoLogradouro: form.enderecoLogradouro.trim() || null,
        enderecoNumero: form.enderecoNumero.trim() || null,
        enderecoComplemento: form.enderecoComplemento.trim() || null
      })
      toast.success('Endereço atualizado.')
    } catch {
      /* erro no pai */
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Endereço' />
      <CardContent>
        <form onSubmit={e => void handleSubmit(e)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                fullWidth
                label='CEP'
                value={form.enderecoCep}
                onChange={e => {
                  const dig = onlyDigits(e.target.value).slice(0, 8)

                  setForm(f => ({ ...f, enderecoCep: dig ? formatCep(dig) : '' }))
                }}
                placeholder='00000-000'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                fullWidth
                label='Cidade'
                value={form.enderecoCidade}
                onChange={e => setForm(f => ({ ...f, enderecoCidade: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                fullWidth
                label='UF'
                value={form.enderecoUf}
                onChange={e => setForm(f => ({ ...f, enderecoUf: e.target.value.toUpperCase().slice(0, 2) }))}
                inputProps={{ maxLength: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Logradouro'
                value={form.enderecoLogradouro}
                onChange={e => setForm(f => ({ ...f, enderecoLogradouro: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <CustomTextField
                fullWidth
                label='Número'
                value={form.enderecoNumero}
                onChange={e => setForm(f => ({ ...f, enderecoNumero: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <CustomTextField
                fullWidth
                label='Complemento'
                value={form.enderecoComplemento}
                onChange={e => setForm(f => ({ ...f, enderecoComplemento: e.target.value }))}
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

export default ClienteEnderecoTab
