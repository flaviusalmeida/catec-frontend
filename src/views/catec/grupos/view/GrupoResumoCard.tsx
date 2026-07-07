'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import { catecPermissoesCatalogo } from '@/fake-db/catec/permissoes'
import type { CatecGrupo } from '@/types/catec/grupoTypes'
import { rotuloModulo } from '@/types/catec/grupoTypes'

type Props = {
  grupo: CatecGrupo
}

const GrupoResumoCard = ({ grupo }: Props) => {
  const modulos = new Set(
    catecPermissoesCatalogo.filter(p => grupo.permissoes.includes(p.codigo)).map(p => p.modulo)
  )

  return (
    <Card className='border-2 border-primary rounded shadow-primarySm'>
      <CardContent className='flex flex-col gap-4'>
        <Typography variant='h6'>Módulos com acesso</Typography>
        {modulos.size > 0 ? (
          <div className='flex flex-col gap-2'>
            {[...modulos].sort().map(modulo => (
              <div key={modulo} className='flex items-center gap-2'>
                <i className='tabler-circle-filled text-[10px] text-primary' />
                <Typography component='span'>{rotuloModulo(modulo)}</Typography>
              </div>
            ))}
          </div>
        ) : (
          <Typography color='text.secondary'>Nenhuma permissão selecionada.</Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default GrupoResumoCard
