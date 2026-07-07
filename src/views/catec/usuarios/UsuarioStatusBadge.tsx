'use client'

import Chip from '@mui/material/Chip'

import type { ThemeColor } from '@core/types'

type UsuarioStatusBadgeProps = {
  requerTrocaSenha: boolean
  ativo: boolean
}

function statusProps(requerTrocaSenha: boolean, ativo: boolean): { label: string; color: ThemeColor } {
  if (requerTrocaSenha) {
    return { label: 'Troca senha', color: 'warning' }
  }

  if (ativo) {
    return { label: 'Ativo', color: 'success' }
  }

  return { label: 'Inativo', color: 'secondary' }
}

const UsuarioStatusBadge = ({ requerTrocaSenha, ativo }: UsuarioStatusBadgeProps) => {
  const { label, color } = statusProps(requerTrocaSenha, ativo)

  return <Chip label={label} size='small' variant='tonal' color={color} />
}

export default UsuarioStatusBadge
