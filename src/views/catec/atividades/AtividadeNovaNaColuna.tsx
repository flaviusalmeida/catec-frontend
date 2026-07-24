'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'

const CustomTextFieldStyled = styled(CustomTextField)({
  '& .MuiInputBase-root.MuiFilledInput-root': {
    backgroundColor: 'var(--mui-palette-background-paper) !important'
  }
})

type Props = {
  onAdd: (titulo: string) => Promise<void> | void
  disabled?: boolean
}

const AtividadeNovaNaColuna = ({ onAdd, disabled }: Props) => {
  const [aberto, setAberto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const fechar = () => {
    setAberto(false)
    setTitulo('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const valor = titulo.trim()

    if (!valor || salvando) return

    setSalvando(true)

    try {
      await onAdd(valor)
      fechar()
    } finally {
      setSalvando(false)
    }
  }

  if (disabled) return null

  return (
    <div className='flex flex-col gap-4 items-start'>
      <Typography
        onClick={() => setAberto(true)}
        color='text.primary'
        className='flex items-center gap-1 cursor-pointer'
      >
        <i className='tabler-plus text-base' />
        <span>Nova atividade</span>
      </Typography>
      {aberto ? (
        <form className='flex flex-col gap-4 min-is-[16.5rem]' onSubmit={handleSubmit}>
          <CustomTextFieldStyled
            fullWidth
            multiline
            autoFocus
            rows={2}
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSubmit(e as unknown as FormEvent)
              }

              if (e.key === 'Escape') fechar()
            }}
            placeholder='Título da atividade'
            variant='outlined'
            required
          />
          <div className='flex gap-3'>
            <Button variant='contained' size='small' color='primary' type='submit' disabled={salvando}>
              Adicionar
            </Button>
            <Button variant='tonal' size='small' color='secondary' onClick={fechar} disabled={salvando}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

export default AtividadeNovaNaColuna
