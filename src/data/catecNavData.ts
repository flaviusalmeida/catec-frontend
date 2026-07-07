import { PermissaoCodigo } from '@/types/catec/permissao'

export type CatecNavItem = {
  id: string
  name: string
  url: string
  icon: string
  section: string
  subtitle: string
  permission?: string
}

export const catecNavItems: CatecNavItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    url: '/catec/dashboard',
    icon: 'tabler-chart-dots',
    section: 'Dashboard',
    subtitle: 'Visão geral dos projetos',
    permission: PermissaoCodigo.TELA_PAINEL
  },
  {
    id: 'projetos',
    name: 'Projetos',
    url: '/catec/projetos',
    icon: 'tabler-briefcase',
    section: 'Projetos',
    subtitle: 'Gerir projetos',
    permission: PermissaoCodigo.TELA_PROJETOS
  },
  {
    id: 'socio-propostas',
    name: 'Propostas pendentes',
    url: '/catec/socio/propostas',
    icon: 'tabler-file-check',
    section: 'Projetos',
    subtitle: 'Parecer do sócio em propostas comerciais',
    permission: PermissaoCodigo.TELA_SOCIO_PROPOSTAS
  },
  {
    id: 'clientes',
    name: 'Clientes',
    url: '/catec/clientes',
    icon: 'tabler-users',
    section: 'Clientes',
    subtitle: 'Cadastro de clientes',
    permission: PermissaoCodigo.TELA_CLIENTES
  },
  {
    id: 'usuarios',
    name: 'Usuários',
    url: '/catec/usuarios',
    icon: 'tabler-user',
    section: 'Segurança',
    subtitle: 'Gerir usuários',
    permission: PermissaoCodigo.TELA_USUARIOS
  },
  {
    id: 'grupos',
    name: 'Grupos',
    url: '/catec/grupos',
    icon: 'tabler-lock',
    section: 'Segurança',
    subtitle: 'Permissões e grupos',
    permission: PermissaoCodigo.TELA_GRUPOS
  }
]
