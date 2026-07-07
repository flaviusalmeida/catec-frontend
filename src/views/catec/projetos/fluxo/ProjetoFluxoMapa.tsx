'use client'

import type { ReactNode } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { CatecContratoStatus, CatecPropostaStatus } from '@/types/catec/projetoFluxoTypes'
import {
  ORDEM_STATUS_CONTRATO,
  ORDEM_STATUS_PROPOSTA,
  STATUS_CONTRATO_ROTULO,
  STATUS_CONTRATO_ROTULO_BADGE,
  STATUS_PROPOSTA_ROTULO,
  STATUS_PROPOSTA_ROTULO_BADGE
} from '@/types/catec/projetoFluxoTypes'
import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'
import {
  ORDEM_STATUS_PROJETO,
  STATUS_PROJETO_ROTULO,
  STATUS_PROJETO_ROTULO_BADGE
} from '@/types/catec/projetoTypes'

import ContratoStatusBadge from '../ContratoStatusBadge'
import FluxoStatusChip from '../FluxoStatusChip'
import ProjetoStatusBadge from '../ProjetoStatusBadge'
import PropostaStatusBadge from '../PropostaStatusBadge'
import {
  FLUXO_STATUS_CORES,
  FLUXO_STATUS_SEMANTICA_ROTULO,
  semanticaContratoStatus,
  semanticaProjetoStatus,
  semanticaPropostaStatus,
  type FluxoStatusSemantica
} from '@/utils/catec/fluxoStatusBadge'

type FluxoPassoProjeto = {
  status: CatecProjetoStatus
  acao?: string
}

type FluxoPassoProposta = {
  tipo: 'proposta'
  status: CatecPropostaStatus
  acao?: string
}

type FluxoPassoContrato = {
  tipo: 'contrato'
  status: CatecContratoStatus
  acao?: string
}

type FluxoPassoEntidade = FluxoPassoProposta | FluxoPassoContrato

const FLUXO_FELIZ_PROJETO: FluxoPassoProjeto[] = [
  { status: 'PENDENTE_CLIENTE', acao: 'Criar demanda' },
  { status: 'AGUARDANDO_PROPOSTA_COMERCIAL', acao: 'Associar cliente' },
  { status: 'ELABORANDO_PROPOSTA', acao: 'Criar / anexar proposta' },
  { status: 'AGUARDANDO_REVISAO_PROPOSTA', acao: 'Enviar ao sócio' },
  { status: 'AGUARDANDO_ENVIO_CLIENTE', acao: 'Sócio aprova' },
  { status: 'AGUARDANDO_ACEITE_PROPOSTA', acao: 'Enviar proposta ao cliente' },
  { status: 'AGUARDANDO_CONTRATO', acao: 'Cliente aceita proposta' },
  { status: 'AGUARDANDO_EXECUCAO', acao: 'Cliente aceita contrato' },
  { status: 'EM_EXECUCAO', acao: 'Alterar status (sidebar)' },
  { status: 'FINALIZADO', acao: 'Alterar status (sidebar)' }
]

const LOOP_AJUSTE_PROJETO: FluxoPassoProjeto[] = [
  { status: 'AGUARDANDO_AJUSTE', acao: 'Sócio reprova ou cliente pede ajuste' },
  { status: 'ELABORANDO_PROPOSTA', acao: 'Reanexar / nova versão' },
  { status: 'AGUARDANDO_REVISAO_PROPOSTA', acao: 'Reenviar ao sócio' }
]

const FLUXO_PROPOSTA: FluxoPassoEntidade[] = [
  { tipo: 'proposta', status: 'RASCUNHO', acao: 'Criar proposta v1' },
  { tipo: 'proposta', status: 'PENDENTE_AVALIACAO', acao: 'Enviar revisão do sócio' },
  { tipo: 'proposta', status: 'AGUARDANDO_ENVIO', acao: 'Sócio aprova' },
  { tipo: 'proposta', status: 'ENVIADA_AO_CLIENTE', acao: 'Enviar ao cliente' },
  { tipo: 'proposta', status: 'ACEITA', acao: 'Cliente aceita' }
]

