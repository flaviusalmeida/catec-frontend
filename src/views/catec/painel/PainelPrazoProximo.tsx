'use client'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'

import ProjetoStatusBadge from '@/views/catec/projetos/ProjetoStatusBadge'
import type { CatecProjetoPainelItem } from '@/types/catec/projetoTypes'
import { formatarDataCurta } from '@/views/catec/projetos/projetoFluxoHelpers'

import { corProgressoPrazo, formatarDiasRestantes, previsaoAtivaPainelItem } from './painelPrazoUtils'

type Props = {
  projetos: CatecProjetoPainelItem[]
  compact?: boolean
}

const PainelPrazoProximo = ({ projetos, compact = false }: Props) => {
  return (
    <Card className={compact ? 'flex h-full w-full flex-col' : 'bs-full'}>
      <CardHeader
        title='Projetos vencidos ou com prazo próximo'
        subheader='Ordenados pelo prazo ativo (início ou conclusão)'
        className={compact ? '!pb-2' : undefined}
      />
      <CardContent
        className={
          compact
            ? 'flex min-h-0 flex-1 flex-col justify-evenly gap-4 overflow-y-auto !pt-0'
            : 'flex flex-col gap-4'
        }
      >
        {projetos.length === 0 ? (
          <Typography color='text.secondary' className='text-center p-4'>
            Nenhum projeto com prazo ativo definido.
          </Typography>
        ) : (
          projetos.map(item => {
            const previsao = previsaoAtivaPainelItem(item)

            return (
            <div key={item.id} className='flex items-center gap-4'>
              <CustomAvatar
                skin='light'
                color={corProgressoPrazo(item)}
                variant='rounded'
                size={compact ? 36 : 34}
              >
                <i className='tabler-calendar-event' />
              </CustomAvatar>
              <div className='flex min-is-0 is-full flex-col gap-1'>
                <Link
                  href={`/catec/projetos/${item.id}`}
                  className='font-medium text-textPrimary hover:text-primary no-underline line-clamp-1'
                >
                  {item.titulo}
                </Link>
                <Typography variant='body2' color='text.secondary' className='line-clamp-1'>
                  {item.clienteNome ?? 'Sem cliente'}
                  {previsao ? ` · ${formatarDataCurta(previsao)}` : ''}
                </Typography>
                <div className='flex flex-wrap items-center gap-2'>
                  <ProjetoStatusBadge status={item.status} />
                  <Typography variant='caption' color='text.secondary'>
                    {formatarDiasRestantes(item.diasRestantes)}
                  </Typography>
                </div>
              </div>
            </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

export default PainelPrazoProximo
