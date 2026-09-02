'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

import { listarAtividadesCatec, listarAtividadesPorServicoCatec } from '@/libs/catecAtividadesApi'
import type {
  CatecAtividade,
  CatecAtividadeBoard,
  CatecAtividadeBoardFaixa,
  CatecAtividadeCreateInput,
  CatecAtividadePrioridade,
  CatecAtividadeStatus,
  CatecAtividadeTipo
} from '@/types/catec/atividadeTypes'
import { PRIORIDADE_ATIVIDADE_ROTULO, TIPO_ATIVIDADE_ROTULO } from '@/types/catec/atividadeTypes'
import type { CatecServico } from '@/types/catec/servicoTypes'

import CustomAutocomplete from '@core/components/mui/Autocomplete'
import CustomTextField from '@core/components/mui/TextField'

import {
  dataCivilSp,
  filtrarServicosParaCriacaoAtividade,
  MSG_PRAZO_APOS_PREVISAO,
  prazoAposPrevisaoServico,
  servicoPermiteMutacaoAtividade
} from './atividadeFluxoRules'
import AtividadeDescricaoEditor from './AtividadeDescricaoEditor'
import AtividadeTipoIcone from './AtividadeTipoIcone'
import { useAtividadesStore } from './useAtividadesStore'
import styles from './styles.module.css'

const TIPOS_CRIACAO: CatecAtividadeTipo[] = ['ETAPA', 'ATIVIDADE', 'SUBATIVIDADE']

function prioridadeIcone(prioridade: CatecAtividadePrioridade): string {
  if (prioridade === 'ALTA') return 'tabler-chevrons-up'
  if (prioridade === 'BAIXA') return 'tabler-chevrons-down'

  return 'tabler-equal'
}

function prioridadeCorClass(prioridade: CatecAtividadePrioridade): string {
  if (prioridade === 'ALTA') return styles.prioAlta
  if (prioridade === 'BAIXA') return styles.prioBaixa

  return styles.prioMedia
}

function tituloModal(tipo: CatecAtividadeTipo | ''): string {
  if (tipo === 'ETAPA') return 'Nova etapa'
  if (tipo === 'ATIVIDADE') return 'Nova atividade'
  if (tipo === 'SUBATIVIDADE') return 'Nova subatividade'

  return 'Nova atividade'
}

function rotuloPai(tipo: CatecAtividadeTipo | ''): string {
  if (tipo === 'ATIVIDADE') return 'Etapa pai'
  if (tipo === 'SUBATIVIDADE') return 'Atividade pai'

  return 'Pai'
}

type PaiOption = {
  id: number
  codigo: string
  titulo: string
  tipo: CatecAtividadeTipo
  servicoId: number
}

function tipoPaiDe(tipoFilho: CatecAtividadeTipo): CatecAtividadeTipo {
  return tipoFilho === 'ATIVIDADE' ? 'ETAPA' : 'ATIVIDADE'
}

function toPaiOption(a: CatecAtividade): PaiOption {
  return {
    id: a.id,
    codigo: a.codigo,
    titulo: a.titulo,
    tipo: a.tipo,
    servicoId: a.servicoId
  }
}

function servicoIdNaFaixa(faixa: CatecAtividadeBoardFaixa): number | null {
  for (const coluna of faixa.colunas) {
    for (const atividade of coluna.atividades) {
      if (atividade.servicoId > 0) return atividade.servicoId
    }
  }

  for (const sub of faixa.subFaixas) {
    const pid = servicoIdNaFaixa(sub)

    if (pid != null) return pid
  }

  return null
}

