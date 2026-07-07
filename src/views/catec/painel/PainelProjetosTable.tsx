'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

import tableStyles from '@core/styles/table.module.css'

import ProjetoStatusBadge from '@/views/catec/projetos/ProjetoStatusBadge'
import type { CatecProjetoPainelItem, CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { ORDEM_STATUS_PROJETO, STATUS_PROJETO_ROTULO_BADGE } from '@/types/catec/projetoTypes'
import { formatarDataCurta } from '@/views/catec/projetos/projetoFluxoHelpers'

import {
  COR_ALERTA_PRAZO,
  ROTULO_ALERTA_PRAZO,
  type FaixaFiltroPrazo,
  itemPassaFiltroPrazo,
  rotuloFaixaFiltroPrazo
} from './painelPrazoUtils'

type Props = {
  projetos: CatecProjetoPainelItem[]
  statusFiltro: CatecProjetoStatus | null
  onStatusFiltroChange: (status: CatecProjetoStatus | null) => void
}

const globalFilterFn: FilterFn<CatecProjetoPainelItem> = (row, _columnId, filterValue) => {
  const q = String(filterValue).toLowerCase()

  if (!q) return true

  return (
    row.original.titulo.toLowerCase().includes(q) ||
    (row.original.clienteNome ?? '').toLowerCase().includes(q)
  )
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 400,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<CatecProjetoPainelItem>()

const PainelProjetosTable = ({ projetos, statusFiltro, onStatusFiltroChange }: Props) => {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusSelect, setStatusSelect] = useState<string>(statusFiltro ?? '')
  const [faixaPrazo, setFaixaPrazo] = useState<FaixaFiltroPrazo>('')
  const [clienteFiltro, setClienteFiltro] = useState('')

  useEffect(() => {
    setStatusSelect(statusFiltro ?? '')
  }, [statusFiltro])

  const clientesUnicos = useMemo(() => {
    const nomes = new Set<string>()

    for (const p of projetos) {
      if (p.clienteNome) nomes.add(p.clienteNome)
    }

    return Array.from(nomes).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [projetos])

  const dadosFiltrados = useMemo(() => {
    return projetos.filter(p => {
      if (statusSelect && p.status !== statusSelect) return false
      if (clienteFiltro && p.clienteNome !== clienteFiltro) return false
      if (!itemPassaFiltroPrazo(p, faixaPrazo)) return false

      return true
    })
  }, [projetos, statusSelect, clienteFiltro, faixaPrazo])

  const columns = useMemo<ColumnDef<CatecProjetoPainelItem, any>[]>(
    () => [
      columnHelper.accessor('titulo', {
        header: 'Projeto',
        cell: ({ row }) => (
          <Link href={`/catec/projetos/${row.original.id}`} className='font-medium text-textPrimary hover:text-primary'>
            {row.original.titulo}
          </Link>
        )
      }),
      columnHelper.accessor('clienteNome', {
        header: 'Cliente',
        cell: ({ row }) => <Typography>{row.original.clienteNome ?? '—'}</Typography>
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <ProjetoStatusBadge status={row.original.status} />
      }),
      columnHelper.display({
        id: 'previsao',
        header: 'Previsão conclusão',
        cell: ({ row }) => (
          <Typography>
            {row.original.previsaoConclusaoEm ? formatarDataCurta(row.original.previsaoConclusaoEm) : '—'}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'alerta',
        header: 'Alerta prazo',
        cell: ({ row }) => {
          const alerta = row.original.alertaPrazo

          if (!alerta) {
            return <Typography color='text.disabled'>—</Typography>
          }

          return <Chip size='small' label={ROTULO_ALERTA_PRAZO[alerta]} color={COR_ALERTA_PRAZO[alerta]} variant='tonal' />
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data: dadosFiltrados,
    columns,
    state: { globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader title='Todos os projetos' subheader='Filtre por status, cliente ou faixa de prazo' />
      <div className='flex flex-col gap-4 p-6 pt-0'>
        <div className='flex flex-col lg:flex-row gap-4'>
          <CustomTextField
            select
            label='Status'
            value={statusSelect}
            onChange={e => {
              const value = e.target.value

              setStatusSelect(value)
              onStatusFiltroChange(value ? (value as CatecProjetoStatus) : null)
            }}
            className='is-full lg:is-[280px]'
          >
            <MenuItem value=''>Todos os status</MenuItem>
            {ORDEM_STATUS_PROJETO.map(status => (
              <MenuItem key={status} value={status}>
                {STATUS_PROJETO_ROTULO_BADGE[status]}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomTextField
            select
            label='Faixa de prazo'
            value={faixaPrazo}
            onChange={e => setFaixaPrazo(e.target.value as FaixaFiltroPrazo)}
            className='is-full lg:is-[220px]'
          >
            <MenuItem value=''>{rotuloFaixaFiltroPrazo('')}</MenuItem>
            <MenuItem value='ATRASADO'>{rotuloFaixaFiltroPrazo('ATRASADO')}</MenuItem>
            <MenuItem value='CRITICO'>{rotuloFaixaFiltroPrazo('CRITICO')}</MenuItem>
            <MenuItem value='ATENCAO'>{rotuloFaixaFiltroPrazo('ATENCAO')}</MenuItem>
            <MenuItem value='SEM_PREVISAO'>{rotuloFaixaFiltroPrazo('SEM_PREVISAO')}</MenuItem>
          </CustomTextField>
          <CustomTextField
            select
            label='Cliente'
            value={clienteFiltro}
            onChange={e => setClienteFiltro(e.target.value)}
            className='is-full lg:is-[220px]'
          >
            <MenuItem value=''>Todos os clientes</MenuItem>
            {clientesUnicos.map(nome => (
              <MenuItem key={nome} value={nome}>
                {nome}
              </MenuItem>
            ))}
          </CustomTextField>
        </div>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center gap-4'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Buscar projeto ou cliente'
            className='max-sm:is-full md:is-[320px]'
          />
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='tabler-chevron-up text-xl' />,
                          desc: <i className='tabler-chevron-down text-xl' />
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  <Typography className='p-6' color='text.secondary'>
                    Nenhum projeto corresponde aos filtros.
                  </Typography>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className='cursor-pointer'
                  onClick={() => router.push(`/catec/projetos/${row.original.id}`)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </Card>
  )
}

export default PainelProjetosTable
