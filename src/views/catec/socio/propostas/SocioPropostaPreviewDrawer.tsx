'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { listarDocumentosPropostaCatec } from '@/libs/catecProjetosApi'
import type { CatecDocumentoAnexo } from '@/types/catec/projetoFluxoTypes'
import type { CatecPropostaPendenteSocio } from '@/types/catec/socioPropostaTypes'
import { downloadDocumentoCatec, fetchDocumentoConteudoCatec } from '@/utils/catec/downloadDocumento'

import { formatarDataHoraHistorico } from '@/views/catec/projetos/historicoFluxoHelpers'

type Props = {
  item: CatecPropostaPendenteSocio | null
  open: boolean
  onClose: () => void
  onAprovar: (item: CatecPropostaPendenteSocio) => void
  onReprovar: (item: CatecPropostaPendenteSocio) => void
  processando: boolean
}

const SocioPropostaPreviewDrawer = ({ item, open, onClose, onAprovar, onReprovar, processando }: Props) => {
  const [documento, setDocumento] = useState<CatecDocumentoAnexo | null>(null)
  const [carregandoDoc, setCarregandoDoc] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)
  const [erroDoc, setErroDoc] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !item) {
      setDocumento(null)
      setErroDoc(null)
      setCarregandoDoc(false)

      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    void (async () => {
      setCarregandoDoc(true)
      setErroDoc(null)
      setDocumento(null)
      setPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)

        return null
      })
      setMimeType(null)

      try {
        const docs = await listarDocumentosPropostaCatec(item.projetoId, item.propostaId)
        const atual = docs[0] ?? null

        if (cancelled) return

        if (!atual) {
          setErroDoc('Nenhum documento anexado a esta proposta.')

          return
        }

        setDocumento(atual)

        const { blob, mimeType: mime } = await fetchDocumentoConteudoCatec(atual.id)

        if (cancelled) return

        setMimeType(mime)

        if (mime === 'application/pdf') {
          objectUrl = URL.createObjectURL(blob)
          setPreviewUrl(objectUrl)
        }
      } catch (err) {
        if (!cancelled) {
          setErroDoc(err instanceof Error ? err.message : 'Não foi possível carregar o documento.')
        }
      } finally {
        if (!cancelled) setCarregandoDoc(false)
      }
    })()

    return () => {
      cancelled = true

      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, item])

  function fechar() {
    if (processando) return

    onClose()
  }

  async function baixar() {
    if (!documento) return

    try {
      await downloadDocumentoCatec(documento.id, documento.nomeOriginal)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download falhou.')
    }
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={fechar}
      PaperProps={{ className: 'is-full sm:is-[480px] md:is-[640px] lg:is-[720px]' }}
    >
      <div className='flex flex-col bs-full'>
        <div className='flex items-start justify-between gap-4 p-6 border-be'>
          <div className='min-is-0'>
            <Typography variant='h5' className='mbe-1'>
              Proposta comercial
            </Typography>
            {item ? (
              <>
                <Typography variant='body2' color='text.secondary'>
                  {item.projetoTitulo} · v{item.versao}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {item.clienteNome ?? '—'} · {item.elaboradoPorNome}
                </Typography>
              </>
            ) : null}
          </div>
          <IconButton onClick={fechar} disabled={processando} aria-label='Fechar'>
            <i className='tabler-x' />
          </IconButton>
        </div>

        <div className='flex-1 overflow-auto p-6 flex flex-col gap-4'>
          {carregandoDoc ? (
            <div className='flex justify-center p-12'>
              <CircularProgress />
            </div>
          ) : erroDoc ? (
            <Typography color='error'>{erroDoc}</Typography>
          ) : documento ? (
            <>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='min-is-0'>
                  <Typography className='font-medium truncate'>{documento.nomeOriginal}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Enviado em {formatarDataHoraHistorico(documento.criadoEm)}
                  </Typography>
                </div>
                <Button
                  size='small'
                  variant='tonal'
                  startIcon={<i className='tabler-download' />}
                  onClick={() => void baixar()}
                >
                  Baixar
                </Button>
              </div>

              {previewUrl && mimeType === 'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  title={documento.nomeOriginal}
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

        {item ? (
          <div className='flex flex-wrap gap-3 p-6 border-bs'>
            <Button
              component={Link}
              href={`/catec/projetos/${item.projetoId}`}
              variant='tonal'
              color='secondary'
              disabled={processando}
            >
              Ver projeto
            </Button>
            <div className='flex-1' />
            <Button variant='tonal' color='error' disabled={processando} onClick={() => onReprovar(item)}>
              Reprovar
            </Button>
            <Button variant='contained' color='success' disabled={processando} onClick={() => onAprovar(item)}>
              Aprovar
            </Button>
          </div>
        ) : null}
      </div>
    </Drawer>
  )
}

export default SocioPropostaPreviewDrawer
