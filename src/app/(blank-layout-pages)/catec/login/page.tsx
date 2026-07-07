import { redirect } from 'next/navigation'

import { getCatecLoginUrl } from '@/utils/catec/authPaths'

const CatecLoginRedirectPage = () => {
  redirect(getCatecLoginUrl())
}

export default CatecLoginRedirectPage
