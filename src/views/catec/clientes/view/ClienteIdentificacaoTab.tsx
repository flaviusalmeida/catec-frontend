'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

import type { CatecCliente, CatecClienteFormState, TipoPessoa } from '@/types/catec/clienteTypes'

import CustomTextField from '@core/components/mui/TextField'
import { formatDocumentoByTipo, onlyDigits } from '@/utils/catec/brFormat'

import { clienteToFormState } from '../clienteFormHelpers'

type Props = {
  cliente: CatecCliente
  onSave: (patch: Partial<CatecCliente>) => Promise<void>
}

const ClienteIdentificacaoTab = ({ cliente, onSave }: Props) => {
  const [form, setForm] = useState<CatecClienteFormState>(() => clienteToFormState(cliente))
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setForm(clienteToFormState(cliente))
  }, [cliente])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.razaoSocialOuNome.trim() || !onlyDigits(form.documento)) {
      toast.error('Informe nome/razão social e documento.')

      return
    }

    setSalvando(true)

    try {
      await onSave({
        tipoPessoa: form.tipoPessoa,
        razaoSocialOuNome: form.razaoSocialOuNome.trim(),
        nomeFantasia: form.nomeFantasia.trim() || null,
        documento: onlyDigits(form.documento) || null
      })
      toast.success('Identificação atualizada.')
    } catch {
      /* erro no pai */
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Identificação' />
      <CardContent>
        <form onSubmit={e => void handleSubmit(e)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Nome / Razão social'
                value={form.razaoSocialOuNome}
                onChange={e => setForm(f => ({ ...f, razaoSocialOuNome: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Nome fantasia'
                value={form.nomeFantasia}
                onChange={e => setForm(f => ({ ...f, nomeFantasia: e.target.value }))}
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

export default ClienteIdentificacaoTab
