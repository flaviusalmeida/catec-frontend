'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecCliente } from '@/types/catec/clienteTypes'
import type { CatecServico } from '@/types/catec/servicoTypes'

import CustomAutocomplete from '@core/components/mui/Autocomplete'
import CustomTextField from '@core/components/mui/TextField'

import { useClientesStore } from '../../clientes/useClientesStore'
import { useServicosStore } from '../useServicosStore'

type Props = {
  servico: CatecServico
  open: boolean
  onClose: () => void
  onSalvo?: () => Promise<void>
  podeAlterarCliente: boolean
}

const ServicoEditDialog = ({ servico, open, onClose, onSalvo, podeAlterarCliente }: Props) => {
  const router = useRouter()
  const { lista: clientes } = useClientesStore()
  const { updateServico, associarCliente, removeServico } = useServicosStore()

  const pendenteCliente = servico.status === 'PENDENTE_CLIENTE'

  const clienteAtual = useMemo(
    () => clientes.find(c => c.id === servico.clienteId) ?? null,
    [clientes, servico.clienteId]
  )

  const [clienteSelecionado, setClienteSelecionado] = useState<CatecCliente | null>(null)
  const [titulo, setTitulo] = useState('')
  const [escopo, setEscopo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    if (!open) return

    setClienteSelecionado(clienteAtual)
    setTitulo(servico.titulo)
    setEscopo(servico.escopo)
    setConfirmandoExclusao(false)
  }, [open, servico, clienteAtual])

  function handleClose() {
    if (salvando || excluindo) return

    onClose()
  }

  async function handleExcluir() {
    setExcluindo(true)

    try {
      await removeServico(servico.id)
      toast.success('Servico excluído.')
      router.push('/catec/servicos')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível excluir o servico.')
      setExcluindo(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const tituloTrim = titulo.trim()
    const escopoTrim = escopo.trim()

    if (!tituloTrim || !escopoTrim) {
      toast.error('Preencha título e descrição.')

      return
    }

    if (pendenteCliente && !clienteSelecionado) {
      toast.error('Selecione um cliente para associar à demanda.')

      return
    }

    if (
      clienteSelecionado &&
      clienteSelecionado.id !== servico.clienteId &&
      !clienteSelecionado.email?.trim() &&
      !clienteSelecionado.responsaveis[0]?.email?.trim()
    ) {
      toast.error('O cliente selecionado precisa ter e-mail cadastrado.')

      return
    }

    setSalvando(true)

    try {
      const tituloAlterado = tituloTrim !== servico.titulo
      const escopoAlterado = escopoTrim !== servico.escopo

      if (pendenteCliente) {
        // Demanda pendente: primeiro associa o cliente (muda o status), depois ajusta título/escopo se necessário.
        await associarCliente(servico.id, clienteSelecionado!.id)

        if (tituloAlterado || escopoAlterado) {
          await updateServico(servico.id, { titulo: tituloTrim, escopo: escopoTrim })
        }
      } else {
        const clienteAlterado =
          podeAlterarCliente && clienteSelecionado != null && clienteSelecionado.id !== servico.clienteId

        if (!tituloAlterado && !escopoAlterado && !clienteAlterado) {
          toast.info('Nenhuma alteração para salvar.')
          setSalvando(false)

          return
        }

        await updateServico(servico.id, {
          titulo: tituloTrim,
          escopo: escopoTrim,
          ...(clienteAlterado ? { clienteId: clienteSelecionado!.id } : {})
        })
      }

      toast.success('Servico atualizado com sucesso.')
      await onSalvo?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar o servico.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
    <Dialog open={open && !confirmandoExclusao} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Editar servico</DialogTitle>
      <form onSubmit={e => void handleSubmit(e)}>
        <DialogContent className='flex flex-col gap-6'>
          <CustomAutocomplete
            fullWidth
            options={clientes}
            value={clienteSelecionado}
            onChange={(_, value) => setClienteSelecionado(value)}
            getOptionLabel={option => option.razaoSocialOuNome}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options, { inputValue }) => {
              const query = inputValue.trim().toLowerCase()

              if (!query) return options

              return options.filter(cliente => {
                const nome = cliente.razaoSocialOuNome.toLowerCase()
                const fantasia = cliente.nomeFantasia?.toLowerCase() ?? ''
                const documento = cliente.documento?.replace(/\D/g, '') ?? ''
                const queryDigits = query.replace(/\D/g, '')

                return (
                  nome.includes(query) ||
                  fantasia.includes(query) ||
                  (queryDigits.length > 0 && documento.includes(queryDigits))
                )
              })
            }}
            disabled={salvando || (!pendenteCliente && !podeAlterarCliente)}
            noOptionsText='Nenhum cliente encontrado'
            renderInput={params => (
              <CustomTextField
                {...params}
                label='Cliente'
                placeholder='Digite para buscar…'
                helperText={
                  !pendenteCliente && !podeAlterarCliente
                    ? 'Você não tem permissão para alterar o cliente deste servico.'
                    : undefined
                }
              />
            )}
          />

          <CustomTextField
            fullWidth
            label='Título'
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            disabled={salvando}
          />

          <CustomTextField
            fullWidth
            multiline
            rows={4}
            label='Descrição'
            value={escopo}
            onChange={e => setEscopo(e.target.value)}
            disabled={salvando}
          />
        </DialogContent>
        <DialogActions className='justify-between'>
          <Button
            variant='tonal'
            color='error'
            type='button'
            onClick={() => setConfirmandoExclusao(true)}
            disabled={salvando}
            startIcon={<i className='tabler-trash' />}
          >
            Excluir
          </Button>
          <div className='flex gap-4'>
            <Button variant='tonal' color='secondary' type='button' onClick={handleClose} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant='contained' type='submit' disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </DialogActions>
      </form>
    </Dialog>

    <Dialog
      open={open && confirmandoExclusao}
      onClose={() => !excluindo && setConfirmandoExclusao(false)}
      fullWidth
      maxWidth='xs'
    >
      <DialogTitle>Excluir servico</DialogTitle>
      <DialogContent>
        <Typography>
          Deseja excluir o servico <strong>{servico.titulo}</strong>? Ele deixará de aparecer nas listagens e nas
          métricas do painel.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant='tonal'
          color='secondary'
          onClick={() => setConfirmandoExclusao(false)}
          disabled={excluindo}
        >
          Voltar
        </Button>
        <Button variant='contained' color='error' onClick={() => void handleExcluir()} disabled={excluindo}>
          {excluindo ? 'Excluindo…' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default ServicoEditDialog
