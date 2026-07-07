'use client'

import { useEffect, useState } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

import type { CatecProjeto, CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { ORDEM_STATUS_PROJETO, STATUS_PROJETO_ROTULO } from '@/types/catec/projetoTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  tableData: CatecProjeto[]
  setData: (data: CatecProjeto[]) => void
}

const ProjetoTableFilters = ({ setData, tableData }: Props) => {
  const [titulo, setTitulo] = useState('')
  const [status, setStatus] = useState<CatecProjetoStatus | ''>('')

  useEffect(() => {
    const q = titulo.trim().toLowerCase()

    const filtered = tableData.filter(projeto => {
      if (q && !projeto.titulo.toLowerCase().includes(q)) return false
      if (status && projeto.status !== status) return false

      return true
    })

    setData(filtered)
  }, [titulo, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Título'
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder='Filtrar por título'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='Status'
            value={status}
            onChange={e => setStatus(e.target.value as CatecProjetoStatus | '')}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos</MenuItem>
            {ORDEM_STATUS_PROJETO.map(s => (
              <MenuItem key={s} value={s}>
                {STATUS_PROJETO_ROTULO[s]}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default ProjetoTableFilters
