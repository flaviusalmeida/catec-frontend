'use client'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { CatecGrupoFormState, CatecPermissaoCatalogo } from '@/types/catec/grupoTypes'
import { agruparPermissoesPorModulo, modulosOrdenados, rotuloModulo } from '@/types/catec/grupoTypes'

type Props = {
  catalogo: CatecPermissaoCatalogo[]
  form: CatecGrupoFormState
  filtro: string
  disabled?: boolean
  onToggle: (codigo: string) => void
  onToggleModulo: (codigos: string[], marcar: boolean) => void
}

const GrupoPermissoesPanel = ({
  catalogo,
  form,
  filtro,
  disabled = false,
  onToggle,
  onToggleModulo
}: Props) => {
  const termo = filtro.trim().toLowerCase()

  const catalogoFiltrado = termo
    ? catalogo.filter(
        p =>
          p.nome.toLowerCase().includes(termo) ||
          p.codigo.toLowerCase().includes(termo) ||
          (p.descricao?.toLowerCase().includes(termo) ?? false) ||
          rotuloModulo(p.modulo).toLowerCase().includes(termo)
      )
    : catalogo

  const porModulo = agruparPermissoesPorModulo(catalogoFiltrado)
  const modulos = modulosOrdenados(porModulo)

  if (modulos.length === 0) {
    return (
      <Typography color='text.secondary' className='p-4'>
        Nenhuma permissão corresponde à busca.
      </Typography>
    )
  }

  return (
    <Grid container spacing={4}>
      {modulos.map(modulo => {
        const permissoes = porModulo.get(modulo) ?? []
        const codigos = permissoes.map(p => p.codigo)
        const marcadas = codigos.filter(c => form.permissoes.has(c)).length
        const todasMarcadas = marcadas === codigos.length && codigos.length > 0

        return (
          <Grid size={{ xs: 12, md: 6 }} key={modulo}>
            <Card className='bs-full'>
              <CardHeader
                title={rotuloModulo(modulo)}
                subheader={`${marcadas} de ${codigos.length} selecionadas`}
                action={
                  <Button
                    size='small'
                    variant='tonal'
                    color='secondary'
                    disabled={disabled}
                    onClick={() => onToggleModulo(codigos, !todasMarcadas)}
                  >
                    {todasMarcadas ? 'Limpar' : 'Marcar todas'}
                  </Button>
                }
              />
              <CardContent className='flex flex-col gap-2'>
                {permissoes.map(p => (
                  <div
                    key={p.codigo}
                    className='flex items-start gap-2 border-b border-solid border-[var(--mui-palette-divider)] pb-3 last:border-0 last:pb-0'
                  >
                    <FormControlLabel
                      className='items-start m-0 flex-1'
                      control={
                        <Checkbox
                          checked={form.permissoes.has(p.codigo)}
                          onChange={() => onToggle(p.codigo)}
                          disabled={disabled}
                        />
                      }
                      label={
                        <span>
                          <Typography component='span' className='font-medium'>
                            {p.nome}
                          </Typography>
                          {p.descricao ? (
                            <Typography component='span' variant='body2' color='text.secondary' className='block'>
                              {p.descricao}
                            </Typography>
                          ) : null}
                        </span>
                      }
                    />
                    <Chip
                      label={p.tipo === 'TELA' ? 'Tela' : 'Ação'}
                      size='small'
                      variant='tonal'
                      color={p.tipo === 'TELA' ? 'info' : 'secondary'}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default GrupoPermissoesPanel
