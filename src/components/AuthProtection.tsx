'use server'

// import { redirect, usePathname } from 'next/navigation'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import jwt from 'jsonwebtoken'
const allowedDomains = [
  'localhost:3000',
  '127.0.0.1:3000',
  'vercel.app',
  process.env.NEXT_PUBLIC_DOMAIN,
  process.env.NEXT_PUBLIC_SHARE_DOMAIN,
]

export default async function Protected({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, getUser, getAccessTokenRaw } =
    getKindeServerSession()
  const user = await getUser()
  const userIsAuthenticated = await isAuthenticated()

  if (!userIsAuthenticated || !user) {
    return redirect('/api/auth/login')
  }

  const headersList = await headers()

  const domain = headersList.get('host')
  const fullUrl = headersList.get('referer') // Pode conter a URL completa
  const pathname = fullUrl ? new URL(fullUrl).pathname : '/'

  if (domain && !allowedDomains.includes(domain)) {
    if (!userIsAuthenticated) {
      return redirect('/api/auth/login')
    } else {
      return redirect('/api/auth/logout')
    }
  }

  const token = await getAccessTokenRaw()
  const decodedToken: any = jwt.decode(token || '')

  if (decodedToken) {
    const allow_access = decodedToken.user_properties.allow_access

    console.log('allow_access', allow_access)

    if (allow_access.v !== 'true') {
      return redirect('/welcome')
    }
  }

  // const userHasAllowAccess = async () => {
  //   const accessToken = await getAccessToken(
  //     process.env.KINDE_M2M_CLIENT_ID || '',
  //     process.env.KINDE_M2M_CLIENT_SECRET || ''
  //   )

  //   const userProperties = await getUserProperties(user.id, accessToken)

  //   const foundProperties = userProperties.properties

  //   const allow_access_prop = foundProperties?.find(
  //     (property: any) => property.key === 'allow_access'
  //   )

  //   if (!allow_access_prop) {
  //     return false
  //   }

  //   return true
  // }

  // const allowViewChildren = await userHasAllowAccess()

  // console.log('--> allowViewChildren', fullUrl, pathname, allowViewChildren)

  // if (!allowViewChildren && pathname !== '/welcome') {
  //   return <>{redirect('/welcome')}</>
  // }

  return children
}
