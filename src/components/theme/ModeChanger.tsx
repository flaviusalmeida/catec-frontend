// React Imports
import { useEffect } from 'react'

// MUI Imports
import { useColorScheme } from '@mui/material/styles'

const ModeChanger = () => {
  const { setMode } = useColorScheme()

  useEffect(() => {
    setMode('light')
  }, [setMode])

  return null
}

export default ModeChanger
