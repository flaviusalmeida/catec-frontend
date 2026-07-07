'use client'

import type { ReactNode } from 'react'

import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import Typography from '@mui/material/Typography'
import type { TimelineProps } from '@mui/lab/Timeline'

export type ProjetoTimelineEntry = {
  key: string
  titulo: string
  icone: string
  meta?: ReactNode
  statusTransicao?: ReactNode
  texto?: string | null
}

const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  },
  '& .MuiTimelineDot-root:has(> i)': {
    width: 28,
    height: 28,
    minWidth: 28,
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBlock: '0.625rem'
  },
  '& .MuiTimelineConnector-root.timeline-connector-recente': {
    width: 2,
    backgroundColor: 'var(--mui-palette-primary-main)'
  }
})

type Props = {
  items: ProjetoTimelineEntry[]
}

const ProjetoTimeline = ({ items }: Props) => {
  return (
    <Timeline>
      {items.map((item, index) => {
        const isRecent = index === 0

        return (
          <TimelineItem key={item.key}>
            <TimelineSeparator>
              <TimelineDot
                variant={isRecent ? 'filled' : 'outlined'}
                color={isRecent ? 'primary' : 'grey'}
                className='mlb-0'
              >
                <i
                  className={`${item.icone} text-lg ${isRecent ? '' : 'text-textSecondary'}`}
                  aria-hidden
                />
              </TimelineDot>
              {index < items.length - 1 ? (
                <TimelineConnector className={isRecent ? 'timeline-connector-recente' : undefined} />
              ) : null}
            </TimelineSeparator>
            <TimelineContent className='pbs-1 pbe-6'>
              <Typography
                className={isRecent ? 'font-semibold' : 'font-medium'}
                color='text.primary'
              >
                {item.titulo}
              </Typography>
              {item.meta}
              {item.statusTransicao}
              {item.texto?.trim() ? (
                <Typography variant='body2' color='text.secondary' className='mts-2 whitespace-pre-wrap'>
                  {item.texto}
                </Typography>
              ) : null}
            </TimelineContent>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}

export default ProjetoTimeline
