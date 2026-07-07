'use client'

import { useState } from 'react'
import type { SyntheticEvent } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

import type { CatecGrupo, CatecPermissaoCatalogo } from '@/types/catec/grupoTypes'

import CustomTabList from '@core/components/mui/TabList'

import GrupoGeralTab from './GrupoGeralTab'
import GrupoPermissoesTab from './GrupoPermissoesTab'

type Props = {
  grupo: CatecGrupo
  catalogo: CatecPermissaoCatalogo[]
  onUpdate: (patch: Partial<CatecGrupo>) => Promise<void>
  onExcluir: () => Promise<void>
}

const GrupoRight = ({ grupo, catalogo, onUpdate, onExcluir }: Props) => {
  const [activeTab, setActiveTab] = useState('geral')

  const handleChange = (_event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='tabler-info-circle' />} value='geral' label='Geral' iconPosition='start' />
            <Tab icon={<i className='tabler-lock' />} value='permissoes' label='Permissões' iconPosition='start' />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {activeTab === 'geral' ? (
              <GrupoGeralTab grupo={grupo} onSave={onUpdate} onExcluir={onExcluir} />
            ) : null}
            {activeTab === 'permissoes' ? (
              <GrupoPermissoesTab
                grupo={grupo}
                catalogo={catalogo}
                onSave={permissoes => onUpdate({ permissoes })}
              />
            ) : null}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default GrupoRight
