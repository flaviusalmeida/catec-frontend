import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import SocioPropostaList from '@views/catec/socio/propostas'

export const metadata: Metadata = {
  title: 'Propostas pendentes — CATEC',
  description: 'Fila de propostas comerciais aguardando parecer do sócio'
}

const CatecSocioPropostasPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_SOCIO_PROPOSTAS} title='Propostas pendentes'>
      <SocioPropostaList />
    </RequireCatecPermission>
  )
}

export default CatecSocioPropostasPage
