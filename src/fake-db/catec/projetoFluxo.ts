import type {
  CatecProjetoFluxoData,
  CatecProjetoFluxoResumo,
  CatecProposta
} from '@/types/catec/projetoFluxoTypes'

const doc = (
  id: number,
  nome: string,
  versao: number,
  autor: string,
  criadoEm: string
) => ({
  id,
  nomeOriginal: nome,
  versao,
  uploadedPorNome: autor,
  criadoEm
})

const fluxoPorProjeto: Record<number, CatecProjetoFluxoData> = {
  1: {
    propostas: [
      {
        id: 101,
        projetoId: 1,
        status: 'ACEITA',
        versao: 2,
        elaboradoPorId: 1,
        elaboradoPorNome: 'Ana Silva',
        enviadaClienteEm: '2026-01-22T14:00:00Z',
        avaliadaSocioEm: null,
        consideracoesPendentes: false,
        criadoEm: '2026-01-18T10:00:00Z',
        atualizadoEm: '2026-02-01T11:00:00Z',
        documentos: [doc(1001, 'proposta-comercial-v2.pdf', 2, 'Ana Silva', '2026-01-18T10:30:00Z')]
      },
      {
        id: 100,
        projetoId: 1,
        status: 'NEGADA',
        versao: 1,
        elaboradoPorId: 1,
        elaboradoPorNome: 'Ana Silva',
        enviadaClienteEm: '2026-01-12T09:00:00Z',
        avaliadaSocioEm: '2026-01-11T16:00:00Z',
        consideracoesPendentes: false,
        criadoEm: '2026-01-10T09:30:00Z',
        atualizadoEm: '2026-01-15T08:00:00Z',
        documentos: [doc(1000, 'proposta-comercial-v1.pdf', 1, 'Ana Silva', '2026-01-10T10:00:00Z')]
      }
    ],
    contrato: {
      id: 201,
      projetoId: 1,
      status: 'ACEITO',
      elaboradoPorId: 1,
      elaboradoPorNome: 'Ana Silva',
      enviadoClienteEm: '2026-02-05T10:00:00Z',
      criadoEm: '2026-02-03T09:00:00Z',
      atualizadoEm: '2026-02-10T15:00:00Z',
      documentos: [doc(2001, 'contrato-execucao.pdf', 1, 'Ana Silva', '2026-02-03T09:30:00Z')]
    },
    interacoes: [
      {
        key: 'C-1',
        titulo: 'Contrato aceito',
        meta: 'Mariana Souza · 10/02/2026, 15:00',
        texto: 'Cliente confirmou assinatura do contrato para início da execução.',
        criadoEm: '2026-02-10T15:00:00Z',
        origem: 'CONTRATO'
      },
      {
        key: 'P-1',
        titulo: 'Proposta aceita',
        meta: 'Mariana Souza · 01/02/2026, 11:00',
        texto: 'Aceite da proposta comercial v2.',
        criadoEm: '2026-02-01T11:00:00Z',
        origem: 'PROPOSTA'
      }
    ],
    historico: [
      {
        origem: 'AUDITORIA',
        registroId: 9005,
        tipoEntidade: 'CONTRATO',
        entidadeId: 201,
        acao: 'STATUS_ALTERADO',
        statusAnterior: 'ENVIADO_AO_CLIENTE',
        statusNovo: 'ACEITO',
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Sistema',
        ocorridoEm: '2026-02-10T15:00:00Z'
      },
      {
        origem: 'INTERACAO',
        registroId: 8002,
        tipoEntidade: 'CONTRATO',
        entidadeId: 201,
        acao: null,
        statusAnterior: null,
        statusNovo: null,
        tipoInteracao: 'ACEITE_CLIENTE',
        texto: 'Cliente confirmou assinatura do contrato para início da execução.',
        usuarioNome: 'Mariana Souza',
        ocorridoEm: '2026-02-10T15:00:00Z'
      },
      {
        origem: 'AUDITORIA',
        registroId: 9004,
        tipoEntidade: 'PROPOSTA',
        entidadeId: 101,
        acao: 'STATUS_ALTERADO',
        statusAnterior: 'ENVIADA_AO_CLIENTE',
        statusNovo: 'ACEITA',
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Sistema',
        ocorridoEm: '2026-02-01T11:00:00Z'
      },
      {
        origem: 'AUDITORIA',
        registroId: 9003,
        tipoEntidade: 'PROPOSTA',
        entidadeId: 101,
        acao: 'DOCUMENTO_ENVIADO',
        statusAnterior: null,
        statusNovo: null,
        tipoInteracao: null,
        texto: 'proposta-comercial-v2.pdf',
        usuarioNome: 'Ana Silva',
        ocorridoEm: '2026-01-22T14:00:00Z'
      },
      {
        origem: 'AUDITORIA',
        registroId: 9002,
        tipoEntidade: 'PROJETO',
        entidadeId: 1,
        acao: 'STATUS_ALTERADO',
        statusAnterior: 'AGUARDANDO_EXECUCAO',
        statusNovo: 'EM_EXECUCAO',
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Sistema',
        ocorridoEm: '2026-02-15T10:30:00Z'
      }
    ]
  },
  2: {
    propostas: [],
    contrato: null,
    interacoes: [],
    historico: [
      {
        origem: 'AUDITORIA',
        registroId: 9201,
        tipoEntidade: 'PROJETO',
        entidadeId: 2,
        acao: 'STATUS_ALTERADO',
        statusAnterior: 'PENDENTE_CLIENTE',
        statusNovo: 'AGUARDANDO_PROPOSTA_COMERCIAL',
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Bruno Costa',
        ocorridoEm: '2026-02-05T14:30:00Z'
      }
    ]
  },
  3: {
    propostas: [],
    contrato: null,
    interacoes: [],
    historico: [
      {
        origem: 'AUDITORIA',
        registroId: 9301,
        tipoEntidade: 'PROJETO',
        entidadeId: 3,
        acao: 'PROJETO_CRIADO',
        statusAnterior: null,
        statusNovo: 'PENDENTE_CLIENTE',
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Diego Alves',
        ocorridoEm: '2026-02-18T11:15:00Z'
      }
    ]
  },
  4: {
    propostas: [
      {
        id: 401,
        projetoId: 4,
        status: 'RASCUNHO',
        versao: 1,
        elaboradoPorId: 1,
        elaboradoPorNome: 'Ana Silva',
        enviadaClienteEm: null,
        avaliadaSocioEm: null,
        consideracoesPendentes: false,
        criadoEm: '2026-02-08T09:00:00Z',
        atualizadoEm: '2026-02-10T16:00:00Z',
        documentos: [doc(4001, 'proposta-fundacoes-v1.pdf', 1, 'Ana Silva', '2026-02-10T15:30:00Z')]
      }
    ],
    contrato: null,
    interacoes: [
      {
        key: 'P-4',
        titulo: 'Ajustar proposta',
        meta: 'Fernanda Lima · 10/02/2026, 16:00',
        texto: 'Incluir opção de fundação profunda no orçamento.',
        criadoEm: '2026-02-10T16:00:00Z',
        origem: 'PROPOSTA'
      }
    ],
    historico: [
      {
        origem: 'AUDITORIA',
        registroId: 9402,
        tipoEntidade: 'PROPOSTA',
        entidadeId: 401,
        acao: 'DOCUMENTO_ENVIADO',
        statusAnterior: null,
        statusNovo: null,
        tipoInteracao: null,
        texto: 'proposta-fundacoes-v1.pdf',
        usuarioNome: 'Ana Silva',
        ocorridoEm: '2026-02-10T15:30:00Z'
      },
      {
        origem: 'AUDITORIA',
        registroId: 9401,
        tipoEntidade: 'PROJETO',
        entidadeId: 4,
        acao: 'STATUS_ALTERADO',
        statusAnterior: 'AGUARDANDO_PROPOSTA_COMERCIAL',
        statusNovo: 'ELABORANDO_PROPOSTA',
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Ana Silva',
        ocorridoEm: '2026-02-08T09:00:00Z'
      }
    ]
  },
  5: {
    propostas: [
      {
        id: 501,
        projetoId: 5,
        status: 'NEGADA',
        versao: 1,
        elaboradoPorId: 3,
        elaboradoPorNome: 'Carla Mendes',
        enviadaClienteEm: '2026-01-20T11:00:00Z',
        avaliadaSocioEm: null,
        consideracoesPendentes: false,
        criadoEm: '2026-01-15T10:00:00Z',
        atualizadoEm: '2026-01-28T09:15:00Z',
        documentos: [doc(5001, 'proposta-consultoria.pdf', 1, 'Carla Mendes', '2026-01-15T10:30:00Z')]
      }
    ],
    contrato: null,
    interacoes: [
      {
        key: 'P-5',
        titulo: 'Proposta recusada',
        meta: 'Carla Mendes Santos · 28/01/2026, 09:15',
        texto: 'Cliente optou por não prosseguir com a consultoria.',
        criadoEm: '2026-01-28T09:15:00Z',
        origem: 'PROPOSTA'
      }
    ],
    historico: [
      {
        origem: 'AUDITORIA',
        registroId: 9502,
        tipoEntidade: 'PROJETO',
        entidadeId: 5,
        acao: 'STATUS_ALTERADO',
        statusAnterior: 'AGUARDANDO_ACEITE_PROPOSTA',
        statusNovo: 'CANCELADO',
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Sistema',
        ocorridoEm: '2026-01-28T09:20:00Z'
      },
      {
        origem: 'INTERACAO',
        registroId: 8501,
        tipoEntidade: 'PROPOSTA',
        entidadeId: 501,
        acao: null,
        statusAnterior: null,
        statusNovo: null,
        tipoInteracao: 'RECUSA_CLIENTE',
        texto: 'Cliente optou por não prosseguir com a consultoria.',
        usuarioNome: 'Carla Mendes Santos',
        ocorridoEm: '2026-01-28T09:15:00Z'
      }
    ]
  }
}

