'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import dynamic from 'next/dynamic'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

import type { ApexOptions } from 'apexcharts'

import type { CatecProjetoPainel, CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { ORDEM_STATUS_PROJETO, STATUS_PROJETO_ROTULO_BADGE } from '@/types/catec/projetoTypes'
import { corGraficoProjetoStatus } from '@/utils/catec/projetoStatusCores'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type Props = {
  painel: CatecProjetoPainel
  statusSelecionado: CatecProjetoStatus | null
  onStatusClick: (status: CatecProjetoStatus | null) => void
  compact?: boolean
}

const PainelStatusDonut = ({ painel, statusSelecionado, onStatusClick, compact = false }: Props) => {
  const theme = useTheme()
  const chartAreaRef = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState({ width: 320, height: 360 })

  useEffect(() => {
    if (!compact || !chartAreaRef.current) return

    const el = chartAreaRef.current

    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect()
      const legendReserve = 72
      const maxDonut = Math.min(width - 16, height - legendReserve - 16)
      const donut = Math.max(200, Math.floor(maxDonut))

      setChartSize({ width: donut, height: donut + legendReserve })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)

    observer.observe(el)

    return () => observer.disconnect()
  }, [compact])

  const chartData = useMemo(() => {
    const entries = ORDEM_STATUS_PROJETO.map(status => ({
      status,
      label: STATUS_PROJETO_ROTULO_BADGE[status],
      value: painel.totais.porStatus[status] ?? 0,
      color: corGraficoProjetoStatus(status)
    })).filter(e => e.value > 0)

    return entries
  }, [painel.totais.porStatus])

  const total = chartData.reduce((sum, e) => sum + e.value, 0)

  const options: ApexOptions = useMemo(
    () => ({
      labels: chartData.map(e => e.label),
      stroke: { width: 0 },
      colors: chartData.map(e => e.color),
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        offsetY: compact ? 4 : 10,
        markers: {
          width: 8,
          height: 8,
          offsetY: 1,
          offsetX: theme.direction === 'rtl' ? 8 : -4
        },
        itemMargin: { horizontal: compact ? 8 : 12, vertical: compact ? 2 : 4 },
        fontSize: '12px',
        fontWeight: 400
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              value: {
                fontSize: compact ? '22px' : '24px',
                color: 'var(--mui-palette-text-primary)',
                fontWeight: 500,
                offsetY: -20
              },
              name: { offsetY: 20 },
              total: {
                show: true,
                fontSize: compact ? '0.8125rem' : '0.9375rem',
                fontWeight: 400,
                label: 'Total',
                color: 'var(--mui-palette-text-secondary)',
                formatter: () => String(total)
              }
            }
          }
        }
      },
      chart: {
        events: {
          dataPointSelection: (_event, _chartContext, config) => {
            const clicked = chartData[config.dataPointIndex]?.status ?? null

            if (!clicked) return
            onStatusClick(statusSelecionado === clicked ? null : clicked)
          }
        }
      }
    }),
    [chartData, compact, onStatusClick, statusSelecionado, theme.direction, total]
  )

  if (chartData.length === 0) {
    return (
      <Card className={compact ? 'flex h-full w-full flex-col' : 'bs-full'}>
        <CardHeader title='Distribuição por status' />
        <CardContent>
          <p className='text-textSecondary m-0 p-6 text-center'>Nenhum projeto para exibir.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={compact ? 'flex h-full w-full flex-col' : 'bs-full'}>
      <CardHeader
        title='Distribuição por status'
        subheader={
          statusSelecionado
            ? `Filtrando: ${STATUS_PROJETO_ROTULO_BADGE[statusSelecionado]} (clique novamente para limpar)`
            : compact
              ? 'Clique em uma fatia para filtrar'
              : 'Clique em uma fatia para filtrar a tabela'
        }
        className={compact ? '!pb-2' : undefined}
      />
      <CardContent
        ref={chartAreaRef}
        className={compact ? 'flex min-h-0 flex-1 items-center justify-center !pt-0' : undefined}
      >
        <AppReactApexCharts
          type='donut'
          height={compact ? chartSize.height : 420}
          width={compact ? chartSize.width : '100%'}
          boxProps={compact ? { sx: { mx: 'auto' } } : undefined}
          series={chartData.map(e => e.value)}
          options={options}
        />
      </CardContent>
    </Card>
  )
}

export default PainelStatusDonut
