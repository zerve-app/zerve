import { getTokens, Stack, XStack, YStack } from '@zerve/ui'
import { FC, ReactNode } from 'react'
import { LinkButton } from './Button'
import { PageFrame } from './PageFrame'

export type Link = {
  key: string
  href: string
  label: string
  icon?: FC
}

export function PageTabsLayout<Links extends Link[] | readonly Link[]>({
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
    <YStack f={1} space mt="$4">
      {header}
      <PageFrame borderBottomWidth={1} borderColor={'#ccc'} space marginHorizontal="$4">
        <XStack space>
          {links.map((link) => (
            <LinkButton
              href={link.href}
              key={link.key}
              icon={link.icon}
              bg={active === link.key ? color.gray3Light : color.gray1Light}
              hoverStyle={{
                bg: active === link.key ? color.gray4Light : color.gray2Light,
                borderColor: active === link.key ? color.blue10Light : color.gray10Dark,
              }}
              borderRadius={0}
              borderWidth={0}
              borderBottomWidth={active === link.key ? 3 : 1}
              marginBottom={-1}
              borderColor={active === link.key ? color.blue10Light : '#ccc'}
            >
              {link.label}
            </LinkButton>
          ))}
        </XStack>
      </PageFrame>
      <PageFrame>{children}</PageFrame>
    </YStack>
  )
}
