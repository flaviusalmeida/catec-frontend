'use client'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import type { CatecCliente } from '@/types/catec/clienteTypes'
import { rotuloTipoPessoa } from '@/types/catec/clienteTypes'

import CustomAvatar from '@core/components/mui/Avatar'
import { documentoParaExibicao, formatTelefoneBrasil } from '@/utils/catec/brFormat'
import { getInitials } from '@/utils/getInitials'

type Props = {
  cliente: CatecCliente
}

const ClienteDetails = ({ cliente }: Props) => {
  
  const responsavel = cliente.responsaveis[0]

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar variant='rounded' size={120}>
                {getInitials(cliente.razaoSocialOuNome)}
              </CustomAvatar>
              <Typography variant='h5'>{cliente.razaoSocialOuNome}</Typography>
            </div>
            <Chip label={rotuloTipoPessoa(cliente.tipoPessoa)} size='small' variant='tonal' color='primary' />
            {cliente.nomeFantasia ? (
              <Typography color='text.secondary'>{cliente.nomeFantasia}</Typography>
            ) : null}
          </div>
        </div>

        <div>
          <Typography variant='h5'>Detalhes</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                CPF/CNPJ:
              </Typography>
              <Typography>{documentoParaExibicao(cliente.tipoPessoa, cliente.documento)}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                E-mail:
              </Typography>
              <Typography>{cliente.email ?? '—'}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Telefone:
              </Typography>
              <Typography>{cliente.telefone ? formatTelefoneBrasil(cliente.telefone) : '—'}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Período de faturamento:
              </Typography>
              <Typography>{cliente.periodoFaturamento || '—'}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Cidade:
              </Typography>
              <Typography>
                {cliente.enderecoCidade ? `${cliente.enderecoCidade}${cliente.enderecoUf ? ` / ${cliente.enderecoUf}` : ''}` : '—'}
              </Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Responsável:
              </Typography>
              <Typography>{responsavel?.nome ?? '—'}</Typography>
            </div>
          </div>
        </div>

        <div className='flex gap-4 justify-center'>
          <Button
            variant='tonal'
            color='secondary'
            component={Link}
            href={'/catec/clientes'}
            startIcon={<i className='tabler-arrow-left' />}
          >
            Voltar à lista
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClienteDetails
