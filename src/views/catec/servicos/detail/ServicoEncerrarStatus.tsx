'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import type { CatecContratoStatus, CatecPropostaStatus } from '@/types/catec/servicoFluxoTypes'
import type { CatecServico, CatecServicoStatus } from '@/types/catec/servicoTypes'
import { STATUS_SERVICO_ROTULO } from '@/types/catec/servicoTypes'

import { useServicosStore } from '../useServicosStore'

type Props = {
  servico: CatecServico
  propostaStatus?: CatecPropostaStatus | null
  contratoStatus?: CatecContratoStatus | null
  onStatusAlterado?: () => Promise<void>
}

type StatusDestino = Extract<CatecServicoStatus, 'EM_EXECUCAO' | 'CANCELADO' | 'FINALIZADO'>

type OpcaoStatus = {
  status: StatusDestino
  label: string
  confirmColor: 'primary' | 'success' | 'error'
}

const OPCAO_CANCELADO: OpcaoStatus = {
  status: 'CANCELADO',
  label: 'Marcar como cancelado',
  confirmColor: 'error'
}

const OPCOES_POR_STATUS: Record<Extract<CatecServicoStatus, 'AGUARDANDO_EXECUCAO' | 'EM_EXECUCAO'>, OpcaoStatus[]> = {
  AGUARDANDO_EXECUCAO: [
    { status: 'EM_EXECUCAO', label: 'Marcar como em execução', confirmColor: 'primary' },
    { status: 'FINALIZADO', label: 'Marcar como finalizado', confirmColor: 'success' },
    OPCAO_CANCELADO
  ],
  EM_EXECUCAO: [
    { status: 'FINALIZADO', label: 'Marcar como finalizado', confirmColor: 'success' },
    OPCAO_CANCELADO
  ]
}

function isStatusComBotao(status: CatecServicoStatus): status is keyof typeof OPCOES_POR_STATUS {
  return status === 'AGUARDANDO_EXECUCAO' || status === 'EM_EXECUCAO'
}

function opcoesPara(
  servico: CatecServico,
  propostaStatus?: CatecPropostaStatus | null,
  contratoStatus?: CatecContratoStatus | null
): OpcaoStatus[] {
  if (isStatusComBotao(servico.status)) {
    return OPCOES_POR_STATUS[servico.status]
  }

  const recusaPendente = propostaStatus === 'NEGADA' || contratoStatus === 'RECUSADO'
  const servicoAberto = servico.status !== 'CANCELADO' && servico.status !== 'FINALIZADO'

  if (recusaPendente && servicoAberto) {
    return [OPCAO_CANCELADO]
  }

  return []
}

const ServicoEncerrarStatus = ({ servico, propostaStatus, contratoStatus, onStatusAlterado }: Props) => {
  const { hasAnyPermission } = useCatecPermission()
  const { atualizarStatusServico } = useServicosStore()

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [statusPendente, setStatusPendente] = useState<StatusDestino | null>(null)
  const [processando, setProcessando] = useState(false)

  const temPermissao = hasAnyPermission([
    PermissaoCodigo.ACAO_CLIENTE_CRIAR,
    PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR
  ])

  const opcoesDisponiveis = opcoesPara(servico, propostaStatus, contratoStatus)
  const podeAlterarStatus = temPermissao && opcoesDisponiveis.length > 0

  if (!podeAlterarStatus) return null

  const opcaoPendente = opcoesDisponiveis.find(opcao => opcao.status === statusPendente)

  function abrirConfirmacao(status: StatusDestino) {
    setMenuAnchor(null)
    setStatusPendente(status)
  }

  function fecharConfirmacao() {
    if (processando) return

    setStatusPendente(null)
  }

  async function confirmarAlteracao() {
    if (!statusPendente) return

    setProcessando(true)

    try {
      await atualizarStatusServico(servico.id, statusPendente)
      await onStatusAlterado?.()
      toast.success(`Servico ${STATUS_SERVICO_ROTULO[statusPendente].toLowerCase()}.`)
      setStatusPendente(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível alterar o status do servico.')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <>
      <Button
        variant='outlined'
        color='primary'
        size='small'
        endIcon={<i className='tabler-chevron-down' />}
        onClick={event => setMenuAnchor(event.currentTarget)}
      >
        Alterar status
      </Button>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {opcoesDisponiveis.map(opcao => (
          <MenuItem key={opcao.status} onClick={() => abrirConfirmacao(opcao.status)}>
            {opcao.label}
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={statusPendente != null} onClose={fecharConfirmacao} fullWidth maxWidth='xs'>
        <DialogTitle>Confirmar alteração de status</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja marcar o servico <strong>{servico.titulo}</strong> como{' '}
            <strong>{statusPendente ? STATUS_SERVICO_ROTULO[statusPendente].toLowerCase() : ''}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={fecharConfirmacao} disabled={processando}>
            Voltar
          </Button>
          <Button
            variant='contained'
            color={opcaoPendente?.confirmColor ?? 'primary'}
            onClick={() => void confirmarAlteracao()}
            disabled={processando}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ServicoEncerrarStatus
