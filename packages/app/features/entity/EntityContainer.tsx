import { Home, Settings, Users } from '@tamagui/lucide-icons'
import { PageHeader } from 'app/components/PageHeader'
import { PageTabsLayout } from 'app/components/PageTabsLayout'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { trpc } from '../../../../apps/zapp/src/utils/trpc'

const entityLinks = [
  { key: '', label: 'Home', icon: Home },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const

export function EntityContainer({
  children,
  active,
  title,
}: {
  children: ReactNode
  active: typeof entityLinks[number]['key']
  title?: string
}) {
  const { query } = useRouter()
  const entityInfo = trpc.entity.getInfo.useQuery(String(query.entityId))
  return (
    <PageTabsLayout
      links={entityLinks.map((link) => ({
        ...link,
        href: `/${String(query.entityId)}/${link.key}`,
      }))}
      active={active}
      header={
        <PageHeader
          title={entityInfo.data?.name}
          imageUri={entityInfo.data?.image}
          pageTitle={title}
        />
      }
    >
      {children}
    </PageTabsLayout>
  )
}
