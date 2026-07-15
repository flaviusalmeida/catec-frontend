'use client'

import { useEffect, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

import type { CatecProjeto, CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { ORDEM_STATUS_PROJETO, STATUS_PROJETO_ROTULO } from '@/types/catec/projetoTypes'

import CustomTextField from '@core/components/mui/TextField'

import {
  FAIXAS_FILTRO_PRAZO,
  parseFaixaFiltroPrazo,
  projetoPassaFiltroPrazo,
  rotuloFaixaFiltroPrazo,
  type FaixaFiltroPrazo
} from '@/views/catec/painel/painelPrazoUtils'

type Props = {
  tableData: CatecProjeto[]
  setData: (data: CatecProjeto[]) => void
}

function parseStatusFiltro(value: string | null): CatecProjetoStatus | '' {
  if (value && (ORDEM_STATUS_PROJETO as string[]).includes(value)) {
    return value as CatecProjetoStatus
  }

  return ''
}

const ProjetoTableFilters = ({ setData, tableData }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [titulo, setTitulo] = useState('')
  const [status, setStatus] = useState<CatecProjetoStatus | ''>(() => parseStatusFiltro(searchParams.get('status')))

  const [faixaPrazo, setFaixaPrazo] = useState<FaixaFiltroPrazo>(() =>
    parseFaixaFiltroPrazo(searchParams.get('faixaPrazo'))
  )

  useEffect(() => {
    setStatus(parseStatusFiltro(searchParams.get('status')))
    setFaixaPrazo(parseFaixaFiltroPrazo(searchParams.get('faixaPrazo')))
  }, [searchParams])

  useEffect(() => {
    const q = titulo.trim().toLowerCase()

    const filtered = tableData.filter(projeto => {
      if (q && !projeto.titulo.toLowerCase().includes(q)) return false
      if (status && projeto.status !== status) return false
      if (!projetoPassaFiltroPrazo(projeto, faixaPrazo)) return false

      return true
    })

    setData(filtered)
  }, [titulo, status, faixaPrazo, tableData, setData])

  function atualizarUrl(nextStatus: CatecProjetoStatus | '', nextFaixa: FaixaFiltroPrazo) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextStatus) params.set('status', nextStatus)
    else params.delete('status')

    if (nextFaixa) params.set('faixaPrazo', nextFaixa)
    else params.delete('faixaPrazo')

    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            label='Título'
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder='Filtrar por título'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            label='Status'
            value={status}
            onChange={e => {
              const next = e.target.value as CatecProjetoStatus | ''

              setStatus(next)
              atualizarUrl(next, faixaPrazo)
            }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos</MenuItem>
            {ORDEM_STATUS_PROJETO.map(s => (
              <MenuItem key={s} value={s}>
                {STATUS_PROJETO_ROTULO[s]}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            label='Faixa de prazo'
            value={faixaPrazo}
            onChange={e => {
              const next = e.target.value as FaixaFiltroPrazo

              setFaixaPrazo(next)
              atualizarUrl(status, next)
            }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>{rotuloFaixaFiltroPrazo('')}</MenuItem>
            {FAIXAS_FILTRO_PRAZO.map(faixa => (
              <MenuItem key={faixa} value={faixa}>
                {rotuloFaixaFiltroPrazo(faixa)}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default ProjetoTableFilters
