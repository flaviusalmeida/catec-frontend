'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useRouter } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { toast } from 'react-toastify'

import CanPermission from '@/components/catec/CanPermission'
import { useCatecPermission } from '@/hooks/useCatecPermission'
import { obterProjetoCatec } from '@/libs/catecProjetosApi'
import { listarUsuariosCatec } from '@/libs/catecUsuariosApi'
import type {
  CatecAtividade,
  CatecAtividadeCreateInput,
  CatecAtividadePrioridade,
  CatecAtividadeStatus,
  CatecAtividadeUpdateInput
} from '@/types/catec/atividadeTypes'
import {
  PRIORIDADE_ATIVIDADE_ROTULO,
  STATUS_ATIVIDADE_COR,
  STATUS_ATIVIDADE_ROTULO
} from '@/types/catec/atividadeTypes'
import type { CatecProjeto } from '@/types/catec/projetoTypes'
import { STATUS_PROJETO_ROTULO } from '@/types/catec/projetoTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'
import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'

import CustomAutocomplete from '@core/components/mui/Autocomplete'
import CustomTextField from '@core/components/mui/TextField'

import AtividadeAnexosSecao from './AtividadeAnexosSecao'
import AtividadeDescricaoEditor from './AtividadeDescricaoEditor'
import AtividadeDiscussaoSecao from './AtividadeDiscussaoSecao'
import { useAtividadesStore } from './useAtividadesStore'
import styles from './styles.module.css'

type Props = {
  open: boolean
  atividade: CatecAtividade | null
  onClose: () => void
  onUpdate: (id: number, body: CatecAtividadeUpdateInput) => Promise<void>
  onCreateFilha: (paiId: number, body: CatecAtividadeCreateInput) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onAbrirAtividade?: (id: number) => void | Promise<void>
}

function toDateInput(iso: string | null): string {
  if (!iso) return ''

  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return ''

  return d.toISOString().slice(0, 10)
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) return '?'

  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

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

type ResponsavelOption = {
  id: number | null
  nome: string
}

const OPCAO_NAO_ATRIBUIDO: ResponsavelOption = {
  id: null,
  nome: 'Não atribuído'
}

