'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import CanPermission from '@/components/catec/CanPermission'
import {
  criarAtividadeRaizCatec,
  listarAtividadesPorProjetoCatec,
  obterAtividadeCatec
} from '@/libs/catecAtividadesApi'
import type { CatecAtividade, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'
import {
  ORDEM_STATUS_ATIVIDADE,
  STATUS_ATIVIDADE_COR,
  STATUS_ATIVIDADE_ROTULO
} from '@/types/catec/atividadeTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'
import type { CatecProjeto, CatecProjetoStatus } from '@/types/catec/projetoTypes'

import CustomTextField from '@core/components/mui/TextField'

import AtividadeDrawer from '@/views/catec/atividades/AtividadeDrawer'
import { useAtividadesStore } from '@/views/catec/atividades/useAtividadesStore'
import drawerStyles from '@/views/catec/atividades/styles.module.css'

import ProjetoAtividadeLinha from './ProjetoAtividadeLinha'
import styles from './projetoAtividades.module.css'

type Props = {
  projeto: CatecProjeto
}

type NoAtividade = {
  atividade: CatecAtividade
  filhos: NoAtividade[]
}

const STATUS_LEITURA: CatecProjetoStatus[] = [
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO',
  'FINALIZADO',
  'CANCELADO'
]

const STATUS_CRIACAO: CatecProjetoStatus[] = ['AGUARDANDO_EXECUCAO', 'EM_EXECUCAO']

function compararOrdem(a: CatecAtividade, b: CatecAtividade): number {
  if (a.ordem !== b.ordem) return a.ordem - b.ordem

  return a.numero - b.numero
}

function montarArvore(lista: CatecAtividade[]): NoAtividade[] {
  const porPai = new Map<number | null, CatecAtividade[]>()

  for (const item of lista) {
    const chave = item.paiId
    const grupo = porPai.get(chave)

    if (grupo) {
      grupo.push(item)
    } else {
      porPai.set(chave, [item])
    }
  }

  for (const grupo of porPai.values()) {
    grupo.sort(compararOrdem)
  }

  const montar = (paiId: number | null): NoAtividade[] => {
    const itens = porPai.get(paiId) ?? []

    return itens.map(atividade => ({
      atividade,
      filhos: montar(atividade.id)
    }))
  }

  return montar(null).filter(no => no.atividade.tipo === 'ETAPA')
}

function metaEtapa(filhos: NoAtividade[]): string {
  const total = filhos.length
  const concluidas = filhos.filter(f => f.atividade.status === 'CONCLUIDA').length
  const rotulo = total === 1 ? 'atividade' : 'atividades'

  return `${total} ${rotulo} · ${concluidas} concluída${concluidas === 1 ? '' : 's'}`
}

function metaAtividade(filhos: NoAtividade[]): string | null {
  if (filhos.length === 0) return null

  return filhos.length === 1 ? '1 subatividade' : `${filhos.length} subatividades`
}

function defaultColapsada(_no: NoAtividade): boolean {
  return true
}

function idsExpansiveis(nos: NoAtividade[]): number[] {
  const ids: number[] = []

  const walk = (lista: NoAtividade[]) => {
    for (const no of lista) {
      if (no.filhos.length > 0) {
        ids.push(no.atividade.id)
        walk(no.filhos)
      }
    }
  }

  walk(nos)

  return ids
}

const ProjetoTabAtividades = ({ projeto }: Props) => {
  const { atualizar, criarFilha, excluir, obter, carregar: carregarStore } = useAtividadesStore()

  const [lista, setLista] = useState<CatecAtividade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [colapsadas, setColapsadas] = useState<Record<number, boolean>>({})

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [atividadeAtual, setAtividadeAtual] = useState<CatecAtividade | null>(null)

  const permiteLeitura = STATUS_LEITURA.includes(projeto.status)
  const permiteCriacao = STATUS_CRIACAO.includes(projeto.status)
  const boardHref = `/catec/atividades?projetoId=${projeto.id}`

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
      setColapsadas({})
      void carregarStore({ projetoId: projeto.id })
    } catch (err) {
      setLista([])
      setErro(err instanceof Error ? err.message : 'Não foi possível carregar as atividades.')
    } finally {
      setCarregando(false)
    }
  }, [carregarStore, permiteLeitura, projeto.id])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const abrirAtividade = useCallback((atividade: CatecAtividade) => {
    setAtividadeAtual(atividade)
    setDrawerOpen(true)
  }, [])

  const handleAbrirAtividadePorId = useCallback(
    async (id: number) => {
      const naLista = lista.find(a => a.id === id) ?? obter(id)

      if (naLista) {
        setAtividadeAtual(naLista)
        setDrawerOpen(true)

        return
      }

      try {
        const carregada = await obterAtividadeCatec(id)

        setAtividadeAtual(carregada)
        setDrawerOpen(true)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível abrir a atividade.')
      }
    },
    [lista, obter]
  )

  const arvore = useMemo(() => montarArvore(lista), [lista])

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

  const isColapsada = useCallback(
    (no: NoAtividade) => {
      const id = no.atividade.id

      if (id in colapsadas) return colapsadas[id]

      return defaultColapsada(no)
    },
    [colapsadas]
  )

  const toggleNo = useCallback((no: NoAtividade) => {
    setColapsadas(prev => {
      const atual = no.atividade.id in prev ? prev[no.atividade.id] : defaultColapsada(no)

      return { ...prev, [no.atividade.id]: !atual }
    })
  }, [])

  const expandirTudo = useCallback(() => {
    const next: Record<number, boolean> = {}

    for (const id of idsExpansiveis(arvore)) {
      next[id] = false
    }

    setColapsadas(next)
  }, [arvore])

  const recolherTudo = useCallback(() => {
    const next: Record<number, boolean> = {}

    for (const id of idsExpansiveis(arvore)) {
      next[id] = true
    }

    setColapsadas(next)
  }, [arvore])

  const patchLocal = (atualizada: CatecAtividade) => {
    setLista(prev => prev.map(item => (item.id === atualizada.id ? atualizada : item)))
  }

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
      toast.success('Etapa criada.')
      setDialogOpen(false)
      setTitulo('')
      await carregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar a etapa.')
    } finally {
      setSalvando(false)
    }
  }

  const renderSubatividades = (filhos: NoAtividade[]) => (
    <div className={`${styles.filhos} ${styles.filhosNivel2}`}>
      {filhos.map(sub => (
        <ProjetoAtividadeLinha
          key={sub.atividade.id}
          atividade={sub.atividade}
          variant='subatividade'
          onAbrir={() => abrirAtividade(sub.atividade)}
        />
      ))}
    </div>
  )

  const renderAtividades = (filhos: NoAtividade[]) => (
    <div className={styles.filhos}>
      {filhos.map(no => {
        const temFilhos = no.filhos.length > 0
        const colapsada = isColapsada(no)

        return (
          <div key={no.atividade.id} className={styles.grupo}>
            <ProjetoAtividadeLinha
              atividade={no.atividade}
              variant='atividade'
              expansivel={temFilhos}
              aberta={temFilhos && !colapsada}
              onToggle={() => toggleNo(no)}
              metaFilhos={metaAtividade(no.filhos)}
              onAbrir={() => abrirAtividade(no.atividade)}
            />
            {temFilhos ? (
              <Collapse in={!colapsada} timeout='auto' unmountOnExit>
                {renderSubatividades(no.filhos)}
              </Collapse>
            ) : null}
          </div>
        )
      })}
    </div>
  )

  const renderEtapas = () => (
    <div className={styles.lista}>
      {arvore.map(etapa => {
        const colapsada = isColapsada(etapa)
        const temAtividades = etapa.filhos.length > 0

        return (
          <div key={etapa.atividade.id} className={styles.grupo}>
            <ProjetoAtividadeLinha
              atividade={etapa.atividade}
              variant='etapa'
              expansivel={temAtividades}
              aberta={temAtividades && !colapsada}
              onToggle={() => toggleNo(etapa)}
              metaFilhos={metaEtapa(etapa.filhos)}
              onAbrir={() => abrirAtividade(etapa.atividade)}
            />
            {temAtividades ? (
              <Collapse in={!colapsada} timeout='auto' unmountOnExit>
                {renderAtividades(etapa.filhos)}
              </Collapse>
            ) : (
              <div className={styles.vazioEtapa}>
                Nenhuma atividade nesta etapa.{' '}
                <Link href={boardHref} className='text-primary font-medium'>
                  Abrir no board
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  if (!permiteLeitura) {
    return (
      <Alert severity='info' variant='outlined'>
        Atividades ficam disponíveis quando o projeto estiver em execução (aguardando execução, em execução) ou
        após finalização/cancelamento para consulta histórica.
      </Alert>
    )
  }

  return (
    <>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }} className='flex flex-wrap items-center justify-between gap-3'>
          <Typography variant='h5'>Atividades do projeto</Typography>
          <div className='flex flex-wrap gap-2'>
            <Button
              component={Link}
              href={boardHref}
              variant='tonal'
              startIcon={<i className='tabler-layout-kanban' />}
            >
              Abrir no board
            </Button>
            <CanPermission code={PermissaoCodigo.ACAO_ATIVIDADE_CRIAR}>
              {permiteCriacao ? (
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => setDialogOpen(true)}
                >
                  Nova etapa
                </Button>
              ) : null}
            </CanPermission>
          </div>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex flex-wrap gap-2'>
              {ORDEM_STATUS_ATIVIDADE.map(status => (
                <Chip
                  key={status}
                  size='small'
                  label={`${STATUS_ATIVIDADE_ROTULO[status]}: ${contadores[status]}`}
                  variant={status === 'A_FAZER' || status === 'EM_ANDAMENTO' ? 'filled' : 'tonal'}
                  color={status === 'A_FAZER' ? 'secondary' : STATUS_ATIVIDADE_COR[status]}
                  className={[
                    drawerStyles.subatividadeStatusChip,
                    status === 'A_FAZER' ? drawerStyles.detalheStatusAFazer : '',
                    status === 'EM_ANDAMENTO' ? drawerStyles.detalheStatusEmAndamento : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              ))}
            </div>
            {arvore.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                <Button size='small' variant='text' onClick={expandirTudo}>
                  Expandir tudo
                </Button>
                <Button size='small' variant='text' onClick={recolherTudo}>
                  Recolher tudo
                </Button>
              </div>
            ) : null}
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
              {renderEtapas()}
            </CanPermission>
          </Grid>
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth='xs'>
          <form onSubmit={handleCriar}>
            <DialogTitle>Nova etapa</DialogTitle>
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

      <AtividadeDrawer
        open={drawerOpen}
        atividade={atividadeAtual}
        onClose={() => setDrawerOpen(false)}
        onUpdate={async (id, body) => {
          const atualizada = await atualizar(id, body)

          setAtividadeAtual(atualizada)
          patchLocal(atualizada)
          await carregar()
        }}
        onCreateFilha={async (paiId, body) => {
          await criarFilha(paiId, body)
          await carregar()
        }}
        onDelete={async id => {
          await excluir(id)
          setAtividadeAtual(null)
          setDrawerOpen(false)
          await carregar()
        }}
        onAbrirAtividade={handleAbrirAtividadePorId}
      />
    </>
  )
}

export default ProjetoTabAtividades
