'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import { getSession, signIn } from 'next-auth/react'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getCatecHomeUrl, getPostAuthDestination } from '@/utils/catec/authPaths'

// Styled Component Imports
import AuthIllustrationWrapper from '@views/pages/auth/AuthIllustrationWrapper'

const CatecLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const emailTrim = email.trim()

    if (!emailTrim) {
      setError('Informe o e-mail.')

      return
    }

    if (!password) {
      setError('Informe a senha.')

      return
    }

    setLoading(true)

    const res = await signIn('credentials', {
      email: emailTrim,
      password,
      redirect: false
    })

    setLoading(false)

    if (res?.ok && !res.error) {
      const session = await getSession()
      const redirectURL = searchParams.get('redirectTo') ?? getCatecHomeUrl()

      if (session) {
        router.replace(getPostAuthDestination(session, redirectURL))

        return
      }

      router.replace(redirectURL)

      return
    }

    if (res?.error) {
      try {
        const parsed = JSON.parse(res.error) as { message?: string[]; mensagem?: string }

        setError(parsed.mensagem ?? parsed.message?.[0] ?? 'Não foi possível entrar. Verifique e-mail e senha.')
      } catch {
        setError('Não foi possível entrar. Verifique e-mail e senha.')
      }

      return
    }

    setError('Não foi possível entrar. Verifique e-mail e senha.')
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

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              label='E-mail'
              type='email'
              placeholder='seu@email.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />

            <CustomTextField
              fullWidth
              label='Senha'
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        disabled={loading}
                      >
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            {error ? (
              <Alert severity='error' variant='outlined'>
                {error}
              </Alert>
            ) : null}

            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'A entrar…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default CatecLogin
