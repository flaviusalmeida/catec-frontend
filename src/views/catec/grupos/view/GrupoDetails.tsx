'use client'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import { catecPermissoesCatalogo } from '@/fake-db/catec/permissoes'
import type { CatecGrupo } from '@/types/catec/grupoTypes'

import CustomAvatar from '@core/components/mui/Avatar'

import GrupoStatusBadge from '../GrupoStatusBadge'
import GrupoTipoBadge from '../GrupoTipoBadge'

type Props = {
  grupo: CatecGrupo
}

const GrupoDetails = ({ grupo }: Props) => {
  
  const totalCatalogo = catecPermissoesCatalogo.length

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <CustomAvatar variant='rounded' size={120} skin='light' color={grupo.sistema ? 'info' : 'primary'}>
              <i className={grupo.sistema ? 'tabler-shield' : 'tabler-users-group'} />
            </CustomAvatar>
            <Typography variant='h5'>{grupo.nome}</Typography>
            <div className='flex flex-wrap gap-2 justify-center'>
              <GrupoTipoBadge sistema={grupo.sistema} />
              <GrupoStatusBadge ativo={grupo.ativo} />
            </div>
          </div>
          <div className='flex items-center justify-around flex-wrap gap-4'>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' color='primary' skin='light'>
                <i className='tabler-lock' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{grupo.permissoes.length}</Typography>
                <Typography>Permissões</Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' color='primary' skin='light'>
                <i className='tabler-list-check' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{totalCatalogo}</Typography>
                <Typography>Catálogo</Typography>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Typography variant='h5'>Detalhes</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Código:
              </Typography>
              <Typography className='font-mono text-sm'>{grupo.codigo}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Descrição:
              </Typography>
              <Typography>{grupo.descricao ?? '—'}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Seleção:
              </Typography>
              <Typography>
                {grupo.permissoes.length} / {totalCatalogo}
              </Typography>
            </div>
          </div>
        </div>

        <div className='flex gap-4 justify-center'>
          <Button
            variant='tonal'
            color='secondary'
            component={Link}
            href={'/catec/grupos'}
            startIcon={<i className='tabler-arrow-left' />}
          >
            Voltar à lista
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default GrupoDetails
