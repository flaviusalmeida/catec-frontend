'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
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

import type { ThemeColor } from '@core/types'
import type { CatecAdminUsuario, CatecGrupoValor, CatecUsuarioCreateInput } from '@/types/catec/usuarioTypes'
import { rotuloGrupo } from '@/types/catec/usuarioTypes'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

import { getInitials } from '@/utils/getInitials'

import tableStyles from '@core/styles/table.module.css'

import UsuarioStatusBadge from '@views/catec/usuarios/UsuarioStatusBadge'

import Usuario2AddDrawer from './Usuario2AddDrawer'
import Usuario2TableFilters from './Usuario2TableFilters'

const Icon = styled('i')({})

type UsuarioRow = CatecAdminUsuario & { action?: string }

const grupoObj: Record<CatecGrupoValor, { icon: string; color: ThemeColor }> = {
  COLABORADOR: { icon: 'tabler-user', color: 'primary' },
  ADMINISTRATIVO: { icon: 'tabler-shield', color: 'error' },
  SOCIO: { icon: 'tabler-crown', color: 'warning' },
  SALA_TECNICA: { icon: 'tabler-tool', color: 'info' },
  CAMPO: { icon: 'tabler-map-pin', color: 'success' },
  FINANCEIRO: { icon: 'tabler-currency-dollar', color: 'secondary' }
}

const globalFilterFn: FilterFn<UsuarioRow> = (row, _columnId, filterValue) => {
  const q = String(filterValue).toLowerCase()

  if (!q) return true

  return (
    row.original.nome.toLowerCase().includes(q) ||
    row.original.email.toLowerCase().includes(q) ||
    (row.original.telefone ?? '').toLowerCase().includes(q)
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

const columnHelper = createColumnHelper<UsuarioRow>()

type Props = {
  lista: CatecAdminUsuario[]
  onAdd: (input: CatecUsuarioCreateInput) => Promise<CatecAdminUsuario>
}

const Usuario2ListTable = ({ lista, onAdd }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filteredData, setFilteredData] = useState(lista)
  const [globalFilter, setGlobalFilter] = useState('')

  
  const router = useRouter()

  useEffect(() => {
    setFilteredData(lista)
  }, [lista])

  const columns = useMemo<ColumnDef<UsuarioRow, any>[]>(
    () => [
      columnHelper.accessor('nome', {
        header: 'Usuário',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar size={34}>{getInitials(row.original.nome)}</CustomAvatar>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.nome}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('telefone', {
        header: 'Telefone',
        cell: ({ row }) => <Typography>{row.original.telefone ?? '—'}</Typography>
      }),
      columnHelper.accessor('grupos', {
        header: 'Grupo principal',
        cell: ({ row }) => {
          const principal = row.original.grupos[0]

          if (!principal) return <Typography>—</Typography>

          const meta = grupoObj[principal]

          return (
            <div className='flex items-center gap-2'>
              <Icon className={meta.icon} sx={{ color: `var(--mui-palette-${meta.color}-main)` }} />
              <Typography color='text.primary'>{rotuloGrupo(principal)}</Typography>
              {row.original.grupos.length > 1 ? (
                <Chip label={`+${row.original.grupos.length - 1}`} size='small' variant='tonal' />
              ) : null}
            </div>
          )
        }
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <UsuarioStatusBadge ativo={row.original.ativo} requerTrocaSenha={row.original.requerTrocaSenha} />
        )
      }),
      columnHelper.display({
        id: 'action',
        header: 'Ações',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton aria-label='Abrir usuário'>
              <Link
                href={`/catec/usuarios/view/${row.original.id}`}
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
        <Usuario2TableFilters setData={setFilteredData} tableData={lista} />
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
              placeholder='Buscar usuário'
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
              Novo usuário
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
                      Não há usuários que correspondam aos filtros.
                    </Typography>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className='cursor-pointer'
                    onClick={() =>
                      router.push(`/catec/usuarios/view/${row.original.id}`)
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

      <Usuario2AddDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAdd={onAdd} />
    </>
  )
}

export default Usuario2ListTable
