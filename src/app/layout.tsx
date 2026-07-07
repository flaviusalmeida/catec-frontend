// Next Imports

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports

// HOC Imports

// Config Imports

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'CATEC',
  description: 'CATEC — Assessoria em engenharia',
  icons: {
    icon: '/images/logo-catec.png',
    apple: '/images/logo-catec.png'
  }
}

const RootLayout = async (props: ChildrenType ) => {
  

  const { children } = props

  // Type guard to ensure lang is a valid Locale
  

  // Vars
  
  const systemMode = await getSystemMode()
  const direction = 'ltr'

  return (
    
      <html id='__next' lang='pt' dir={direction} suppressHydrationWarning>
        <body className='flex is-full min-bs-full flex-auto flex-col' suppressHydrationWarning>
          <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
          {children}
        </body>
      </html>
    
  )
}

export default RootLayout
