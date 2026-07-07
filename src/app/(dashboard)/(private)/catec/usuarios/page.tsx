import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import Usuario2List from '@views/catec/usuarios/list'

export const metadata: Metadata = {
  title: 'Usuários — CATEC',
  description: 'Gestão de usuários CATEC'
}

const CatecUsuariosPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_USUARIOS} title='Usuários'>
      <Usuario2List />
    </RequireCatecPermission>
  )
}

export default CatecUsuariosPage
