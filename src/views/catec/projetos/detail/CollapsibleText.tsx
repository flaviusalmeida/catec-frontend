'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'

type Props = {
  text: string
  maxChars?: number
}

const CollapsibleText = ({ text, maxChars = 180 }: Props) => {
  const [aberto, setAberto] = useState(false)
  const trimmed = text.trim() || '—'
  const longo = trimmed.length > maxChars

  if (!longo) {
    return (
      <Typography variant='body1' color='text.secondary' className='whitespace-pre-wrap'>
        {trimmed}
      </Typography>
    )
  }

  return (
    <div>
      <Collapse in={aberto} collapsedSize={72}>
        <Typography variant='body1' color='text.secondary' className='whitespace-pre-wrap'>
          {trimmed}
        </Typography>
      </Collapse>
      <Button size='small' variant='text' onClick={() => setAberto(v => !v)} className='mts-2'>
        {aberto ? 'Ver menos' : 'Ver mais'}
      </Button>
    </div>
  )
}

export default CollapsibleText
