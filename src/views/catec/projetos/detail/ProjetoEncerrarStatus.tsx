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
import type { CatecProjeto, CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { STATUS_PROJETO_ROTULO } from '@/types/catec/projetoTypes'

import { useProjetosStore } from '../useProjetosStore'

type Props = {
  projeto: CatecProjeto
  onStatusAlterado?: () => Promise<void>
}

type StatusDestino = Extract<CatecProjetoStatus, 'EM_EXECUCAO' | 'CANCELADO' | 'FINALIZADO'>

const OPCOES_POR_STATUS: Record<
  Extract<CatecProjetoStatus, 'AGUARDANDO_EXECUCAO' | 'EM_EXECUCAO'>,
  Array<{
    status: StatusDestino
    label: string
    confirmColor: 'primary' | 'success' | 'error'
  }>
> = {
  AGUARDANDO_EXECUCAO: [
    { status: 'EM_EXECUCAO', label: 'Marcar como em execução', confirmColor: 'primary' },
    { status: 'FINALIZADO', label: 'Marcar como finalizado', confirmColor: 'success' },
    { status: 'CANCELADO', label: 'Marcar como cancelado', confirmColor: 'error' }
  ],
  EM_EXECUCAO: [
    { status: 'FINALIZADO', label: 'Marcar como finalizado', confirmColor: 'success' },
    { status: 'CANCELADO', label: 'Marcar como cancelado', confirmColor: 'error' }
  ]
}

function isStatusComBotao(status: CatecProjetoStatus): status is keyof typeof OPCOES_POR_STATUS {
  return status === 'AGUARDANDO_EXECUCAO' || status === 'EM_EXECUCAO'
}

const ProjetoEncerrarStatus = ({ projeto, onStatusAlterado }: Props) => {
  const { hasAnyPermission } = useCatecPermission()
  const { atualizarStatusProjeto } = useProjetosStore()

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [statusPendente, setStatusPendente] = useState<StatusDestino | null>(null)
  const [processando, setProcessando] = useState(false)

  const temPermissao = hasAnyPermission([
    PermissaoCodigo.ACAO_CLIENTE_CRIAR,
    PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR
  ])
  const podeAlterarStatus =
    temPermissao && isStatusComBotao(projeto.status)

  if (!podeAlterarStatus) return null

  const opcoesDisponiveis = OPCOES_POR_STATUS[projeto.status]
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
      await atualizarStatusProjeto(projeto.id, statusPendente)
      await onStatusAlterado?.()
      toast.success(`Projeto ${STATUS_PROJETO_ROTULO[statusPendente].toLowerCase()}.`)
      setStatusPendente(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível alterar o status do projeto.')
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
            Deseja marcar o projeto <strong>{projeto.titulo}</strong> como{' '}
            <strong>{statusPendente ? STATUS_PROJETO_ROTULO[statusPendente].toLowerCase() : ''}</strong>?
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

export default ProjetoEncerrarStatus
