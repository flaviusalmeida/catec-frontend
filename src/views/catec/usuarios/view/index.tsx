'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'

import { useUsuarios2Store } from '../useUsuarios2Store'
import Usuario2LeftOverview from './Usuario2LeftOverview'
import Usuario2Right from './Usuario2Right'

type Props = {
  id: string
}

const Usuario2View = ({ id }: Props) => {
  const { lista, carregando: storeCarregando, updateUsuario, resetarSenha, obterUsuario } = useUsuarios2Store()
  

  const [usuario, setUsuario] = useState<CatecAdminUsuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)

  const usuarioId = Number(id)

  useEffect(() => {
    if (Number.isNaN(usuarioId)) {
      setNaoEncontrado(true)
      setCarregando(false)

      return
    }

    const cached = lista.find(u => u.id === usuarioId)

    if (cached) {
      setUsuario(cached)
      setNaoEncontrado(false)
      setCarregando(false)

      return
    }

    if (storeCarregando) return

    let cancelled = false

    void (async () => {
      setCarregando(true)
      const remoto = await obterUsuario(usuarioId)

      if (cancelled) return

      setUsuario(remoto)
      setNaoEncontrado(!remoto)
      setCarregando(false)
    })()

    return () => {
      cancelled = true
    }
  }, [usuarioId, lista, storeCarregando, obterUsuario])

  useEffect(() => {
    if (!usuario) return

    const atualizado = lista.find(u => u.id === usuario.id)

    if (atualizado) setUsuario(atualizado)
  }, [lista, usuario?.id])

  if (carregando || storeCarregando) {
    return (
      <div className='flex justify-center p-12'>
        <CircularProgress />
      </div>
    )
  }

  if (naoEncontrado || !usuario) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Usuário não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={'/catec/usuarios'}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  async function handleUpdate(patch: Partial<CatecAdminUsuario>) {
    try {
      const atualizado = await updateUsuario(usuario!.id, patch)

      setUsuario(atualizado)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar o usuário.')
      throw err
    }
  }

  async function handleResetSenha() {
    try {
      const atualizado = await resetarSenha(usuario!.id)

      setUsuario(atualizado)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.')
      throw err
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <Usuario2LeftOverview usuario={usuario} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <Usuario2Right
          usuario={usuario}
          onUpdate={patch => handleUpdate(patch)}
          onResetSenha={() => handleResetSenha()}
        />
      </Grid>
    </Grid>
  )
}

export default Usuario2View
