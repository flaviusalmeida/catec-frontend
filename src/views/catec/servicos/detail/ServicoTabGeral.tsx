'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { CatecServico } from '@/types/catec/servicoTypes'

import { formatTelefoneBrasil } from '@/utils/catec/brFormat'

import ServicoStatusBadge from '../ServicoStatusBadge'
import CollapsibleText from './CollapsibleText'

type Props = {
  servico: CatecServico
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

const ServicoTabGeral = ({ servico }: Props) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Dados gerais' />
          <CardContent>
            <Grid container spacing={4}>
              <InfoField label='Cliente'>
                {servico.clienteId && servico.clienteNome ? (
                  <Link
                    href={`/catec/clientes/view/${servico.clienteId}`}
                    className='text-primary hover:underline'
                  >
                    {servico.clienteNome}
                  </Link>
                ) : (
                  '—'
                )}
              </InfoField>
              <InfoField label='Criado por'>{servico.criadoPorNome}</InfoField>
              <InfoField label='Status'>
                <ServicoStatusBadge status={servico.status} />
              </InfoField>
              <InfoField label='E-mail'>{servico.emailContato ?? '—'}</InfoField>
              <InfoField label='Telefone'>
                {servico.telefoneContato ? formatTelefoneBrasil(servico.telefoneContato) : '—'}
              </InfoField>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Escopo da demanda' />
          <CardContent>
            <CollapsibleText text={servico.escopo} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ServicoTabGeral
