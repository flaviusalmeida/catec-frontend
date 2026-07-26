'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import classnames from 'classnames'
import { toast } from 'react-toastify'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { listarProjetosCatec } from '@/libs/catecProjetosApi'
import type { CatecAtividadeBoardAgrupar, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'
import { ORDEM_AGRUPAR_BOARD } from '@/types/catec/atividadeTypes'
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

function parseAgrupar(value: string | null): CatecAtividadeBoardAgrupar {
  if (value && ORDEM_AGRUPAR_BOARD.includes(value as CatecAtividadeBoardAgrupar)) {
    return value as CatecAtividadeBoardAgrupar
  }

  return 'NENHUM'
}

const AtividadesView = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission } = useCatecPermission()
  const { board, carregando, erro, carregar, criarRaiz, criarFilha } = useAtividadesStore()

  const projetoIdUrl = useMemo(() => parseProjetoId(searchParams.get('projetoId')), [searchParams])
  const agruparUrl = useMemo(() => parseAgrupar(searchParams.get('agrupar')), [searchParams])
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
      q: null,
      agrupar: agruparUrl
    })
  }, [projetoIdUrl, agruparUrl, carregar])

  const setAgrupar = useCallback(
    (agrupar: CatecAtividadeBoardAgrupar) => {
      const params = new URLSearchParams(searchParams.toString())

      if (agrupar === 'NENHUM') {
        params.delete('agrupar')
      } else {
        params.set('agrupar', agrupar)
      }

      const qs = params.toString()

      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams]
  )

  const handleCriarNaColuna = useCallback(
    async (titulo: string, status: CatecAtividadeStatus) => {
      if (projetoIdUrl == null) {
        setStatusPrefill(status)
        setDialogOpen(true)

        return
      }

      try {
        await criarRaiz(projetoIdUrl, { titulo, status })
        toast.success('Épico criado.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível criar o épico.')
        throw err
      }
    },
    [criarRaiz, projetoIdUrl]
  )

  const boardVazio = board.faixas.every(f => f.colunas.every(c => c.atividades.length === 0))

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

      {carregando && boardVazio ? (
        <div className='flex justify-center p-12'>
          <CircularProgress />
        </div>
      ) : (
        <AtividadeBoard
          board={board}
          agrupar={agruparUrl}
          onAgruparChange={setAgrupar}
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
        onCreate={async ({ projetoId: pid, tipo, paiId, body }) => {
          const payload = {
            ...body,
            status: body.status ?? statusPrefill ?? undefined
          }

          if (tipo === 'EPICO') {
            await criarRaiz(pid, payload)
            toast.success('Épico criado.')

            return
          }

          if (paiId == null) {
            throw new Error(tipo === 'ATIVIDADE' ? 'Selecione o épico pai.' : 'Selecione a atividade pai.')
          }

          await criarFilha(paiId, payload)
          toast.success(tipo === 'ATIVIDADE' ? 'Atividade criada.' : 'Subatividade criada.')
        }}
      />
    </div>
  )
}

export default AtividadesView
