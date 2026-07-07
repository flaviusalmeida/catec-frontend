'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
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

import { aprovarPropostaSocioCatec, devolverPropostaSocioCatec } from '@/libs/catecSocioPropostasApi'
import type { CatecPropostaPendenteSocio } from '@/types/catec/socioPropostaTypes'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

import tableStyles from '@core/styles/table.module.css'

import { formatarDataHoraHistorico } from '@/views/catec/projetos/historicoFluxoHelpers'

import SocioPropostaPreviewDrawer from './SocioPropostaPreviewDrawer'
import SocioPropostaTableFilters from './SocioPropostaTableFilters'

type Row = CatecPropostaPendenteSocio & { action?: string }

type DialogMode = 'aprovar' | 'reprovar' | null

const globalFilterFn: FilterFn<Row> = (row, _columnId, filterValue) => {
  const q = String(filterValue).toLowerCase()

  if (!q) return true

  return (
    row.original.projetoTitulo.toLowerCase().includes(q) ||
    (row.original.clienteNome ?? '').toLowerCase().includes(q) ||
    row.original.elaboradoPorNome.toLowerCase().includes(q)
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

const columnHelper = createColumnHelper<Row>()

type Props = {
  lista: CatecPropostaPendenteSocio[]
  onRecarregar: () => Promise<void>
}

const SocioPropostaListTable = ({ lista, onRecarregar }: Props) => {
  const [filteredData, setFilteredData] = useState(lista)
  const [globalFilter, setGlobalFilter] = useState('')
  const [processando, setProcessando] = useState(false)
  const [previewItem, setPreviewItem] = useState<CatecPropostaPendenteSocio | null>(null)
  const [dialogItem, setDialogItem] = useState<CatecPropostaPendenteSocio | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [observacao, setObservacao] = useState('')

  useEffect(() => {
    setFilteredData(lista)
  }, [lista])

  const abrirPreview = useCallback((item: CatecPropostaPendenteSocio) => {
    setPreviewItem(item)
  }, [])

  const abrirDialog = useCallback((item: CatecPropostaPendenteSocio, mode: Exclude<DialogMode, null>) => {
    setDialogItem(item)
    setDialogMode(mode)
    setObservacao('')
  }, [])

  const fecharDialog = useCallback(() => {
    if (processando) return

    setDialogItem(null)
    setDialogMode(null)
    setObservacao('')
  }, [processando])

  const confirmarAcao = useCallback(async () => {
    if (!dialogItem || !dialogMode) return

    if (dialogMode === 'reprovar' && !observacao.trim()) {
      toast.error('Informe o parecer ao reprovar a proposta para elaboração.')

      return
    }

    setProcessando(true)

    try {
      if (dialogMode === 'aprovar') {
        await aprovarPropostaSocioCatec(dialogItem.propostaId, {
          projetoId: dialogItem.projetoId,
          observacao: observacao.trim() || undefined
        })
        toast.success('Proposta aprovada. O administrativo pode enviar ao cliente.')
      } else {
        await devolverPropostaSocioCatec(dialogItem.propostaId, {
          projetoId: dialogItem.projetoId,
          observacao: observacao.trim()
        })
        toast.success('Proposta reprovada. O administrativo deve ajustar e reenviar.')
      }

      setPreviewItem(prev => (prev?.propostaId === dialogItem.propostaId ? null : prev))
      fecharDialog()
      await onRecarregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível concluir a ação.')
    } finally {
      setProcessando(false)
    }
  }, [dialogItem, dialogMode, fecharDialog, observacao, onRecarregar])

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      columnHelper.accessor('projetoTitulo', {
        header: 'Projeto',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar size={34} skin='light' color='primary'>
              <i className='tabler-file-text' />
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.projetoTitulo}
              </Typography>
              <Typography variant='body2' className='line-clamp-1 max-is-[280px]'>
                {row.original.clienteNome ?? '—'}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('elaboradoPorNome', {
        header: 'Elaborado por',
        cell: ({ getValue }) => <Typography color='text.secondary'>{getValue()}</Typography>
      }),
      columnHelper.accessor('criadoEm', {
        header: 'Enviado em',
        cell: ({ getValue }) => (
          <Typography color='text.secondary'>{formatarDataHoraHistorico(getValue())}</Typography>
        )
      }),
      columnHelper.display({
        id: 'action',
        header: 'Ações',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton size='small' title='Visualizar documento' onClick={() => abrirPreview(row.original)}>
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [abrirPreview]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <>
      <Card>
        <CardHeader title='Filtros' className='pbe-4' />
        <SocioPropostaTableFilters setData={setFilteredData} tableData={lista} />
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
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Buscar proposta'
            className='max-sm:is-full sm:is-[280px]'
          />
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
                      Nenhuma proposta corresponde aos filtros aplicados.
                    </Typography>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className='cursor-pointer'
                    onClick={() => abrirPreview(row.original)}
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

      <SocioPropostaPreviewDrawer
        item={previewItem}
        open={previewItem != null}
        onClose={() => setPreviewItem(null)}
        onAprovar={item => abrirDialog(item, 'aprovar')}
        onReprovar={item => abrirDialog(item, 'reprovar')}
        processando={processando}
      />

      <Dialog open={dialogMode != null} onClose={fecharDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{dialogMode === 'aprovar' ? 'Aprovar proposta' : 'Reprovar proposta'}</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          {dialogItem ? (
            <Typography variant='body2' color='text.secondary'>
              {dialogItem.projetoTitulo} · v{dialogItem.versao}
            </Typography>
          ) : null}
          <CustomTextField
            fullWidth
            multiline
            minRows={3}
            label={dialogMode === 'reprovar' ? 'Parecer (obrigatório)' : 'Observação (opcional)'}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            placeholder={
              dialogMode === 'reprovar'
                ? 'Descreva os ajustes necessários na proposta.'
                : 'Comentário opcional sobre a aprovação.'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={fecharDialog} disabled={processando}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color={dialogMode === 'aprovar' ? 'success' : 'error'}
            onClick={() => void confirmarAcao()}
            disabled={processando || (dialogMode === 'reprovar' && !observacao.trim())}
          >
            {dialogMode === 'aprovar' ? 'Confirmar aprovação' : 'Confirmar reprovação'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SocioPropostaListTable
