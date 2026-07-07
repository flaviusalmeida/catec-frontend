// Next Imports
import type { Metadata } from 'next'

// Component Imports
import CatecLogin from '@views/catec/auth/Login'

export const metadata: Metadata = {
  title: 'Entrar — CATEC',
  description: 'Login no sistema CATEC'
}

const LoginPage = () => {
  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] p-6'>
      <CatecLogin />
    </div>
  )
}

export default LoginPage
