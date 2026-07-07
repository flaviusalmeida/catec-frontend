'use client'

import Grid from '@mui/material/Grid'

import type { CatecGrupo } from '@/types/catec/grupoTypes'

import GrupoDetails from './GrupoDetails'
import GrupoResumoCard from './GrupoResumoCard'

type Props = {
  grupo: CatecGrupo
}

const GrupoLeftOverview = ({ grupo }: Props) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <GrupoDetails grupo={grupo} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GrupoResumoCard grupo={grupo} />
      </Grid>
    </Grid>
  )
}

export default GrupoLeftOverview
