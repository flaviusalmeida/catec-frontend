'use client'

import { useState } from 'react'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import type { CatecContratoStatus, CatecPropostaStatus } from '@/types/catec/servicoFluxoTypes'
import type { CatecServico } from '@/types/catec/servicoTypes'
import { STATUS_SERVICO_ROTULO } from '@/types/catec/servicoTypes'

import CustomAvatar from '@core/components/mui/Avatar'
import { formatTelefoneBrasil } from '@/utils/catec/brFormat'
import { getInitials } from '@/utils/getInitials'

import ServicoStatusBadge from '../ServicoStatusBadge'
import { formatarDataCurta } from '../servicoFluxoHelpers'
import ServicoEditDialog from './ServicoEditDialog'
import ServicoEncerrarStatus from './ServicoEncerrarStatus'

type Props = {
  servico: CatecServico
  propostaStatus?: CatecPropostaStatus | null
  contratoStatus?: CatecContratoStatus | null
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

const ServicoDetails = ({ servico, propostaStatus, contratoStatus, onStatusAlterado }: Props) => {
  const { hasPermission, hasAnyPermission } = useCatecPermission()
  const [editOpen, setEditOpen] = useState(false)

  const encerrado = servico.status === 'FINALIZADO' || servico.status === 'CANCELADO'

  const podeEditar =
    !encerrado &&
    hasAnyPermission([
      PermissaoCodigo.ACAO_SERVICO_EDITAR,
      PermissaoCodigo.ACAO_SERVICO_ASSOCIAR_CLIENTE
    ])

  // Fora da pendência de cliente, só o administrativo pode trocar o cliente do servico.
  const podeAlterarCliente =
    servico.status === 'PENDENTE_CLIENTE'
      ? hasPermission(PermissaoCodigo.ACAO_SERVICO_ASSOCIAR_CLIENTE)
      : hasPermission(PermissaoCodigo.ACAO_CLIENTE_CRIAR)

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar variant='rounded' size={120}>
                {getInitials(servico.titulo)}
              </CustomAvatar>
              <Typography variant='h5' className='text-center'>
                {servico.titulo}
              </Typography>
            </div>
            <ServicoStatusBadge status={servico.status} />
            <ServicoEncerrarStatus
              servico={servico}
              propostaStatus={propostaStatus}
              contratoStatus={contratoStatus}
              onStatusAlterado={onStatusAlterado}
            />
          </div>

          <div>
            <Typography variant='h5'>Detalhes</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-3'>
              <DetalheCampo label='Cliente'>
                {servico.clienteId && servico.clienteNome ? (
                  <Typography
                    component={Link}
                    href={`/catec/clientes/view/${servico.clienteId}`}
                    variant='body2'
                    color='primary.main'
                  >
                    {servico.clienteNome}
                  </Typography>
                ) : (
                  <Typography variant='body2' color='text.primary'>
                    —
                  </Typography>
                )}
              </DetalheCampo>

              <DetalheCampo label='Status'>
                <Typography variant='body2' color='text.primary'>
                  {STATUS_SERVICO_ROTULO[servico.status]}
                </Typography>
              </DetalheCampo>

              <div className='flex flex-col gap-2'>
                <DetalheCampo label='Início da execução previsto'>
                  <Typography variant='body2' color='text.primary'>
                    {servico.previsaoInicioExecucaoEm
                      ? formatarDataCurta(servico.previsaoInicioExecucaoEm)
                      : '—'}
                  </Typography>
                </DetalheCampo>
                <DetalheCampo label='Conclusão prevista'>
                  <Typography variant='body2' color='text.primary'>
                    {servico.previsaoConclusaoEm ? formatarDataCurta(servico.previsaoConclusaoEm) : '—'}
                  </Typography>
                </DetalheCampo>
                {servico.conclusaoEm ? (
                  <DetalheCampo label='Data de conclusão'>
                    <Typography variant='body2' color='text.primary'>
                      {formatarDataCurta(servico.conclusaoEm)}
                    </Typography>
                  </DetalheCampo>
                ) : null}
              </div>

              <div className='flex flex-col gap-2'>
                <DetalheCampo label='E-mail'>
                  <Typography variant='body2' color='text.primary'>
                    {servico.emailContato ?? '—'}
                  </Typography>
                </DetalheCampo>
                <DetalheCampo label='Telefone'>
                  <Typography variant='body2' color='text.primary'>
                    {servico.telefoneContato ? formatTelefoneBrasil(servico.telefoneContato) : '—'}
                  </Typography>
                </DetalheCampo>
              </div>
            </div>
          </div>

          <div className='flex gap-4 justify-center flex-wrap'>
          <Button
            variant='tonal'
            color='secondary'
            component={Link}
            href={'/catec/servicos'}
            startIcon={<i className='tabler-arrow-left' />}
          >
            Voltar à lista
          </Button>
          {podeEditar ? (
            <Button
              variant='contained'
              onClick={() => setEditOpen(true)}
              startIcon={<i className='tabler-edit' />}
            >
              Editar servico
            </Button>
          ) : null}
          </div>
        </div>
      </CardContent>

      {podeEditar ? (
        <ServicoEditDialog
          servico={servico}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSalvo={onStatusAlterado}
          podeAlterarCliente={podeAlterarCliente}
        />
      ) : null}
    </Card>
  )
}

export default ServicoDetails
