import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { XStack, Image } from '@zerve/ui'
import { HeaderAuth } from './Header'
import Head from 'next/head'

const APP_NAME = 'Zerve'

export default function RootLayout({
  children,
  title,
  links,
}: {
  children: ReactNode
  title?: string
  links?: ReactNode
}) {
  const session = useSession()
  return (
    <>
      <Head>
        <title>{title ? `${title} | ${APP_NAME}` : APP_NAME}</title>
        <meta name="description" content="" />
      </Head>
      <nav>
        <XStack space bg="#ececec" ai="center">
          <Link href={'/'}>
            <Image src="/ZerveIconSquare.png" width={50} height={50} m="$4" />
          </Link>
          {links}
          <HeaderAuth user={session?.data?.user} />
        </XStack>
      </nav>
      {children}
    </>
  )
}
