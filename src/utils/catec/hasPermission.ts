export function hasPermission(
  permissoes: readonly string[] | undefined | null,
  codigo: string
): boolean {
  return permissoes?.includes(codigo) ?? false
}

export function hasAnyPermission(
  permissoes: readonly string[] | undefined | null,
  codigos: readonly string[]
): boolean {
  if (!permissoes?.length || !codigos.length) {
    return false
  }

  return codigos.some(c => permissoes.includes(c))
}

export function hasAllPermissions(
  permissoes: readonly string[] | undefined | null,
  codigos: readonly string[]
): boolean {
  if (!codigos.length) {
    return true
  }

  return codigos.every(c => permissoes?.includes(c) ?? false)
}

export function isPermissionAllowed(
  permissoes: readonly string[] | undefined | null,
  options: {
    code?: string
    anyOf?: readonly string[]
    allOf?: readonly string[]
  }
): boolean {
  if (options.code) {
    return hasPermission(permissoes, options.code)
  }

  if (options.anyOf?.length) {
    return hasAnyPermission(permissoes, options.anyOf)
  }

  if (options.allOf?.length) {
    return hasAllPermissions(permissoes, options.allOf)
  }

  return true
}
