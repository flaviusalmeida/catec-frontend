'use client'

// React Imports
import { useEffect } from 'react'

// Hook Imports
import { useCookie } from 'react-use'

// Type Imports
import { useColorScheme } from '@mui/material'

const useLayoutInit = () => {
  const { setMode } = useColorScheme()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, updateCookieColorPref] = useCookie('colorPref')

  useEffect(() => {
    updateCookieColorPref('light')
    setMode('light')
  }, [setMode, updateCookieColorPref])
}

export default useLayoutInit
