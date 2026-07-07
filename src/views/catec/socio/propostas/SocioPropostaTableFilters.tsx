'use client'

import { useEffect, useMemo, useState } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

import type { CatecPropostaPendenteSocio } from '@/types/catec/socioPropostaTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  tableData: CatecPropostaPendenteSocio[]
  setData: (data: CatecPropostaPendenteSocio[]) => void
}

const SocioPropostaTableFilters = ({ setData, tableData }: Props) => {
  const [titulo, setTitulo] = useState('')
  const [cliente, setCliente] = useState('')

  const clientes = useMemo(() => {
    const nomes = tableData
      .map(item => item.clienteNome?.trim())
      .filter((nome): nome is string => Boolean(nome))

    return [...new Set(nomes)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [tableData])

  useEffect(() => {
    const qTitulo = titulo.trim().toLowerCase()

    const filtered = tableData.filter(item => {
      if (qTitulo && !item.projetoTitulo.toLowerCase().includes(qTitulo)) return false
      if (cliente && item.clienteNome !== cliente) return false

      return true
    })

    setData(filtered)
  }, [titulo, cliente, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Título do projeto'
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder='Filtrar por título'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='Cliente'
            value={cliente}
            onChange={e => setCliente(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos</MenuItem>
            {clientes.map(nome => (
              <MenuItem key={nome} value={nome}>
                {nome}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default SocioPropostaTableFilters
