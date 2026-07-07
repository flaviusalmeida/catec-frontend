'use client'

import { useEffect, useState } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

import type { CatecGrupo } from '@/types/catec/grupoTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  tableData: CatecGrupo[]
  setData: (data: CatecGrupo[]) => void
}

const GrupoTableFilters = ({ setData, tableData }: Props) => {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<'' | 'sistema' | 'custom'>('')
  const [status, setStatus] = useState<'' | 'ativo' | 'inativo'>('')

  useEffect(() => {
    const q = nome.trim().toLowerCase()

    const filtered = tableData.filter(grupo => {
      if (q && !grupo.nome.toLowerCase().includes(q) && !grupo.codigo.toLowerCase().includes(q)) return false
      if (tipo === 'sistema' && !grupo.sistema) return false
      if (tipo === 'custom' && grupo.sistema) return false
      if (status === 'ativo' && !grupo.ativo) return false
      if (status === 'inativo' && grupo.ativo) return false

      return true
    })

    setData(filtered)
  }, [nome, tipo, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            label='Nome ou código'
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder='Buscar grupo'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            label='Tipo'
            value={tipo}
            onChange={e => setTipo(e.target.value as typeof tipo)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos</MenuItem>
            <MenuItem value='sistema'>Sistema</MenuItem>
            <MenuItem value='custom'>Customizado</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            label='Status'
            value={status}
            onChange={e => setStatus(e.target.value as typeof status)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos</MenuItem>
            <MenuItem value='ativo'>Ativo</MenuItem>
            <MenuItem value='inativo'>Inativo</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default GrupoTableFilters
