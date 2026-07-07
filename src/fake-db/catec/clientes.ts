import type { CatecCliente } from '@/types/catec/clienteTypes'

export const catecClientesDb: CatecCliente[] = [
  {
    id: 1,
    tipoPessoa: 'PJ',
    razaoSocialOuNome: 'Construtora Horizonte Ltda',
    nomeFantasia: 'Horizonte Engenharia',
    documento: '12345678000190',
    email: 'contato@horizonte.local',
    telefone: '11987654321',
    enderecoLogradouro: 'Av. Paulista',
    enderecoNumero: '1500',
    enderecoComplemento: 'Sala 42',
    enderecoCidade: 'São Paulo',
    enderecoUf: 'SP',
    enderecoCep: '01310100',
    periodoFaturamento: 'Até todo dia 15',
    observacoes: 'Cliente prioritário para laudos estruturais.',
    responsaveis: [
      {
        id: 1,
        nome: 'Mariana Costa',
        email: 'mariana@horizonte.local',
        telefone: '11999887766'
      }
    ]
  },
  {
    id: 2,
    tipoPessoa: 'PF',
    razaoSocialOuNome: 'João Pedro Almeida',
    nomeFantasia: null,
    documento: '52998224725',
    email: 'joao.almeida@email.local',
    telefone: '21988776655',
    enderecoLogradouro: 'Rua das Flores',
    enderecoNumero: '88',
    enderecoComplemento: null,
    enderecoCidade: 'Rio de Janeiro',
    enderecoUf: 'RJ',
    enderecoCep: '22041080',
    periodoFaturamento: 'À vista na entrega',
    observacoes: null,
    responsaveis: [
      {
        id: 2,
        nome: 'João Pedro Almeida',
        email: 'joao.almeida@email.local',
        telefone: '21988776655'
      }
    ]
  },
  {
    id: 3,
    tipoPessoa: 'PJ',
    razaoSocialOuNome: 'Incorporadora Vale Verde S.A.',
    nomeFantasia: 'Vale Verde',
    documento: '98765432000111',
    email: 'financeiro@valeverde.local',
    telefone: '31991234567',
    enderecoLogradouro: 'Rua Bahia',
    enderecoNumero: '1200',
    enderecoComplemento: 'Andar 3',
    enderecoCidade: 'Belo Horizonte',
    enderecoUf: 'MG',
    enderecoCep: '30160120',
    periodoFaturamento: '30 dias após emissão da NF',
    observacoes: 'Exige cópia do contrato em anexo nos projetos.',
    responsaveis: [
      {
        id: 3,
        nome: 'Fernanda Ribeiro',
        email: 'fernanda@valeverde.local',
        telefone: '31990001122'
      }
    ]
  },
  {
    id: 4,
    tipoPessoa: 'PF',
    razaoSocialOuNome: 'Carla Mendes Santos',
    nomeFantasia: null,
    documento: '39053344705',
    email: 'carla.mendes@email.local',
    telefone: '11976543210',
    enderecoLogradouro: 'Alameda Santos',
    enderecoNumero: '45',
    enderecoComplemento: 'Apto 12',
    enderecoCidade: 'São Paulo',
    enderecoUf: 'SP',
    enderecoCep: '01418000',
    periodoFaturamento: 'Até todo dia 10',
    observacoes: null,
    responsaveis: [
      {
        id: 4,
        nome: 'Carla Mendes Santos',
        email: 'carla.mendes@email.local',
        telefone: '11976543210'
      }
    ]
  }
]
