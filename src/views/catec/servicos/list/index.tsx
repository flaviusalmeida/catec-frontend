'use client'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ServicoListCards from './ServicoListCards'
import ServicoListTable from './ServicoListTable'
import { useClientesStore } from '@/views/catec/clientes/useClientesStore'
import { useServicosStore } from '../useServicosStore'

const ServicoList = () => {
  const { lista, resumo, carregando, erro, addServico } = useServicosStore()
  const { lista: clientes } = useClientesStore()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Serviços</Typography>
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
            <ServicoListCards lista={lista} resumo={resumo} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ServicoListTable lista={lista} clientes={clientes} onAdd={addServico} />
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default ServicoList
