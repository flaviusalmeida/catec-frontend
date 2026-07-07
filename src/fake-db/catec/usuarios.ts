import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'

export const catecUsuariosDb: CatecAdminUsuario[] = [
  {
    id: 1,
    nome: 'Ana Silva',
    email: 'ana.silva@catec.local',
    telefone: '(11) 98765-4321',
    ativo: true,
    requerTrocaSenha: false,
    grupos: ['ADMINISTRATIVO']
  },
  {
    id: 2,
    nome: 'Bruno Costa',
    email: 'bruno.costa@catec.local',
    telefone: null,
    ativo: true,
    requerTrocaSenha: false,
    grupos: ['SOCIO', 'ADMINISTRATIVO']
  },
  {
    id: 3,
    nome: 'Carla Mendes',
    email: 'carla.mendes@catec.local',
    telefone: '(11) 91234-5678',
    ativo: false,
    requerTrocaSenha: true,
    grupos: ['COLABORADOR']
  },
  {
    id: 4,
    nome: 'Diego Alves',
    email: 'diego.alves@catec.local',
    telefone: '(21) 99876-5432',
    ativo: true,
    requerTrocaSenha: false,
    grupos: ['SALA_TECNICA', 'CAMPO']
  }
]
