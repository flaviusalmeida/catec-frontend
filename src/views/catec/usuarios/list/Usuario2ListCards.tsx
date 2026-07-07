'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'

import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'

type Props = {
  lista: CatecAdminUsuario[]
}

const Usuario2ListCards = ({ lista }: Props) => {
  const data = useMemo<UserDataType[]>(() => {
    const ativos = lista.filter(u => u.ativo && !u.requerTrocaSenha).length
    const pendentes = lista.filter(u => u.requerTrocaSenha).length
    const inativos = lista.filter(u => !u.ativo && !u.requerTrocaSenha).length

    return [
      {
        title: 'Total',
        stats: String(lista.length),
        avatarIcon: 'tabler-users',
        avatarColor: 'primary',
        subtitle: 'Usuários cadastrados'
      },
      {
        title: 'Ativos',
        stats: String(ativos),
        avatarIcon: 'tabler-user-check',
        avatarColor: 'success',
        subtitle: 'Contas ativas'
      },
      {
        title: 'Pendentes',
        stats: String(pendentes),
        avatarIcon: 'tabler-user-exclamation',
        avatarColor: 'warning',
        subtitle: 'Aguardam troca de senha'
      },
      {
        title: 'Inativos',
        stats: String(inativos),
        avatarIcon: 'tabler-user-off',
        avatarColor: 'secondary',
        subtitle: 'Contas desativadas'
      }
    ]
  }, [lista])

  return (
    <Grid container spacing={6}>
      {data.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default Usuario2ListCards
