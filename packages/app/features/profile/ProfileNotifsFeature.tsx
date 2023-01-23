import { getTokens, Heading, YStack } from '@zerve/ui'
import RootLayout from 'app/components/RootLayout'
import { useSession } from 'next-auth/react'
import ProfileContainer from './ProfileContainer'

export type ProfileNotifsFeatureProps = Record<string, never>

export function ProfileNotifsFeature({}: ProfileNotifsFeatureProps) {
  const session = useSession()
  if (!session) {
    throw new Error('Not signed in')
  }
  const { color } = getTokens()

  return (
    <RootLayout title="Notification Settings">
      <ProfileContainer title="Notification Settings" active="notifs">
        <Heading>Lol</Heading>
      </ProfileContainer>
    </RootLayout>
  )
}
