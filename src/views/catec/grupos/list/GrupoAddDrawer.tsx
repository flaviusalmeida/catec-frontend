'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecGrupo, CatecGrupoCreateInput, CatecPermissaoCatalogo } from '@/types/catec/grupoTypes'

import CustomTextField from '@core/components/mui/TextField'


type Props = {
  open: boolean
  onClose: () => void
  onAdd: (input: CatecGrupoCreateInput) => Promise<CatecGrupo>
  catalogo: CatecPermissaoCatalogo[]
}

function permissoesIniciais(catalogo: CatecPermissaoCatalogo[]): string[] {
  const painel = catalogo.find(p => p.codigo === 'tela.painel')

  if (painel) return [painel.codigo]

  const primeira = catalogo[0]

  return primeira ? [primeira.codigo] : []
}

const GrupoAddDrawer = ({ open, onClose, onAdd, catalogo }: Props) => {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)

  const router = useRouter()
  

  function reset() {
    setNome('')
    setDescricao('')
  }

  function handleClose() {
    if (salvando) return

    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome.trim()) {
      toast.error('Informe o nome do grupo.')

      return
    }

    const permissoes = permissoesIniciais(catalogo)

    if (permissoes.length === 0) {
      toast.error('Catálogo de permissões indisponível.')

      return
    }

    setSalvando(true)

    try {
      const criado = await onAdd({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        permissoes
      })

      toast.success('Grupo criado. Configure as permissões na edição.')
      handleClose()
      router.push(`/catec/grupos/view/${criado.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar o grupo.')
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
        <Typography variant='h5'>Novo grupo</Typography>
        <IconButton size='small' onClick={handleClose} disabled={salvando}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={e => void handleSubmit(e)} className='flex flex-col gap-6 p-6'>
        <CustomTextField
          fullWidth
          label='Nome'
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder='Comercial externo'
          disabled={salvando}
        />
        <CustomTextField
          fullWidth
          multiline
          rows={3}
          label='Descrição'
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          disabled={salvando}
        />
        <Typography variant='body2' color='text.secondary'>
          O código é gerado pelo servidor. Após criar, ajuste as permissões na tela de edição.
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

export default GrupoAddDrawer
