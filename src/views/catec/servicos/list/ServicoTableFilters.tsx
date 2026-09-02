'use client'

import { useEffect, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

import type { CatecServico, CatecServicoStatus } from '@/types/catec/servicoTypes'
import { ORDEM_STATUS_SERVICO, STATUS_SERVICO_ROTULO } from '@/types/catec/servicoTypes'

import CustomTextField from '@core/components/mui/TextField'

import {
  FAIXAS_FILTRO_PRAZO,
  parseFaixaFiltroPrazo,
  servicoPassaFiltroPrazo,
  rotuloFaixaFiltroPrazo,
  type FaixaFiltroPrazo
} from '@/views/catec/painel/painelPrazoUtils'

type Props = {
  tableData: CatecServico[]
  setData: (data: CatecServico[]) => void
}

function parseStatusFiltro(value: string | null): CatecServicoStatus | '' {
  if (value && (ORDEM_STATUS_SERVICO as string[]).includes(value)) {
    return value as CatecServicoStatus
  }

  return ''
}

const ServicoTableFilters = ({ setData, tableData }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [titulo, setTitulo] = useState('')
  const [status, setStatus] = useState<CatecServicoStatus | ''>(() => parseStatusFiltro(searchParams.get('status')))

  const [faixaPrazo, setFaixaPrazo] = useState<FaixaFiltroPrazo>(() =>
    parseFaixaFiltroPrazo(searchParams.get('faixaPrazo'))
  )

  useEffect(() => {
    setStatus(parseStatusFiltro(searchParams.get('status')))
    setFaixaPrazo(parseFaixaFiltroPrazo(searchParams.get('faixaPrazo')))
  }, [searchParams])

  useEffect(() => {
    const q = titulo.trim().toLowerCase()

    const filtered = tableData.filter(servico => {
      if (q && !servico.titulo.toLowerCase().includes(q)) return false
      if (status && servico.status !== status) return false
      if (!servicoPassaFiltroPrazo(servico, faixaPrazo)) return false

      return true
    })

    setData(filtered)
  }, [titulo, status, faixaPrazo, tableData, setData])

  function atualizarUrl(nextStatus: CatecServicoStatus | '', nextFaixa: FaixaFiltroPrazo) {
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
              const next = e.target.value as CatecServicoStatus | ''

              setStatus(next)
              atualizarUrl(next, faixaPrazo)
            }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Todos</MenuItem>
            {ORDEM_STATUS_SERVICO.map(s => (
              <MenuItem key={s} value={s}>
                {STATUS_SERVICO_ROTULO[s]}
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

export default ServicoTableFilters
