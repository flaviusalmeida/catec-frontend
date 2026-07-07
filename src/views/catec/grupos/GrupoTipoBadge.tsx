'use client'

import Chip from '@mui/material/Chip'

import type { ThemeColor } from '@core/types'

type Props = {
  sistema: boolean
}

const GrupoTipoBadge = ({ sistema }: Props) => {
  const color: ThemeColor = sistema ? 'info' : 'warning'
  const label = sistema ? 'Sistema' : 'Customizado'

  return <Chip label={label} size='small' variant='tonal' color={color} />
}

export default GrupoTipoBadge