function cloneFluxo(data: CatecProjetoFluxoData): CatecProjetoFluxoData {
  return JSON.parse(JSON.stringify(data)) as CatecProjetoFluxoData
}

export function getInitialProjetoFluxoData(projetoId: number): CatecProjetoFluxoData {
  const base = fluxoPorProjeto[projetoId]

  if (base) return cloneFluxo(base)

  return {
    propostas: [],
    contrato: null,
    interacoes: [],
    historico: []
  }
}

export function propostaMaisRecente(propostas: CatecProposta[]): CatecProposta | null {
  if (propostas.length === 0) return null

  return [...propostas].sort((a, b) => b.versao - a.versao)[0]
}

export function computeProjetoFluxoResumo(projetoId: number, data: CatecProjetoFluxoData): CatecProjetoFluxoResumo {
  const propostaAtual = propostaMaisRecente(data.propostas)
  const ultimaInteracao = data.interacoes[0]?.criadoEm ?? null

  return {
    projetoId,
    propostaStatus: propostaAtual?.status ?? null,
    contratoStatus: data.contrato?.status ?? null,
    ultimaInteracaoEm: ultimaInteracao
  }
}

/** @deprecated use computeProjetoFluxoResumo com dados do store */
export function getProjetoFluxoResumo(projetoId: number): CatecProjetoFluxoResumo {
  return computeProjetoFluxoResumo(projetoId, getInitialProjetoFluxoData(projetoId))
}
