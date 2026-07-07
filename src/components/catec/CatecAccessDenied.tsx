'use client'

import type { ReactNode } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

type Props = {
  title?: string
  message?: ReactNode
}

const CatecAccessDenied = ({
  title = 'Acesso restrito',
  message = 'O seu perfil não tem permissão para aceder a esta área. As operações sensíveis continuam validadas pela API.'
}: Props) => {
  return (
    <Card>
      <CardContent className='flex flex-col gap-2 p-6'>
        <Typography variant='h5' component='h1'>
          {title}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {message}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default CatecAccessDenied
