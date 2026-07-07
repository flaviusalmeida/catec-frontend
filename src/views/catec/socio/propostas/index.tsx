'use client'

import { useCallback, useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { CatecPropostaPendenteSocio } from '@/types/catec/socioPropostaTypes'

import { listarPropostasPendentesSocioCatec } from '@/libs/catecSocioPropostasApi'

import SocioPropostaListTable from './SocioPropostaListTable'

const SocioPropostaList = () => {
  const [lista, setLista] = useState<CatecPropostaPendenteSocio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const recarregar = useCallback(async () => {
    setErro(null)

    try {
      const rows = await listarPropostasPendentesSocioCatec()

      setLista(rows)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível carregar as propostas pendentes.')
      setLista([])
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setCarregando(true)
      await recarregar()
      setCarregando(false)
    })()
  }, [recarregar])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Propostas pendentes</Typography>
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
        <Grid size={{ xs: 12 }}>
          <SocioPropostaListTable lista={lista} onRecarregar={recarregar} />
        </Grid>
      )}
    </Grid>
  )
}

export default SocioPropostaList
