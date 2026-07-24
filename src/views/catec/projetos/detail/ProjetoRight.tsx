'use client'

import { useCallback, useMemo } from 'react'
import type { SyntheticEvent } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

import type { CatecProjeto } from '@/types/catec/projetoTypes'

import CustomTabList from '@core/components/mui/TabList'

import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoTabAtividades from './ProjetoTabAtividades'
import ProjetoTabContrato from './ProjetoTabContrato'
import ProjetoTabGeral from './ProjetoTabGeral'
import ProjetoTabHistorico from './ProjetoTabHistorico'
import ProjetoTabPropostas from './ProjetoTabPropostas'

const TAB_IDS = ['geral', 'propostas', 'contrato', 'atividades', 'historico'] as const

type TabId = (typeof TAB_IDS)[number]

const parseTab = (value: string | null): TabId => {
  if (value && TAB_IDS.includes(value as TabId)) {
    return value as TabId
  }

  return 'geral'
}

type Props = {
  projeto: CatecProjeto
  fluxo: UseProjetoFluxoStore
}

const ProjetoRight = ({ projeto, fluxo }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTab = useMemo(() => parseTab(searchParams.get('tab')), [searchParams])

  const handleChange = useCallback(
    (_event: SyntheticEvent, value: string) => {
      const nextTab = value as TabId
      const params = new URLSearchParams(searchParams.toString())

      if (nextTab === 'geral') {
        params.delete('tab')
      } else {
        params.set('tab', nextTab)
      }

      const query = params.toString()

      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='tabler-info-circle' />} value='geral' label='Geral' iconPosition='start' />
            <Tab
              icon={<i className='tabler-file-description' />}
              value='propostas'
              label='Propostas'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-file-certificate' />}
              value='contrato'
              label='Contrato'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-list-check' />}
              value='atividades'
              label='Atividades'
              iconPosition='start'
            />
            <Tab icon={<i className='tabler-history' />} value='historico' label='Histórico' iconPosition='start' />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {activeTab === 'geral' ? <ProjetoTabGeral projeto={projeto} /> : null}
            {activeTab === 'propostas' ? <ProjetoTabPropostas projeto={projeto} fluxo={fluxo} /> : null}
            {activeTab === 'contrato' ? <ProjetoTabContrato projeto={projeto} fluxo={fluxo} /> : null}
            {activeTab === 'atividades' ? <ProjetoTabAtividades projeto={projeto} /> : null}
            {activeTab === 'historico' ? <ProjetoTabHistorico fluxo={fluxo} /> : null}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default ProjetoRight
