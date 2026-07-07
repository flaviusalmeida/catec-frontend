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

import { clienteToFormState } from '../clienteFormHelpers'

type Props = {
  cliente: CatecCliente
  onSave: (patch: Partial<CatecCliente>) => Promise<void>
}

const ClienteFaturamentoTab = ({ cliente, onSave }: Props) => {
  const [form, setForm] = useState<CatecClienteFormState>(() => clienteToFormState(cliente))
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setForm(clienteToFormState(cliente))
  }, [cliente])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.periodoFaturamento.trim()) {
      toast.error('Informe o período de faturamento.')

      return
    }

    setSalvando(true)

    try {
      await onSave({
        periodoFaturamento: form.periodoFaturamento.trim()
      })
      toast.success('Faturamento atualizado.')
    } catch {
      /* erro no pai */
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Faturamento' />
      <CardContent>
        <form onSubmit={e => void handleSubmit(e)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Período de faturamento'
                value={form.periodoFaturamento}
                onChange={e => setForm(f => ({ ...f, periodoFaturamento: e.target.value }))}
                placeholder='Ex.: Até todo dia 15'
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

export default ClienteFaturamentoTab
