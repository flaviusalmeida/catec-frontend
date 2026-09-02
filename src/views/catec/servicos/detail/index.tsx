'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { CatecServico } from '@/types/catec/servicoTypes'

import { useServicosStore } from '../useServicosStore'
import { useServicoFluxoStore } from '../useServicoFluxoStore'
import ServicoLeftOverview from './ServicoLeftOverview'
import ServicoRight from './ServicoRight'

type Props = {
  id: string
}

const ServicoDetalhe = ({ id }: Props) => {
  const { carregando: storeCarregando, refreshServico } = useServicosStore()
  
  const servicoId = Number(id)

  const recarregarServico = useCallback(async () => {
    const remoto = await refreshServico(servicoId)

    if (remoto) setServico(remoto)

    return remoto
  }, [servicoId, refreshServico])

  const fluxo = useServicoFluxoStore(servicoId, recarregarServico)

  const [servico, setServico] = useState<CatecServico | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)

  useEffect(() => {
    if (Number.isNaN(servicoId)) {
      setNaoEncontrado(true)
      setCarregando(false)

      return
    }

    let cancelled = false

    void (async () => {
      setCarregando(true)
      const remoto = await refreshServico(servicoId)

      if (cancelled) return

      setServico(remoto)
      setNaoEncontrado(!remoto)
      setCarregando(false)
    })()

    return () => {
      cancelled = true
    }
  }, [servicoId, refreshServico])

  const aguardandoConteudoInicial = (carregando || fluxo.carregando) && !servico

  if (aguardandoConteudoInicial || storeCarregando) {
    return (
      <div className='flex justify-center p-12'>
        <CircularProgress />
      </div>
    )
  }

  if (naoEncontrado || !servico) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Servico não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={'/catec/servicos'}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      {fluxo.erro ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' variant='outlined'>
            {fluxo.erro}
          </Alert>
        </Grid>
      ) : null}
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <ServicoLeftOverview
          servico={servico}
          propostaStatus={fluxo.propostaAtual?.status}
          contratoStatus={fluxo.data.contrato?.status}
          onStatusAlterado={recarregarServico}
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <ServicoRight servico={servico} fluxo={fluxo} />
      </Grid>
    </Grid>
  )
}

export default ServicoDetalhe
