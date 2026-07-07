'use client'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'
import { rotuloGrupo } from '@/types/catec/usuarioTypes'

import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'

import UsuarioStatusBadge from '@views/catec/usuarios/UsuarioStatusBadge'

type Props = {
  usuario: CatecAdminUsuario
}

const Usuario2Details = ({ usuario }: Props) => {
  

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar variant='rounded' size={120}>
                {getInitials(usuario.nome)}
              </CustomAvatar>
              <Typography variant='h5'>{usuario.nome}</Typography>
            </div>
          </div>
        </div>

        <div>
          <Typography variant='h5'>Detalhes</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                E-mail:
              </Typography>
              <Typography>{usuario.email}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Telefone:
              </Typography>
              <Typography>{usuario.telefone ?? '—'}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Status:
              </Typography>
              <UsuarioStatusBadge ativo={usuario.ativo} requerTrocaSenha={usuario.requerTrocaSenha} />
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Grupos:
              </Typography>
              <Typography>{usuario.grupos.map(rotuloGrupo).join(', ')}</Typography>
            </div>
          </div>
        </div>

        <div className='flex gap-4 justify-center'>
          <Button
            variant='tonal'
            color='secondary'
            component={Link}
            href={'/catec/usuarios'}
            startIcon={<i className='tabler-arrow-left' />}
          >
            Voltar à lista
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Usuario2Details
