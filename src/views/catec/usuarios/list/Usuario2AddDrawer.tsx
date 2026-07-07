'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecAdminUsuario, CatecGrupoValor, CatecUsuarioCreateInput } from '@/types/catec/usuarioTypes'
import { GRUPOS_OPCOES } from '@/types/catec/usuarioTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (input: CatecUsuarioCreateInput) => Promise<CatecAdminUsuario>
}

const Usuario2AddDrawer = ({ open, onClose, onAdd }: Props) => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [grupo, setGrupo] = useState<CatecGrupoValor>('COLABORADOR')
  const [salvando, setSalvando] = useState(false)

  function reset() {
    setNome('')
    setEmail('')
    setTelefone('')
    setGrupo('COLABORADOR')
  }

  function handleClose() {
    if (salvando) return

    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome.trim() || !email.trim()) {
      toast.error('Informe nome e e-mail.')

      return
    }

    if (!grupo) {
      toast.error('Selecione um grupo.')

      return
    }

    setSalvando(true)

    try {
      await onAdd({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim() || null,
        grupos: [grupo]
      })

      toast.success('Usuário criado. Senha provisória enviada por e-mail.')
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar o usuário.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Novo usuário</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-6'>
        <CustomTextField
          fullWidth
          label='Nome'
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder='Ana Silva'
        />
        <CustomTextField
          fullWidth
          type='email'
          label='E-mail'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='ana@catec.local'
        />
        <CustomTextField
          fullWidth
          label='Telefone'
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          placeholder='(11) 98765-4321'
        />

        <div>
          <Typography variant='subtitle2' className='mbe-3 font-medium'>
            Grupo de acesso
          </Typography>
          <RadioGroup value={grupo} onChange={e => setGrupo(e.target.value as CatecGrupoValor)}>
            <Grid container spacing={1}>
              {GRUPOS_OPCOES.map(g => (
                <Grid size={{ xs: 12 }} key={g.valor}>
                  <FormControlLabel value={g.valor} control={<Radio />} label={g.rotulo} />
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </div>

        <Typography variant='body2' color='text.secondary'>
          A conta é criada inativa. O sistema envia senha provisória por e-mail.
        </Typography>

        <div className='flex items-center gap-4'>
          <Button variant='contained' type='submit' disabled={salvando}>
            {salvando ? 'Criando…' : 'Criar'}
          </Button>
          <Button variant='tonal' color='secondary' type='button' onClick={handleClose} disabled={salvando}>
            Cancelar
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default Usuario2AddDrawer