/** Etapas/atividades aparecem como cabeçalho de faixa, não como card — recupera opções dali. */
function paisDoBoard(
  board: CatecAtividadeBoard,
  servicoId: number,
  tipoFilho: CatecAtividadeTipo,
  resolverServico?: (atividadeId: number) => number | null
): PaiOption[] {
  const tipoPai = tipoPaiDe(tipoFilho)
  const porId = new Map<number, PaiOption>()

  const considerar = (faixa: CatecAtividadeBoardFaixa, servicoFaixa: number | null) => {
    if (faixa.atividadeId == null || faixa.tipo !== tipoPai) return
    if (servicoFaixa == null || servicoFaixa !== servicoId) return

    porId.set(faixa.atividadeId, {
      id: faixa.atividadeId,
      codigo: '',
      titulo: faixa.titulo,
      tipo: tipoPai,
      servicoId: servicoFaixa
    })
  }

  for (const faixa of board.faixas) {
    if (board.agrupar === 'SERVICO') {
      const pid = Number(faixa.chave)

      if (Number.isFinite(pid) && pid === servicoId) {
        for (const sub of faixa.subFaixas) considerar(sub, pid)
      }

      continue
    }

    const pidFaixa =
      servicoIdNaFaixa(faixa) ??
      (faixa.atividadeId != null ? (resolverServico?.(faixa.atividadeId) ?? null) : null)

    considerar(faixa, pidFaixa)
  }

  return [...porId.values()].sort(
    (a, b) => (a.codigo || a.titulo).localeCompare(b.codigo || b.titulo, 'pt-BR') || a.id - b.id
  )
}

function filtrarPaisDaLista(lista: CatecAtividade[], servicoId: number, tipoFilho: CatecAtividadeTipo): PaiOption[] {
  const tipoPai = tipoPaiDe(tipoFilho)

  return lista
    .filter(a => a.servicoId === servicoId && a.tipo === tipoPai)
    .map(toPaiOption)
    .sort((a, b) => a.codigo.localeCompare(b.codigo, 'pt-BR') || a.id - b.id)
}

function rotuloOpcaoPai(option: PaiOption): string {
  return option.codigo ? `${option.codigo} · ${option.titulo}` : option.titulo
}

export type CatecAtividadeNovaPayload = {
  servicoId: number
  tipo: CatecAtividadeTipo
  paiId: number | null
  body: CatecAtividadeCreateInput
}

type Props = {
  open: boolean
  onClose: () => void
  servicos: CatecServico[]
  servicoIdFixo?: number | null
  statusInicial?: CatecAtividadeStatus | null

  /** Quando definido, fixa o tipo (ex.: Nova etapa a partir do cabeçalho do servico). */
  tipoFixo?: CatecAtividadeTipo | null

  /** Quando definido, pré-seleciona (e fixa) o pai — ex.: criar atividade sob uma etapa do board. */
  paiIdFixo?: number | null
  onCreate: (payload: CatecAtividadeNovaPayload) => Promise<void>
}

