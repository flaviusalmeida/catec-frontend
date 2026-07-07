'use client'

import Grid from '@mui/material/Grid'

import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'

import Usuario2Details from './Usuario2Details'

type Props = {
  usuario: CatecAdminUsuario
}

const Usuario2LeftOverview = ({ usuario }: Props) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Usuario2Details usuario={usuario} />
      </Grid>
    </Grid>
  )
}

export default Usuario2LeftOverview
