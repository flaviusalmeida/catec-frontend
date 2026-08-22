'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import CanPermission from '@/components/catec/CanPermission'
import {
  alterarStatusAtividadeCatec,
  atualizarAtividadeCatec,
  criarAtividadeRaizCatec,
  excluirAtividadeCatec,
  listarAtividadesPorProjetoCatec
} from '@/libs/catecAtividadesApi'
import { listarUsuariosCatec } from '@/libs/catecUsuariosApi'
import type { CatecAtividade, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'
import {
  ORDEM_STATUS_ATIVIDADE,
  STATUS_ATIVIDADE_COR,
  STATUS_ATIVIDADE_ROTULO
} from '@/types/catec/atividadeTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'
import type { CatecProjeto, CatecProjetoStatus } from '@/types/catec/projetoTypes'
import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'
import { useCatecPermission } from '@/hooks/useCatecPermission'

import CustomTextField from '@core/components/mui/TextField'

import ProjetoAtividadeLinha from './ProjetoAtividadeLinha'
import styles from './projetoAtividades.module.css'

type Props = {
  projeto: CatecProjeto
}

type NoAtividade = {
  atividade: CatecAtividade
  filhos: NoAtividade[]
}

type DialogAcao = 'responsavel' | 'prazo' | 'excluir' | null

const STATUS_LEITURA: CatecProjetoStatus[] = [
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO',
  'FINALIZADO',
  'CANCELADO'
]

const STATUS_CRIACAO: CatecProjetoStatus[] = ['AGUARDANDO_EXECUCAO', 'EM_EXECUCAO']

const LIMITE_FILHAS_EXPANDIDAS = 3
const PAGE_SIZE_DEFAULT = 10

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

function defaultColapsada(no: NoAtividade): boolean {
  if (no.atividade.tipo === 'ETAPA') return false
  if (no.atividade.tipo === 'ATIVIDADE') {
    return no.filhos.length > LIMITE_FILHAS_EXPANDIDAS
  }

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

function prazoInputValue(iso: string | null): string {
  if (!iso) return ''

  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return ''

  return d.toISOString().slice(0, 10)
}

const ProjetoTabAtividades = ({ projeto }: Props) => {
  const router = useRouter()
  const { hasPermission } = useCatecPermission()

  const [lista, setLista] = useState<CatecAtividade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [colapsadas, setColapsadas] = useState<Record<number, boolean>>({})
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE_DEFAULT)

  const [acaoDialog, setAcaoDialog] = useState<DialogAcao>(null)
  const [atividadeAcao, setAtividadeAcao] = useState<CatecAtividade | null>(null)
  const [usuarios, setUsuarios] = useState<CatecAdminUsuario[]>([])
  const [responsavelId, setResponsavelId] = useState<number | ''>('')
  const [prazoValor, setPrazoValor] = useState('')
  const [salvandoAcao, setSalvandoAcao] = useState(false)

  const permiteLeitura = STATUS_LEITURA.includes(projeto.status)
  const permiteCriacao = STATUS_CRIACAO.includes(projeto.status)
  const projetoMutavel = STATUS_CRIACAO.includes(projeto.status)
  const boardHref = `/catec/atividades?projetoId=${projeto.id}`

  const podeEditar = projetoMutavel && hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_EDITAR)
  const podeMoverStatus = projetoMutavel && hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_MOVER_STATUS)
  const podeExcluir = projetoMutavel && hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_EXCLUIR)

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

  const etapasPaginadas = useMemo(() => {
    const start = page * rowsPerPage

    return arvore.slice(start, start + rowsPerPage)
  }, [arvore, page, rowsPerPage])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(arvore.length / rowsPerPage) - 1)

    if (page > maxPage) setPage(maxPage)
  }, [arvore.length, page, rowsPerPage])

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

  const abrirBoard = useCallback(() => {
    router.push(boardHref)
  }, [boardHref, router])

  const fecharAcaoDialog = () => {
    setAcaoDialog(null)
    setAtividadeAcao(null)
    setResponsavelId('')
    setPrazoValor('')
  }

  const abrirResponsavel = async (atividade: CatecAtividade) => {
    setAtividadeAcao(atividade)
    setResponsavelId(atividade.responsavelId ?? '')
    setAcaoDialog('responsavel')

    if (usuarios.length === 0) {
      try {
        const data = await listarUsuariosCatec()

        setUsuarios(data)
      } catch {
        setUsuarios([])
        toast.error('Não foi possível carregar a lista de usuários.')
      }
    }
  }

  const abrirPrazo = (atividade: CatecAtividade) => {
    setAtividadeAcao(atividade)
    setPrazoValor(prazoInputValue(atividade.prazoEm))
    setAcaoDialog('prazo')
  }

  const abrirExcluir = (atividade: CatecAtividade) => {
    setAtividadeAcao(atividade)
    setAcaoDialog('excluir')
  }

  const patchLocal = (atualizada: CatecAtividade) => {
    setLista(prev => prev.map(item => (item.id === atualizada.id ? atualizada : item)))
  }

  const handleAlterarStatus = async (atividade: CatecAtividade, status: CatecAtividadeStatus) => {
    try {
      const atualizada = await alterarStatusAtividadeCatec(atividade.id, { status })

      patchLocal(atualizada)
      toast.success('Status atualizado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível alterar o status.')
    }
  }

  const salvarResponsavel = async () => {
    if (!atividadeAcao) return

    setSalvandoAcao(true)

    try {
      const atualizada = await atualizarAtividadeCatec(atividadeAcao.id, {
        titulo: atividadeAcao.titulo,
        descricao: atividadeAcao.descricao,
        status: atividadeAcao.status,
        prioridade: atividadeAcao.prioridade,
        responsavelId: responsavelId === '' ? null : Number(responsavelId),
        prazoEm: atividadeAcao.prazoEm,
        ordem: atividadeAcao.ordem
      })

      patchLocal(atualizada)
      toast.success('Responsável atualizado.')
      fecharAcaoDialog()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível alterar o responsável.')
    } finally {
      setSalvandoAcao(false)
    }
  }

  const salvarPrazo = async () => {
    if (!atividadeAcao) return

    setSalvandoAcao(true)

    try {
      const atualizada = await atualizarAtividadeCatec(atividadeAcao.id, {
        titulo: atividadeAcao.titulo,
        descricao: atividadeAcao.descricao,
        status: atividadeAcao.status,
        prioridade: atividadeAcao.prioridade,
        responsavelId: atividadeAcao.responsavelId,
        prazoEm: prazoValor ? new Date(`${prazoValor}T12:00:00`).toISOString() : null,
        ordem: atividadeAcao.ordem
      })

      patchLocal(atualizada)
      toast.success('Prazo atualizado.')
      fecharAcaoDialog()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível alterar o prazo.')
    } finally {
      setSalvandoAcao(false)
    }
  }

  const confirmarExcluir = async () => {
    if (!atividadeAcao) return

    setSalvandoAcao(true)

    try {
      await excluirAtividadeCatec(atividadeAcao.id)
      toast.success('Item excluído.')
      fecharAcaoDialog()
      await carregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível excluir.')
    } finally {
      setSalvandoAcao(false)
    }
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

  const propsMenu = (atividade: CatecAtividade, comMenu: boolean) =>
    comMenu
      ? {
          showMenu: true as const,
          podeEditar,
          podeMoverStatus,
          podeExcluir,
          onEditar: abrirBoard,
          onAlterarStatus: (status: CatecAtividadeStatus) => void handleAlterarStatus(atividade, status),
          onAlterarResponsavel: () => void abrirResponsavel(atividade),
          onAlterarPrazo: () => abrirPrazo(atividade),
          onExcluir: () => abrirExcluir(atividade)
        }
      : { showMenu: false as const }

  const renderSubatividades = (filhos: NoAtividade[]) => (
    <div className={`${styles.filhos} ${styles.filhosNivel2}`}>
      {filhos.map(sub => (
        <ProjetoAtividadeLinha
          key={sub.atividade.id}
          atividade={sub.atividade}
          variant='subatividade'
          onOpenBoard={abrirBoard}
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
              onOpenBoard={abrirBoard}
              {...propsMenu(no.atividade, true)}
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
      {etapasPaginadas.map(etapa => {
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
              onOpenBoard={abrirBoard}
              {...propsMenu(etapa.atividade, true)}
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
              <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setDialogOpen(true)}>
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
                variant='tonal'
                color={STATUS_ATIVIDADE_COR[status]}
                label={`${STATUS_ATIVIDADE_ROTULO[status]}: ${contadores[status]}`}
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
            {arvore.length > 0 ? (
              <TablePagination
                component='div'
                className={styles.paginacao}
                count={arvore.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => {
                  setRowsPerPage(Number.parseInt(e.target.value, 10))
                  setPage(0)
                }}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage='por página'
                labelDisplayedRows={({ from, to, count }) =>
                  `Mostrando ${from}–${to} de ${count !== -1 ? count : `mais de ${to}`} etapas`
                }
              />
            ) : null}
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

      <Dialog open={acaoDialog === 'responsavel'} onClose={fecharAcaoDialog} fullWidth maxWidth='xs'>
        <DialogTitle>Alterar responsável</DialogTitle>
        <DialogContent>
          <FormControl fullWidth className='mbs-2'>
            <InputLabel id='resp-label'>Responsável</InputLabel>
            <Select
              labelId='resp-label'
              label='Responsável'
              value={responsavelId === '' ? '' : String(responsavelId)}
              onChange={e => {
                const v = e.target.value

                setResponsavelId(v === '' ? '' : Number(v))
              }}
            >
              <MenuItem value=''>
                <em>Sem responsável</em>
              </MenuItem>
              {usuarios.map(u => (
                <MenuItem key={u.id} value={String(u.id)}>
                  {u.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharAcaoDialog} color='secondary' disabled={salvandoAcao}>
            Cancelar
          </Button>
          <Button variant='contained' onClick={() => void salvarResponsavel()} disabled={salvandoAcao}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={acaoDialog === 'prazo'} onClose={fecharAcaoDialog} fullWidth maxWidth='xs'>
        <DialogTitle>Alterar prazo</DialogTitle>
        <DialogContent>
          <CustomTextField
            autoFocus
            fullWidth
            type='date'
            label='Prazo'
            value={prazoValor}
            onChange={e => setPrazoValor(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className='mbs-2'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharAcaoDialog} color='secondary' disabled={salvandoAcao}>
            Cancelar
          </Button>
          <Button variant='contained' onClick={() => void salvarPrazo()} disabled={salvandoAcao}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={acaoDialog === 'excluir'} onClose={fecharAcaoDialog} fullWidth maxWidth='xs'>
        <DialogTitle>Excluir</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja excluir <strong>{atividadeAcao?.codigo}</strong> — {atividadeAcao?.titulo}? Itens com filhos não
            podem ser excluídos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharAcaoDialog} color='secondary' disabled={salvandoAcao}>
            Cancelar
          </Button>
          <Button color='error' variant='contained' onClick={() => void confirmarExcluir()} disabled={salvandoAcao}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ProjetoTabAtividades
