import { ReactNode, useMemo } from 'react'
import { Building, Settings, Wallet } from '@tamagui/lucide-icons'
import { LinksSidebarLayout } from 'app/components/SidebarLayout'
import { useRouter } from 'next/router'
import { EntityContainer } from '../EntityContainer'
import { Heading } from '@zerve/ui'

const entitySettingsLinks = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'billing', label: 'Billing', icon: Wallet },
  { key: 'public', label: 'Entity Profile', icon: Building },
] as const

export function EntitySettingsContainer({
  children,
  active,
  title,
}: {
  children: ReactNode
  active: typeof entitySettingsLinks[number]['key']
  title?: string
}) {
  const { query } = useRouter()
  const links = useMemo(() => {
    return entitySettingsLinks.map((link) => ({
      ...link,
      href: `/${query.entityId}/settings/${link.key}`,
    }))
  }, [query.entityId])
  return (
    <EntityContainer active="settings" title={title}>
      <LinksSidebarLayout
        links={links}
        active={active}
        // header={
        //   <Heading
        //     paddingLeft={320}
        //     paddingVertical={48}
        //     size="$10"
        //     fontWeight={'300'}
        //     color="$gray11Light"
        //   >
        //     {title}
        //   </Heading>
        // }
      >
        {children}
      </LinksSidebarLayout>
    </EntityContainer>
  )
}
