'use client'

import { useState, type ReactNode } from 'react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ProjetoDocumentoPreviewDrawer from './ProjetoDocumentoPreviewDrawer'
import ProjetoMetaItensGrid, { type ProjetoMetaItem } from './ProjetoMetaItensGrid'

type Props = {
  nomeArquivo: string
  meta?: string
  metaComplementar?: ReactNode
  metaItens?: ProjetoMetaItem[]
  status?: ReactNode
  extra?: ReactNode
  documentoId?: number
  previewTitulo?: string
  previewSubtitulo?: string
  onDownload?: () => void
}

const ProjetoFileRow = ({
  nomeArquivo,
  meta,
  metaComplementar,
  metaItens,
  status,
  extra,
  documentoId,
  previewTitulo,
  previewSubtitulo,
  onDownload
}: Props) => {
  const [previewAberto, setPreviewAberto] = useState(false)
  const podeVisualizar = documentoId != null && previewTitulo != null
  const usaLayoutEstruturado = metaItens != null || status != null

  return (
    <>
      <div className='flex flex-wrap items-start justify-between gap-3 rounded border p-4'>
        <div className='flex items-start gap-3 min-is-0 flex-1'>
          <i className='tabler-file-type-pdf text-2xl text-error shrink-0 mts-0.5' />
          <div className='min-is-0 flex-1'>
            <Typography variant='body1' className='font-semibold truncate'>
              {nomeArquivo}
            </Typography>
            {status ? <div className='mts-2'>{status}</div> : null}
            {metaItens && metaItens.length > 0 ? (
              <div className='mts-2'>
                <ProjetoMetaItensGrid itens={metaItens} />
              </div>
            ) : null}
            {!usaLayoutEstruturado && meta ? (
              <Typography variant='caption' color='text.secondary' className='block mts-1'>
                {meta}
              </Typography>
            ) : null}
            {!usaLayoutEstruturado && metaComplementar ? <div className='mts-1'>{metaComplementar}</div> : null}
            {!usaLayoutEstruturado && extra ? <div className='mts-2'>{extra}</div> : null}
          </div>
        </div>
        {podeVisualizar || onDownload ? (
          <div className='flex items-center gap-1 shrink-0'>
            {podeVisualizar ? (
              <Button
                size='small'
                variant='text'
                startIcon={<i className='tabler-eye' />}
                onClick={() => setPreviewAberto(true)}
              >
                Visualizar
              </Button>
            ) : null}
            {onDownload ? (
              <Button size='small' variant='text' startIcon={<i className='tabler-download' />} onClick={onDownload}>
                Baixar
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {podeVisualizar ? (
        <ProjetoDocumentoPreviewDrawer
          open={previewAberto}
          onClose={() => setPreviewAberto(false)}
          documentoId={documentoId}
          nomeArquivo={nomeArquivo}
          titulo={previewTitulo}
          subtitulo={previewSubtitulo}
          meta={meta}
        />
      ) : null}
    </>
  )
}

export default ProjetoFileRow
