import type { CatecPermissaoCatalogo } from '@/types/catec/grupoTypes'

export const catecPermissoesCatalogo: CatecPermissaoCatalogo[] = [
  { id: 1, codigo: 'tela.painel', nome: 'Painel', tipo: 'TELA', modulo: 'painel', descricao: 'Acesso ao painel inicial.' },
  { id: 2, codigo: 'tela.servicos', nome: 'Servicos', tipo: 'TELA', modulo: 'servico', descricao: 'Listagem de servicos.' },
  {
    id: 3,
    codigo: 'tela.servico.detalhe',
    nome: 'Detalhe do servico',
    tipo: 'TELA',
    modulo: 'servico',
    descricao: 'Visualizar página de detalhe do servico.'
  },
  { id: 4, codigo: 'tela.clientes', nome: 'Clientes', tipo: 'TELA', modulo: 'cliente', descricao: 'Gestão de clientes.' },
  { id: 5, codigo: 'tela.usuarios', nome: 'Usuários', tipo: 'TELA', modulo: 'usuario', descricao: 'Gestão de usuários.' },
  { id: 6, codigo: 'tela.grupos', nome: 'Grupos', tipo: 'TELA', modulo: 'grupo', descricao: 'Gestão de grupos de acesso.' },
  {
    id: 7,
    codigo: 'acao.servico.criar',
    nome: 'Criar servico',
    tipo: 'ACAO',
    modulo: 'servico',
    descricao: 'Cadastrar novos servicos.'
  },
  {
    id: 8,
    codigo: 'acao.servico.editar',
    nome: 'Editar servico',
    tipo: 'ACAO',
    modulo: 'servico',
    descricao: 'Alterar dados do servico.'
  },
  {
    id: 9,
    codigo: 'acao.servico.associar_cliente',
    nome: 'Associar cliente',
    tipo: 'ACAO',
    modulo: 'servico',
    descricao: 'Vincular cliente ao servico.'
  },
  {
    id: 10,
    codigo: 'acao.servico.listar_todos',
    nome: 'Listar todos os servicos',
    tipo: 'ACAO',
    modulo: 'servico',
    descricao: 'Ver servicos de outros responsáveis.'
  },
  {
    id: 11,
    codigo: 'acao.cliente.criar',
    nome: 'Criar cliente',
    tipo: 'ACAO',
    modulo: 'cliente',
    descricao: 'Cadastrar novos clientes.'
  },
  {
    id: 12,
    codigo: 'acao.cliente.editar',
    nome: 'Editar cliente',
    tipo: 'ACAO',
    modulo: 'cliente',
    descricao: 'Alterar dados do cliente.'
  },
  {
    id: 13,
    codigo: 'acao.cliente.excluir',
    nome: 'Excluir cliente',
    tipo: 'ACAO',
    modulo: 'cliente',
    descricao: 'Remover cliente do cadastro.'
  },
  {
    id: 14,
    codigo: 'acao.usuario.gerir',
    nome: 'Gerir usuários',
    tipo: 'ACAO',
    modulo: 'usuario',
    descricao: 'Criar e editar usuários.'
  },
  {
    id: 15,
    codigo: 'acao.usuario.redefinir_senha',
    nome: 'Redefinir senha',
    tipo: 'ACAO',
    modulo: 'usuario',
    descricao: 'Enviar senha provisória.'
  },
  {
    id: 16,
    codigo: 'acao.proposta.criar',
    nome: 'Criar proposta',
    tipo: 'ACAO',
    modulo: 'proposta',
    descricao: 'Registrar nova proposta.'
  },
  {
    id: 17,
    codigo: 'acao.proposta.editar',
    nome: 'Editar proposta',
    tipo: 'ACAO',
    modulo: 'proposta',
    descricao: 'Alterar proposta existente.'
  },
  {
    id: 18,
    codigo: 'acao.proposta.enviar_cliente',
    nome: 'Enviar proposta ao cliente',
    tipo: 'ACAO',
    modulo: 'proposta',
    descricao: 'Disparar proposta para o cliente.'
  },
  {
    id: 19,
    codigo: 'acao.contrato.criar',
    nome: 'Criar contrato',
    tipo: 'ACAO',
    modulo: 'contrato',
    descricao: 'Registrar contrato do servico.'
  },
  {
    id: 20,
    codigo: 'acao.contrato.enviar',
    nome: 'Enviar contrato',
    tipo: 'ACAO',
    modulo: 'contrato',
    descricao: 'Enviar contrato ao cliente.'
  },
  {
    id: 21,
    codigo: 'acao.documento.upload',
    nome: 'Upload de documento',
    tipo: 'ACAO',
    modulo: 'documento',
    descricao: 'Anexar documentos ao servico.'
  },
  {
    id: 22,
    codigo: 'acao.interacao.registrar',
    nome: 'Registrar interação',
    tipo: 'ACAO',
    modulo: 'interacao',
    descricao: 'Registrar interação com cliente.'
  },
  {
    id: 23,
    codigo: 'acao.grupo.gerir',
    nome: 'Gerir grupos',
    tipo: 'ACAO',
    modulo: 'grupo',
    descricao: 'Criar, editar e excluir grupos.'
  },
  {
    id: 24,
    codigo: 'tela.atividades',
    nome: 'Atividades',
    tipo: 'TELA',
    modulo: 'atividade',
    descricao: 'Acesso ao board e listagens de atividades.'
  },
  {
    id: 25,
    codigo: 'acao.atividade.criar',
    nome: 'Criar atividade',
    tipo: 'ACAO',
    modulo: 'atividade',
    descricao: 'Criar atividades raiz ou filhas.'
  },
  {
    id: 26,
    codigo: 'acao.atividade.editar',
    nome: 'Editar atividade',
    tipo: 'ACAO',
    modulo: 'atividade',
    descricao: 'Alterar dados de atividades.'
  },
  {
    id: 27,
    codigo: 'acao.atividade.mover_status',
    nome: 'Mover status da atividade',
    tipo: 'ACAO',
    modulo: 'atividade',
    descricao: 'Alterar status via board (drag-and-drop).'
  },
  {
    id: 28,
    codigo: 'acao.atividade.excluir',
    nome: 'Excluir atividade',
    tipo: 'ACAO',
    modulo: 'atividade',
    descricao: 'Remover atividades sem filhas.'
  }
]
