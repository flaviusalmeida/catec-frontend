// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import NavSearch from '@components/layout/shared/search'

import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {!isBreakpointReached && (
          <Link href={themeConfig.homePageUrl}>
            <Logo />
          </Link>
        )}
      </div>

      <div className='flex items-center'>
        <NavSearch />
        <ShortcutsDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
