'use client'

import Chip from '@mui/material/Chip'

import type { ThemeColor } from '@core/types'

type Props = {
  ativo: boolean
}

const GrupoStatusBadge = ({ ativo }: Props) => {
  const color: ThemeColor = ativo ? 'success' : 'secondary'
  const label = ativo ? 'Ativo' : 'Inativo'

  return <Chip label={label} size='small' variant='tonal' color={color} />
}

export default GrupoStatusBadge
