'use client'

import { useEffect, useState } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

import type { CatecAdminUsuario, CatecGrupoValor } from '@/types/catec/usuarioTypes'
import { GRUPOS_OPCOES } from '@/types/catec/usuarioTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  tableData: CatecAdminUsuario[]
  setData: (data: CatecAdminUsuario[]) => void
}

const Usuario2TableFilters = ({ setData, tableData }: Props) => {
  const [grupo, setGrupo] = useState<CatecGrupoValor | ''>('')
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'troca_senha' | ''>('')

  useEffect(() => {
    const filtered = tableData.filter(user => {
      if (grupo && !user.grupos.includes(grupo)) return false

      if (status === 'ativo' && (!user.ativo || user.requerTrocaSenha)) return false
      if (status === 'inativo' && (user.ativo || user.requerTrocaSenha)) return false
      if (status === 'troca_senha' && !user.requerTrocaSenha) return false

      return true
    })

    setData(filtered)
  }, [grupo, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='Grupo'
            value={grupo}
            onChange={e => setGrupo(e.target.value as CatecGrupoValor | '')}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos os grupos</MenuItem>
            {GRUPOS_OPCOES.map(g => (
              <MenuItem key={g.valor} value={g.valor}>
                {g.rotulo}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='Status'
            value={status}
            onChange={e => setStatus(e.target.value as typeof status)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos os status</MenuItem>
            <MenuItem value='ativo'>Ativo</MenuItem>
            <MenuItem value='inativo'>Inativo</MenuItem>
            <MenuItem value='troca_senha'>Troca de senha</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default Usuario2TableFilters
