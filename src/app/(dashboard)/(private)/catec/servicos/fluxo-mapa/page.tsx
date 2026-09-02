import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import ServicoFluxoMapa from '@views/catec/servicos/fluxo/ServicoFluxoMapa'

export const metadata: Metadata = {
  title: 'Mapa do fluxo — CATEC',
  description: 'Revisão visual do fluxo completo do serviço'
}

const CatecServicoFluxoMapaPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_SERVICOS} title='Mapa do fluxo'>
      <ServicoFluxoMapa />
    </RequireCatecPermission>
  )
}

export default CatecServicoFluxoMapaPage