function formatarDataExibicao(iso: string | null | undefined): string {
  if (!iso) return 'Nenhum'

  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return 'Nenhum'

  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatarDataHoraExibicao(iso: string | null | undefined): string {
  if (!iso) return 'Nenhum'

  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return 'Nenhum'

  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const ano = String(d.getFullYear()).slice(-2)
  const hora = String(d.getHours()).padStart(2, '0')
  const minuto = String(d.getMinutes()).padStart(2, '0')

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`
}

const AtividadeDrawer = ({
  open,
  atividade,
  onClose,
  onUpdate,
  onCreateFilha,
  onDelete,
  onAbrirAtividade
}: Props) => {
  const router = useRouter()
  const { hasPermission } = useCatecPermission()
  const { board } = useAtividadesStore()
  const podeEditar = hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_EDITAR)
  const podeCriar = hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_CRIAR)
  const podeExcluir = hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_EXCLUIR)
  const podeGerirAnexos =
    hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_EDITAR) ||
    hasPermission(PermissaoCodigo.ACAO_DOCUMENTO_UPLOAD)

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState<CatecAtividadeStatus>('A_FAZER')
  const [prioridade, setPrioridade] = useState<CatecAtividadePrioridade>('MEDIA')
  const [responsavelId, setResponsavelId] = useState<number | ''>('')
  const [prazo, setPrazo] = useState('')
  const [usuarios, setUsuarios] = useState<CatecAdminUsuario[]>([])
  const [salvando, setSalvando] = useState(false)
  const [filhaTitulo, setFilhaTitulo] = useState('')
  const [criandoFilha, setCriandoFilha] = useState(false)
  const [mostrandoFilha, setMostrandoFilha] = useState(false)
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null)
  const [prioAnchor, setPrioAnchor] = useState<null | HTMLElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(330)
  const [infoAberta, setInfoAberta] = useState(true)
  const [projetoAberto, setProjetoAberto] = useState(true)
  const [editandoResponsavel, setEditandoResponsavel] = useState(false)
  const [editandoPrazo, setEditandoPrazo] = useState(false)
  const [projeto, setProjeto] = useState<CatecProjeto | null>(null)
  const [carregandoProjeto, setCarregandoProjeto] = useState(false)
  const [arrastandoDivider, setArrastandoDivider] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const arrastandoRef = useRef(false)

  const SIDEBAR_MIN = 280
  const SIDEBAR_MAX = 560

  const estadoRef = useRef({
    titulo: '',
    descricao: '',
    status: 'A_FAZER' as CatecAtividadeStatus,
    prioridade: 'MEDIA' as CatecAtividadePrioridade,
    responsavelId: '' as number | '',
    prazo: ''
  })

  const filhas = useMemo(() => {
    if (!atividade) return []

    return board
      .flatMap(coluna => coluna.atividades)
      .filter(item => item.paiId === atividade.id)
      .sort((a, b) => a.ordem - b.ordem || a.id - b.id)
  }, [board, atividade])

  const progressoFilhas = useMemo(() => {
    if (filhas.length === 0) return null

    const concluidas = filhas.filter(f => f.status === 'CONCLUIDA').length
    const percentual = Math.round((concluidas / filhas.length) * 100)

    return { concluidas, total: filhas.length, percentual }
  }, [filhas])

  useEffect(() => {
    if (!atividade) return

    setTitulo(atividade.titulo)
    setDescricao(atividade.descricao ?? '')
    setStatus(atividade.status)
    setPrioridade(atividade.prioridade)
    setResponsavelId(atividade.responsavelId ?? '')
    setPrazo(toDateInput(atividade.prazoEm))
    setFilhaTitulo('')
    setMostrandoFilha(false)
    setEditandoResponsavel(false)
    setEditandoPrazo(false)
  }, [atividade])

  useEffect(() => {
    if (!arrastandoDivider) return

    const onMove = (e: PointerEvent) => {
      if (!arrastandoRef.current || !bodyRef.current) return

      const rect = bodyRef.current.getBoundingClientRect()
      const max = Math.min(SIDEBAR_MAX, Math.floor(rect.width * 0.6))
      const next = Math.round(rect.right - e.clientX)

      setSidebarWidth(Math.min(max, Math.max(SIDEBAR_MIN, next)))
    }

    const onUp = () => {
      arrastandoRef.current = false
      setArrastandoDivider(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [arrastandoDivider])

  const iniciarArrasteDivider = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    arrastandoRef.current = true
    setArrastandoDivider(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    estadoRef.current = { titulo, descricao, status, prioridade, responsavelId, prazo }
  }, [titulo, descricao, status, prioridade, responsavelId, prazo])

  useEffect(() => {
    if (!open) return

    void listarUsuariosCatec()
      .then(setUsuarios)
      .catch(() => setUsuarios([]))
  }, [open])

  useEffect(() => {
    if (!open || !atividade?.projetoId) {
      setProjeto(null)

      return
    }

    let cancelado = false

    setCarregandoProjeto(true)

    void obterProjetoCatec(atividade.projetoId)
      .then(dados => {
        if (!cancelado) setProjeto(dados)
      })
      .catch(() => {
        if (!cancelado) setProjeto(null)
      })
      .finally(() => {
        if (!cancelado) setCarregandoProjeto(false)
      })

    return () => {
      cancelado = true
    }
  }, [open, atividade?.projetoId])

  const opcoesResponsavel: ResponsavelOption[] = (() => {
    const lista: ResponsavelOption[] = [...usuarios]

    if (
      atividade?.responsavelId != null &&
      !usuarios.some(u => u.id === atividade.responsavelId)
    ) {
      lista.unshift({
        id: atividade.responsavelId,
        nome: atividade.responsavelNome ?? `Usuário #${atividade.responsavelId}`
      })
    }

    return [OPCAO_NAO_ATRIBUIDO, ...lista]
  })()

  const responsavelSelecionado: ResponsavelOption =
    responsavelId === ''
      ? OPCAO_NAO_ATRIBUIDO
      : (opcoesResponsavel.find(u => u.id === responsavelId) ?? OPCAO_NAO_ATRIBUIDO)

  const estaSujo = () => {
    if (!atividade) return false

    const atual = estadoRef.current

    return (
      atual.titulo.trim() !== atividade.titulo ||
      (atual.descricao.trim() || null) !== (atividade.descricao ?? null) ||
      atual.status !== atividade.status ||
      atual.prioridade !== atividade.prioridade ||
      (atual.responsavelId === '' ? null : Number(atual.responsavelId)) !== atividade.responsavelId ||
      atual.prazo !== toDateInput(atividade.prazoEm)
    )
  }

  const persistir = async (): Promise<boolean> => {
    if (!atividade || !podeEditar) return true

    const atual = estadoRef.current
    const tituloTrim = atual.titulo.trim()

    if (!tituloTrim) {
      toast.error('Informe o título.')

      return false
    }

    setSalvando(true)

    try {
      await onUpdate(atividade.id, {
        titulo: tituloTrim,
        descricao: atual.descricao.trim() || null,
        status: atual.status,
        prioridade: atual.prioridade,
        responsavelId: atual.responsavelId === '' ? null : Number(atual.responsavelId),
        prazoEm: atual.prazo ? new Date(`${atual.prazo}T12:00:00`).toISOString() : null
      })

      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar a atividade.')

      return false
    } finally {
      setSalvando(false)
    }
  }

  const handleClose = async () => {
    if (salvando) return

    if (estaSujo()) {
      const ok = await persistir()

      if (!ok) return
    }

    onClose()
  }

  const salvarSeSujo = async (): Promise<boolean> => {
    if (salvando) return false

    if (!estaSujo()) return true

    return persistir()
  }

  const irParaProjeto = async (e: ReactMouseEvent) => {
    e.preventDefault()
    if (!atividade) return

    const ok = await salvarSeSujo()

    if (!ok) return

    onClose()
    router.push(`/catec/projetos/${atividade.projetoId}`)
  }

  const irParaAtividade = async (id: number) => {
    if (!atividade || id === atividade.id) return

    const ok = await salvarSeSujo()

    if (!ok) return

    await onAbrirAtividade?.(id)
  }

  const handleDelete = async () => {
    if (!atividade || !podeExcluir) return

    if (!window.confirm('Excluir esta atividade?')) return

    setSalvando(true)

    try {
      await onDelete(atividade.id)
      toast.success('Atividade excluída.')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível excluir a atividade.')
    } finally {
      setSalvando(false)
    }
  }

  const handleCriarFilha = async () => {
    if (!atividade) return

    const t = filhaTitulo.trim()

    if (!t) {
      toast.error('Informe o título da atividade filha.')

      return
    }

    setCriandoFilha(true)

    try {
      if (estaSujo()) {
        const ok = await persistir()

        if (!ok) return
      }

      await onCreateFilha(atividade.id, { titulo: t })
      toast.success('Atividade filha criada.')
      setFilhaTitulo('')
      setMostrandoFilha(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar a atividade filha.')
    } finally {
      setCriandoFilha(false)
    }
  }

  return (
    <Dialog
      open={open && atividade != null}
      onClose={() => {
        void handleClose()
      }}
      fullWidth
      maxWidth='lg'
      scroll='body'
      transitionDuration={200}
      PaperProps={{ className: styles.detalheDialog }}
    >
      {atividade ? (
        <div className={styles.detalheForm}>
          <div className={styles.detalheToolbar}>
            <div className={styles.detalheBreadcrumb}>
              <NextLink
                href={`/catec/projetos/${atividade.projetoId}`}
                className={styles.detalheBreadcrumbLink}
                onClick={e => void irParaProjeto(e)}
                title='Abrir projeto'
              >
                <i className='tabler-folder text-lg text-primary' />
                <span className='truncate font-medium'>
                  {atividade.projetoTitulo || `Projeto #${atividade.projetoId}`}
                </span>
              </NextLink>
              {atividade.paiId != null ? (
                <>
                  <Typography variant='body2' color='text.disabled' component='span'>
                    /
                  </Typography>
                  <button
                    type='button'
                    className={styles.detalheBreadcrumbLink}
                    disabled={salvando || !onAbrirAtividade}
                    onClick={() => void irParaAtividade(atividade.paiId!)}
                    title={`Abrir ${atividade.paiCodigo ?? `atividade #${atividade.paiId}`}`}
                  >
                    <span className='truncate'>{atividade.paiCodigo ?? `#${atividade.paiId}`}</span>
                  </button>
                </>
              ) : null}
              <Typography variant='body2' color='text.disabled' component='span'>
                /
              </Typography>
              <Typography variant='body2' color='text.secondary' className='font-medium shrink-0'>
                {atividade.codigo}
              </Typography>
            </div>

            <IconButton size='small' onClick={() => void handleClose()} aria-label='Fechar' disabled={salvando}>
              <i className='tabler-x text-xl text-textSecondary' />
            </IconButton>
          </div>

          <div
            ref={bodyRef}
            className={arrastandoDivider ? `${styles.detalheBody} ${styles.detalheBodyArrastando}` : styles.detalheBody}
            style={{ gridTemplateColumns: `minmax(0, 1fr) 8px ${sidebarWidth}px` }}
          >
            <div className={styles.detalheMain}>
              <div className={styles.detalheTituloBloco}>
                <textarea
                  className={styles.detalheTituloInput}
                  value={titulo}
                  onChange={e => {
                    setTitulo(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = `${e.target.scrollHeight}px`
                  }}
                  onFocus={e => {
                    e.target.style.height = 'auto'
                    e.target.style.height = `${e.target.scrollHeight}px`
                  }}
                  ref={el => {
                    if (el) {
                      el.style.height = 'auto'
                      el.style.height = `${el.scrollHeight}px`
                    }
                  }}
                  disabled={!podeEditar || salvando}
                  placeholder='Título da atividade'
                  required
                  rows={1}
                />

                <div className={styles.detalheTituloSeparador} />
              </div>

              <AtividadeDescricaoEditor
                value={descricao || null}
                disabled={!podeEditar || salvando}
                salvando={salvando}
                onSalvar={async html => {
                  if (!atividade) return

                  setDescricao(html ?? '')
                  setSalvando(true)

                  try {
                    const atual = estadoRef.current

                    await onUpdate(atividade.id, {
                      titulo: atual.titulo.trim() || atividade.titulo,
                      descricao: html,
                      status: atual.status,
                      prioridade: atual.prioridade,
                      responsavelId: atual.responsavelId === '' ? null : Number(atual.responsavelId),
                      prazoEm: atual.prazo ? new Date(`${atual.prazo}T12:00:00`).toISOString() : null
                    })
                    toast.success('Descrição salva.')
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Não foi possível salvar a descrição.')
                    throw err
                  } finally {
                    setSalvando(false)
                  }
                }}
              />

              <AtividadeAnexosSecao
                key={`anexos-${atividade.id}`}
                atividadeId={atividade.id}
                podeGerir={podeGerirAnexos}
                disabled={salvando}
              />

              {atividade.nivel === 1 ? (
                <section className={styles.subatividadesSecao}>
                  <h2 className={styles.descricaoCampoTitulo}>
                    Subatividades{filhas.length > 0 ? ` (${filhas.length})` : ''}
                  </h2>

                  {progressoFilhas ? (
                    <div className={styles.subatividadeProgresso} aria-label={`${progressoFilhas.percentual}% concluído`}>
                      <div className={styles.subatividadeProgressoBarra}>
                        <div
                          className={styles.subatividadeProgressoPreenchimento}
                          style={{ width: `${progressoFilhas.percentual}%` }}
                        />
                      </div>
                      <span className={styles.subatividadeProgressoTexto}>
                        {progressoFilhas.percentual}% concluído
                      </span>
                    </div>
                  ) : null}

                  {filhas.length > 0 ? (
                    <div className={styles.subatividadeTabelaWrap}>
                      <table className={styles.subatividadeTabela}>
                        <thead>
                          <tr>
                            <th>Ticket</th>
                            <th>Prioridade</th>
                            <th>Responsável</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filhas.map(filha => (
                            <tr
                              key={filha.id}
                              className={styles.subatividadeLinha}
                              onClick={() => void irParaAtividade(filha.id)}
                            >
                              <td>
                                <div className={styles.subatividadeColTicket}>
                                  <button
                                    type='button'
                                    className={styles.subatividadeTicketCodigo}
                                    onClick={e => {
                                      e.stopPropagation()
                                      void irParaAtividade(filha.id)
                                    }}
                                    disabled={salvando || !onAbrirAtividade}
                                  >
                                    {filha.codigo}
                                  </button>
                                  <span className={styles.subatividadeTicketTitulo}>{filha.titulo}</span>
                                </div>
                              </td>
                              <td>
                                <div className={styles.subatividadeColPrio}>
                                  <i
                                    className={`${prioridadeIcone(filha.prioridade)} text-base ${prioridadeCorClass(filha.prioridade)}`}
                                  />
                                  <span>{PRIORIDADE_ATIVIDADE_ROTULO[filha.prioridade]}</span>
                                </div>
                              </td>
                              <td>
                                <div className={styles.subatividadeColResp}>
                                  {filha.responsavelNome ? (
                                    <>
                                      <Avatar className={`bs-6 is-6 text-xs ${styles.avatarUsuario}`}>
                                        {iniciais(filha.responsavelNome)}
                                      </Avatar>
                                      <span className={styles.subatividadeRespNome}>{filha.responsavelNome}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Avatar className={`bs-6 is-6 text-xs ${styles.avatarNaoAtribuido}`}>
                                        <i className='tabler-user text-sm' />
                                      </Avatar>
                                      <span className={styles.subatividadeRespVazio}>Não atribuído</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span
                                  className={[
                                    styles.subatividadeStatusPill,
                                    filha.status === 'A_FAZER' ? styles.subatividadeStatusAFazer : '',
                                    filha.status === 'EM_ANDAMENTO' ? styles.subatividadeStatusEmAndamento : '',
                                    filha.status === 'AGUARDANDO' ? styles.subatividadeStatusAguardando : '',
                                    filha.status === 'CONCLUIDA' ? styles.subatividadeStatusConcluida : ''
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                >
                                  {STATUS_ATIVIDADE_ROTULO[filha.status]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {mostrandoFilha && podeCriar ? (
                    <div className='flex items-center gap-2'>
                      <CustomTextField
                        fullWidth
                        size='small'
                        placeholder='Título da subatividade'
                        value={filhaTitulo}
                        onChange={e => setFilhaTitulo(e.target.value)}
                        autoFocus
                      />
                      <Button size='small' variant='contained' onClick={handleCriarFilha} disabled={criandoFilha}>
                        Criar
                      </Button>
                      <Button
                        size='small'
                        color='secondary'
                        onClick={() => {
                          setMostrandoFilha(false)
                          setFilhaTitulo('')
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : podeCriar ? (
                    <button
                      type='button'
                      className={styles.subatividadeAdicionar}
                      onClick={() => setMostrandoFilha(true)}
                      disabled={salvando}
                    >
                      Adicionar subtarefa
                    </button>
                  ) : filhas.length === 0 ? (
                    <Typography variant='body2' color='text.disabled'>
                      Nenhuma
                    </Typography>
                  ) : null}
                </section>
              ) : null}

              <AtividadeDiscussaoSecao
                key={`discussao-${atividade.id}`}
                atividadeId={atividade.id}
                podeComentar={podeEditar}
                disabled={salvando}
              />
            </div>

            <div
              className={styles.detalheDivider}
              onPointerDown={iniciarArrasteDivider}
              role='separator'
              aria-orientation='vertical'
              aria-label='Redimensionar painel'
              title='Arraste para redimensionar'
            />

            <aside className={styles.detalheSidebar}>
              <Button
                variant={status === 'A_FAZER' || status === 'EM_ANDAMENTO' ? 'contained' : 'tonal'}
                color={status === 'A_FAZER' ? 'secondary' : STATUS_ATIVIDADE_COR[status]}
                endIcon={<i className='tabler-chevron-down text-base' />}
                className={[
                  styles.detalheStatusBtn,
                  status === 'A_FAZER' ? styles.detalheStatusAFazer : '',
                  status === 'EM_ANDAMENTO' ? styles.detalheStatusEmAndamento : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={!podeEditar || salvando}
                onClick={e => setStatusAnchor(e.currentTarget)}
              >
                {STATUS_ATIVIDADE_ROTULO[status]}
              </Button>
              <Menu anchorEl={statusAnchor} open={Boolean(statusAnchor)} onClose={() => setStatusAnchor(null)}>
                {(Object.keys(STATUS_ATIVIDADE_ROTULO) as CatecAtividadeStatus[]).map(key => (
                  <MenuItem
                    key={key}
                    selected={key === status}
                    onClick={() => {
                      setStatus(key)
                      setStatusAnchor(null)
                    }}
                  >
                    {STATUS_ATIVIDADE_ROTULO[key]}
                  </MenuItem>
                ))}
              </Menu>

              <div className={styles.detalheInfoGrupo}>
              <div className={infoAberta ? styles.detalheInfo : `${styles.detalheInfo} ${styles.detalheInfoFechada}`}>
                <button
                  type='button'
                  className={styles.detalheInfoHeadingBtn}
                  onClick={() => setInfoAberta(v => !v)}
                  aria-expanded={infoAberta}
                >
                  <i className={infoAberta ? 'tabler-chevron-down' : 'tabler-chevron-right'} />
                  <span className={styles.detalheInfoHeadingTitle}>Informações</span>
                </button>

                {infoAberta ? (
                  <>
                <div className={styles.detalheInfoRow}>
                  <span className={styles.detalheInfoLabel}>Prioridade</span>
                  <button
                    type='button'
                    className={styles.detalheInfoValueBtn}
                    disabled={!podeEditar || salvando}
                    onClick={e => setPrioAnchor(e.currentTarget)}
                  >
                    <i className={`${prioridadeIcone(prioridade)} text-lg ${prioridadeCorClass(prioridade)}`} />
                    <span>{PRIORIDADE_ATIVIDADE_ROTULO[prioridade]}</span>
                    <i className={`tabler-chevron-down text-sm ${styles.detalheInfoChevron}`} />
                  </button>
                  <Menu anchorEl={prioAnchor} open={Boolean(prioAnchor)} onClose={() => setPrioAnchor(null)}>
                    {(Object.keys(PRIORIDADE_ATIVIDADE_ROTULO) as CatecAtividadePrioridade[]).map(key => (
                      <MenuItem
                        key={key}
                        selected={key === prioridade}
                        onClick={() => {
                          setPrioridade(key)
                          setPrioAnchor(null)
                        }}
                      >
                        <span className='inline-flex items-center gap-2'>
                          <i className={`${prioridadeIcone(key)} text-lg ${prioridadeCorClass(key)}`} />
                          {PRIORIDADE_ATIVIDADE_ROTULO[key]}
                        </span>
                      </MenuItem>
                    ))}
                  </Menu>
                </div>

                <div className={styles.detalheInfoRow}>
                  <span className={styles.detalheInfoLabel}>Responsável</span>
                  {podeEditar && editandoResponsavel ? (
                    <CustomAutocomplete
                      size='small'
                      fullWidth
                      open
                      autoFocus
                      options={opcoesResponsavel}
                      value={responsavelSelecionado}
                      onChange={(_, value) => {
                        setResponsavelId(value?.id == null ? '' : value.id)
                        setEditandoResponsavel(false)
                      }}
                      onClose={() => setEditandoResponsavel(false)}
                      getOptionLabel={option => option.nome}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      disabled={salvando}
                      disableClearable
                      noOptionsText='Nenhum usuário encontrado'
                      className={styles.detalheAutocomplete}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props as typeof props & { key: string }

                        return (
                          <li
                            key={key}
                            {...optionProps}
                            className={`${optionProps.className ?? ''} ${styles.detalheAutocompleteOption}`}
                          >
                            {option.id == null ? (
                              <Avatar className={`bs-6 is-6 text-xs ${styles.avatarNaoAtribuido}`}>
                                <i className='tabler-user text-sm' />
                              </Avatar>
                            ) : (
                              <Avatar className={`bs-6 is-6 text-xs ${styles.avatarUsuario}`}>
                                {iniciais(option.nome)}
                              </Avatar>
                            )}
                            <span className='truncate'>{option.nome}</span>
                          </li>
                        )
                      }}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          placeholder='Buscar responsável…'
                          size='small'
                          autoFocus
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                {responsavelSelecionado.id == null ? (
                                  <Avatar className={`bs-6 is-6 text-xs mie-2 ${styles.avatarNaoAtribuido}`}>
                                    <i className='tabler-user text-sm' />
                                  </Avatar>
                                ) : (
                                  <Avatar className={`bs-6 is-6 text-xs mie-2 ${styles.avatarUsuario}`}>
                                    {iniciais(responsavelSelecionado.nome)}
                                  </Avatar>
                                )}
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                  ) : (
                    <button
                      type='button'
                      className={styles.detalheInfoValueBtn}
                      disabled={!podeEditar || salvando}
                      onClick={() => {
                        if (podeEditar) setEditandoResponsavel(true)
                      }}
                    >
                      {responsavelSelecionado.id == null ? (
                        <span className='text-textDisabled'>Não atribuído</span>
                      ) : (
                        <>
                          <Avatar className={`bs-6 is-6 text-xs ${styles.avatarUsuario}`}>
                            {iniciais(responsavelSelecionado.nome)}
                          </Avatar>
                          <span className='truncate'>{responsavelSelecionado.nome}</span>
                        </>
                      )}
                      {podeEditar ? (
                        <i className={`tabler-chevron-down text-sm ${styles.detalheInfoChevron}`} />
                      ) : null}
                    </button>
                  )}
                </div>

                <div className={styles.detalheInfoRow}>
                  <span className={styles.detalheInfoLabel}>Prazo</span>
                  {podeEditar && (prazo || editandoPrazo) ? (
                    <input
                      type='date'
                      className={styles.detalheDateInput}
                      value={prazo}
                      onChange={e => setPrazo(e.target.value)}
                      onBlur={() => {
                        if (!prazo) setEditandoPrazo(false)
                      }}
                      disabled={salvando}
                      autoFocus={editandoPrazo && !prazo}
                    />
                  ) : podeEditar ? (
                    <button
                      type='button'
                      className={styles.detalheInfoValueBtn}
                      disabled={salvando}
                      onClick={() => setEditandoPrazo(true)}
                    >
                      <span className='text-textDisabled'>Nenhum</span>
                    </button>
                  ) : (
                    <span className={styles.detalheInfoValueStatic}>
                      {prazo ? (
                        formatarDataExibicao(`${prazo}T12:00:00`)
                      ) : (
                        <span className='text-textDisabled'>Nenhum</span>
                      )}
                    </span>
                  )}
                </div>

                <div className={styles.detalheInfoRow}>
                  <span className={styles.detalheInfoLabel}>Criação</span>
                  <span className={styles.detalheInfoValueStatic}>
                    {formatarDataHoraExibicao(atividade.criadoEm)}
                  </span>
                </div>

                <div className={styles.detalheInfoRow}>
                  <span className={styles.detalheInfoLabel}>Alteração</span>
                  <span className={styles.detalheInfoValueStatic}>
                    {formatarDataHoraExibicao(atividade.atualizadoEm)}
                  </span>
                </div>
                  </>
                ) : null}
              </div>

              <div
                className={
                  projetoAberto ? styles.detalheInfo : `${styles.detalheInfo} ${styles.detalheInfoFechada}`
                }
              >
                <button
                  type='button'
                  className={styles.detalheInfoHeadingBtn}
                  onClick={() => setProjetoAberto(v => !v)}
                  aria-expanded={projetoAberto}
                >
                  <i className={projetoAberto ? 'tabler-chevron-down' : 'tabler-chevron-right'} />
                  <span className={styles.detalheInfoHeadingTitle}>Projeto</span>
                </button>

                {projetoAberto ? (
                  carregandoProjeto ? (
                    <Typography variant='body2' color='text.secondary'>
                      Carregando projeto…
                    </Typography>
                  ) : projeto ? (
                    <>
                      <div className={styles.detalheInfoRow}>
                        <span className={styles.detalheInfoLabel}>Título</span>
                        <NextLink
                          href={`/catec/projetos/${projeto.id}`}
                          className={`${styles.detalheInfoValueStatic} text-primary hover:underline`}
                        >
                          <span className='truncate'>{projeto.titulo || '—'}</span>
                        </NextLink>
                      </div>

                      <div className={styles.detalheInfoRow}>
                        <span className={styles.detalheInfoLabel}>Cliente</span>
                        <span className={styles.detalheInfoValueStatic}>
                          <span className='truncate'>{projeto.clienteNome || 'Nenhum'}</span>
                        </span>
                      </div>

                      <div className={styles.detalheInfoRow}>
                        <span className={styles.detalheInfoLabel}>Status</span>
                        <span className={styles.detalheInfoValueStatic}>
                          {STATUS_PROJETO_ROTULO[projeto.status]}
                        </span>
                      </div>

                      <div className={styles.detalheInfoRow}>
                        <span className={styles.detalheInfoLabel}>Conclusão</span>
                        <span className={styles.detalheInfoValueStatic}>
                          {formatarDataExibicao(projeto.previsaoConclusaoEm)}
                        </span>
                      </div>

                      <div className={styles.detalheInfoRow}>
                        <span className={styles.detalheInfoLabel}>Criado por</span>
                        <span className={styles.detalheInfoValueStatic}>
                          {projeto.criadoPorNome ? (
                            <>
                              <Avatar className={`bs-6 is-6 text-xs ${styles.avatarUsuario}`}>
                                {iniciais(projeto.criadoPorNome)}
                              </Avatar>
                              <span className='truncate'>{projeto.criadoPorNome}</span>
                            </>
                          ) : (
                            '—'
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      {atividade.projetoTitulo || `Projeto #${atividade.projetoId}`}
                    </Typography>
                  )
                ) : null}
              </div>
              </div>

              {podeExcluir ? (
                <CanPermission code={PermissaoCodigo.ACAO_ATIVIDADE_EXCLUIR}>
                  <button
                    type='button'
                    className={styles.detalheExcluir}
                    onClick={handleDelete}
                    disabled={salvando}
                  >
                    Excluir atividade
                  </button>
                </CanPermission>
              ) : null}
            </aside>
          </div>
        </div>
      ) : null}
    </Dialog>
  )
}

export default AtividadeDrawer
