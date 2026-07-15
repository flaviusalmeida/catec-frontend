'use client'

import Link from 'next/link'

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

const PainelKpiCards = ({ painel, compact = false }: Props) => {
  return (
    <Grid container spacing={compact ? 3 : 6} alignItems='stretch'>
      {ORDEM_STATUS_PROJETO.map(status => {
        const total = painel.totais.porStatus[status] ?? 0
        const cores = corPainelProjetoStatus(status)
        const rotulo = STATUS_PROJETO_ROTULO_BADGE[status]

        return (
          <Grid key={status} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} className='flex'>
            <Link
              href={`/catec/projetos?status=${status}`}
              className='flex is-full text-inherit no-underline'
              aria-label={`Ver projetos: ${rotulo}`}
            >
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent
                  className={
                    compact
                      ? 'flex grow justify-between gap-2 !py-3 last:pb-3'
                      : 'flex grow justify-between gap-2'
                  }
                >
                  <div className='flex min-is-0 grow flex-col gap-1'>
                    <Typography color='text.primary' className='leading-snug'>
                      {rotulo}
                    </Typography>
                    <Typography variant='h4' className='mts-auto'>
                      {total}
                    </Typography>
                  </div>
                  <CustomAvatar
                    variant='rounded'
                    size={42}
                    className='shrink-0'
                    sx={{ bgcolor: cores.light, color: cores.main }}
                  >
                    <i className={classnames(ICON_POR_STATUS[status], 'text-[26px]')} />
                  </CustomAvatar>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default PainelKpiCards
