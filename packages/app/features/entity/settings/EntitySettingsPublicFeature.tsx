import { Input } from '@zerve/ui'
import { PageSectionStack } from 'app/components/PageSection'
import { PageSectionForm } from 'app/components/PageSectionForm'
import { AvatarUploadSection } from 'app/components/PictureUpload'
import RootLayout from 'app/components/RootLayout'
import { useRouter } from 'next/router'
import { trpc } from '../../../../../apps/zapp/src/utils/trpc'
import { EntitySettingsContainer } from './EntitySettingsContainer'

function SetNameSection({ entity }: { entity: { name: string; key: string } }) {
  const setName = trpc.entity.setName.useMutation()
  return (
    <PageSectionForm
      title="Public Entity Name"
      isLoading={setName.isLoading}
      initData={entity.name}
      items={[
        {
          name: 'Name',
          input: ({ state, id, setState }) => {
            return <Input id={id} value={state} onChangeText={setState} />
          },
        },
      ]}
      submitLabel="Save Name"
      onSubmit={async (name) => setName.mutateAsync({ name, key: entity.key })}
    />
  )
}

export function EntitySettingsPublicFeature() {
  const { query } = useRouter()
  const entityKey = String(query.entityId)
  const utils = trpc.useContext()

  const entity = trpc.entity.getInfo.useQuery(entityKey)
  return (
    <RootLayout>
      <EntitySettingsContainer active="public">
        <PageSectionStack>
          {entity?.data && <SetNameSection entity={entity.data} />}
          <AvatarUploadSection
            title="Entity Picture"
            description="Drop your new entity picture here, or click to select a file."
            endpoint="entity-picture"
            token={{ entityKey: entityKey }}
            image={entity.data?.image}
            onResolved={({ avatarKey }) => {
              utils.entity.getInfo.setData(entityKey, (data) => {
                if (!data) return data
                return {
                  ...data,
                  image: avatarKey,
                }
              })
              utils.entity.getInfo.invalidate(entityKey)
            }}
          />
        </PageSectionStack>
      </EntitySettingsContainer>
    </RootLayout>
  )
}
