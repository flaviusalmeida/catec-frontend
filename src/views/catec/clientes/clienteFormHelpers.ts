import type { CatecCliente, CatecClienteFormState, CatecClienteRequest } from '@/types/catec/clienteTypes'
import { EMPTY_RESPONSAVEL_FORM } from '@/types/catec/clienteTypes'

import { formatCep, formatDocumentoByTipo, formatTelefoneBrasil, onlyDigits } from '@/utils/catec/brFormat'

export function clienteToFormState(cliente: CatecCliente): CatecClienteFormState {
  const docDigits = onlyDigits(cliente.documento ?? '')
  const telDigits = onlyDigits(cliente.telefone ?? '')

  const responsaveis =
    cliente.responsaveis.length > 0
      ? cliente.responsaveis.map(r => {
          const respTelDigits = onlyDigits(r.telefone)

          return {
            nome: r.nome,
            email: r.email,
            telefone: respTelDigits ? formatTelefoneBrasil(respTelDigits) : ''
          }
        })
      : [{ ...EMPTY_RESPONSAVEL_FORM }]

  return {
    tipoPessoa: cliente.tipoPessoa,
    razaoSocialOuNome: cliente.razaoSocialOuNome,
    nomeFantasia: cliente.nomeFantasia ?? '',
    documento: docDigits ? formatDocumentoByTipo(cliente.tipoPessoa, docDigits) : '',
    email: cliente.email ?? '',
    telefone: telDigits ? formatTelefoneBrasil(telDigits) : '',
    enderecoLogradouro: cliente.enderecoLogradouro ?? '',
    enderecoNumero: cliente.enderecoNumero ?? '',
    enderecoComplemento: cliente.enderecoComplemento ?? '',
    enderecoCidade: cliente.enderecoCidade ?? '',
    enderecoUf: cliente.enderecoUf ?? '',
    enderecoCep: (() => {
      const cepD = onlyDigits(cliente.enderecoCep ?? '')

      return cepD ? formatCep(cepD) : ''
    })(),
    periodoFaturamento: cliente.periodoFaturamento ?? '',
    observacoes: cliente.observacoes ?? '',
    responsaveis
  }
}

export function formStateToClientePatch(form: CatecClienteFormState): Partial<CatecCliente> {
  return {
    tipoPessoa: form.tipoPessoa,
    razaoSocialOuNome: form.razaoSocialOuNome.trim(),
    nomeFantasia: form.nomeFantasia.trim() || null,
    documento: onlyDigits(form.documento) || null,
    email: form.email.trim() || null,
    telefone: onlyDigits(form.telefone) || null,
    enderecoLogradouro: form.enderecoLogradouro.trim() || null,
    enderecoNumero: form.enderecoNumero.trim() || null,
    enderecoComplemento: form.enderecoComplemento.trim() || null,
    enderecoCidade: form.enderecoCidade.trim() || null,
    enderecoUf: form.enderecoUf.trim().toUpperCase() || null,
    enderecoCep: onlyDigits(form.enderecoCep) || null,
    periodoFaturamento: form.periodoFaturamento.trim(),
    observacoes: form.observacoes.trim() || null,
    responsaveis: form.responsaveis.map((r, index) => ({
      id: index + 1,
      nome: r.nome.trim(),
      email: r.email.trim(),
      telefone: onlyDigits(r.telefone)
    }))
  }
}

export function formStateToClienteRequest(form: CatecClienteFormState): CatecClienteRequest {
  const patch = formStateToClientePatch(form)

  return {
    tipoPessoa: patch.tipoPessoa!,
    razaoSocialOuNome: patch.razaoSocialOuNome!,
    nomeFantasia: patch.nomeFantasia ?? null,
    documento: patch.documento ?? '',
    email: patch.email ?? '',
    telefone: patch.telefone ?? '',
    enderecoLogradouro: patch.enderecoLogradouro ?? null,
    enderecoNumero: patch.enderecoNumero ?? null,
    enderecoComplemento: patch.enderecoComplemento ?? null,
    enderecoCidade: patch.enderecoCidade ?? null,
    enderecoUf: patch.enderecoUf ?? null,
    enderecoCep: patch.enderecoCep ?? null,
    periodoFaturamento: patch.periodoFaturamento!,
    observacoes: patch.observacoes ?? null,
    responsaveis: (patch.responsaveis ?? []).map(r => ({
      nome: r.nome,
      email: r.email,
      telefone: r.telefone
    }))
  }
}

export function clienteToRequest(cliente: CatecCliente): CatecClienteRequest {
  return {
    tipoPessoa: cliente.tipoPessoa,
    razaoSocialOuNome: cliente.razaoSocialOuNome,
    nomeFantasia: cliente.nomeFantasia,
    documento: onlyDigits(cliente.documento ?? '') || '',
    email: cliente.email ?? '',
    telefone: onlyDigits(cliente.telefone ?? '') || '',
    enderecoLogradouro: cliente.enderecoLogradouro,
    enderecoNumero: cliente.enderecoNumero,
    enderecoComplemento: cliente.enderecoComplemento,
    enderecoCidade: cliente.enderecoCidade,
    enderecoUf: cliente.enderecoUf?.toUpperCase() ?? null,
    enderecoCep: cliente.enderecoCep,
    periodoFaturamento: cliente.periodoFaturamento,
    observacoes: cliente.observacoes,
    responsaveis: cliente.responsaveis.map(r => ({
      nome: r.nome,
      email: r.email,
      telefone: onlyDigits(r.telefone)
    }))
  }
}

export function validateClienteForm(form: CatecClienteFormState): string | null {
  if (!form.razaoSocialOuNome.trim()) return 'Informe o nome ou razão social.'
  if (!onlyDigits(form.documento)) return 'Informe o CPF/CNPJ.'
  if (!form.email.trim()) return 'Informe o e-mail.'
  if (!onlyDigits(form.telefone)) return 'Informe o telefone.'
  if (!form.periodoFaturamento.trim()) return 'Informe o período de faturamento.'

  const primeiro = form.responsaveis[0]

  if (!primeiro?.nome.trim()) return 'Informe o nome do contato.'
  if (!primeiro.email.trim()) return 'Informe o e-mail do contato.'
  if (!onlyDigits(primeiro.telefone)) return 'Informe o telefone do contato.'

  return null
}
