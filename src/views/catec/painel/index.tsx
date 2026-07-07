'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'

import PainelAlertaCards from './PainelAlertaCards'
import PainelKpiCards from './PainelKpiCards'
import PainelPrazoProximo from './PainelPrazoProximo'
import PainelProjetosTable from './PainelProjetosTable'
import PainelStatusDonut from './PainelStatusDonut'
import { useFullscreen } from './useFullscreen'
import { usePainelAutoAtualizacao, usePainelStore } from './usePainelStore'

const PainelView = () => {
  const { painel, carregando, erro, carregar } = usePainelStore()

  usePainelAutoAtualizacao(carregar)
  const [statusFiltro, setStatusFiltro] = useState<CatecProjetoStatus | null>(null)
  const { ref, ativo: telaCheia, alternar: alternarTelaCheia } = useFullscreen<HTMLDivElement>()

  const gridSpacing = telaCheia ? 3 : 6

  const conteudo =
    carregando || !painel ? (
      <div className='flex flex-1 items-center justify-center'>
        <CircularProgress />
      </div>
    ) : telaCheia ? (
      <div className='flex min-h-0 flex-1 flex-col gap-3'>
        <div className='shrink-0'>
          <PainelAlertaCards painel={painel} compact />
        </div>
        <div className='shrink-0'>
          <PainelKpiCards
            painel={painel}
            statusSelecionado={statusFiltro}
            onStatusClick={setStatusFiltro}
            compact
          />
        </div>
        <div className='grid min-h-0 flex-1 grid-cols-12 gap-3'>
          <div className='col-span-12 flex min-h-0 w-full md:col-span-5 lg:col-span-4'>
            <PainelStatusDonut
              painel={painel}
              statusSelecionado={statusFiltro}
              onStatusClick={setStatusFiltro}
              compact
            />
          </div>
          <div className='col-span-12 flex min-h-0 w-full md:col-span-7 lg:col-span-8'>
            <PainelPrazoProximo projetos={painel.projetosPrazoProximo} compact />
          </div>
        </div>
      </div>
    ) : (
      <Grid container spacing={gridSpacing}>
        <Grid size={{ xs: 12 }}>
          <PainelAlertaCards painel={painel} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PainelKpiCards
            painel={painel}
            statusSelecionado={statusFiltro}
            onStatusClick={setStatusFiltro}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <PainelStatusDonut
            painel={painel}
            statusSelecionado={statusFiltro}
            onStatusClick={setStatusFiltro}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <PainelPrazoProximo projetos={painel.projetosPrazoProximo} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PainelProjetosTable
            projetos={painel.projetos}
            statusFiltro={statusFiltro}
            onStatusFiltroChange={setStatusFiltro}
          />
        </Grid>
      </Grid>
    )

  return (
    <div
      ref={ref}
      className={
        telaCheia
          ? 'flex h-dvh w-full flex-col overflow-hidden bg-[var(--mui-palette-background-default)] p-4'
          : undefined
      }
    >
      <div className='flex shrink-0 items-center justify-between gap-4'>
        <Typography variant='h4'>Dashboard</Typography>
        <Tooltip title={telaCheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}>
          <IconButton
            aria-label={telaCheia ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
            onClick={() => void alternarTelaCheia()}
            color='primary'
          >
            <i className={telaCheia ? 'tabler-arrows-minimize' : 'tabler-arrows-maximize'} />
          </IconButton>
        </Tooltip>
      </div>

      {erro ? (
        <Alert severity='error' variant='outlined' className='mt-3 shrink-0'>
          {erro}
        </Alert>
      ) : null}

      <div className={telaCheia ? 'mt-3 flex min-h-0 flex-1 flex-col' : 'mt-6'}>{conteudo}</div>
    </div>
  )
}

export default PainelView
