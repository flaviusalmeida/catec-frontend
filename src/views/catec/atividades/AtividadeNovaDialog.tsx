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

import AtividadeDescricaoEditor from './AtividadeDescricaoEditor'
import styles from './styles.module.css'

function prioridadeIcone(prioridade: CatecAtividadePrioridade): string {
  if (prioridade === 'ALTA') return 'tabler-chevrons-up'
  if (prioridade === 'BAIXA') return 'tabler-chevrons-down'

  return 'tabler-equal'
}

function prioridadeCorClass(prioridade: CatecAtividadePrioridade): string {
  if (prioridade === 'ALTA') return styles.prioAlta
  if (prioridade === 'BAIXA') return styles.prioBaixa

  return styles.prioMedia
}

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
  const [descricao, setDescricao] = useState<string | null>(null)
  const [prioridade, setPrioridade] = useState<CatecAtividadePrioridade>('MEDIA')
  const [prazo, setPrazo] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return

    setProjetoId(projetoIdFixo ?? '')
    setTitulo('')
    setDescricao(null)
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
        descricao,
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
      transitionDuration={200}
      PaperProps={{ className: styles.novaDialog }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nova atividade</DialogTitle>
        <DialogContent className={styles.novaDialogContent}>
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
            placeholder='Ex.: Elaborar proposta comercial'
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            autoFocus
          />
          {open ? (
            <AtividadeDescricaoEditor
              key='nova-atividade-descricao'
              value={descricao}
              modoFormulario
              compacto
              onChange={setDescricao}
            />
          ) : null}
          <div className={styles.novaDialogLinha}>
            <CustomTextField
              select
              fullWidth
              label='Prioridade'
              value={prioridade}
              onChange={e => setPrioridade(e.target.value as CatecAtividadePrioridade)}
              slotProps={{
                select: {
                  renderValue: value => {
                    const key = value as CatecAtividadePrioridade

                    return (
                      <span className='inline-flex items-center gap-2'>
                        <i className={`${prioridadeIcone(key)} text-base ${prioridadeCorClass(key)}`} />
                        {PRIORIDADE_ATIVIDADE_ROTULO[key]}
                      </span>
                    )
                  }
                }
              }}
            >
              {(Object.keys(PRIORIDADE_ATIVIDADE_ROTULO) as CatecAtividadePrioridade[]).map(key => (
                <MenuItem key={key} value={key}>
                  <span className='inline-flex items-center gap-2'>
                    <i className={`${prioridadeIcone(key)} text-lg ${prioridadeCorClass(key)}`} />
                    {PRIORIDADE_ATIVIDADE_ROTULO[key]}
                  </span>
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              fullWidth
              label='Prazo'
              type='date'
              value={prazo}
              onChange={e => setPrazo(e.target.value)}
              className={styles.novaDialogPrazo}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </div>
        </DialogContent>
        <DialogActions className={styles.novaDialogActions}>
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
