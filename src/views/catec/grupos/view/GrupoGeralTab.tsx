'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import { toast } from 'react-toastify'

import type { CatecGrupo } from '@/types/catec/grupoTypes'

import CustomTextField from '@core/components/mui/TextField'

import GrupoExcluirDialog from '../GrupoExcluirDialog'

type Props = {
  grupo: CatecGrupo
  onSave: (patch: Partial<CatecGrupo>) => Promise<void>
  onExcluir: () => Promise<void>
}

const GrupoGeralTab = ({ grupo, onSave, onExcluir }: Props) => {
  const [nome, setNome] = useState(grupo.nome)
  const [descricao, setDescricao] = useState(grupo.descricao ?? '')
  const [ativo, setAtivo] = useState(grupo.ativo)
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [confirmarExcluir, setConfirmarExcluir] = useState(false)

  useEffect(() => {
    setNome(grupo.nome)
    setDescricao(grupo.descricao ?? '')
    setAtivo(grupo.ativo)
  }, [grupo])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome.trim()) {
      toast.error('Informe o nome do grupo.')

      return
    }

    setSalvando(true)

    try {
      await onSave({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        ativo
      })
      toast.success('Dados do grupo atualizados.')
    } catch {
      /* erro exibido pelo pai */
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir() {
    setExcluindo(true)

    try {
      await onExcluir()
      setConfirmarExcluir(false)
    } catch {
      /* erro exibido pelo pai */
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader title='Identificação' />
        <CardContent>
          <form onSubmit={e => void handleSubmit(e)}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField fullWidth label='Nome' value={nome} onChange={e => setNome(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField fullWidth label='Código' value={grupo.codigo} disabled />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Descrição'
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Switch checked={ativo} onChange={e => setAtivo(e.target.checked)} />}
                  label='Grupo ativo'
                />
              </Grid>
              <Grid size={{ xs: 12 }} className='flex flex-wrap items-center justify-between gap-4'>
                <Button variant='contained' type='submit' disabled={salvando || excluindo}>
                  {salvando ? 'Salvando…' : 'Salvar alterações'}
                </Button>
                {!grupo.sistema ? (
                  <Button
                    variant='tonal'
                    color='error'
                    type='button'
                    onClick={() => setConfirmarExcluir(true)}
                    disabled={salvando || excluindo}
                  >
                    Excluir grupo
                  </Button>
                ) : null}
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <GrupoExcluirDialog
        open={confirmarExcluir}
        loading={excluindo}
        onClose={() => setConfirmarExcluir(false)}
        onConfirm={() => void handleExcluir()}
      />
    </>
  )
}

export default GrupoGeralTab
