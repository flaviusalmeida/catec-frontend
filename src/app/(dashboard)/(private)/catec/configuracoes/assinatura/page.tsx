import type { Metadata } from 'next'

import RequireCatecPermission from '@/components/catec/RequireCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'
import AssinaturaConfigView from '@/views/catec/configuracoes/assinatura/AssinaturaConfigView'

export const metadata: Metadata = {
  title: 'Assinatura eletrônica — CATEC',
  description: 'Configuração do fluxo de assinatura eletrônica'
}

const CatecAssinaturaConfigPage = () => {
  return (
    <RequireCatecPermission code={PermissaoCodigo.TELA_CONFIG_ASSINATURA} title='Assinatura eletrônica'>
      <AssinaturaConfigView />
    </RequireCatecPermission>
  )
}

export default CatecAssinaturaConfigPage
