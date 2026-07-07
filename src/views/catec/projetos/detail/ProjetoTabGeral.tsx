'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { CatecProjeto } from '@/types/catec/projetoTypes'

import { formatTelefoneBrasil } from '@/utils/catec/brFormat'

import ProjetoStatusBadge from '../ProjetoStatusBadge'
import CollapsibleText from './CollapsibleText'

type Props = {
  projeto: CatecProjeto
}

function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant='caption' color='text.secondary' className='block mbe-1'>
        {label}
      </Typography>
      <Typography variant='body1'>{children}</Typography>
    </Grid>
  )
}

const ProjetoTabGeral = ({ projeto }: Props) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Dados gerais' />
          <CardContent>
            <Grid container spacing={4}>
              <InfoField label='Cliente'>
                {projeto.clienteId && projeto.clienteNome ? (
                  <Link
                    href={`/catec/clientes/view/${projeto.clienteId}`}
                    className='text-primary hover:underline'
                  >
                    {projeto.clienteNome}
                  </Link>
                ) : (
                  '—'
                )}
              </InfoField>
              <InfoField label='Criado por'>{projeto.criadoPorNome}</InfoField>
              <InfoField label='Status'>
                <ProjetoStatusBadge status={projeto.status} />
              </InfoField>
              <InfoField label='E-mail'>{projeto.emailContato ?? '—'}</InfoField>
              <InfoField label='Telefone'>
                {projeto.telefoneContato ? formatTelefoneBrasil(projeto.telefoneContato) : '—'}
              </InfoField>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Escopo da demanda' />
          <CardContent>
            <CollapsibleText text={projeto.escopo} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProjetoTabGeral
