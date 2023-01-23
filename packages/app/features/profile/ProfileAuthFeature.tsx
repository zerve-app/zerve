import { useSession } from 'next-auth/react'
import ProfileContainer from './ProfileContainer'
import { SignOutButton } from '../../components/SignOutButton'
import RootLayout from 'app/components/RootLayout'
import { PageSection } from 'app/components/PageSection'
import { Paragraph, YStack } from '@zerve/ui'

export type ProfileAuthFeatureProps = Record<string, never>

export function ProfileAuthFeature({}: ProfileAuthFeatureProps) {
  const session = useSession()
  if (!session) {
    throw new Error('Not signed in')
  }
  return (
    <RootLayout title="Auth">
      <ProfileContainer active="auth" title="Authentication Settings">
        <YStack space>
          <PageSection title="Email">
            <Paragraph>{session.data?.user?.email}</Paragraph>
          </PageSection>
          <PageSection title="Sign Out" footer={<SignOutButton />}>
            <Paragraph>See you later, aligator</Paragraph>
          </PageSection>
        </YStack>
      </ProfileContainer>
    </RootLayout>
  )
}
