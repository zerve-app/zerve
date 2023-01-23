import { ReactNode, useMemo } from 'react'
import { Scale, Settings } from '@tamagui/lucide-icons'
import { LinksSidebarLayout } from 'app/components/SidebarLayout'
import { useRouter } from 'next/router'
import { ProjectContainer } from '../ProjectContainer'

const entitySettingsLinks = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'permissions', label: 'Permissions', icon: Scale },
] as const

export function ProjectSettingsContainer({
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
    <ProjectContainer active="settings" title={title}>
      <LinksSidebarLayout links={links} active={active}>
        {children}
      </LinksSidebarLayout>
    </ProjectContainer>
  )
}
