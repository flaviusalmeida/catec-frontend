'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

import { listarAtividadesCatec } from '@/libs/catecAtividadesApi'
import type {
  CatecAtividade,
  CatecAtividadeCreateInput,
  CatecAtividadePrioridade,
  CatecAtividadeStatus,
  CatecAtividadeTipo
} from '@/types/catec/atividadeTypes'
import { PRIORIDADE_ATIVIDADE_ROTULO, TIPO_ATIVIDADE_ROTULO } from '@/types/catec/atividadeTypes'
import type { CatecProjeto } from '@/types/catec/projetoTypes'

import CustomTextField from '@core/components/mui/TextField'

import AtividadeDescricaoEditor from './AtividadeDescricaoEditor'
import AtividadeTipoIcone from './AtividadeTipoIcone'
import styles from './styles.module.css'

const TIPOS_CRIACAO: CatecAtividadeTipo[] = ['EPICO', 'ATIVIDADE', 'SUBATIVIDADE']

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

function tituloModal(tipo: CatecAtividadeTipo | ''): string {
  if (tipo === 'EPICO') return 'Novo épico'
  if (tipo === 'ATIVIDADE') return 'Nova atividade'
  if (tipo === 'SUBATIVIDADE') return 'Nova subatividade'

  return 'Nova atividade'
}

function rotuloPai(tipo: CatecAtividadeTipo): string {
  if (tipo === 'ATIVIDADE') return 'Épico pai'
  if (tipo === 'SUBATIVIDADE') return 'Atividade pai'

  return 'Pai'
}

export type CatecAtividadeNovaPayload = {
  projetoId: number
  tipo: CatecAtividadeTipo
  paiId: number | null
  body: CatecAtividadeCreateInput
}

type Props = {
  open: boolean
  onClose: () => void
  projetos: CatecProjeto[]
  projetoIdFixo?: number | null
  statusInicial?: CatecAtividadeStatus | null
  onCreate: (payload: CatecAtividadeNovaPayload) => Promise<void>
}

