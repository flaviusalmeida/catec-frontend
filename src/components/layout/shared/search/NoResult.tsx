'use client'

// Next Imports
import Link from 'next/link'
import { useMemo } from 'react'

// Third-party Imports
import classnames from 'classnames'

// Data Imports
import searchData from '@/data/searchData'

// Hook Imports
import { useCatecPermission } from '@/hooks/useCatecPermission'

// Util Imports
import { hasPermission } from '@/utils/catec/hasPermission'

const NoResult = ({ searchValue, setOpen }: { searchValue: string; setOpen: (value: boolean) => void }) => {
  const { permissoes } = useCatecPermission()

  const suggestions = useMemo(
    () =>
      searchData
        .filter(item => !item.permission || hasPermission(permissoes, item.permission))
        .slice(0, 3)
        .map(item => ({
          label: item.name,
          href: item.url,
          icon: item.icon
        })),
    [permissoes]
  )

  return (
    <div className='flex items-center justify-center grow flex-wrap plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      <div className='flex flex-col items-center'>
        <i className='tabler-file-alert text-[64px] mbe-2.5' />
        <p className='text-lg font-medium leading-[1.55556] mbe-11'>{`Nenhum resultado para "${searchValue}"`}</p>
        {suggestions.length > 0 && (
          <>
            <p className='text-[15px] leading-[1.4667] mbe-4 text-textDisabled'>Tente pesquisar por</p>
            <ul className='flex flex-col self-start gap-[18px]'>
              {suggestions.map((item, index) => (
                <li key={index} className='flex items-center'>
                  <Link
                    href={item.href}
                    className='flex items-center gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                    onClick={() => setOpen(false)}
                  >
                    <i className={classnames(item.icon, 'text-xl shrink-0')} />
                    <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default NoResult
