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

const ClienteResponsavelTab = ({ cliente, onSave }: Props) => {
  const [form, setForm] = useState<CatecClienteFormState>(() => clienteToFormState(cliente))
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setForm(clienteToFormState(cliente))
  }, [cliente])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (
      !form.responsavel.nome.trim() ||
      !form.responsavel.email.trim() ||
      !onlyDigits(form.responsavel.telefone)
    ) {
      toast.error('Informe nome, e-mail e telefone do responsável.')

      return
    }

    setSalvando(true)

    try {
      await onSave({
        responsaveis: [
          {
            id: cliente.responsaveis[0]?.id ?? 1,
            nome: form.responsavel.nome.trim(),
            email: form.responsavel.email.trim(),
            telefone: onlyDigits(form.responsavel.telefone)
          }
        ]
      })
      toast.success('Responsável atualizado.')
    } catch {
      /* erro no pai */
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Responsável' />
      <CardContent>
        <form onSubmit={e => void handleSubmit(e)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Nome'
                value={form.responsavel.nome}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    responsavel: { ...f.responsavel, nome: e.target.value }
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                type='email'
                label='E-mail'
                value={form.responsavel.email}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    responsavel: { ...f.responsavel, email: e.target.value }
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Telefone'
                value={form.responsavel.telefone}
                onChange={e => {
                  const d = onlyDigits(e.target.value).slice(0, 11)

                  setForm(f => ({
                    ...f,
                    responsavel: {
                      ...f.responsavel,
                      telefone: d ? formatTelefoneBrasil(d) : ''
                    }
                  }))
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

export default ClienteResponsavelTab
