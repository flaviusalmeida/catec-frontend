/** Permissões do grupo ADMINISTRATIVO (espelha seed V27). */
export const permissoesAdministrativo = [
  'tela.painel',
  'tela.servicos',
  'tela.servico.detalhe',
  'tela.clientes',
  'tela.usuarios',
  'tela.socio.propostas',
  'tela.grupos',
  'acao.servico.criar',
  'acao.servico.editar',
  'acao.servico.associar_cliente',
  'acao.servico.listar_todos',
  'acao.cliente.criar',
  'acao.cliente.editar',
  'acao.cliente.excluir',
  'acao.usuario.gerir',
  'acao.usuario.redefinir_senha',
  'acao.proposta.criar',
  'acao.proposta.editar',
  'acao.proposta.enviar_cliente',
  'acao.socio.proposta.aprovar',
  'acao.socio.proposta.devolver',
  'acao.contrato.criar',
  'acao.contrato.enviar',
  'acao.documento.upload',
  'acao.interacao.registrar',
  'acao.grupo.gerir'
] as const

export type CatecMeFixture = {
  id: number
  nome: string
  email: string
  grupos: string[]
  permissoes: string[]
  ativo: boolean
  telefone: string | null
  requerTrocaSenha: boolean
}

export function meAdministrativo(overrides: Partial<CatecMeFixture> = {}): CatecMeFixture {
  return {
    id: 1,
    nome: 'Administrador',
    email: 'admin@catec.local',
    grupos: ['ADMINISTRATIVO'],
    permissoes: [...permissoesAdministrativo],
    ativo: true,
    telefone: null,
    requerTrocaSenha: false,
    ...overrides
  }
}
