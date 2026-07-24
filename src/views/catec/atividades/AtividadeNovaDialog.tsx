'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

import type { CatecAtividadeCreateInput, CatecAtividadePrioridade, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'
import { PRIORIDADE_ATIVIDADE_ROTULO } from '@/types/catec/atividadeTypes'
import type { CatecProjeto } from '@/types/catec/projetoTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  onClose: () => void
  projetos: CatecProjeto[]
  projetoIdFixo?: number | null
  statusInicial?: CatecAtividadeStatus | null
  onCreate: (projetoId: number, body: CatecAtividadeCreateInput) => Promise<void>
}

const AtividadeNovaDialog = ({ open, onClose, projetos, projetoIdFixo, statusInicial, onCreate }: Props) => {
  const [projetoId, setProjetoId] = useState<number | ''>(projetoIdFixo ?? '')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<CatecAtividadePrioridade>('MEDIA')
  const [prazo, setPrazo] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return

    setProjetoId(projetoIdFixo ?? '')
    setTitulo('')
    setDescricao('')
    setPrioridade('MEDIA')
    setPrazo('')
  }, [open, projetoIdFixo])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const pid = typeof projetoId === 'number' ? projetoId : Number(projetoId)

    if (!pid || !titulo.trim()) {
      toast.error('Informe o projeto e o título.')

      return
    }

    setSalvando(true)

    try {
      await onCreate(pid, {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        prioridade,
        status: statusInicial ?? undefined,
        prazoEm: prazo ? new Date(`${prazo}T12:00:00`).toISOString() : null
      })
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar a atividade.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' transitionDuration={200}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nova atividade</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-2'>
          <CustomTextField
            select
            fullWidth
            label='Projeto'
            value={projetoId}
            onChange={e => setProjetoId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={projetoIdFixo != null}
            required
          >
            <MenuItem value=''>
              <em>Selecione</em>
            </MenuItem>
            {projetos.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.titulo}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomTextField
            fullWidth
            label='Título'
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
          />
          <CustomTextField
            fullWidth
            label='Descrição'
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            multiline
            rows={3}
          />
          <CustomTextField
            select
            fullWidth
            label='Prioridade'
            value={prioridade}
            onChange={e => setPrioridade(e.target.value as CatecAtividadePrioridade)}
          >
            {(Object.keys(PRIORIDADE_ATIVIDADE_ROTULO) as CatecAtividadePrioridade[]).map(key => (
              <MenuItem key={key} value={key}>
                {PRIORIDADE_ATIVIDADE_ROTULO[key]}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomTextField
            fullWidth
            label='Prazo'
            type='date'
            value={prazo}
            onChange={e => setPrazo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='secondary' disabled={salvando}>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={salvando}>
            Criar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AtividadeNovaDialog
