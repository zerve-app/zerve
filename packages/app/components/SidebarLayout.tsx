import { getTokens, Heading, Stack, XStack, YStack } from '@zerve/ui'
import Link from 'next/link'
import type { FC, ReactNode } from 'react'
import { LinkButton } from './Button'
import { PageFrame } from './PageFrame'

export type SidebarLink = {
  key: string
  href?: string
  label: string
  icon?: FC
}

export type SidebarSection = {
  key: string
  label: string
  links: SidebarLink[]
}

export function LinksSidebarLayout<Links extends SidebarLink[] | readonly SidebarLink[]>({
  links,
  children,
  active,
  header,
}: {
  links: Links
  children: ReactNode
  active: Links[number]['key']
  header?: ReactNode
}) {
  const { color } = getTokens()
  return (
    <SidebarLayout
      header={header}
      children={children}
      sidebar={links.map((link) => (
        <LinkButton
          size={'$4'}
          icon={link.icon}
          key={link.key}
          href={link.href}
          jc="flex-start"
          bg={active === link.key ? color.gray3Light : color.gray1Light}
          hoverStyle={{ bg: active === link.key ? color.gray4Light : color.gray2Light }}
          color={color.gray5Dark}
        >
          {link.label}
        </LinkButton>
      ))}
    />
  )
}

export function SectionSidebarLayout<
  Sections extends SidebarSection[] | readonly SidebarSection[]
>({
  sections,
  children,
  activeSection,
  active,
  header,
}: {
  sections: Sections
  children: ReactNode
  activeSection?: Sections[number]['key']
  active?: Sections[number]['links'][number]['key']
  header?: ReactNode
}) {
  const { color } = getTokens()
  return (
    <SidebarLayout
      header={header}
      children={children}
      sidebar={sections.map((section) => (
        <YStack key={section.key}>
          <Heading color={section.key === activeSection ? '$purple10Light' : undefined}>
            {section.label}
          </Heading>
          {section?.links?.map((link) => (
            <LinkButton
              key={link.key}
              size={'$4'}
              icon={link.icon}
              key={link.key}
              href={link.href}
              jc="flex-start"
              bg={active === link.key ? color.gray3Light : color.gray1Light}
              hoverStyle={{ bg: active === link.key ? color.gray4Light : color.gray2Light }}
              color={link.href ? color.gray5Dark : color.gray10Dark}
            >
              {link.label}
            </LinkButton>
          ))}
        </YStack>
      ))}
    />
  )
}

export function SidebarLayout({
  sidebar,
  children,
  header,
}: {
  sidebar: ReactNode
  children: ReactNode
  header?: ReactNode
}) {
  return (
    <>
      {header}
      <PageFrame flexDirection="row">
        <XStack f={1} space backgroundColor={null} paddingHorizontal="$4">
          <YStack minWidth={300} space="$2">
            {sidebar}
          </YStack>
          <Stack f={1} minWidth={500}>
            {children}
          </Stack>
        </XStack>
      </PageFrame>
    </>
  )
}
