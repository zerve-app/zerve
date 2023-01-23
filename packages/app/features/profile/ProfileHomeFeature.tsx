import { useSession } from 'next-auth/react'
import ProfileContainer from './ProfileContainer'
import RootLayout from 'app/components/RootLayout'
import { PageSection, PageSectionStack } from 'app/components/PageSection'
import { Button, Paragraph, Spinner, XStack } from '@zerve/ui'
import { trpc } from '../../../../apps/zapp/src/utils/trpc'
import { Check, X } from '@tamagui/lucide-icons'

export type ProfileHomeFeatureProps = Record<string, never>

export function ProfileHomeFeature({}: ProfileHomeFeatureProps) {
  const session = useSession()
  const inviteQuery = trpc.entity.listInvites.useQuery()
  if (!session) {
    throw new Error('Not signed in')
  }
  return (
    <RootLayout title="Profile">
      <ProfileContainer active="home" title="Profile Home">
        <PageSectionStack>
          <PageSection title="Invites">
            {inviteQuery.isLoading ? <Spinner /> : null}
            {inviteQuery.data?.invites.map((invite) => (
              <XStack space>
                <Paragraph key={invite.entity.key}>
                  Invited to <b>{invite.entity.name}</b> by <b>{invite.fromUser.name}</b>
                </Paragraph>
                <Button icon={Check} theme="green">
                  Accept
                </Button>
                <Button icon={X} theme="red">
                  Ignore
                </Button>
              </XStack>
            ))}
          </PageSection>
        </PageSectionStack>
      </ProfileContainer>
    </RootLayout>
  )
}
