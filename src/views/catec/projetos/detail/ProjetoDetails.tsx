'use client'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import type { CatecProjeto } from '@/types/catec/projetoTypes'
import { STATUS_PROJETO_ROTULO } from '@/types/catec/projetoTypes'

import CustomAvatar from '@core/components/mui/Avatar'
import { formatTelefoneBrasil } from '@/utils/catec/brFormat'
import { getInitials } from '@/utils/getInitials'

import ProjetoStatusBadge from '../ProjetoStatusBadge'
import { formatarDataCurta } from '../projetoFluxoHelpers'
import ProjetoEncerrarStatus from './ProjetoEncerrarStatus'

type Props = {
  projeto: CatecProjeto
  onStatusAlterado?: () => Promise<void>
}

function DetalheCampo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      {children}
    </div>
  )
}

const ProjetoDetails = ({ projeto, onStatusAlterado }: Props) => {
  

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar variant='rounded' size={120}>
                {getInitials(projeto.titulo)}
              </CustomAvatar>
              <Typography variant='h5' className='text-center'>
                {projeto.titulo}
              </Typography>
            </div>
            <ProjetoStatusBadge status={projeto.status} />
            <ProjetoEncerrarStatus projeto={projeto} onStatusAlterado={onStatusAlterado} />
          </div>

          <div>
            <Typography variant='h5'>Detalhes</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-3'>
              <DetalheCampo label='Cliente'>
                {projeto.clienteId && projeto.clienteNome ? (
                  <Typography
                    component={Link}
                    href={`/catec/clientes/view/${projeto.clienteId}`}
                    variant='body2'
                    color='primary.main'
                  >
                    {projeto.clienteNome}
                  </Typography>
                ) : (
                  <Typography variant='body2' color='text.primary'>
                    —
                  </Typography>
                )}
              </DetalheCampo>

              <DetalheCampo label='Status'>
                <Typography variant='body2' color='text.primary'>
                  {STATUS_PROJETO_ROTULO[projeto.status]}
                </Typography>
              </DetalheCampo>

              <div className='flex flex-col gap-2'>
                <DetalheCampo label='Início da execução previsto'>
                  <Typography variant='body2' color='text.primary'>
                    {projeto.previsaoInicioExecucaoEm
                      ? formatarDataCurta(projeto.previsaoInicioExecucaoEm)
                      : '—'}
                  </Typography>
                </DetalheCampo>
                <DetalheCampo label='Conclusão prevista'>
                  <Typography variant='body2' color='text.primary'>
                    {projeto.previsaoConclusaoEm ? formatarDataCurta(projeto.previsaoConclusaoEm) : '—'}
                  </Typography>
                </DetalheCampo>
                {projeto.conclusaoEm ? (
                  <DetalheCampo label='Data de conclusão'>
                    <Typography variant='body2' color='text.primary'>
                      {formatarDataCurta(projeto.conclusaoEm)}
                    </Typography>
                  </DetalheCampo>
                ) : null}
              </div>

              <div className='flex flex-col gap-2'>
                <DetalheCampo label='E-mail'>
                  <Typography variant='body2' color='text.primary'>
                    {projeto.emailContato ?? '—'}
                  </Typography>
                </DetalheCampo>
                <DetalheCampo label='Telefone'>
                  <Typography variant='body2' color='text.primary'>
                    {projeto.telefoneContato ? formatTelefoneBrasil(projeto.telefoneContato) : '—'}
                  </Typography>
                </DetalheCampo>
              </div>
            </div>
          </div>

          <div className='flex gap-4 justify-center'>
          <Button
            variant='tonal'
            color='secondary'
            component={Link}
            href={'/catec/projetos'}
            startIcon={<i className='tabler-arrow-left' />}
          >
            Voltar à lista
          </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjetoDetails
