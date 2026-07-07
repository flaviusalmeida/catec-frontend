'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import type { CatecGrupo } from '@/types/catec/grupoTypes'

import { useGruposStore } from '../useGruposStore'
import GrupoLeftOverview from './GrupoLeftOverview'
import GrupoRight from './GrupoRight'

type Props = {
  id: string
}

const GrupoView = ({ id }: Props) => {
  const { lista, catalogo, carregando: storeCarregando, updateGrupo, removeGrupo, obterGrupo } = useGruposStore()
  
  const router = useRouter()

  const [grupo, setGrupo] = useState<CatecGrupo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)

  const grupoId = Number(id)

  useEffect(() => {
    if (Number.isNaN(grupoId)) {
      setNaoEncontrado(true)
      setCarregando(false)

      return
    }

    const cached = lista.find(g => g.id === grupoId)

    if (cached) {
      setGrupo(cached)
      setNaoEncontrado(false)
      setCarregando(false)

      return
    }

    if (storeCarregando) return

    let cancelled = false

    void (async () => {
      setCarregando(true)
      const remoto = await obterGrupo(grupoId)

      if (cancelled) return

      setGrupo(remoto)
      setNaoEncontrado(!remoto)
      setCarregando(false)
    })()

    return () => {
      cancelled = true
    }
  }, [grupoId, lista, storeCarregando, obterGrupo])

  useEffect(() => {
    if (!grupo) return

    const atualizado = lista.find(g => g.id === grupo.id)

    if (atualizado) {
      setGrupo(atualizado)
    }
  }, [lista, grupo?.id])

  if (carregando || storeCarregando) {
    return (
      <div className='flex justify-center p-12'>
        <CircularProgress />
      </div>
    )
  }

  if (naoEncontrado || !grupo) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Grupo não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={'/catec/grupos'}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  async function handleUpdate(patch: Partial<CatecGrupo>) {
    try {
      const atualizado = await updateGrupo(grupo.id, patch)

      setGrupo(atualizado)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar o grupo.')
      throw err
    }
  }

  async function handleExcluir() {
    try {
      await removeGrupo(grupo.id)
      toast.success('Grupo excluído.')
      router.push('/catec/grupos')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível excluir o grupo.')
      throw err
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <GrupoLeftOverview grupo={grupo} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <GrupoRight
          grupo={grupo}
          catalogo={catalogo}
          onUpdate={patch => handleUpdate(patch)}
          onExcluir={() => handleExcluir()}
        />
      </Grid>
    </Grid>
  )
}

export default GrupoView
