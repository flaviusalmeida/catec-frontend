'use client'

// React Imports
import { useCallback, useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { useCatecPermission } from '@/hooks/useCatecPermission'
import { useCatecShortcuts } from '@/hooks/useCatecShortcuts'

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  }

  return (
    <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
      {children}
    </PerfectScrollbar>
  )
}

const ShortcutsDropdown = () => {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const { permissoes } = useCatecPermission()
  const { shortcuts, availableItems, toggleShortcut, isSelected } = useCatecShortcuts(permissoes)

  const handleClose = useCallback(() => {
    setOpen(false)
    setEditing(false)
  }, [])

  const handleToggle = useCallback(() => {
    setOpen(prevOpen => !prevOpen)
  }, [])

  const handleEditToggle = useCallback(() => {
    setEditing(prev => !prev)
  }, [])

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    adjustPopoverHeight()
    window.addEventListener('resize', adjustPopoverHeight)

    return () => window.removeEventListener('resize', adjustPopoverHeight)
  }, [editing, shortcuts.length])

  if (availableItems.length === 0) {
    return null
  }

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <i className='tabler-layout-grid-add' />
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full  !mbs-3 z-[1] max-bs-[517px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: 'is-96  !mbs-3 z-[1] max-bs-[517px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3.5 pli-4 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      {editing ? 'Personalizar atalhos' : 'Atalhos'}
                    </Typography>
                    <Tooltip
                      title={editing ? 'Concluir' : 'Personalizar atalhos'}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                    >
                      <IconButton
                        size='small'
                        className='text-textPrimary'
                        onClick={handleEditToggle}
                        aria-label={editing ? 'Concluir personalização' : 'Personalizar atalhos'}
                      >
                        <i className={classnames(editing ? 'tabler-check' : 'tabler-plus')} />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {editing ? (
                      <ul className='flex flex-col'>
                        {availableItems.map(item => (
                          <li
                            key={item.id}
                            className='flex items-center justify-between gap-3 pli-4 plb-3 border-be last:border-be-0'
                          >
                            <div className='flex items-center gap-3 min-is-0'>
                              <CustomAvatar size={38} className='bg-actionSelected text-textPrimary shrink-0'>
                                <i className={classnames('text-xl', item.icon)} />
                              </CustomAvatar>
                              <div className='min-is-0'>
                                <Typography className='font-medium' color='text.primary'>
                                  {item.name}
                                </Typography>
                                <Typography variant='body2' noWrap>
                                  {item.subtitle}
                                </Typography>
                              </div>
                            </div>
                            <Switch
                              checked={isSelected(item.id)}
                              onChange={() => toggleShortcut(item.id)}
                              inputProps={{ 'aria-label': `Atalho ${item.name}` }}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : shortcuts.length > 0 ? (
                      <Grid container>
                        {shortcuts.map(shortcut => (
                          <Grid
                            size={{ xs: 6 }}
                            key={shortcut.id}
                            onClick={handleClose}
                            className='[&:not(:last-of-type):not(:nth-last-of-type(2))]:border-be odd:border-ie'
                          >
                            <Link
                              href={shortcut.url}
                              className='flex items-center flex-col p-6 gap-3 bs-full hover:bg-actionHover'
                            >
                              <CustomAvatar size={50} className='bg-actionSelected text-textPrimary'>
                                <i className={classnames('text-[1.625rem]', shortcut.icon)} />
                              </CustomAvatar>
                              <div className='flex flex-col items-center text-center'>
                                <Typography className='font-medium' color='text.primary'>
                                  {shortcut.name}
                                </Typography>
                                <Typography variant='body2'>{shortcut.subtitle}</Typography>
                              </div>
                            </Link>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <div className='flex flex-col items-center justify-center gap-2 p-8 text-center'>
                        <i className='tabler-layout-grid-add text-[2.5rem] text-textDisabled' />
                        <Typography color='text.secondary'>Nenhum atalho selecionado</Typography>
                        <Typography variant='body2' color='text.disabled'>
                          Clique em + para escolher as páginas que quer fixar aqui.
                        </Typography>
                      </div>
                    )}
                  </ScrollWrapper>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default ShortcutsDropdown
