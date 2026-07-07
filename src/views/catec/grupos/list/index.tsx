'use client'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import GrupoListCards from './GrupoListCards'
import GrupoListTable from './GrupoListTable'
import { useGruposStore } from '../useGruposStore'

const GrupoList = () => {
  const { lista, catalogo, carregando, erro, addGrupo } = useGruposStore()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Grupos de acesso</Typography>
      </Grid>

      {erro ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' variant='outlined'>
            {erro}
          </Alert>
        </Grid>
      ) : null}

      {carregando ? (
        <Grid size={{ xs: 12 }} className='flex justify-center p-12'>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          <Grid size={{ xs: 12 }}>
            <GrupoListCards lista={lista} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <GrupoListTable lista={lista} catalogo={catalogo} onAdd={addGrupo} />
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default GrupoList
