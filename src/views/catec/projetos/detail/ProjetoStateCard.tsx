'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

type Props = {
  titulo: string
  descricao?: string
  tipo?: 'empty' | 'locked' | 'info'
}

const ICONS = {
  empty: 'tabler-inbox',
  locked: 'tabler-lock',
  info: 'tabler-info-circle'
} as const

const ProjetoStateCard = ({ titulo, descricao, tipo = 'empty' }: Props) => {
  return (
    <Card variant='outlined'>
      <CardContent className='flex flex-col items-center gap-2 p-12 text-center'>
        <i className={`${ICONS[tipo]} text-[2.5rem] text-textDisabled`} />
        <Typography variant='h6'>{titulo}</Typography>
        {descricao ? <Typography color='text.secondary'>{descricao}</Typography> : null}
      </CardContent>
    </Card>
  )
}

export default ProjetoStateCard
