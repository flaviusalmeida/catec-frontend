'use client'

import { useEffect, useState } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

import type { CatecCliente, TipoPessoa } from '@/types/catec/clienteTypes'

import CustomTextField from '@core/components/mui/TextField'
import { onlyDigits } from '@/utils/catec/brFormat'

type Props = {
  tableData: CatecCliente[]
  setData: (data: CatecCliente[]) => void
}

const ClienteTableFilters = ({ setData, tableData }: Props) => {
  const [nome, setNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [tipo, setTipo] = useState<TipoPessoa | ''>('')

  useEffect(() => {
    const nomeQ = nome.trim().toLowerCase()
    const docDigits = onlyDigits(documento)

    const filtered = tableData.filter(cliente => {
      if (nomeQ && !cliente.razaoSocialOuNome.toLowerCase().includes(nomeQ)) return false

      if (docDigits) {
        const rowDigits = onlyDigits(cliente.documento ?? '')

        if (!rowDigits.includes(docDigits)) return false
      }

      if (tipo && cliente.tipoPessoa !== tipo) return false

      return true
    })

    setData(filtered)
  }, [nome, documento, tipo, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            label='Nome / Razão social'
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder='Buscar por nome'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            label='CPF/CNPJ'
            value={documento}
            onChange={e => setDocumento(e.target.value)}
            placeholder='Buscar por documento'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            label='Tipo'
            value={tipo}
            onChange={e => setTipo(e.target.value as TipoPessoa | '')}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos</MenuItem>
            <MenuItem value='PF'>Pessoa Física</MenuItem>
            <MenuItem value='PJ'>Pessoa Jurídica</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default ClienteTableFilters
