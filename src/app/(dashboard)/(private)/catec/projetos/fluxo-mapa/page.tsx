import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import ProjetoFluxoMapa from '@views/catec/projetos/fluxo/ProjetoFluxoMapa'

export const metadata: Metadata = {
  title: 'Mapa do fluxo — CATEC',
  description: 'Revisão visual do fluxo completo do projeto'
}

const CatecProjetoFluxoMapaPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_PROJETOS} title='Mapa do fluxo'>
      <ProjetoFluxoMapa />
    </RequireCatecPermission>
  )
}

export default CatecProjetoFluxoMapaPage
