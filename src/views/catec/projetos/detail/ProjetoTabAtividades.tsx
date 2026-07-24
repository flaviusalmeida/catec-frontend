'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import CanPermission from '@/components/catec/CanPermission'
import { criarAtividadeRaizCatec, listarAtividadesPorProjetoCatec } from '@/libs/catecAtividadesApi'
import type { CatecAtividade, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'
import {
  ORDEM_STATUS_ATIVIDADE,
  PRIORIDADE_ATIVIDADE_COR,
  PRIORIDADE_ATIVIDADE_ROTULO,
  STATUS_ATIVIDADE_COR,
  STATUS_ATIVIDADE_ROTULO
} from '@/types/catec/atividadeTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'
import type { CatecProjeto, CatecProjetoStatus } from '@/types/catec/projetoTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  projeto: CatecProjeto
}

const STATUS_LEITURA: CatecProjetoStatus[] = [
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO',
  'FINALIZADO',
  'CANCELADO'
]

const STATUS_CRIACAO: CatecProjetoStatus[] = ['AGUARDANDO_EXECUCAO', 'EM_EXECUCAO']

function formatarPrazo(iso: string | null): string {
  if (!iso) return '—'

  return new Date(iso).toLocaleDateString('pt-BR')
}

const ProjetoTabAtividades = ({ projeto }: Props) => {
  const [lista, setLista] = useState<CatecAtividade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const permiteLeitura = STATUS_LEITURA.includes(projeto.status)
  const permiteCriacao = STATUS_CRIACAO.includes(projeto.status)

  const carregar = useCallback(async () => {
    if (!permiteLeitura) {
      setLista([])
      setCarregando(false)
      setErro(null)

      return
    }

    setCarregando(true)
    setErro(null)

    try {
      const data = await listarAtividadesPorProjetoCatec(projeto.id)

      setLista(data)
    } catch (err) {
      setLista([])
      setErro(err instanceof Error ? err.message : 'Não foi possível carregar as atividades.')
    } finally {
      setCarregando(false)
    }
  }, [permiteLeitura, projeto.id])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const contadores = useMemo(() => {
    const map = Object.fromEntries(ORDEM_STATUS_ATIVIDADE.map(s => [s, 0])) as Record<
      CatecAtividadeStatus,
      number
    >

    for (const a of lista) {
      map[a.status] = (map[a.status] ?? 0) + 1
    }

    return map
  }, [lista])

  const handleCriar = async (e: FormEvent) => {
    e.preventDefault()

    const t = titulo.trim()

    if (!t) {
      toast.error('Informe o título.')

      return
    }

    setSalvando(true)

    try {
      await criarAtividadeRaizCatec(projeto.id, { titulo: t })
      toast.success('Atividade criada.')
      setDialogOpen(false)
      setTitulo('')
      await carregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar a atividade.')
    } finally {
      setSalvando(false)
    }
  }

  if (!permiteLeitura) {
    return (
      <Alert severity='info' variant='outlined'>
        Atividades ficam disponíveis quando o projeto estiver em execução (aguardando execução, em execução) ou
        após finalização/cancelamento para consulta histórica.
      </Alert>
    )
  }

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12 }} className='flex flex-wrap items-center justify-between gap-3'>
        <Typography variant='h5'>Atividades do projeto</Typography>
        <div className='flex flex-wrap gap-2'>
          <Button
            component={Link}
            href={`/catec/atividades?projetoId=${projeto.id}`}
            variant='tonal'
            startIcon={<i className='tabler-layout-kanban' />}
          >
            Abrir no board
          </Button>
          <CanPermission code={PermissaoCodigo.ACAO_ATIVIDADE_CRIAR}>
            {permiteCriacao ? (
              <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setDialogOpen(true)}>
                Nova atividade
              </Button>
            ) : null}
          </CanPermission>
        </div>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <div className='flex flex-wrap gap-2'>
          {ORDEM_STATUS_ATIVIDADE.map(status => (
            <Chip
              key={status}
              variant='tonal'
              color={STATUS_ATIVIDADE_COR[status]}
              label={`${STATUS_ATIVIDADE_ROTULO[status]}: ${contadores[status]}`}
            />
          ))}
        </div>
      </Grid>

      {erro ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' variant='outlined'>
            {erro}
          </Alert>
        </Grid>
      ) : null}

      {carregando ? (
        <Grid size={{ xs: 12 }} className='flex justify-center p-8'>
          <CircularProgress />
        </Grid>
      ) : lista.length === 0 ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='info' variant='outlined'>
            Nenhuma atividade cadastrada neste projeto.
          </Alert>
        </Grid>
      ) : (
        <Grid size={{ xs: 12 }}>
          <CanPermission
            anyOf={[PermissaoCodigo.TELA_ATIVIDADES, PermissaoCodigo.TELA_PROJETO_DETALHE]}
            fallback={
              <Alert severity='warning' variant='outlined'>
                Sem permissão para listar atividades.
              </Alert>
            }
          >
            <div className='flex flex-col gap-3'>
              {lista.map(atividade => (
                <Card key={atividade.id} variant='outlined'>
                  <CardContent className='flex flex-wrap items-center justify-between gap-3 py-3'>
                    <div className='flex flex-col gap-1 min-is-0'>
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {atividade.codigo}
                      </Typography>
                      <Typography className='font-medium wrap-break-word'>{atividade.titulo}</Typography>
                      <div className='flex flex-wrap gap-2 items-center'>
                        <Chip
                          size='small'
                          variant='tonal'
                          color={STATUS_ATIVIDADE_COR[atividade.status]}
                          label={STATUS_ATIVIDADE_ROTULO[atividade.status]}
                        />
                        <Chip
                          size='small'
                          variant='tonal'
                          color={PRIORIDADE_ATIVIDADE_COR[atividade.prioridade]}
                          label={PRIORIDADE_ATIVIDADE_ROTULO[atividade.prioridade]}
                        />
                        {atividade.nivel > 1 ? (
                          <Chip size='small' variant='tonal' color='secondary' label='Filha' />
                        ) : null}
                      </div>
                    </div>
                    <div className='flex flex-col items-end gap-0.5'>
                      <Typography variant='body2' color='text.secondary'>
                        {atividade.responsavelNome ?? 'Sem responsável'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Prazo: {formatarPrazo(atividade.prazoEm)}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CanPermission>
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth='xs'>
        <form onSubmit={handleCriar}>
          <DialogTitle>Nova atividade</DialogTitle>
          <DialogContent>
            <CustomTextField
              autoFocus
              fullWidth
              label='Título'
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required
              className='mbs-2'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color='secondary' disabled={salvando}>
              Cancelar
            </Button>
            <Button type='submit' variant='contained' disabled={salvando}>
              Criar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  )
}

export default ProjetoTabAtividades
