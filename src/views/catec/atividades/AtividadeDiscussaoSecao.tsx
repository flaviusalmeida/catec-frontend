'use client'

import { useCallback, useEffect, useState } from 'react'

import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import {
  criarComentarioAtividadeCatec,
  excluirComentarioAtividadeCatec,
  listarComentariosAtividadeCatec,
  listarHistoricoAtividadeCatec
} from '@/libs/catecAtividadesApi'
import type { CatecAtividadeComentario, CatecAtividadeHistoricoItem } from '@/types/catec/atividadeTypes'
import { tituloHistoricoAtividade } from '@/types/catec/atividadeTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'

import CustomTextField from '@core/components/mui/TextField'

import styles from './styles.module.css'

type Aba = 'comentarios' | 'historico'

type Props = {
  atividadeId: number
  podeComentar: boolean
  disabled?: boolean
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) return '?'

  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function formatarQuando(iso: string): string {
  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return ''

  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const AtividadeDiscussaoSecao = ({ atividadeId, podeComentar, disabled = false }: Props) => {
  const { session, hasPermission } = useCatecPermission()
  const usuarioId = Number(session?.user?.id ?? 0)
  const usuarioNome = session?.user?.name?.trim() || 'Você'
  const podeEditar = hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_EDITAR)

  const [aba, setAba] = useState<Aba>('comentarios')
  const [comentarios, setComentarios] = useState<CatecAtividadeComentario[]>([])
  const [historico, setHistorico] = useState<CatecAtividadeHistoricoItem[]>([])
  const [carregandoComentarios, setCarregandoComentarios] = useState(true)
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)
  const [historicoCarregado, setHistoricoCarregado] = useState(false)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [removendoId, setRemovendoId] = useState<number | null>(null)

  const carregarComentarios = useCallback(async () => {
    setCarregandoComentarios(true)

    try {
      setComentarios(await listarComentariosAtividadeCatec(atividadeId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível carregar os comentários.')
      setComentarios([])
    } finally {
      setCarregandoComentarios(false)
    }
  }, [atividadeId])

  const carregarHistorico = useCallback(async () => {
    setCarregandoHistorico(true)

    try {
      setHistorico(await listarHistoricoAtividadeCatec(atividadeId))
      setHistoricoCarregado(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível carregar o histórico.')
      setHistorico([])
    } finally {
      setCarregandoHistorico(false)
    }
  }, [atividadeId])

  useEffect(() => {
    setAba('comentarios')
    setTexto('')
    setHistoricoCarregado(false)
    setHistorico([])
    void carregarComentarios()
  }, [carregarComentarios])

  useEffect(() => {
    if (aba === 'historico' && !historicoCarregado) {
      void carregarHistorico()
    }
  }, [aba, historicoCarregado, carregarHistorico])

  const handleEnviar = async () => {
    const valor = texto.trim()

    if (!valor || !podeComentar) return

    setEnviando(true)

    try {
      const criado = await criarComentarioAtividadeCatec(atividadeId, valor)

      setComentarios(prev => [criado, ...prev])
      setTexto('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível adicionar o comentário.')
    } finally {
      setEnviando(false)
    }
  }

  const handleRemover = async (comentario: CatecAtividadeComentario) => {
    const podeRemover = podeEditar || comentario.criadoPorId === usuarioId

    if (!podeRemover) return

    setRemovendoId(comentario.id)

    try {
      await excluirComentarioAtividadeCatec(atividadeId, comentario.id)
      setComentarios(prev => prev.filter(c => c.id !== comentario.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível excluir o comentário.')
    } finally {
      setRemovendoId(null)
    }
  }

  return (
    <section className={styles.trabalhoSecao}>
      <div className={styles.discussaoAbas} role='tablist' aria-label='Discussão da atividade'>
        <button
          type='button'
          role='tab'
          aria-selected={aba === 'comentarios'}
          className={aba === 'comentarios' ? styles.discussaoAbaAtiva : styles.discussaoAba}
          onClick={() => setAba('comentarios')}
        >
          Comentários
        </button>
        <button
          type='button'
          role='tab'
          aria-selected={aba === 'historico'}
          className={aba === 'historico' ? styles.discussaoAbaAtiva : styles.discussaoAba}
          onClick={() => setAba('historico')}
        >
          Histórico
        </button>
      </div>

      {aba === 'comentarios' ? (
        <div className={styles.discussaoPainel} role='tabpanel'>
          {podeComentar ? (
            <div className={styles.comentarioComposer}>
              <Avatar className={`${styles.comentarioAvatar} ${styles.avatarUsuario}`}>
                {iniciais(usuarioNome)}
              </Avatar>
              <div className={styles.comentarioComposerCorpo}>
                <CustomTextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={6}
                  placeholder='Adicionar comentário...'
                  value={texto}
                  disabled={disabled || enviando}
                  onChange={e => setTexto(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      void handleEnviar()
                    }
                  }}
                />
                <div className={styles.comentarioComposerAcoes}>
                  <button
                    type='button'
                    className={styles.comentarioEnviar}
                    disabled={disabled || enviando || !texto.trim()}
                    onClick={() => void handleEnviar()}
                  >
                    {enviando ? 'Enviando…' : 'Comentar'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {carregandoComentarios ? (
            <div className={styles.trabalhoLoading}>
              <CircularProgress size={22} />
            </div>
          ) : comentarios.length === 0 ? (
            <Typography variant='body2' className={styles.trabalhoVazio}>
              Nenhum comentário ainda.
            </Typography>
          ) : (
            <ul className={styles.comentarioLista}>
              {comentarios.map(comentario => {
                const podeRemover = podeEditar || comentario.criadoPorId === usuarioId

                return (
                  <li key={comentario.id} className={styles.comentarioItem}>
                    <Avatar className={`${styles.comentarioAvatar} ${styles.avatarUsuario}`}>
                      {iniciais(comentario.criadoPorNome)}
                    </Avatar>
                    <div className={styles.comentarioConteudo}>
                      <div className={styles.comentarioMeta}>
                        <span className={styles.comentarioAutor}>{comentario.criadoPorNome}</span>
                        <span className={styles.comentarioQuando}>{formatarQuando(comentario.criadoEm)}</span>
                      </div>
                      <p className={styles.comentarioTexto}>{comentario.texto}</p>
                      {podeRemover ? (
                        <button
                          type='button'
                          className={styles.comentarioRemover}
                          disabled={disabled || removendoId === comentario.id}
                          onClick={() => void handleRemover(comentario)}
                        >
                          Excluir
                        </button>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className={styles.discussaoPainel} role='tabpanel'>
          {carregandoHistorico ? (
            <div className={styles.trabalhoLoading}>
              <CircularProgress size={22} />
            </div>
          ) : historico.length === 0 ? (
            <Typography variant='body2' className={styles.trabalhoVazio}>
              Nenhum evento no histórico
            </Typography>
          ) : (
            <ul className={styles.historicoLista}>
              {historico.map(item => (
                <li key={item.id} className={styles.historicoItem}>
                  <div className={styles.historicoCabecalho}>
                    <span className={styles.historicoTitulo}>{tituloHistoricoAtividade(item)}</span>
                    <span className={styles.historicoQuando}>{formatarQuando(item.criadoEm)}</span>
                  </div>
                  <span className={styles.historicoAutor}>{item.usuarioNome}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default AtividadeDiscussaoSecao
