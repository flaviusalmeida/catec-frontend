'use client'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import Usuario2ListCards from './Usuario2ListCards'
import Usuario2ListTable from './Usuario2ListTable'
import { useUsuarios2Store } from '../useUsuarios2Store'

const Usuario2List = () => {
  const { lista, carregando, erro, addUsuario } = useUsuarios2Store()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Usuários</Typography>
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
            <Usuario2ListCards lista={lista} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Usuario2ListTable lista={lista} onAdd={addUsuario} />
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default Usuario2List
