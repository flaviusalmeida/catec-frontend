'use client'

import { useState } from 'react'
import type { SyntheticEvent } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'

import CustomTabList from '@core/components/mui/TabList'

import Usuario2DadosTab from './Usuario2DadosTab'
import Usuario2GruposTab from './Usuario2GruposTab'

type Props = {
  usuario: CatecAdminUsuario
  onUpdate: (patch: Partial<CatecAdminUsuario>) => Promise<void>
  onResetSenha: () => Promise<void>
}

const Usuario2Right = ({ usuario, onUpdate, onResetSenha }: Props) => {
  const [activeTab, setActiveTab] = useState('dados')

  const handleChange = (_event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='tabler-user' />} value='dados' label='Dados' iconPosition='start' />
            <Tab icon={<i className='tabler-users-group' />} value='grupos' label='Grupos' iconPosition='start' />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {activeTab === 'dados' ? (
              <Usuario2DadosTab
                usuario={usuario}
                onSave={patch => onUpdate(patch)}
                onResetSenha={onResetSenha}
              />
            ) : null}
            {activeTab === 'grupos' ? (
              <Usuario2GruposTab usuario={usuario} onSave={grupos => onUpdate({ grupos })} />
            ) : null}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default Usuario2Right
