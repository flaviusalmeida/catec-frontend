'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
import { toast } from 'react-toastify'
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

import type { CatecCliente } from '@/types/catec/clienteTypes'
import type { CatecProjeto, CatecProjetoCreateInput } from '@/types/catec/projetoTypes'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'


import tableStyles from '@core/styles/table.module.css'

import ProjetoStatusBadge from '../ProjetoStatusBadge'
import ProjetoAddDrawer from './ProjetoAddDrawer'
import ProjetoTableFilters from './ProjetoTableFilters'

type ProjetoRow = CatecProjeto & { action?: string }

const globalFilterFn: FilterFn<ProjetoRow> = (row, _columnId, filterValue) => {
  const q = String(filterValue).toLowerCase()

  if (!q) return true

  return (
    row.original.titulo.toLowerCase().includes(q) ||
    (row.original.clienteNome ?? '').toLowerCase().includes(q) ||
    row.original.criadoPorNome.toLowerCase().includes(q)
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

const columnHelper = createColumnHelper<ProjetoRow>()

type Props = {
  lista: CatecProjeto[]
  clientes: CatecCliente[]
  onAdd: (input: CatecProjetoCreateInput) => Promise<CatecProjeto>
}

const ProjetoListTable = ({ lista, clientes, onAdd }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filteredData, setFilteredData] = useState(lista)
  const [globalFilter, setGlobalFilter] = useState('')

  const router = useRouter()

  const columns = useMemo<ColumnDef<ProjetoRow, any>[]>(
    () => [
      columnHelper.accessor('titulo', {
        header: 'Projeto',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar size={34} skin='light' color='primary'>
              <i className='tabler-briefcase' />
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.titulo}
              </Typography>
              <Typography variant='body2' className='line-clamp-1 max-is-[280px]'>
                {row.original.escopo}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('clienteNome', {
        header: 'Cliente',
        cell: ({ row }) => <Typography>{row.original.clienteNome ?? '—'}</Typography>
      }),
      columnHelper.accessor('criadoPorNome', {
        header: 'Criado por',
        cell: ({ row }) => <Typography color='text.secondary'>{row.original.criadoPorNome}</Typography>
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <ProjetoStatusBadge status={row.original.status} />
      }),
      columnHelper.display({
        id: 'action',
        header: 'Ações',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton aria-label='Abrir projeto'>
              <Link href={`/catec/projetos/${row.original.id}`} className='flex'>
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
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
    <>
      <Card>
        <CardHeader title='Filtros' className='pbe-4' />
        <ProjetoTableFilters setData={setFilteredData} tableData={lista} />
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
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
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Buscar projeto'
              className='max-sm:is-full'
            />
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
              onClick={() => toast.info('Exportação simulada (mock).')}
            >
              Exportar
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setDrawerOpen(true)}
              className='max-sm:is-full'
            >
              Novo projeto
            </Button>
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
                      Não há projetos que correspondam aos filtros.
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
                      <td
                        key={cell.id}
                        onClick={e => {
                          if (cell.column.id === 'action') e.stopPropagation()
                        }}
                      >
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

      <ProjetoAddDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} clientes={clientes} onAdd={onAdd} />
    </>
  )
}

export default ProjetoListTable
