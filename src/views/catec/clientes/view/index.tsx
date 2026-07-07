'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import type { CatecCliente } from '@/types/catec/clienteTypes'

import { useClientesStore } from '../useClientesStore'
import ClienteLeftOverview from './ClienteLeftOverview'
import ClienteRight from './ClienteRight'

type Props = {
  id: string
}

const ClienteView = ({ id }: Props) => {
  const { lista, carregando: storeCarregando, updateCliente, obterCliente } = useClientesStore()
  

  const [cliente, setCliente] = useState<CatecCliente | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)

  const clienteId = Number(id)

  useEffect(() => {
    if (Number.isNaN(clienteId)) {
      setNaoEncontrado(true)
      setCarregando(false)

      return
    }

    const cached = lista.find(c => c.id === clienteId)

    if (cached) {
      setCliente(cached)
      setNaoEncontrado(false)
      setCarregando(false)

      return
    }

    if (storeCarregando) return

    let cancelled = false

    void (async () => {
      setCarregando(true)
      const remoto = await obterCliente(clienteId)

      if (cancelled) return

      setCliente(remoto)
      setNaoEncontrado(!remoto)
      setCarregando(false)
    })()

    return () => {
      cancelled = true
    }
  }, [clienteId, lista, storeCarregando, obterCliente])

  useEffect(() => {
    if (!cliente) return

    const atualizado = lista.find(c => c.id === cliente.id)

    if (atualizado) setCliente(atualizado)
  }, [lista, cliente?.id])

  if (carregando || storeCarregando) {
    return (
      <div className='flex justify-center p-12'>
        <CircularProgress />
      </div>
    )
  }

  if (naoEncontrado || !cliente) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Cliente não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={'/catec/clientes'}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  async function handleUpdate(patch: Partial<CatecCliente>) {
    try {
      const atualizado = await updateCliente(cliente!.id, patch)

      setCliente(atualizado)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar o cliente.')
      throw err
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <ClienteLeftOverview cliente={cliente} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <ClienteRight cliente={cliente} onUpdate={patch => handleUpdate(patch)} />
      </Grid>
    </Grid>
  )
}

export default ClienteView
