/** Códigos de permissão (espelham backend `PermissaoCodigo`). */
export const PermissaoCodigo = {
  TELA_PAINEL: 'tela.painel',
  TELA_SERVICOS: 'tela.servicos',
  TELA_SERVICO_DETALHE: 'tela.servico.detalhe',
  TELA_ATIVIDADES: 'tela.atividades',
  TELA_CLIENTES: 'tela.clientes',
  TELA_USUARIOS: 'tela.usuarios',
  TELA_SOCIO_PROPOSTAS: 'tela.socio.propostas',
  TELA_GRUPOS: 'tela.grupos',
  TELA_CONFIG_ASSINATURA: 'tela.config.assinatura',

  ACAO_ATIVIDADE_CRIAR: 'acao.atividade.criar',
  ACAO_ATIVIDADE_EDITAR: 'acao.atividade.editar',
  ACAO_ATIVIDADE_MOVER_STATUS: 'acao.atividade.mover_status',
  ACAO_ATIVIDADE_EXCLUIR: 'acao.atividade.excluir',

  ACAO_SERVICO_CRIAR: 'acao.servico.criar',
  ACAO_SERVICO_EDITAR: 'acao.servico.editar',
  ACAO_SERVICO_ASSOCIAR_CLIENTE: 'acao.servico.associar_cliente',
  ACAO_SERVICO_LISTAR_TODOS: 'acao.servico.listar_todos',
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
  ACAO_CONTRATO_ASSINATURA_ENVIAR: 'acao.contrato.assinatura_enviar',
  ACAO_DOCUMENTO_UPLOAD: 'acao.documento.upload',
  ACAO_INTERACAO_REGISTRAR: 'acao.interacao.registrar',
  ACAO_GRUPO_GERIR: 'acao.grupo.gerir',
  ACAO_CONFIG_ASSINATURA_GERIR: 'acao.config.assinatura.gerir'
} as const

export type PermissaoCodigoValor = (typeof PermissaoCodigo)[keyof typeof PermissaoCodigo]