const LOOP_PROPOSTA_AJUSTE: FluxoPassoEntidade[] = [
  { tipo: 'proposta', status: 'AGUARDANDO_AJUSTE', acao: 'Sócio reprova ou cliente ajusta' },
  { tipo: 'proposta', status: 'RASCUNHO', acao: 'Reanexar ou nova versão v2+' }
]

const FLUXO_CONTRATO: FluxoPassoEntidade[] = [
  { tipo: 'contrato', status: 'RASCUNHO', acao: 'Criar contrato + anexo' },
  { tipo: 'contrato', status: 'ENVIADO_AO_CLIENTE', acao: 'Enviar ao cliente' },
  { tipo: 'contrato', status: 'ACEITO', acao: 'Cliente aceita' }
]

const LOOP_CONTRATO_AJUSTE: FluxoPassoEntidade[] = [
  { tipo: 'contrato', status: 'AGUARDANDO_AJUSTE', acao: 'Cliente pede ajuste' },
  { tipo: 'contrato', status: 'ENVIADO_AO_CLIENTE', acao: 'Reanexar e reenviar' }
]

function FluxoSeta({ rotulo }: { rotulo?: string }) {
  return (
    <div className='flex flex-col items-center gap-1 py-2'>
      <i className='tabler-arrow-down text-textDisabled text-xl' />
      {rotulo ? (
        <Typography variant='caption' color='text.secondary' className='text-center max-is-[220px]'>
          {rotulo}
        </Typography>
      ) : null}
    </div>
  )
}

