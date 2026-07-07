'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useSession } from 'next-auth/react'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Lib Imports
import { trocarSenhaCatec } from '@/libs/catecAuthApi'

// Util Imports
import { getCatecHomeUrl } from '@/utils/catec/authPaths'

// Styled Component Imports
import AuthIllustrationWrapper from '@views/pages/auth/AuthIllustrationWrapper'

const DefinirSenha = () => {
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { update } = useSession()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (senha !== confirmacao) {
      setError('As senhas não coincidem.')

      return
    }

    setLoading(true)

    try {
      const login = await trocarSenhaCatec(senha)

      await update({ accessToken: login.accessToken })

      router.replace(getCatecHomeUrl())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível contatar o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <div className='flex justify-center mbe-6'>
            <Image
              src='/images/logo-catec.png'
              alt='CATEC — Assessoria em engenharia'
              width={200}
              height={112}
              priority
              className='object-contain'
            />
          </div>

          <Typography variant='h5' className='mbe-2'>
            Definir senha
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mbe-6'>
            Escolha uma senha forte: pelo menos 8 caracteres, com maiúsculas, minúsculas, um dígito e um símbolo.
          </Typography>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Nova senha'
              type='password'
              value={senha}
              onChange={e => setSenha(e.target.value)}
              disabled={loading}
              slotProps={{ htmlInput: { minLength: 8 } }}
            />

            <CustomTextField
              fullWidth
              label='Confirmar senha'
              type='password'
              value={confirmacao}
              onChange={e => setConfirmacao(e.target.value)}
              disabled={loading}
              slotProps={{ htmlInput: { minLength: 8 } }}
            />

            {error ? (
              <Alert severity='error' variant='outlined'>
                {error}
              </Alert>
            ) : null}

            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar e continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default DefinirSenha