const AtividadeNovaDialog = ({
  open,
  onClose,
  servicos,
  servicoIdFixo,
  statusInicial,
  tipoFixo = null,
  paiIdFixo = null,
  onCreate
}: Props) => {
  const { board, catalogo, obter } = useAtividadesStore()
  const [servicoId, setServicoId] = useState<number | ''>(servicoIdFixo ?? '')
  const [tipo, setTipo] = useState<CatecAtividadeTipo | ''>(tipoFixo ?? '')
  const [paiId, setPaiId] = useState<number | ''>(paiIdFixo ?? '')
  const [candidatosApi, setCandidatosApi] = useState<CatecAtividade[]>([])
  const [carregandoPais, setCarregandoPais] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState<string | null>(null)
  const [prioridade, setPrioridade] = useState<CatecAtividadePrioridade>('MEDIA')
  const [prazo, setPrazo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const precisaPai = tipo === 'ATIVIDADE' || tipo === 'SUBATIVIDADE'
  const servicoEscolhido = servicoId !== '' && Number(servicoId) > 0
  const tipoEscolhido = tipo !== ''
  const servicoEditavel = servicoIdFixo == null
  const tipoEditavel = tipoFixo == null && servicoEscolhido
  const paiEditavel = paiIdFixo == null && precisaPai && servicoEscolhido && tipoEscolhido

  const servicosElegiveis = useMemo(() => filtrarServicosParaCriacaoAtividade(servicos), [servicos])

  const servicoSelecionado = useMemo(
    () => (servicoId === '' ? null : (servicosElegiveis.find(p => p.id === servicoId) ?? null)),
    [servicoId, servicosElegiveis]
  )

  const candidatosPai = useMemo(() => {
    if (!precisaPai || !servicoEscolhido || !tipo) return [] as PaiOption[]

    const pid = Number(servicoId)
    const porId = new Map<number, PaiOption>()

    const adicionar = (itens: PaiOption[]) => {
      for (const item of itens) {
        const atual = porId.get(item.id)

        if (!atual || (!atual.codigo && item.codigo)) {
          porId.set(item.id, item)
        }
      }
    }

    adicionar(filtrarPaisDaLista(catalogo, pid, tipo))
    adicionar(paisDoBoard(board, pid, tipo, id => obter(id)?.servicoId ?? null))
    adicionar(filtrarPaisDaLista(candidatosApi, pid, tipo))

    if (paiIdFixo != null && !porId.has(paiIdFixo)) {
      const doCatalogo = obter(paiIdFixo)

      if (doCatalogo && doCatalogo.servicoId === pid) {
        porId.set(paiIdFixo, toPaiOption(doCatalogo))
      }
    }

    return [...porId.values()].sort(
      (a, b) => (a.codigo || a.titulo).localeCompare(b.codigo || b.titulo, 'pt-BR') || a.id - b.id
    )
  }, [precisaPai, servicoEscolhido, servicoId, tipo, catalogo, board, candidatosApi, paiIdFixo, obter])

  const paiSelecionado = useMemo(
    () => (paiId === '' ? null : (candidatosPai.find(a => a.id === paiId) ?? null)),
    [paiId, candidatosPai]
  )

  useEffect(() => {
    if (!open) return

    setServicoId(servicoIdFixo ?? '')
    setTipo(tipoFixo ?? '')
    setPaiId(paiIdFixo ?? '')
    setCandidatosApi([])
    setTitulo('')
    setDescricao(null)
    setPrioridade('MEDIA')
    setPrazo('')
  }, [open, servicoIdFixo, tipoFixo, paiIdFixo])

  useEffect(() => {
    if (!open || !precisaPai || !servicoEscolhido) {
      setCandidatosApi([])
      setCarregandoPais(false)

      return
    }

    const pid = Number(servicoId)
    let cancelled = false

    setCarregandoPais(true)

    const carregar = async () => {
      try {
        let lista = await listarAtividadesCatec({ servicoId: pid })

        if (lista.length === 0) {
          lista = await listarAtividadesPorServicoCatec(pid).catch(() => [] as CatecAtividade[])
        }

        if (cancelled) return

        setCandidatosApi(lista)
        setPaiId(prev => {
          if (paiIdFixo != null && lista.some(a => a.id === paiIdFixo)) return paiIdFixo
          if (typeof prev === 'number' && lista.some(a => a.id === prev)) return prev

          return paiIdFixo ?? (typeof prev === 'number' ? prev : '')
        })
      } catch (err) {
        if (cancelled) return
        setCandidatosApi([])
        toast.error(err instanceof Error ? err.message : 'Não foi possível carregar as opções de pai.')
      } finally {
        if (!cancelled) setCarregandoPais(false)
      }
    }

    void carregar()

    return () => {
      cancelled = true
    }
  }, [open, precisaPai, servicoEscolhido, servicoId, paiIdFixo])

  useEffect(() => {
    if (!open || paiIdFixo == null) return

    if (candidatosPai.some(a => a.id === paiIdFixo)) {
      setPaiId(paiIdFixo)
    }
  }, [open, paiIdFixo, candidatosPai])

  const helperPai = useMemo(() => {
    if (!servicoEscolhido) return 'Selecione o servico primeiro.'
    if (!tipoEscolhido) return 'Selecione o tipo primeiro.'
    if (tipo === 'ETAPA') return 'Etapa não possui pai.'
    if (carregandoPais && candidatosPai.length === 0) return 'Carregando…'

    if (!carregandoPais && candidatosPai.length === 0) {
      return tipo === 'ATIVIDADE' ? 'Nenhuma etapa neste servico.' : 'Nenhuma atividade neste servico.'
    }

    return undefined
  }, [servicoEscolhido, tipoEscolhido, tipo, carregandoPais, candidatosPai.length])

  const placeholderTitulo = useMemo(() => {
    if (tipo === 'ETAPA') return 'Ex.: Entregar proposta comercial'
    if (tipo === 'ATIVIDADE') return 'Ex.: Elaborar minuta da proposta'
    if (tipo === 'SUBATIVIDADE') return 'Ex.: Revisar cláusulas contratuais'

    return 'Ex.: Elaborar proposta comercial'
  }, [tipo])

  const handleServicoChange = (value: CatecServico | null) => {
    setServicoId(value?.id ?? '')

    if (tipoFixo == null) setTipo('')
    if (paiIdFixo == null) setPaiId('')
    setCandidatosApi([])
  }

  const handleTipoChange = (value: CatecAtividadeTipo | '') => {
    setTipo(value)

    if (paiIdFixo == null) setPaiId('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const pid = typeof servicoId === 'number' ? servicoId : Number(servicoId)

    if (!pid || !titulo.trim()) {
      toast.error('Informe o servico e o título.')

      return
    }

    if (!tipo) {
      toast.error('Selecione o tipo.')

      return
    }

    if (precisaPai && (paiId === '' || !Number(paiId))) {
      toast.error(
        tipo === 'ATIVIDADE' ? 'Selecione a etapa pai.' : 'Selecione a atividade pai.'
      )

      return
    }

    const servico = servicos.find(p => p.id === pid)

    if (!servico || !servicoPermiteMutacaoAtividade(servico.status)) {
      toast.error('Só é possível criar atividades em servicos aguardando execução ou em execução.')

      return
    }

    if (prazoAposPrevisaoServico(prazo, servico.previsaoConclusaoEm)) {
      toast.error(MSG_PRAZO_APOS_PREVISAO)

      return
    }

    setSalvando(true)

    try {
      await onCreate({
        servicoId: pid,
        tipo,
        paiId: precisaPai ? Number(paiId) : null,
        body: {
          titulo: titulo.trim(),
          descricao,
          prioridade,
          status: statusInicial ?? undefined,
          prazoEm: prazo ? new Date(`${prazo}T12:00:00`).toISOString() : null
        }
      })
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
      transitionDuration={200}
      PaperProps={{ className: styles.novaDialog }}
    >
      <form onSubmit={handleSubmit} className={styles.novaDialogForm}>
        <DialogTitle>{tituloModal(tipo)}</DialogTitle>
        <DialogContent className={styles.novaDialogContent}>
          <CustomAutocomplete
            fullWidth
            options={servicosElegiveis}
            value={servicoSelecionado}
            onChange={(_, value) => handleServicoChange(value)}
            getOptionLabel={option => option.titulo}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={!servicoEditavel}
            noOptionsText='Nenhum servico em execução'
            filterOptions={(options, { inputValue }) => {
              const query = inputValue.trim().toLowerCase()

              if (!query) return options

              return options.filter(p => {
                const titulo = p.titulo.toLowerCase()
                const cliente = p.clienteNome?.toLowerCase() ?? ''

                return titulo.includes(query) || cliente.includes(query)
              })
            }}
            slotProps={{
              popper: {
                disablePortal: false
              }
            }}
            renderInput={params => (
              <CustomTextField
                {...params}
                label='Servico'
                required
                disabled={!servicoEditavel}
                autoFocus={servicoEditavel}
                placeholder='Digite para buscar…'
                helperText={
                  servicosElegiveis.length === 0
                    ? 'Só servicos aguardando execução ou em execução.'
                    : undefined
                }
              />
            )}
          />

          <CustomTextField
            select
            fullWidth
            label='Tipo'
            value={tipo}
            onChange={e => handleTipoChange(e.target.value as CatecAtividadeTipo | '')}
            required
            disabled={!tipoEditavel}
            helperText={!servicoEscolhido && tipoFixo == null ? 'Selecione o servico primeiro.' : undefined}
            slotProps={{
              select: {
                displayEmpty: true,
                MenuProps: {
                  disableScrollLock: true
                },
                renderValue: value => {
                  if (value === '' || value == null) {
                    return <em className='text-textDisabled'>Selecione o tipo</em>
                  }

                  const key = value as CatecAtividadeTipo

                  return (
                    <span className='inline-flex items-center gap-2'>
                      <AtividadeTipoIcone tipo={key} comTooltip={false} />
                      {TIPO_ATIVIDADE_ROTULO[key]}
                    </span>
                  )
                }
              }
            }}
          >
            <MenuItem value=''>
              <em>Selecione o tipo</em>
            </MenuItem>
            {TIPOS_CRIACAO.map(key => (
              <MenuItem key={key} value={key}>
                <span className='inline-flex items-center gap-2'>
                  <AtividadeTipoIcone tipo={key} comTooltip={false} />
                  {TIPO_ATIVIDADE_ROTULO[key]}
                </span>
              </MenuItem>
            ))}
          </CustomTextField>

          {tipo !== 'ETAPA' ? (
            <CustomAutocomplete
              fullWidth
              options={candidatosPai}
              value={paiSelecionado}
              onChange={(_, value) => setPaiId(value?.id ?? '')}
              getOptionLabel={rotuloOpcaoPai}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={!paiEditavel}
              loading={carregandoPais}
              noOptionsText={
                carregandoPais
                  ? 'Carregando…'
                  : tipo === 'ATIVIDADE'
                    ? 'Nenhuma etapa neste servico.'
                    : 'Nenhuma atividade neste servico.'
              }
              filterOptions={(options, { inputValue }) => {
                const query = inputValue.trim().toLowerCase()

                if (!query) return options

                return options.filter(o => {
                  const rotulo = rotuloOpcaoPai(o).toLowerCase()

                  return rotulo.includes(query) || String(o.id).includes(query)
                })
              }}
              slotProps={{
                popper: {
                  disablePortal: false
                }
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props as typeof props & { key: string }

                return (
                  <li key={key} {...optionProps} className={`${optionProps.className ?? ''}`.trim()}>
                    <span className='inline-flex items-center gap-2 min-is-0'>
                      <AtividadeTipoIcone tipo={option.tipo} comTooltip={false} />
                      <span className='truncate'>{rotuloOpcaoPai(option)}</span>
                    </span>
                  </li>
                )
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label={rotuloPai(tipo)}
                  required={precisaPai}
                  disabled={!paiEditavel}
                  helperText={helperPai}
                  placeholder='Digite para buscar…'
                />
              )}
            />
          ) : null}

          <CustomTextField
            fullWidth
            label='Título'
            placeholder={placeholderTitulo}
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            autoFocus={!servicoEditavel}
          />
          {open ? (
            <AtividadeDescricaoEditor
              key='nova-atividade-descricao'
              value={descricao}
              modoFormulario
              compacto
              onChange={setDescricao}
            />
          ) : null}
          <div className={styles.novaDialogLinha}>
            <CustomTextField
              select
              fullWidth
              label='Prioridade'
              value={prioridade}
              onChange={e => setPrioridade(e.target.value as CatecAtividadePrioridade)}
              slotProps={{
                select: {
                  MenuProps: {
                    disableScrollLock: true
                  },
                  renderValue: value => {
                    const key = value as CatecAtividadePrioridade

                    return (
                      <span className='inline-flex items-center gap-2'>
                        <i className={`${prioridadeIcone(key)} text-base ${prioridadeCorClass(key)}`} />
                        {PRIORIDADE_ATIVIDADE_ROTULO[key]}
                      </span>
                    )
                  }
                }
              }}
            >
              {(Object.keys(PRIORIDADE_ATIVIDADE_ROTULO) as CatecAtividadePrioridade[]).map(key => (
                <MenuItem key={key} value={key}>
                  <span className='inline-flex items-center gap-2'>
                    <i className={`${prioridadeIcone(key)} text-lg ${prioridadeCorClass(key)}`} />
                    {PRIORIDADE_ATIVIDADE_ROTULO[key]}
                  </span>
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              fullWidth
              label='Prazo'
              type='date'
              value={prazo}
              onChange={e => setPrazo(e.target.value)}
              className={styles.novaDialogPrazo}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: servicoSelecionado?.previsaoConclusaoEm
                  ? {
                      max: dataCivilSp(servicoSelecionado.previsaoConclusaoEm)
                    }
                  : undefined
              }}
              helperText={
                servicoSelecionado?.previsaoConclusaoEm
                  ? `Até a previsão do servico (${dataCivilSp(servicoSelecionado.previsaoConclusaoEm).split('-').reverse().join('/')})`
                  : undefined
              }
            />
          </div>
        </DialogContent>
        <DialogActions className={styles.novaDialogActions}>
          <Button onClick={onClose} color='secondary' disabled={salvando}>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={salvando}>
            Criar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AtividadeNovaDialog
