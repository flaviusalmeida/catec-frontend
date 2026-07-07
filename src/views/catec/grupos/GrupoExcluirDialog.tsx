'use client'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'

type Props = {
  open: boolean
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}

const GrupoExcluirDialog = ({ open, loading, onClose, onConfirm }: Props) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='xs' fullWidth>
      <DialogContent className='flex flex-col items-center text-center pbs-8'>
        <i className='tabler-alert-circle text-[64px] mbe-4 text-error' />
        <Typography variant='h5' className='mbe-2'>
          Confirmar exclusão
        </Typography>
        <Typography color='text.secondary'>
          O grupo será removido permanentemente. Usuários que o possuíam perderão as permissões associadas.
          Continuar?
        </Typography>
      </DialogContent>
      <DialogActions className='justify-center gap-2 pbe-6'>
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant='contained' color='error' onClick={onConfirm} disabled={loading}>
          {loading ? 'Excluindo…' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GrupoExcluirDialog
