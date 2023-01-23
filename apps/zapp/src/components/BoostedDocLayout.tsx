import type { ReactNode } from 'react'
import { MDContent } from 'app/components/MDContent'
import { PublicLayout } from 'app/components/PublicLayout'
import { type SidebarSection, SectionSidebarLayout } from 'app/components/SidebarLayout'
import { useRouter } from 'next/router'

const DocsSections: SidebarSection[] = [
  {
    label: 'General',
    key: 'overview',
    links: [
      { href: '/docs/boosted', label: 'Boosted Overview', key: 'overview' },
      { href: '/docs/boosted/getting-started', label: 'Getting Started', key: 'getting-started' },
      { href: '/docs/boosted/deployment', label: 'Deployment', key: 'deployment' },
    ],
  },
  {
    label: 'Guides',
    key: 'guides',
    links: [
      {
        label: 'Mutations and Queries',
        key: 'mutations-and-queries',
        href: '/docs/boosted/mutations-and-queries',
      },
      {
        label: 'DB Schema Basics',
        key: 'db-schema-basics',
        href: '/docs/boosted/db-schema-basics',
      },
      {
        label: 'Permissions & Events',
        key: 'permissions-events',
      },
      {
        label: 'File Uploading to S3',
        key: 'file-uploading-to-s3-direct',
      },
      {
        label: 'Avatar Uploading',
        key: 'avatar-uploading',
        href: '/docs/boosted/avatar-uploading',
      },
      {
        label: 'Sending Emails',
        key: 'emails',
        href: '/docs/boosted/sending-emails',
      },

      {
        label: 'Env Variables',
        key: 'env-variables',
        href: '/docs/boosted/env-variables',
      },
      {
        label: 'OAuth Setup',
        key: 'oauth-setup',
      },
      {
        label: 'Invite Workflow',
        key: 'next-auth-invite-workflow',
      },
      {
        label: 'Email Change Workflow',
        key: 'next-auth-email-change-workflow',
      },
      {
        label: 'App Notifications',
        key: 'app-notifications',
      },
      {
        label: 'Next Auth UI',
        key: 'next-auth-ui',
      },
    ],
  },
  {
    label: 'ZStack Intro',
    key: 'zstack-intro',
    links: [
      {
        label: 'TRPC',
        key: 'trpc',
      },
      {
        label: 'React',
        key: 'react',
      },
      {
        label: 'Next.js',
        key: 'nextjs',
      },
      {
        label: 'Auth.js (Next Auth)',
        key: 'authjs',
      },
      {
        label: 'Tamagui',
        key: 'tamagui',
      },
      {
        label: 'Prisma',
        key: 'prisma',
      },
      {
        label: 'Zod',
        key: 'zod',
      },
      {
        label: 'Typescript',
        key: 'ts',
      },
      {
        label: 'React Native',
        key: 'rn',
      },
      {
        label: 'Tanstack Query (React Query)',
        key: 'tanstack-query',
      },
    ],
  },
]

export function BoostedDocLayout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter()
  let active: string | undefined
  let activeSection: string | undefined
  let title: string | undefined

  DocsSections.find((section) => {
    const activeLink = section.links.find((link) => {
      return link.href === pathname
    })

    if (activeLink) {
      title = activeLink.label
      active = activeLink.key
      activeSection = section.key
    }
    return !!activeLink
  })
  return (
    <PublicLayout footer active="boosted" title={title}>
      <SectionSidebarLayout active={active} activeSection={activeSection} sections={DocsSections}>
        <MDContent>{children}</MDContent>
      </SectionSidebarLayout>
    </PublicLayout>
  )
}
