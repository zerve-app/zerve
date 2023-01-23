import ProfileContainer from './ProfileContainer'
import { AvatarUploadSection } from '../../components/PictureUpload'
import { Input, Spinner } from '@zerve/ui'
import { useSession } from 'next-auth/react'
import RootLayout from 'app/components/RootLayout'
import { trpc } from '../../../../apps/zapp/src/utils/trpc'
import { PageSectionForm } from 'app/components/PageSectionForm'
import { PageSectionStack } from 'app/components/PageSection'

function SetUsernameSection() {
  const session = useSession()
  const setUsername = trpc.auth.setUserName.useMutation()
  const initName = session?.data?.user?.name
  if (!initName) return <Spinner />
  return (
    <PageSectionForm
      title="Public Name"
      isLoading={setUsername.isLoading}
      initData={initName}
      items={[
        {
          name: 'Name',
          input: ({ state, id, setState }) => {
            return <Input id={id} value={state} onChangeText={setState} />
          },
        },
      ]}
      submitLabel="Save Name"
      onSubmit={setUsername.mutateAsync}
    />
  )
}

export type ProfilePublicFeatureProps = Record<string, never>

export function ProfilePublicFeature() {
  const session = useSession()
  const { image } = session.data?.user || {}

  return (
    <RootLayout title="Public Profile">
      <ProfileContainer active="public" title="Public Profile">
        <PageSectionStack>
          <SetUsernameSection />
          <AvatarUploadSection
            image={image}
            title="Profile Picture"
            description="Drop your new profile picture here, or click to select a file."
            token={null}
            circle
            endpoint="profile-picture"
            onResolved={() => {
              window.location.reload()
            }}
          />
        </PageSectionStack>
      </ProfileContainer>
    </RootLayout>
  )
}