const AtividadeNovaDialog = ({ open, onClose, projetos, projetoIdFixo, statusInicial, onCreate }: Props) => {
  const [projetoId, setProjetoId] = useState<number | ''>(projetoIdFixo ?? '')
  const [tipo, setTipo] = useState<CatecAtividadeTipo | ''>('')
  const [paiId, setPaiId] = useState<number | ''>('')
  const [candidatosPai, setCandidatosPai] = useState<CatecAtividade[]>([])
  const [carregandoPais, setCarregandoPais] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState<string | null>(null)
  const [prioridade, setPrioridade] = useState<CatecAtividadePrioridade>('MEDIA')
  const [prazo, setPrazo] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return

    setProjetoId(projetoIdFixo ?? '')
    setTipo('')
    setPaiId('')
    setCandidatosPai([])
    setTitulo('')
    setDescricao(null)
    setPrioridade('MEDIA')
    setPrazo('')
  }, [open, projetoIdFixo])

  useEffect(() => {
    if (!open || tipo === '' || tipo === 'EPICO') {
      setCandidatosPai([])
      setPaiId('')

      return
    }

    const pid = typeof projetoId === 'number' ? projetoId : Number(projetoId)

    if (!pid) {
      setCandidatosPai([])
      setPaiId('')

      return
    }

    let cancelled = false

    setCarregandoPais(true)
    void listarAtividadesCatec({ projetoId: pid })
      .then(lista => {
        if (cancelled) return

        const tipoPai: CatecAtividadeTipo = tipo === 'ATIVIDADE' ? 'EPICO' : 'ATIVIDADE'
        const filtrados = lista
          .filter(a => a.tipo === tipoPai)
          .sort((a, b) => a.codigo.localeCompare(b.codigo, 'pt-BR') || a.id - b.id)

        setCandidatosPai(filtrados)
        setPaiId(prev => (typeof prev === 'number' && filtrados.some(a => a.id === prev) ? prev : ''))
      })
      .catch(() => {
        if (cancelled) return
        setCandidatosPai([])
        setPaiId('')
      })
      .finally(() => {
        if (!cancelled) setCarregandoPais(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, tipo, projetoId])

  const precisaPai = tipo === 'ATIVIDADE' || tipo === 'SUBATIVIDADE'

  const placeholderTitulo = useMemo(() => {
    if (tipo === 'EPICO') return 'Ex.: Entregar proposta comercial'
    if (tipo === 'ATIVIDADE') return 'Ex.: Elaborar minuta da proposta'
    if (tipo === 'SUBATIVIDADE') return 'Ex.: Revisar cláusulas contratuais'

    return 'Ex.: Elaborar proposta comercial'
  }, [tipo])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const pid = typeof projetoId === 'number' ? projetoId : Number(projetoId)

    if (!pid || !titulo.trim()) {
      toast.error('Informe o projeto e o título.')

      return
    }

    if (!tipo) {
      toast.error('Selecione o tipo.')

      return
    }

    if (precisaPai && (paiId === '' || !Number(paiId))) {
      toast.error(
        tipo === 'ATIVIDADE' ? 'Selecione o épico pai.' : 'Selecione a atividade pai.'
      )

      return
    }

    setSalvando(true)

    try {
      await onCreate({
        projetoId: pid,
        tipo,
        paiId: precisaPai ? Number(paiId) : null,
        body: {
          titulo: titulo.trim(),
          descricao,
          prioridade,
          status: statusInicial ?? undefined,
          prazoEm: prazo ? new Date(`${prazo}T12:00:00`).toISOString() : null
        }
      })
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar.')
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
      <form onSubmit={handleSubmit} className={styles.novaDialogForm}>
        <DialogTitle>{tituloModal(tipo)}</DialogTitle>
        <DialogContent className={styles.novaDialogContent}>
          <CustomTextField
            select
            fullWidth
            label='Projeto'
            value={projetoId}
            onChange={e => setProjetoId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={projetoIdFixo != null}
            required
            slotProps={{
              select: {
                MenuProps: {
                  disableScrollLock: true,
                  PaperProps: { className: styles.novaDialogSelectMenu }
                }
              }
            }}
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
            select
            fullWidth
            label='Tipo'
            value={tipo}
            onChange={e => setTipo(e.target.value as CatecAtividadeTipo | '')}
            required
            slotProps={{
              select: {
                displayEmpty: true,
                MenuProps: {
                  disableScrollLock: true
                },
                renderValue: value => {
                  if (value === '' || value == null) {
                    return <em className='text-textDisabled'>Selecione o tipo</em>
                  }

                  const key = value as CatecAtividadeTipo

                  return (
                    <span className='inline-flex items-center gap-2'>
                      <AtividadeTipoIcone tipo={key} comTooltip={false} />
                      {TIPO_ATIVIDADE_ROTULO[key]}
                    </span>
                  )
                }
              }
            }}
          >
            <MenuItem value=''>
              <em>Selecione o tipo</em>
            </MenuItem>
            {TIPOS_CRIACAO.map(key => (
              <MenuItem key={key} value={key}>
                <span className='inline-flex items-center gap-2'>
                  <AtividadeTipoIcone tipo={key} comTooltip={false} />
                  {TIPO_ATIVIDADE_ROTULO[key]}
                </span>
              </MenuItem>
            ))}
          </CustomTextField>

          {precisaPai ? (
            <CustomTextField
              select
              fullWidth
              label={rotuloPai(tipo)}
              value={paiId}
              onChange={e => setPaiId(e.target.value === '' ? '' : Number(e.target.value))}
              required
              disabled={!projetoId || carregandoPais}
              helperText={
                !projetoId
                  ? 'Selecione o projeto primeiro.'
                  : carregandoPais
                    ? 'Carregando…'
                    : candidatosPai.length === 0
                      ? tipo === 'ATIVIDADE'
                        ? 'Nenhum épico neste projeto.'
                        : 'Nenhuma atividade neste projeto.'
                      : undefined
              }
              slotProps={{
                select: {
                  MenuProps: {
                    disableScrollLock: true,
                    PaperProps: { className: styles.novaDialogSelectMenu }
                  }
                }
              }}
            >
              <MenuItem value=''>
                <em>Selecione</em>
              </MenuItem>
              {candidatosPai.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  <span className='inline-flex items-center gap-2 min-is-0'>
                    <AtividadeTipoIcone tipo={a.tipo} comTooltip={false} />
                    <span className='truncate'>
                      {a.codigo} · {a.titulo}
                    </span>
                  </span>
                </MenuItem>
              ))}
            </CustomTextField>
          ) : null}

          <CustomTextField
            fullWidth
            label='Título'
            placeholder={placeholderTitulo}
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
                  MenuProps: {
                    disableScrollLock: true
                  },
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
