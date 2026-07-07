'use client'

import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecCliente } from '@/types/catec/clienteTypes'
import type { CatecProjeto, CatecProjetoCreateInput } from '@/types/catec/projetoTypes'

import CustomTextField from '@core/components/mui/TextField'
import { formatTelefoneBrasil } from '@/utils/catec/brFormat'

type Props = {
  open: boolean
  onClose: () => void
  clientes: CatecCliente[]
  onAdd: (input: CatecProjetoCreateInput) => Promise<CatecProjeto>
}

const ProjetoAddDrawer = ({ open, onClose, clientes, onAdd }: Props) => {
  const [clienteId, setClienteId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [escopo, setEscopo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const clienteSelecionado = useMemo(
    () => clientes.find(c => String(c.id) === clienteId) ?? null,
    [clienteId, clientes]
  )

  const responsavel = clienteSelecionado?.responsaveis[0] ?? null

  function reset() {
    setClienteId('')
    setTitulo('')
    setEscopo('')
  }

  function handleClose() {
    if (salvando) return

    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const tituloTrim = titulo.trim()
    const escopoTrim = escopo.trim()

    if (!tituloTrim || !escopoTrim) {
      toast.error('Preencha título e descrição.')

      return
    }

    const temCliente = Boolean(clienteSelecionado)

    if (temCliente && !responsavel?.email?.trim() && !clienteSelecionado?.email?.trim()) {
      toast.error('O cliente selecionado precisa ter e-mail cadastrado.')

      return
    }

    setSalvando(true)

    try {
      await onAdd({
        clienteId: clienteSelecionado?.id ?? null,
        titulo: tituloTrim,
        escopo: escopoTrim
      })

      toast.success(
        temCliente
          ? 'Projeto criado com sucesso.'
          : 'Demanda registrada. Associe um cliente quando possível.'
      )
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar o projeto.')
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
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 460 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Novo projeto</Typography>
        <IconButton size='small' onClick={handleClose} disabled={salvando}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={e => void handleSubmit(e)} className='flex flex-col gap-6 p-6'>
        <CustomTextField
          select
          fullWidth
          label='Cliente'
          value={clienteId}
          onChange={e => setClienteId(e.target.value)}
          disabled={salvando}
          slotProps={{ select: { displayEmpty: true } }}
        >
          <MenuItem value=''>Sem cliente (demanda pendente)</MenuItem>
          {clientes.map(c => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.razaoSocialOuNome}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          fullWidth
          label='Título'
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder='Laudo estrutural — Edifício X'
          disabled={salvando}
        />

        {clienteSelecionado ? (
          <div className='flex flex-col gap-2'>
            <Typography variant='subtitle2' className='font-medium'>
              Contato do cliente
            </Typography>
            {!responsavel?.email?.trim() && !clienteSelecionado.email ? (
              <Alert severity='warning' variant='outlined'>
                Este cliente não tem e-mail no cadastro. Complete o cadastro antes de salvar.
              </Alert>
            ) : (
              <>
                <Typography variant='body2'>
                  <strong>E-mail:</strong> {responsavel?.email ?? clienteSelecionado.email}
                </Typography>
                <Typography variant='body2'>
                  <strong>Telefone:</strong>{' '}
                  {responsavel?.telefone || clienteSelecionado.telefone
                    ? formatTelefoneBrasil(responsavel?.telefone ?? clienteSelecionado.telefone ?? '')
                    : '—'}
                </Typography>
              </>
            )}
          </div>
        ) : null}

        <CustomTextField
          fullWidth
          multiline
          rows={4}
          label='Descrição'
          value={escopo}
          onChange={e => setEscopo(e.target.value)}
          placeholder='Descreva o escopo da demanda'
          disabled={salvando}
        />

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

export default ProjetoAddDrawer
