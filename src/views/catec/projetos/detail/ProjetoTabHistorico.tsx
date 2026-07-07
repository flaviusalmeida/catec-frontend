'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import TablePagination from '@mui/material/TablePagination'

import {
  iconeHistoricoItem,
  tituloHistoricoItem
} from '../historicoFluxoHelpers'
import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import HistoricoMetaLinha from './HistoricoMetaLinha'
import HistoricoStatusTransicao from './HistoricoStatusTransicao'
import ProjetoStateCard from './ProjetoStateCard'
import ProjetoTimeline from './ProjetoTimeline'

type Props = {
  fluxo: UseProjetoFluxoStore
}

const PAGE_SIZE = 20

const ProjetoTabHistorico = ({ fluxo }: Props) => {
  const { historicoPage, historicoCarregando, carregarHistorico, data } = fluxo
  const [page, setPage] = useState(0)

  useEffect(() => {
    void carregarHistorico(page)
  }, [page, carregarHistorico])

  const timeline = useMemo(
    () =>
      historicoPage.content.map(item => ({
        key: `${item.origem}-${item.registroId}`,
        titulo: tituloHistoricoItem(item),
        icone: iconeHistoricoItem(item),
        meta: <HistoricoMetaLinha item={item} propostas={data.propostas} />,
        statusTransicao: <HistoricoStatusTransicao item={item} />,
        texto: item.texto
      })),
    [historicoPage.content, data.propostas]
  )

  if (historicoCarregando && historicoPage.content.length === 0) {
    return (
      <div className='flex justify-center p-12'>
        <CircularProgress />
      </div>
    )
  }

  if (historicoPage.totalElements === 0 && !historicoCarregando) {
    return <ProjetoStateCard titulo='Nenhum histórico disponível.' />
  }

  return (
    <Card>
      <CardHeader title='Histórico do fluxo' />
      <CardContent>
        <ProjetoTimeline items={timeline} />
        <TablePagination
          component='div'
          count={historicoPage.totalElements}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </CardContent>
    </Card>
  )
}

export default ProjetoTabHistorico
