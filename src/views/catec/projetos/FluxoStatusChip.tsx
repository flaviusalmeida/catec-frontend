'use client'

import Chip from '@mui/material/Chip'

import type { FluxoStatusSemantica } from '@/utils/catec/fluxoStatusBadge'
import { fluxoStatusBadgeSx } from '@/utils/catec/fluxoStatusBadge'

type Props = {
  label: string
  semantica: FluxoStatusSemantica
}

const FluxoStatusChip = ({ label, semantica }: Props) => {
  return <Chip label={label} size='small' sx={fluxoStatusBadgeSx(semantica)} />
}

export default FluxoStatusChip
