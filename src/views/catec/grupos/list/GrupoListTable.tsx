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

import type { CatecGrupo, CatecGrupoCreateInput, CatecPermissaoCatalogo } from '@/types/catec/grupoTypes'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'


import tableStyles from '@core/styles/table.module.css'

import GrupoStatusBadge from '../GrupoStatusBadge'
import GrupoTipoBadge from '../GrupoTipoBadge'
import GrupoAddDrawer from './GrupoAddDrawer'
import GrupoTableFilters from './GrupoTableFilters'

type GrupoRow = CatecGrupo & { action?: string }

const globalFilterFn: FilterFn<GrupoRow> = (row, _columnId, filterValue) => {
  const q = String(filterValue).toLowerCase()

  if (!q) return true

  return (
    row.original.nome.toLowerCase().includes(q) ||
    row.original.codigo.toLowerCase().includes(q) ||
    (row.original.descricao ?? '').toLowerCase().includes(q)
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

const columnHelper = createColumnHelper<GrupoRow>()

type Props = {
  lista: CatecGrupo[]
  catalogo: CatecPermissaoCatalogo[]
  onAdd: (input: CatecGrupoCreateInput) => Promise<CatecGrupo>
}

const GrupoListTable = ({ lista, catalogo, onAdd }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filteredData, setFilteredData] = useState(lista)
  const [globalFilter, setGlobalFilter] = useState('')

  
  const router = useRouter()

  useEffect(() => {
    setFilteredData(lista)
  }, [lista])

  const columns = useMemo<ColumnDef<GrupoRow, any>[]>(
    () => [
      columnHelper.accessor('nome', {
        header: 'Grupo',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-medium'>
              {row.original.nome}
            </Typography>
            <Typography variant='body2'>{row.original.codigo}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('codigo', {
        header: 'Código',
        cell: ({ row }) => (
          <Typography className='font-mono text-sm' color='text.secondary'>
            {row.original.codigo}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'tipo',
        header: 'Tipo',
        cell: ({ row }) => <GrupoTipoBadge sistema={row.original.sistema} />
      }),
      columnHelper.display({
        id: 'permissoes',
        header: 'Permissões',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.permissoes.length}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <GrupoStatusBadge ativo={row.original.ativo} />
      }),
      columnHelper.display({
        id: 'action',
        header: 'Ações',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton aria-label='Abrir grupo'>
              <Link
                href={`/catec/grupos/view/${row.original.id}`}
                className='flex'
              >
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
        <GrupoTableFilters setData={setFilteredData} tableData={lista} />
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
              placeholder='Buscar grupo'
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
              Novo grupo
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
                      Não há grupos que correspondam aos filtros.
                    </Typography>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className='cursor-pointer'
                    onClick={() =>
                      router.push(`/catec/grupos/view/${row.original.id}`)
                    }
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

      <GrupoAddDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAdd={onAdd} catalogo={catalogo} />
    </>
  )
}

export default GrupoListTable
