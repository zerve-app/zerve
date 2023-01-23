import type { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Stack, Image, XStack, Button, Anchor } from '@zerve/ui'
import { SignInButton } from './SignInButton'
import { Bell } from '@tamagui/lucide-icons'
import { LinkButton } from './Button'
import { resolveSmallAvatarURL } from 'app/provider/media'
import { NextLink } from 'solito/build/link/next-link'

export function HeaderLinkButton({
  children,
  href,
  active,
}: {
  children: React.ReactNode
  href: string
  active?: boolean
}) {
  return (
    <Anchor
      textDecorationLine="none"
      href={href}
      color={active ? '$purple10Dark' : '$gray10Dark'}
      hoverStyle={{ color: '$purple10Dark' }}
      p="$4"
      fontSize="$4"
      fontWeight="bold"
    >
      {children}
    </Anchor>
  )
}

export function HeaderAuth({ user }: { user?: User }) {
  const session = useSession()
  const readyUser = session?.data?.user || user
  return (
    <Stack f={1} ai="flex-end">
      <XStack ai="center">
        <LinkButton icon={Bell} href="/notifications" size={'$5'} />
        {user ? (
          <Link className="align" href="/profile">
            <XStack padding="$3" space ai="center">
              {readyUser?.image ? (
                <Stack borderRadius={25} overflow="hidden" width={50}>
                  <Image
                    src={resolveSmallAvatarURL(readyUser.image)}
                    accessibilityLabel={readyUser.name || 'profile'}
                    alt={readyUser.name || 'profile'}
                    height={50}
                    width={50}
                  />
                </Stack>
              ) : null}
            </XStack>
          </Link>
        ) : (
          <SignInButton />
        )}
      </XStack>
    </Stack>
  )
}
