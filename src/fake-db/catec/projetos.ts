import type { CatecProjeto } from '@/types/catec/projetoTypes'

const t1 = '2026-01-10T09:00:00Z'
const t2 = '2026-02-05T14:30:00Z'
const t3 = '2026-02-18T11:15:00Z'

export const catecProjetosDb: CatecProjeto[] = [
  {
    id: 1,
    clienteId: 1,
    clienteNome: 'Construtora Horizonte Ltda',
    titulo: 'Laudo estrutural — Torre A',
    escopo: 'Inspeção estrutural completa da torre A com relatório técnico e recomendações.',
    emailContato: 'mariana@horizonte.local',
    telefoneContato: '11999887766',
    criadoPorId: 1,
    criadoPorNome: 'Ana Silva',
    status: 'EM_EXECUCAO',
    criadoEm: t1,
    atualizadoEm: t3
  },
  {
    id: 2,
    clienteId: 2,
    clienteNome: 'João Pedro Almeida',
    titulo: 'Vistoria residencial — Reforma',
    escopo: 'Avaliação de condições estruturais antes da reforma do imóvel.',
    emailContato: 'joao.almeida@email.local',
    telefoneContato: '21988776655',
    criadoPorId: 2,
    criadoPorNome: 'Bruno Costa',
    status: 'AGUARDANDO_PROPOSTA_COMERCIAL',
    criadoEm: t2,
    atualizadoEm: t2
  },
  {
    id: 3,
    clienteId: null,
    clienteNome: null,
    titulo: 'Demanda interna — Análise preliminar',
    escopo: 'Levantamento inicial sem cliente definido; aguardando associação.',
    emailContato: null,
    telefoneContato: null,
    criadoPorId: 4,
    criadoPorNome: 'Diego Alves',
    status: 'PENDENTE_CLIENTE',
    criadoEm: t3,
    atualizadoEm: t3
  },
  {
    id: 4,
    clienteId: 3,
    clienteNome: 'Incorporadora Vale Verde S.A.',
    titulo: 'Projeto fundações — Lote B',
    escopo: 'Estudo geotécnico e proposta comercial para fundações do lote B.',
    emailContato: 'fernanda@valeverde.local',
    telefoneContato: '31990001122',
    criadoPorId: 1,
    criadoPorNome: 'Ana Silva',
    status: 'ELABORANDO_PROPOSTA',
    criadoEm: t1,
    atualizadoEm: t2
  },
  {
    id: 5,
    clienteId: 4,
    clienteNome: 'Carla Mendes Santos',
    titulo: 'Consultoria cancelada',
    escopo: 'Demanda encerrada a pedido do cliente.',
    emailContato: 'carla.mendes@email.local',
    telefoneContato: '11976543210',
    criadoPorId: 3,
    criadoPorNome: 'Carla Mendes',
    status: 'CANCELADO',
    criadoEm: t1,
    atualizadoEm: t3
  }
]
