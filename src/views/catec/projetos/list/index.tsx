'use client'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ProjetoListCards from './ProjetoListCards'
import ProjetoListTable from './ProjetoListTable'
import { useClientesStore } from '@/views/catec/clientes/useClientesStore'
import { useProjetosStore } from '../useProjetosStore'

const ProjetoList = () => {
  const { lista, resumo, carregando, erro, addProjeto } = useProjetosStore()
  const { lista: clientes } = useClientesStore()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Projetos</Typography>
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
            <ProjetoListCards lista={lista} resumo={resumo} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ProjetoListTable lista={lista} clientes={clientes} onAdd={addProjeto} />
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default ProjetoList
