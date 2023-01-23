import type { ReactNode } from 'react'
import { LinksSidebarLayout, SidebarLink } from '../../components/SidebarLayout'
import { Bell, Home, Key, Landmark, User } from '@tamagui/lucide-icons'
import { PageHeader } from 'app/components/PageHeader'
import { useSession } from 'next-auth/react'
import { YStack } from '@zerve/ui'

const profileLinks: readonly SidebarLink[] = [
  { key: 'home', href: '/profile', label: 'Profile Home', icon: Home },
  { key: 'public', href: '/profile/public', label: 'Public Info', icon: User },
  { key: 'auth', href: '/profile/auth', label: 'Authentication', icon: Key },
  { key: 'entities', href: '/profile/entities', label: 'Entities', icon: Landmark },
  { key: 'notifs', href: '/profile/notifs', label: 'Notifications', icon: Bell },
] as const

export default function ProfileContainer({
  children,
  active,
  title,
}: {
  children: ReactNode
  active: typeof profileLinks[number]['key']
  title?: string
}) {
  const session = useSession()
  return (
    <YStack f={1} space mt="$4">
      <PageHeader
        title={session?.data?.user?.name}
        imageUri={session?.data?.user?.image}
        pageTitle={title}
        imageCircle
      />
      <LinksSidebarLayout links={profileLinks} active={active} header={null}>
        {children}
      </LinksSidebarLayout>
    </YStack>
  )
}
