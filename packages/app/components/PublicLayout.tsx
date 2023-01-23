import type { ReactNode } from 'react'
import { HeaderLinkButton } from './Header'
import { HomeFooter } from './HomeFooter'
import RootLayout from './RootLayout'

export function PublicLayout({
  children,
  title,
  footer,
  active,
}: {
  children: ReactNode
  title?: string
  footer?: boolean
  active?: 'pricing' | 'boosted'
}) {
  return (
    <RootLayout
      title={title}
      links={
        <>
          <HeaderLinkButton href="/docs/boosted" active={active === 'boosted'}>
            Boosted
          </HeaderLinkButton>
          <HeaderLinkButton href="/pricing" active={active === 'pricing'}>
            Pricing
          </HeaderLinkButton>
        </>
      }
    >
      {children}
      {footer && <HomeFooter />}
    </RootLayout>
  )
}
