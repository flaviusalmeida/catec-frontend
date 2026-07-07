'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { grupoToForm, type CatecGrupo, type CatecGrupoFormState, type CatecPermissaoCatalogo } from '@/types/catec/grupoTypes'


import CustomTextField from '@core/components/mui/TextField'

import GrupoPermissoesPanel from './GrupoPermissoesPanel'

type Props = {
  grupo: CatecGrupo
  catalogo: CatecPermissaoCatalogo[]
  onSave: (permissoes: string[]) => Promise<void>
}

const GrupoPermissoesTab = ({ grupo, catalogo, onSave }: Props) => {
  const [form, setForm] = useState<CatecGrupoFormState>(() => grupoToForm(grupo))
  const [filtro, setFiltro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const totalCatalogo = catalogo.length

  useEffect(() => {
    setForm(grupoToForm(grupo))
  }, [grupo])

  function togglePermissao(codigo: string) {
    setForm(f => {
      const next = new Set(f.permissoes)

      if (next.has(codigo)) next.delete(codigo)
      else next.add(codigo)

      return { ...f, permissoes: next }
    })
  }

  function toggleModulo(codigos: string[], marcar: boolean) {
    setForm(f => {
      const next = new Set(f.permissoes)

      for (const codigo of codigos) {
        if (marcar) next.add(codigo)
        else next.delete(codigo)
      }

      return { ...f, permissoes: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (form.permissoes.size === 0) {
      toast.error('Selecione pelo menos uma permissão.')

      return
    }

    setSalvando(true)

    try {
      await onSave([...form.permissoes])
      toast.success('Permissões atualizadas.')
    } catch {
      /* erro exibido pelo pai */
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={e => void handleSubmit(e)} className='flex flex-col gap-4'>
      <Card>
        <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CustomTextField
            fullWidth
            label='Buscar permissão'
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder='Nome, código ou módulo'
            className='max-is-full sm:max-is-[320px]'
          />
          <Typography color='text.secondary'>
            {form.permissoes.size} de {totalCatalogo} permissões selecionadas
          </Typography>
        </CardContent>
      </Card>

      <GrupoPermissoesPanel
        catalogo={catalogo}
        form={form}
        filtro={filtro}
        disabled={salvando}
        onToggle={togglePermissao}
        onToggleModulo={toggleModulo}
      />

      <div>
        <Button variant='contained' type='submit' disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}

export default GrupoPermissoesTab