function NoProjeto({ passo }: { passo: FluxoPassoProjeto }) {
  return (
    <Card variant='outlined' className='max-is-[280px]'>
      <CardContent className='flex flex-col items-center gap-2 p-4 text-center'>
        <ProjetoStatusBadge status={passo.status} />
        <Typography variant='body2' color='text.secondary'>
          {STATUS_PROJETO_ROTULO[passo.status]}
        </Typography>
        {passo.acao ? (
          <Typography variant='caption' color='text.disabled'>
            {passo.acao}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}

function NoEntidade({ passo }: { passo: FluxoPassoEntidade }) {
  const rotulo =
    passo.tipo === 'proposta'
      ? STATUS_PROPOSTA_ROTULO[passo.status]
      : STATUS_CONTRATO_ROTULO[passo.status]

  return (
    <Card variant='outlined' className='max-is-[280px]'>
      <CardContent className='flex flex-col items-center gap-2 p-4 text-center'>
        {passo.tipo === 'proposta' ? (
          <PropostaStatusBadge status={passo.status} />
        ) : (
          <ContratoStatusBadge status={passo.status} />
        )}
        <Typography variant='body2' color='text.secondary'>
          {rotulo}
        </Typography>
        <Typography variant='caption' color='text.disabled' className='font-mono'>
          {passo.status}
        </Typography>
        {passo.acao ? (
          <Typography variant='caption' color='text.secondary'>
            {passo.acao}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ColunaFluxo<T extends FluxoPassoProjeto | FluxoPassoEntidade>({
  titulo,
  passos,
  renderNo
}: {
  titulo: string
  passos: T[]
  renderNo: (passo: T) => ReactNode
}) {
  return (
    <div className='flex flex-col items-center'>
      <Typography variant='subtitle2' className='mbe-4'>
        {titulo}
      </Typography>
      {passos.map((passo, index) => (
        <div key={index} className='flex flex-col items-center'>
          {renderNo(passo)}
          {index < passos.length - 1 ? <FluxoSeta rotulo={passos[index + 1].acao} /> : null}
        </div>
      ))}
    </div>
  )
}

const SEMANTICAS_ORDEM: FluxoStatusSemantica[] = [
  'emAndamento',
  'aguardandoAcao',
  'concluidoSucesso',
  'encerradoNegativo',
  'neutro'
]

const ProjetoFluxoMapa = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Mapa do fluxo — revisão visual</Typography>
        <Typography color='text.secondary' className='mbs-2'>
          Página interna para revisar cores e rótulos das tags de status usadas na tela de projetos.
          Baseado em{' '}
          <Typography component='span' variant='body2' className='font-mono'>
            FLUXO_COMPLETO_PROJETO.md
          </Typography>
          .
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card variant='outlined'>
          <CardHeader title='Legenda semântica de cores' />
          <CardContent>
            <Grid container spacing={3}>
              {SEMANTICAS_ORDEM.map(semantica => (
                <Grid key={semantica} size={{ xs: 12, sm: 6, md: 4 }}>
                  <div className='flex flex-col gap-2'>
                    <FluxoStatusChip label={FLUXO_STATUS_SEMANTICA_ROTULO[semantica]} semantica={semantica} />
                    <Typography variant='caption' color='text.disabled' className='font-mono'>
                      bg {FLUXO_STATUS_CORES[semantica].background} · text {FLUXO_STATUS_CORES[semantica].text}
                    </Typography>
                  </div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Tags do projeto (sidebar e listagem)' subheader='Componente ProjetoStatusBadge' />
          <CardContent>
            <Grid container spacing={3}>
              {ORDEM_STATUS_PROJETO.map(status => (
                <Grid key={status} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <div className='flex flex-col gap-2 p-3 rounded-lg border border-solid border-divider'>
                    <ProjetoStatusBadge status={status} />
                    <Typography variant='caption' color='text.secondary'>
                      Semântica: {FLUXO_STATUS_SEMANTICA_ROTULO[semanticaProjetoStatus(status)]}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Badge: {STATUS_PROJETO_ROTULO_BADGE[status]}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      Completo: {STATUS_PROJETO_ROTULO[status]}
                    </Typography>
                    <Typography variant='caption' className='font-mono text-textDisabled'>
                      {status}
                    </Typography>
                  </div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader
            title='Tags da proposta (aba Propostas)'
            subheader='AGUARDANDO_ENVIO (Aprovada) usa verde — parecer positivo do sócio concluído'
          />
          <CardContent>
            <Grid container spacing={3}>
              {ORDEM_STATUS_PROPOSTA.map(status => (
                <Grid key={status} size={{ xs: 12, sm: 6 }}>
                  <div className='flex flex-col gap-2 p-3 rounded-lg border border-solid border-divider'>
                    <PropostaStatusBadge status={status} />
                    <Typography variant='caption' color='text.secondary'>
                      Semântica: {FLUXO_STATUS_SEMANTICA_ROTULO[semanticaPropostaStatus(status)]}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Badge: {STATUS_PROPOSTA_ROTULO_BADGE[status]}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      Completo: {STATUS_PROPOSTA_ROTULO[status]}
                    </Typography>
                    <Typography variant='caption' className='font-mono text-textDisabled'>
                      {status}
                    </Typography>
                  </div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title='Tags do contrato (aba Contrato)' subheader='RECUSADO exibe tag Recusado pelo cliente no documento' />
          <CardContent>
            <Grid container spacing={3}>
              {ORDEM_STATUS_CONTRATO.map(status => (
                <Grid key={status} size={{ xs: 12, sm: 6 }}>
                  <div className='flex flex-col gap-2 p-3 rounded-lg border border-solid border-divider'>
                    <ContratoStatusBadge status={status} />
                    <Typography variant='caption' color='text.secondary'>
                      Semântica: {FLUXO_STATUS_SEMANTICA_ROTULO[semanticaContratoStatus(status)]}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Badge: {STATUS_CONTRATO_ROTULO_BADGE[status]}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      Completo: {STATUS_CONTRATO_ROTULO[status]}
                    </Typography>
                    <Typography variant='caption' className='font-mono text-textDisabled'>
                      {status}
                    </Typography>
                  </div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <Card>
          <CardHeader title='Fluxo feliz — visão projeto' />
          <CardContent className='flex flex-col items-center overflow-x-auto p-6'>
            {FLUXO_FELIZ_PROJETO.map((passo, index) => (
              <div key={`${passo.status}-${index}`} className='flex flex-col items-center'>
                <NoProjeto passo={passo} />
                {index < FLUXO_FELIZ_PROJETO.length - 1 ? (
                  <FluxoSeta rotulo={FLUXO_FELIZ_PROJETO[index + 1].acao} />
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Card className='h-full'>
          <CardHeader title='Desvios e terminais' />
          <CardContent className='flex flex-col gap-4'>
            <div>
              <Typography variant='subtitle2' className='mbe-2'>
                Cancelamento
              </Typography>
              <div className='flex flex-col gap-3'>
                <Card variant='outlined'>
                  <CardContent className='p-4'>
                    <Typography variant='body2' className='mbe-2'>
                      Proposta recusada
                    </Typography>
                    <PropostaStatusBadge status='NEGADA' />
                    <FluxoSeta rotulo='sync projeto' />
                    <ProjetoStatusBadge status='CANCELADO' />
                  </CardContent>
                </Card>
                <Card variant='outlined'>
                  <CardContent className='p-4'>
                    <Typography variant='body2' className='mbe-2'>
                      Contrato recusado
                    </Typography>
                    <ContratoStatusBadge status='RECUSADO' />
                    <FluxoSeta rotulo='sync projeto' />
                    <ProjetoStatusBadge status='CANCELADO' />
                  </CardContent>
                </Card>
                <Card variant='outlined'>
                  <CardContent className='p-4'>
                    <Typography variant='body2' className='mbe-2'>
                      Manual (sidebar)
                    </Typography>
                    <Typography variant='caption' color='text.secondary' className='block mbe-2'>
                      De AGUARDANDO_EXECUCAO ou EM_EXECUCAO
                    </Typography>
                    <ProjetoStatusBadge status='CANCELADO' />
                  </CardContent>
                </Card>
              </div>
            </div>
            <Divider />
            <div>
              <Typography variant='subtitle2' className='mbe-2'>
                Loop de ajuste (projeto)
              </Typography>
              <div className='flex flex-col items-center'>
                {LOOP_AJUSTE_PROJETO.map((passo, index) => (
                  <div key={index} className='flex flex-col items-center'>
                    <NoProjeto passo={passo} />
                    {index < LOOP_AJUSTE_PROJETO.length - 1 ? <FluxoSeta /> : null}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card className='h-full'>
          <CardHeader
            title='Fase proposta'
            subheader='AGUARDANDO_ENVIO = Aprovada pelo sócio (verde) · aguardando envio ao cliente'
          />
          <CardContent className='flex flex-col items-center overflow-x-auto p-6'>
            <ColunaFluxo
              titulo='Caminho feliz'
              passos={FLUXO_PROPOSTA}
              renderNo={passo => <NoEntidade passo={passo} />}
            />
            <Divider className='mbs-6 mbe-6 w-full' />
            <ColunaFluxo
              titulo='Loop de ajuste'
              passos={LOOP_PROPOSTA_AJUSTE}
              renderNo={passo => <NoEntidade passo={passo} />}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card className='h-full'>
          <CardHeader title='Fase contrato' subheader='Sem revisão interna — RASCUNHO → envio → resposta do cliente' />
          <CardContent className='flex flex-col items-center overflow-x-auto p-6'>
            <ColunaFluxo
              titulo='Caminho feliz'
              passos={FLUXO_CONTRATO}
              renderNo={passo => <NoEntidade passo={passo} />}
            />
            <Divider className='mbs-6 mbe-6 w-full' />
            <ColunaFluxo
              titulo='Loop de ajuste'
              passos={LOOP_CONTRATO_AJUSTE}
              renderNo={passo => <NoEntidade passo={passo} />}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card variant='outlined'>
          <CardContent className='p-4'>
            <Typography variant='body2' color='text.secondary'>
              Projeto em{' '}
              <Typography component='span' variant='body2' className='font-mono'>
                AGUARDANDO_CONTRATO
              </Typography>{' '}
              durante toda a fase de contrato. Após aceite do contrato →{' '}
              <ProjetoStatusBadge status='AGUARDANDO_EXECUCAO' />.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProjetoFluxoMapa
