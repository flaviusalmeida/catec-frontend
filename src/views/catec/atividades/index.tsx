'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import classnames from 'classnames'
import { toast } from 'react-toastify'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { listarProjetosCatec } from '@/libs/catecProjetosApi'
import type {
  CatecAtividadeBoardAgrupar,
  CatecAtividadeStatus,
  CatecAtividadeTipo
} from '@/types/catec/atividadeTypes'
import { AGRUPAR_BOARD_DEFAULT, ORDEM_AGRUPAR_BOARD } from '@/types/catec/atividadeTypes'
import { PermissaoCodigo } from '@/types/catec/permissao'
import type { CatecProjeto } from '@/types/catec/projetoTypes'
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'

import AtividadeBoard from './AtividadeBoard'
import type { CatecAtividadeNovaNaColunaOpts } from './AtividadeBoard'
import AtividadeNovaDialog from './AtividadeNovaDialog'
import { useAtividadesStore } from './useAtividadesStore'
import styles from './styles.module.css'

const AGRUPAR_STORAGE_KEY = 'catec-atividades-board-agrupar'

function parseProjetoId(value: string | null): number | null {
  if (!value) return null

  const n = Number(value)

  return Number.isFinite(n) && n > 0 ? n : null
}

function isAgruparValido(value: string | null | undefined): value is CatecAtividadeBoardAgrupar {
  return Boolean(value && ORDEM_AGRUPAR_BOARD.includes(value as CatecAtividadeBoardAgrupar))
}

function lerAgruparSalvo(): CatecAtividadeBoardAgrupar | null {
  try {
    const raw = localStorage.getItem(AGRUPAR_STORAGE_KEY)

    return isAgruparValido(raw) ? raw : null
  } catch {
    return null
  }
}

function salvarAgrupar(agrupar: CatecAtividadeBoardAgrupar) {
  try {
    localStorage.setItem(AGRUPAR_STORAGE_KEY, agrupar)
  } catch {
    // ignore quota / private mode
  }
}

const AtividadesView = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission } = useCatecPermission()
  const { board, carregando, erro, carregar, criarRaiz, criarFilha } = useAtividadesStore()

  const projetoIdUrl = useMemo(() => parseProjetoId(searchParams.get('projetoId')), [searchParams])
  const agruparUrlRaw = searchParams.get('agrupar')
  const agruparUrl = isAgruparValido(agruparUrlRaw) ? agruparUrlRaw : null

  const [agruparSalvo, setAgruparSalvo] = useState<CatecAtividadeBoardAgrupar | null>(null)
  const [storageLido, setStorageLido] = useState(false)
  const [projetos, setProjetos] = useState<CatecProjeto[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusPrefill, setStatusPrefill] = useState<CatecAtividadeStatus | null>(null)
  const [projetoIdFixoDialog, setProjetoIdFixoDialog] = useState<number | null>(null)
  const [tipoFixo, setTipoFixo] = useState<CatecAtividadeTipo | null>(null)
  const [paiIdFixo, setPaiIdFixo] = useState<number | null>(null)

  const podeMover = hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_MOVER_STATUS)
  const podeCriar = hasPermission(PermissaoCodigo.ACAO_ATIVIDADE_CRIAR)

  useEffect(() => {
    setAgruparSalvo(lerAgruparSalvo())
    setStorageLido(true)
  }, [])

  // URL válida > última escolha > Projeto. Só resolve após ler o storage (ou se a URL já define).
  const agruparPronto = agruparUrl != null || storageLido
  const agrupar = agruparUrl ?? agruparSalvo ?? AGRUPAR_BOARD_DEFAULT

  useEffect(() => {
    void listarProjetosCatec()
      .then(setProjetos)
      .catch(() => setProjetos([]))
  }, [])

  useEffect(() => {
    if (!agruparPronto) {
      return
    }

    salvarAgrupar(agrupar)

    if (agruparUrlRaw === agrupar) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())

    params.set('agrupar', agrupar)
    const qs = params.toString()

    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [agrupar, agruparPronto, agruparUrlRaw, pathname, router, searchParams])

  useEffect(() => {
    if (!agruparPronto) {
      return
    }

    void carregar({
      projetoId: projetoIdUrl,
      q: null,
      agrupar
    })
  }, [projetoIdUrl, agrupar, agruparPronto, carregar])

  const setAgrupar = useCallback(
    (proximo: CatecAtividadeBoardAgrupar) => {
      salvarAgrupar(proximo)
      setAgruparSalvo(proximo)

      const params = new URLSearchParams(searchParams.toString())

      params.set('agrupar', proximo)
      const qs = params.toString()

      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams]
  )

  const fecharDialog = useCallback(() => {
    setDialogOpen(false)
    setStatusPrefill(null)
    setProjetoIdFixoDialog(null)
    setTipoFixo(null)
    setPaiIdFixo(null)
  }, [])

  const abrirDialogNova = useCallback(
    (opts?: {
      status?: CatecAtividadeStatus | null
      /** `undefined` = herda projeto da URL; `null` = deixa o usuário escolher. */
      projetoId?: number | null
      tipo?: CatecAtividadeTipo | null
      paiId?: number | null
    }) => {
      setStatusPrefill(opts?.status ?? null)
      setProjetoIdFixoDialog(
        opts != null && 'projetoId' in opts ? (opts.projetoId ?? null) : projetoIdUrl
      )
      setTipoFixo(opts?.tipo ?? null)
      setPaiIdFixo(opts?.paiId ?? null)
      setDialogOpen(true)
    },
    [projetoIdUrl]
  )

  const handleNovaNaColuna = useCallback(
    ({ status, paiId, projetoId, tipo }: CatecAtividadeNovaNaColunaOpts) => {
      // Agrupamento por responsável (sem pai/tipo/projeto de contexto): formulário livre.
      const livre = projetoId == null && paiId == null && tipo == null

      abrirDialogNova({
        status,
        projetoId: livre ? null : (projetoId ?? projetoIdUrl),
        tipo: tipo ?? null,
        paiId: paiId ?? null
      })
    },
    [abrirDialogNova, projetoIdUrl]
  )

  const handleNovaEtapa = useCallback(
    (projetoId: number) => {
      abrirDialogNova({ projetoId, tipo: 'ETAPA' })
    },
    [abrirDialogNova]
  )

  const boardVazio = board.faixas.every(
    f =>
      f.colunas.every(c => c.atividades.length === 0) &&
      f.subFaixas.every(sf => sf.colunas.every(c => c.atividades.length === 0))
  )
  const aguardandoPreferencia = !agruparPronto

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

      {(carregando && boardVazio) || aguardandoPreferencia ? (
        <div className='flex justify-center p-12'>
          <CircularProgress />
        </div>
      ) : (
        <AtividadeBoard
          board={board}
          agrupar={agrupar}
          onAgruparChange={setAgrupar}
          podeMover={podeMover}
          podeCriar={podeCriar}
          onNovaNaColuna={handleNovaNaColuna}
          onNovaEtapa={handleNovaEtapa}
        />
      )}

      <AtividadeNovaDialog
        open={dialogOpen}
        onClose={fecharDialog}
        projetos={projetos}
        projetoIdFixo={projetoIdFixoDialog}
        statusInicial={statusPrefill}
        tipoFixo={tipoFixo}
        paiIdFixo={paiIdFixo}
        onCreate={async ({ projetoId: pid, tipo, paiId, body }) => {
          const payload = {
            ...body,
            status: body.status ?? statusPrefill ?? undefined
          }

          if (tipo === 'ETAPA') {
            await criarRaiz(pid, payload)
            toast.success('Etapa criada.')

            return
          }

          if (paiId == null) {
            throw new Error(tipo === 'ATIVIDADE' ? 'Selecione a etapa pai.' : 'Selecione a atividade pai.')
          }

          await criarFilha(paiId, payload)
          toast.success(tipo === 'ATIVIDADE' ? 'Atividade criada.' : 'Subatividade criada.')
        }}
      />
    </div>
  )
}

export default AtividadesView
