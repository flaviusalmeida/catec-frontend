'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import classnames from 'classnames'
import { toast } from 'react-toastify'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { listarProjetosCatec } from '@/libs/catecProjetosApi'
import type { CatecAtividadeStatus } from '@/types/catec/atividadeTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'
import type { CatecProjeto } from '@/types/catec/projetoTypes'
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'

import AtividadeBoard from './AtividadeBoard'
import AtividadeNovaDialog from './AtividadeNovaDialog'
import { useAtividadesStore } from './useAtividadesStore'
import styles from './styles.module.css'

function parseProjetoId(value: string | null): number | null {
  if (!value) return null

  const n = Number(value)

  return Number.isFinite(n) && n > 0 ? n : null
}

const AtividadesView = () => {
  const searchParams = useSearchParams()
  const { hasPermission } = useCatecPermission()
  const { board, carregando, erro, carregar, criarRaiz } = useAtividadesStore()

  const projetoIdUrl = useMemo(() => parseProjetoId(searchParams.get('projetoId')), [searchParams])
  const [projetos, setProjetos] = useState<CatecProjeto[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusPrefill, setStatusPrefill] = useState<CatecAtividadeStatus | null>(null)

  const podeMover = hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_MOVER_STATUS)
  const podeCriar = hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_CRIAR)
  const podeCriarNaColuna = podeCriar && projetoIdUrl != null

  useEffect(() => {
    void listarProjetosCatec()
      .then(setProjetos)
      .catch(() => setProjetos([]))
  }, [])

  useEffect(() => {
    void carregar({
      projetoId: projetoIdUrl,
      q: null
    })
  }, [projetoIdUrl, carregar])

  const handleCriarNaColuna = useCallback(
    async (titulo: string, status: CatecAtividadeStatus) => {
      if (projetoIdUrl == null) {
        setStatusPrefill(status)
        setDialogOpen(true)

        return
      }

      try {
        await criarRaiz(projetoIdUrl, { titulo, status })
        toast.success('Atividade criada.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível criar a atividade.')
        throw err
      }
    },
    [criarRaiz, projetoIdUrl]
  )

  return (
    <div
      className={classnames(
        commonLayoutClasses.contentHeightFixed,
        styles.scroll,
        'is-full overflow-auto pis-2 -mis-2'
      )}
    >
      {erro ? (
        <Alert severity='error' variant='outlined' className='mbe-4'>
          {erro}
        </Alert>
      ) : null}

      {carregando && board.every(c => c.atividades.length === 0) ? (
        <div className='flex justify-center p-12'>
          <CircularProgress />
        </div>
      ) : (
        <AtividadeBoard
          board={board}
          podeMover={podeMover}
          podeCriar={podeCriar}
          podeCriarNaColuna={podeCriarNaColuna}
          onCriarNaColuna={handleCriarNaColuna}
          onPedirProjetoParaCriar={() => {
            setStatusPrefill(null)
            setDialogOpen(true)
          }}
        />
      )}

      <AtividadeNovaDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setStatusPrefill(null)
        }}
        projetos={projetos}
        projetoIdFixo={projetoIdUrl}
        statusInicial={statusPrefill}
        onCreate={async (pid, body) => {
          await criarRaiz(pid, {
            ...body,
            status: body.status ?? statusPrefill ?? undefined
          })
          toast.success('Atividade criada.')
        }}
      />
    </div>
  )
}

export default AtividadesView
