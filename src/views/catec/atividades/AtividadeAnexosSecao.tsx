'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import {
  excluirDocumentoAtividadeCatec,
  listarDocumentosAtividadeCatec,
  uploadDocumentoAtividadeCatec
} from '@/libs/catecAtividadesApi'
import type { CatecAtividadeDocumento } from '@/types/catec/atividadeTypes'
import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'

import styles from './styles.module.css'

type Props = {
  atividadeId: number
  podeGerir: boolean
  disabled?: boolean
}

const AtividadeAnexosSecao = ({ atividadeId, podeGerir, disabled = false }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [anexos, setAnexos] = useState<CatecAtividadeDocumento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [removendoId, setRemovendoId] = useState<number | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)

    try {
      setAnexos(await listarDocumentosAtividadeCatec(atividadeId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível carregar os anexos.')
      setAnexos([])
    } finally {
      setCarregando(false)
    }
  }, [atividadeId])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !podeGerir) return

    setEnviando(true)

    try {
      for (const file of Array.from(files)) {
        const doc = await uploadDocumentoAtividadeCatec(atividadeId, file)

        setAnexos(prev => [doc, ...prev])
      }
      toast.success(files.length > 1 ? 'Arquivos anexados.' : 'Arquivo anexado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível anexar o arquivo.')
    } finally {
      setEnviando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDownload = async (doc: CatecAtividadeDocumento) => {
    try {
      await downloadDocumentoCatec(doc.id, doc.nomeOriginal)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível baixar o arquivo.')
    }
  }

  const handleRemover = async (doc: CatecAtividadeDocumento) => {
    if (!podeGerir) return

    setRemovendoId(doc.id)

    try {
      await excluirDocumentoAtividadeCatec(atividadeId, doc.id)
      setAnexos(prev => prev.filter(a => a.id !== doc.id))
      toast.success('Anexo removido.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível remover o anexo.')
    } finally {
      setRemovendoId(null)
    }
  }

  return (
    <section className={styles.trabalhoSecao}>
      <h2 className={styles.descricaoCampoTitulo}>
        Anexos{carregando ? '' : ` (${anexos.length})`}
      </h2>

      {carregando ? (
        <div className={styles.trabalhoLoading}>
          <CircularProgress size={22} />
        </div>
      ) : (
        <>
          {anexos.length > 0 ? (
            <ul className={styles.anexoLista}>
              {anexos.map(doc => (
                <li key={doc.id} className={styles.anexoItem}>
                  <button
                    type='button'
                    className={styles.anexoNome}
                    onClick={() => void handleDownload(doc)}
                    title='Baixar arquivo'
                  >
                    {doc.nomeOriginal}
                  </button>
                  {podeGerir ? (
                    <button
                      type='button'
                      className={styles.anexoRemover}
                      disabled={disabled || enviando || removendoId === doc.id}
                      onClick={() => void handleRemover(doc)}
                    >
                      Remover
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <Typography variant='body2' color='text.disabled' className={styles.trabalhoVazio}>
              Nenhum anexo
            </Typography>
          )}

          {podeGerir ? (
            <>
              <input
                ref={inputRef}
                type='file'
                multiple
                className={styles.anexoInputOculto}
                disabled={disabled || enviando}
                onChange={e => void handleUpload(e.target.files)}
              />
              <button
                type='button'
                className={styles.trabalhoAdicionar}
                disabled={disabled || enviando}
                onClick={() => inputRef.current?.click()}
              >
                {enviando ? 'Enviando…' : '+ Adicionar arquivo'}
              </button>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}

export default AtividadeAnexosSecao
