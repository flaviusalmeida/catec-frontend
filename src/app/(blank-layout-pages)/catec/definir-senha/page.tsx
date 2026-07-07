import type { Metadata } from 'next'

import DefinirSenha from '@views/catec/auth/DefinirSenha'

export const metadata: Metadata = {
  title: 'Definir senha — CATEC',
  description: 'Definir nova senha de acesso ao CATEC'
}

const DefinirSenhaPage = () => {
  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] p-6'>
      <DefinirSenha />
    </div>
  )
}

export default DefinirSenhaPage
