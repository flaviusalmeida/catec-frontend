import type { CatecGrupo } from '@/types/catec/grupoTypes'

const now = '2026-01-15T10:00:00Z'

export const catecGruposDb: CatecGrupo[] = [
  {
    id: 1,
    codigo: 'ADMINISTRATIVO',
    nome: 'Administrativo',
    descricao: 'Gestão de usuários, clientes e cadastros administrativos.',
    ativo: true,
    sistema: true,
    permissoes: [
      'tela.clientes',
      'tela.usuarios',
      'tela.grupos',
      'acao.cliente.criar',
      'acao.cliente.editar',
      'acao.cliente.excluir',
      'acao.usuario.gerir',
      'acao.usuario.redefinir_senha',
      'acao.grupo.gerir'
    ],
    criadoEm: now,
    atualizadoEm: now
  },
  {
    id: 2,
    codigo: 'COLABORADOR',
    nome: 'Colaborador',
    descricao: 'Operações do dia a dia em projetos e interações.',
    ativo: true,
    sistema: true,
    permissoes: [
      'tela.projetos',
      'tela.projeto.detalhe',
      'acao.projeto.criar',
      'acao.projeto.editar',
      'acao.interacao.registrar',
      'acao.documento.upload'
    ],
    criadoEm: now,
    atualizadoEm: now
  },
  {
    id: 3,
    codigo: 'SOCIO',
    nome: 'Sócio',
    descricao: 'Visão estratégica e aprovação de propostas.',
    ativo: true,
    sistema: true,
    permissoes: [
      'tela.painel',
      'tela.projetos',
      'tela.projeto.detalhe',
      'tela.socio.propostas',
      'acao.projeto.listar_todos',
      'acao.socio.proposta.aprovar',
      'acao.socio.proposta.devolver'
    ],
    criadoEm: now,
    atualizadoEm: now
  },
  {
    id: 4,
    codigo: 'FINANCEIRO',
    nome: 'Financeiro',
    descricao: 'Faturamento, contratos e documentos financeiros.',
    ativo: true,
    sistema: true,
    permissoes: [
      'tela.projetos',
      'tela.projeto.detalhe',
      'acao.contrato.criar',
      'acao.contrato.enviar',
      'acao.documento.upload'
    ],
    criadoEm: now,
    atualizadoEm: now
  },
  {
    id: 5,
    codigo: 'COMERCIAL_EXTERNO',
    nome: 'Comercial externo',
    descricao: 'Parceiros com acesso limitado a clientes e propostas.',
    ativo: false,
    sistema: false,
    permissoes: ['tela.clientes', 'acao.cliente.criar', 'acao.proposta.criar'],
    criadoEm: now,
    atualizadoEm: now
  }
]
