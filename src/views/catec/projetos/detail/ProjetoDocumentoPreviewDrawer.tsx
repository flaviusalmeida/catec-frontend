'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { downloadDocumentoCatec, fetchDocumentoConteudoCatec } from '@/utils/catec/downloadDocumento'

type Props = {
  open: boolean
  onClose: () => void
  documentoId: number | null
  nomeArquivo?: string | null
  titulo: string
  subtitulo?: string
  meta?: string
}

const ProjetoDocumentoPreviewDrawer = ({
  open,
  onClose,
  documentoId,
  nomeArquivo,
  titulo,
  subtitulo,
  meta
}: Props) => {
  const [carregando, setCarregando] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [nomeCarregado, setNomeCarregado] = useState<string | null>(null)

  useEffect(() => {
    if (!open || documentoId == null) {
      setErro(null)
      setCarregando(false)

      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    void (async () => {
      setCarregando(true)
      setErro(null)
      setPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)

        return null
      })
      setMimeType(null)
      setNomeCarregado(nomeArquivo ?? null)

      try {
        const { blob, mimeType: mime } = await fetchDocumentoConteudoCatec(documentoId)

        if (cancelled) return

        setMimeType(mime)

        if (mime === 'application/pdf') {
          objectUrl = URL.createObjectURL(blob)
          setPreviewUrl(objectUrl)
        }
      } catch (err) {
        if (!cancelled) {
          setErro(err instanceof Error ? err.message : 'Não foi possível carregar o documento.')
        }
      } finally {
        if (!cancelled) setCarregando(false)
      }
    })()

    return () => {
      cancelled = true

      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, documentoId, nomeArquivo])

  async function baixar() {
    if (documentoId == null) return

    try {
      await downloadDocumentoCatec(documentoId, nomeCarregado ?? nomeArquivo ?? 'documento')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download falhou.')
    }
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ className: 'is-full sm:is-[480px] md:is-[640px] lg:is-[720px]' }}
    >
      <div className='flex flex-col bs-full'>
        <div className='flex items-start justify-between gap-4 p-6 border-be'>
          <div className='min-is-0'>
            <Typography variant='h5' className='mbe-1'>
              {titulo}
            </Typography>
            {subtitulo ? (
              <Typography variant='body2' color='text.secondary'>
                {subtitulo}
              </Typography>
            ) : null}
          </div>
          <IconButton onClick={onClose} aria-label='Fechar'>
            <i className='tabler-x' />
          </IconButton>
        </div>

        <div className='flex-1 overflow-auto p-6 flex flex-col gap-4'>
          {carregando ? (
            <div className='flex justify-center p-12'>
              <CircularProgress />
            </div>
          ) : erro ? (
            <Typography color='error'>{erro}</Typography>
          ) : documentoId != null ? (
            <>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='min-is-0'>
                  <Typography className='font-medium truncate'>{nomeCarregado ?? nomeArquivo ?? 'Documento'}</Typography>
                  {meta ? (
                    <Typography variant='caption' color='text.secondary'>
                      {meta}
                    </Typography>
                  ) : null}
                </div>
                <Button
                  size='small'
                  variant='text'
                  startIcon={<i className='tabler-download' />}
                  onClick={() => void baixar()}
                >
                  Baixar
                </Button>
              </div>

              {previewUrl && mimeType === 'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  title={nomeCarregado ?? nomeArquivo ?? 'Documento'}
                  className='bs-full min-bs-[480px] w-full rounded border'
                />
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  Pré-visualização disponível apenas para PDF. Use Baixar para abrir o arquivo.
                </Typography>
              )}
            </>
          ) : null}
        </div>
      </div>
    </Drawer>
  )
}

export default ProjetoDocumentoPreviewDrawer
