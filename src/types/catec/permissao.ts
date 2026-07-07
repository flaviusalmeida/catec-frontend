/** Códigos de permissão (espelham backend `PermissaoCodigo`). */
export const PermissaoCodigo = {
  TELA_PAINEL: 'tela.painel',
  TELA_PROJETOS: 'tela.projetos',
  TELA_PROJETO_DETALHE: 'tela.projeto.detalhe',
  TELA_CLIENTES: 'tela.clientes',
  TELA_USUARIOS: 'tela.usuarios',
  TELA_SOCIO_PROPOSTAS: 'tela.socio.propostas',
  TELA_GRUPOS: 'tela.grupos',

  ACAO_PROJETO_CRIAR: 'acao.projeto.criar',
  ACAO_PROJETO_EDITAR: 'acao.projeto.editar',
  ACAO_PROJETO_ASSOCIAR_CLIENTE: 'acao.projeto.associar_cliente',
  ACAO_PROJETO_LISTAR_TODOS: 'acao.projeto.listar_todos',
  ACAO_CLIENTE_CRIAR: 'acao.cliente.criar',
  ACAO_CLIENTE_EDITAR: 'acao.cliente.editar',
  ACAO_CLIENTE_EXCLUIR: 'acao.cliente.excluir',
  ACAO_USUARIO_GERIR: 'acao.usuario.gerir',
  ACAO_USUARIO_REDEFINIR_SENHA: 'acao.usuario.redefinir_senha',
  ACAO_PROPOSTA_CRIAR: 'acao.proposta.criar',
  ACAO_PROPOSTA_EDITAR: 'acao.proposta.editar',
  ACAO_PROPOSTA_ENVIAR_CLIENTE: 'acao.proposta.enviar_cliente',
  ACAO_SOCIO_PROPOSTA_APROVAR: 'acao.socio.proposta.aprovar',
  ACAO_SOCIO_PROPOSTA_DEVOLVER: 'acao.socio.proposta.devolver',
  ACAO_CONTRATO_CRIAR: 'acao.contrato.criar',
  ACAO_CONTRATO_ENVIAR: 'acao.contrato.enviar',
  ACAO_DOCUMENTO_UPLOAD: 'acao.documento.upload',
  ACAO_INTERACAO_REGISTRAR: 'acao.interacao.registrar',
  ACAO_GRUPO_GERIR: 'acao.grupo.gerir'
} as const

export type PermissaoCodigoValor = (typeof PermissaoCodigo)[keyof typeof PermissaoCodigo]
