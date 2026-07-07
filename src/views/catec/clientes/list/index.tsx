'use client'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ClienteListCards from './ClienteListCards'
import ClienteListTable from './ClienteListTable'
import { useClientesStore } from '../useClientesStore'

const ClienteList = () => {
  const { lista, resumo, carregando, erro, addCliente } = useClientesStore()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Clientes</Typography>
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
            <ClienteListCards lista={lista} resumo={resumo} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ClienteListTable lista={lista} onAdd={addCliente} />
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default ClienteList
