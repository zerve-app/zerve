import { Button, Card, Heading, Image } from '@zerve/ui'
import { Settings, Settings2 } from '@tamagui/lucide-icons'
import RootLayout from 'app/components/RootLayout'
import { resolveSmallAvatarURL } from 'app/provider/media'
import { useSession } from 'next-auth/react'
import { useLink } from 'solito/link'
import { trpc } from '../../../../apps/zapp/src/utils/trpc'
import { CreateEntityButton } from '../../components/CreateEntityButton'
import { ItemList } from '../../components/ItemList'
import ProfileContainer from './ProfileContainer'

function EntitySettingsButton({ entityKey }: { entityKey: string }) {
  const linkProps = useLink({ as: `/${entityKey}/settings`, href: '/[entityId]/settings' })
  return <Button icon={Settings} size="$5" chromeless {...linkProps} />
}

function EntityCard({ entity }: { entity: DisplayEntity }) {
  const linkProps = useLink({ as: `/${entity.key}`, href: '/[entityId]' })
  console.log('entity', entity)
  return (
    <Card
      bg="$gray2Light"
      p="$4"
      key={entity.key}
      borderWidth={1}
      borderColor="#ccc"
      {...linkProps}
      cursor="pointer"
      hoverStyle={{
        bg: '$gray1Light',
      }}
    >
      <Card.Header fd="row" jc="space-between" ai="center" space="$4">
        {entity.image && (
          <Image
            src={resolveSmallAvatarURL(entity.image)}
            alt={entity.name}
            width={32}
            height={32}
          />
        )}
        <Heading f={1} fontFamily="sans-serif" cursor="pointer">
          {entity.name}
        </Heading>
        <Heading fontFamily="sans-serif" color="$gray10Dark" marginRight="$4" cursor="pointer">
          /{entity.key}
        </Heading>
        <EntitySettingsButton entityKey={entity.key} />
      </Card.Header>
    </Card>
  )
}

export type DisplayEntity = {
  key: string
  isEntityAdmin: boolean
  name: string
  image?: string | null
}

export type ProfileEntitiesFeatureProps = {
  data: DisplayEntity[]
}

export function ProfileEntitiesFeature({ data }: ProfileEntitiesFeatureProps) {
  const session = useSession()
  const entities = trpc.entity.list.useQuery()
  const user = session?.data?.user
  if (!user) {
    return null
  }
  return (
    <RootLayout title="Entities">
      <ProfileContainer active="entities" title="Entities">
        <ItemList
          emptyLabel="You have no organizations"
          items={entities.data || data}
          renderItem={(entity) => {
            return <EntityCard entity={entity} key={entity.key} />
          }}
          button={<CreateEntityButton />}
        />
      </ProfileContainer>
    </RootLayout>
  )
}
