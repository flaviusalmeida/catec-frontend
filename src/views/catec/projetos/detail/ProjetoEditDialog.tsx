'use client'

import { useEffect, useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { toast } from 'react-toastify'

import type { CatecCliente } from '@/types/catec/clienteTypes'
import type { CatecProjeto } from '@/types/catec/projetoTypes'

import CustomAutocomplete from '@core/components/mui/Autocomplete'
import CustomTextField from '@core/components/mui/TextField'

import { useClientesStore } from '../../clientes/useClientesStore'
import { useProjetosStore } from '../useProjetosStore'

type Props = {
  projeto: CatecProjeto
  open: boolean
  onClose: () => void
  onSalvo?: () => Promise<void>
  podeAlterarCliente: boolean
}

const ProjetoEditDialog = ({ projeto, open, onClose, onSalvo, podeAlterarCliente }: Props) => {
  const { lista: clientes } = useClientesStore()
  const { updateProjeto, associarCliente } = useProjetosStore()

  const pendenteCliente = projeto.status === 'PENDENTE_CLIENTE'

  const clienteAtual = useMemo(
    () => clientes.find(c => c.id === projeto.clienteId) ?? null,
    [clientes, projeto.clienteId]
  )

  const [clienteSelecionado, setClienteSelecionado] = useState<CatecCliente | null>(null)
  const [titulo, setTitulo] = useState('')
  const [escopo, setEscopo] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return

    setClienteSelecionado(clienteAtual)
    setTitulo(projeto.titulo)
    setEscopo(projeto.escopo)
  }, [open, projeto, clienteAtual])

  function handleClose() {
    if (salvando) return

    onClose()
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
      clienteSelecionado.id !== projeto.clienteId &&
      !clienteSelecionado.email?.trim() &&
      !clienteSelecionado.responsaveis[0]?.email?.trim()
    ) {
      toast.error('O cliente selecionado precisa ter e-mail cadastrado.')

      return
    }

    setSalvando(true)

    try {
      const tituloAlterado = tituloTrim !== projeto.titulo
      const escopoAlterado = escopoTrim !== projeto.escopo

      if (pendenteCliente) {
        // Demanda pendente: primeiro associa o cliente (muda o status), depois ajusta título/escopo se necessário.
        await associarCliente(projeto.id, clienteSelecionado!.id)

        if (tituloAlterado || escopoAlterado) {
          await updateProjeto(projeto.id, { titulo: tituloTrim, escopo: escopoTrim })
        }
      } else {
        const clienteAlterado =
          podeAlterarCliente && clienteSelecionado != null && clienteSelecionado.id !== projeto.clienteId

        if (!tituloAlterado && !escopoAlterado && !clienteAlterado) {
          toast.info('Nenhuma alteração para salvar.')
          setSalvando(false)

          return
        }

        await updateProjeto(projeto.id, {
          titulo: tituloTrim,
          escopo: escopoTrim,
          ...(clienteAlterado ? { clienteId: clienteSelecionado!.id } : {})
        })
      }

      toast.success('Projeto atualizado com sucesso.')
      await onSalvo?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar o projeto.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Editar projeto</DialogTitle>
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
                    ? 'Você não tem permissão para alterar o cliente deste projeto.'
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
        <DialogActions>
          <Button variant='tonal' color='secondary' type='button' onClick={handleClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button variant='contained' type='submit' disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProjetoEditDialog
