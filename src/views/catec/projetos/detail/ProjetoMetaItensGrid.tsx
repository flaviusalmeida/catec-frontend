'use client'

import Typography from '@mui/material/Typography'

export type ProjetoMetaItem = {
  label: string
  value: string
}

type Props = {
  itens: ProjetoMetaItem[]
}

const ProjetoMetaItensGrid = ({ itens }: Props) => {
  if (itens.length === 0) return null

  return (
    <div className='flex flex-col gap-1'>
      {itens.map(item => (
        <div key={`${item.label}-${item.value}`} className='flex items-baseline gap-3 min-is-0'>
          <Typography variant='caption' color='text.secondary' className='shrink-0 min-is-[10.5rem]'>
            {item.label}
          </Typography>
          <Typography variant='caption' color='text.primary' className='font-medium truncate'>
            {item.value}
          </Typography>
        </div>
      ))}
    </div>
  )
}

export default ProjetoMetaItensGrid
