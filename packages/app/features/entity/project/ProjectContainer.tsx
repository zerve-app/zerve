import { Database, HardDrive, History, Server, Settings } from '@tamagui/lucide-icons'
import { PageHeader } from 'app/components/PageHeader'
import { PageTabsLayout } from 'app/components/PageTabsLayout'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import Link from 'next/link'

const entityLinks = [
  { key: 'data', label: 'Data', icon: Database },
  { key: 'media', label: 'Media', icon: HardDrive },
  { key: 'history', label: 'History', icon: History },
  { key: 'servers', label: 'Servers', icon: Server },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const

export function ProjectContainer({
  children,
  active,
  title,
}: {
  children: ReactNode
  active: typeof entityLinks[number]['key']
  title?: string
}) {
  const { query } = useRouter()
  return (
    <PageTabsLayout
      links={entityLinks.map((link) => ({
        ...link,
        href: `/${String(query.entityId)}/${String(query.projectId)}/${link.key}`,
      }))}
      active={active}
      header={
        <PageHeader
          title={
            <>
              <Link href={`/${String(query.entityId)}`}>{String(query.entityId)}</Link>/
              <Link href={`/${String(query.entityId)}/${String(query.projectId)}`}>
                {String(query.projectId)}
              </Link>
            </>
          }
          pageTitle={title}
        />
      }
    >
      {children}
    </PageTabsLayout>
  )
}
