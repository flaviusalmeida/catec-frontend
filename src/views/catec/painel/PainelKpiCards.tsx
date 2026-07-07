'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import classnames from 'classnames'

import CustomAvatar from '@core/components/mui/Avatar'

import type { CatecProjetoPainel, CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { ORDEM_STATUS_PROJETO, STATUS_PROJETO_ROTULO_BADGE } from '@/types/catec/projetoTypes'
import { corPainelProjetoStatus } from '@/utils/catec/projetoStatusCores'

type Props = {
  painel: CatecProjetoPainel
  statusSelecionado: CatecProjetoStatus | null
  onStatusClick: (status: CatecProjetoStatus | null) => void
  compact?: boolean
}

const ICON_POR_STATUS: Record<CatecProjetoStatus, string> = {
  PENDENTE_CLIENTE: 'tabler-user-plus',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'tabler-clock-pause',
  ELABORANDO_PROPOSTA: 'tabler-file-pencil',
  AGUARDANDO_REVISAO_PROPOSTA: 'tabler-file-check',
  AGUARDANDO_AJUSTE: 'tabler-file-pencil',
  AGUARDANDO_ENVIO_CLIENTE: 'tabler-send',
  AGUARDANDO_ACEITE_PROPOSTA: 'tabler-user-check',
  AGUARDANDO_CONTRATO: 'tabler-file-description',
  AGUARDANDO_EXECUCAO: 'tabler-hourglass',
  EM_EXECUCAO: 'tabler-player-play',
  CANCELADO: 'tabler-circle-x',
  FINALIZADO: 'tabler-circle-check'
}

const PainelKpiCards = ({ painel, statusSelecionado, onStatusClick, compact = false }: Props) => {
  return (
    <Grid container spacing={compact ? 3 : 6}>
      {ORDEM_STATUS_PROJETO.map(status => {
        const total = painel.totais.porStatus[status] ?? 0
        const selecionado = statusSelecionado === status
        const cores = corPainelProjetoStatus(status)

        return (
          <Grid key={status} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <div
              className={selecionado ? 'ring-2 ring-primary rounded-md' : undefined}
              onClick={() => onStatusClick(selecionado ? null : status)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onStatusClick(selecionado ? null : status)
                }
              }}
              role='button'
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <Card>
                <CardContent className={compact ? 'flex justify-between gap-1 !py-3 last:pb-3' : 'flex justify-between gap-1'}>
                  <div className='flex grow flex-col gap-1'>
                    <Typography color='text.primary'>{STATUS_PROJETO_ROTULO_BADGE[status]}</Typography>
                    <Typography variant='h4'>{total}</Typography>
                  </div>
                  <CustomAvatar
                    variant='rounded'
                    size={42}
                    sx={{ bgcolor: cores.light, color: cores.main }}
                  >
                    <i className={classnames(ICON_POR_STATUS[status], 'text-[26px]')} />
                  </CustomAvatar>
                </CardContent>
              </Card>
            </div>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default PainelKpiCards
