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

import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'

import CustomTextField from '@core/components/mui/TextField'

import UsuarioResetSenhaDialog from '../UsuarioResetSenhaDialog'

type Props = {
  usuario: CatecAdminUsuario
  onSave: (patch: Pick<CatecAdminUsuario, 'nome' | 'email' | 'telefone' | 'ativo'>) => Promise<void>
  onResetSenha: () => Promise<void>
}

const Usuario2DadosTab = ({ usuario, onSave, onResetSenha }: Props) => {
  const [nome, setNome] = useState(usuario.nome)
  const [email, setEmail] = useState(usuario.email)
  const [telefone, setTelefone] = useState(usuario.telefone ?? '')
  const [ativo, setAtivo] = useState(usuario.ativo)
  const [salvando, setSalvando] = useState(false)
  const [confirmarReset, setConfirmarReset] = useState(false)
  const [resetando, setResetando] = useState(false)

  const contaPendente = usuario.requerTrocaSenha

  useEffect(() => {
    setNome(usuario.nome)
    setEmail(usuario.email)
    setTelefone(usuario.telefone ?? '')
    setAtivo(usuario.ativo)
  }, [usuario])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome.trim() || !email.trim()) {
      toast.error('Informe nome e e-mail.')

      return
    }

    setSalvando(true)

    try {
      await onSave({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim() || null,
        ativo: contaPendente ? usuario.ativo : ativo
      })
      toast.success('Dados atualizados.')
    } catch {
      /* erro exibido pelo pai */
    } finally {
      setSalvando(false)
    }
  }

  async function handleResetSenha() {
    setResetando(true)

    try {
      await onResetSenha()
      setAtivo(false)
      setConfirmarReset(false)
      toast.success('Nova senha provisória enviada por e-mail.')
    } catch {
      /* erro exibido pelo pai */
    } finally {
      setResetando(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader title='Dados do usuário' />
        <CardContent>
          <form onSubmit={e => void handleSubmit(e)}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField fullWidth label='Nome' value={nome} onChange={e => setNome(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  type='email'
                  label='E-mail'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Telefone'
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                />
              </Grid>

              {!contaPendente ? (
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={<Switch checked={ativo} onChange={e => setAtivo(e.target.checked)} />}
                    label='Conta ativa'
                  />
                </Grid>
              ) : null}

              <Grid size={{ xs: 12 }} className='flex flex-wrap items-center justify-between gap-4'>
                <Button variant='contained' type='submit' disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar alterações'}
                </Button>
                {!contaPendente && ativo ? (
                  <Button variant='tonal' color='warning' type='button' onClick={() => setConfirmarReset(true)}>
                    Redefinir senha
                  </Button>
                ) : null}
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <UsuarioResetSenhaDialog
        open={confirmarReset}
        loading={resetando}
        onClose={() => setConfirmarReset(false)}
        onConfirm={() => void handleResetSenha()}
      />
    </>
  )
}

export default Usuario2DadosTab
