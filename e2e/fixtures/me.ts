/** Permissões do grupo ADMINISTRATIVO (espelha seed V27). */
export const permissoesAdministrativo = [
  'tela.painel',
  'tela.projetos',
  'tela.projeto.detalhe',
  'tela.clientes',
  'tela.usuarios',
  'tela.socio.propostas',
  'tela.grupos',
  'acao.projeto.criar',
  'acao.projeto.editar',
  'acao.projeto.associar_cliente',
  'acao.projeto.listar_todos',
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
