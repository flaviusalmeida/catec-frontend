'use client'

import Grid from '@mui/material/Grid'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { CardProps } from '@mui/material/Card'
import classnames from 'classnames'

import type { ThemeColor } from '@core/types'
import CustomAvatar from '@core/components/mui/Avatar'

import type { CatecProjetoPainel } from '@/types/catec/projetoTypes'

type Props = {
  painel: CatecProjetoPainel
  compact?: boolean
}

type CardDef = {
  key: keyof CatecProjetoPainel['totais']['alertasPrazo']
  title: string
  subtitle: string
  avatarIcon: string
  color: ThemeColor
}

const Card = styled(MuiCard)<CardProps & { bordercolor: ThemeColor }>(({ bordercolor }) => ({
  transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
  borderBottomWidth: '2px',
  borderBottomColor: `var(--mui-palette-${bordercolor}-darkerOpacity)`,
  '[data-skin="bordered"] &:hover': {
    boxShadow: 'none'
  },
  '&:hover': {
    borderBottomWidth: '3px',
    borderBottomColor: `var(--mui-palette-${bordercolor}-main) !important`,
    boxShadow: 'var(--mui-customShadows-lg)',
    marginBlockEnd: '-1px'
  }
}))

const CARD_DEFS: CardDef[] = [
  {
    key: 'atrasados',
    title: 'Atrasados',
    subtitle: 'Previsão de conclusão vencida',
    avatarIcon: 'tabler-alert-triangle',
    color: 'error'
  },
  {
    key: 'criticos7Dias',
    title: 'Críticos (≤7 dias)',
    subtitle: 'Entrega prevista em até 7 dias',
    avatarIcon: 'tabler-clock-exclamation',
    color: 'warning'
  },
  {
    key: 'atencao15Dias',
    title: 'Atenção (8–15 dias)',
    subtitle: 'Entrega prevista em até 15 dias',
    avatarIcon: 'tabler-clock',
    color: 'warning'
  },
  {
    key: 'semPrevisao',
    title: 'Sem previsão',
    subtitle: 'Aguardando execução sem data de conclusão',
    avatarIcon: 'tabler-calendar-question',
    color: 'info'
  }
]

const PainelAlertaCards = ({ painel, compact = false }: Props) => {
  const { alertasPrazo } = painel.totais

  return (
    <Grid container spacing={compact ? 3 : 6}>
      {CARD_DEFS.map(def => (
        <Grid key={def.key} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card bordercolor={def.color}>
            <CardContent className={compact ? 'flex flex-col gap-1 !py-3 last:pb-3' : 'flex flex-col gap-1'}>
              <div className='flex items-center gap-4'>
                <CustomAvatar color={def.color} skin='light' variant='rounded' size={40}>
                  <i className={classnames(def.avatarIcon, 'text-[28px]')} />
                </CustomAvatar>
                <Typography variant='h4'>{alertasPrazo[def.key]}</Typography>
              </div>
              <div className='flex flex-col gap-1'>
                <Typography color='text.primary'>{def.title}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {def.subtitle}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default PainelAlertaCards
