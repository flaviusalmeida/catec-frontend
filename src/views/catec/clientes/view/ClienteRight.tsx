'use client'

import { useState } from 'react'
import type { SyntheticEvent } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

import type { CatecCliente } from '@/types/catec/clienteTypes'

import CustomTabList from '@core/components/mui/TabList'

import ClienteContatoTab from './ClienteContatoTab'
import ClienteEnderecoTab from './ClienteEnderecoTab'
import ClienteFaturamentoTab from './ClienteFaturamentoTab'
import ClienteIdentificacaoTab from './ClienteIdentificacaoTab'
import ClienteObservacoesTab from './ClienteObservacoesTab'
import ClienteResponsavelTab from './ClienteResponsavelTab'

type Props = {
  cliente: CatecCliente
  onUpdate: (patch: Partial<CatecCliente>) => Promise<void>
}

const ClienteRight = ({ cliente, onUpdate }: Props) => {
  const [activeTab, setActiveTab] = useState('identificacao')

  const handleChange = (_event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab
              icon={<i className='tabler-id' />}
              value='identificacao'
              label='Identificação'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-phone' />}
              value='contato'
              label='Contato'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-file-invoice' />}
              value='faturamento'
              label='Faturamento'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-map-pin' />}
              value='endereco'
              label='Endereço'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-notes' />}
              value='observacoes'
              label='Observações'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-user-check' />}
              value='responsavel'
              label='Responsável'
              iconPosition='start'
            />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {activeTab === 'identificacao' ? (
              <ClienteIdentificacaoTab cliente={cliente} onSave={onUpdate} />
            ) : null}
            {activeTab === 'contato' ? <ClienteContatoTab cliente={cliente} onSave={onUpdate} /> : null}
            {activeTab === 'faturamento' ? (
              <ClienteFaturamentoTab cliente={cliente} onSave={onUpdate} />
            ) : null}
            {activeTab === 'endereco' ? <ClienteEnderecoTab cliente={cliente} onSave={onUpdate} /> : null}
            {activeTab === 'observacoes' ? (
              <ClienteObservacoesTab cliente={cliente} onSave={onUpdate} />
            ) : null}
            {activeTab === 'responsavel' ? (
              <ClienteResponsavelTab cliente={cliente} onSave={onUpdate} />
            ) : null}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default ClienteRight
