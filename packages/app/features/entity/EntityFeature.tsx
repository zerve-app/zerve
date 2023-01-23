import { Card, Heading, XStack, YStack } from '@zerve/ui'
import { Plus } from '@tamagui/lucide-icons'
import { LinkButton } from 'app/components/Button'
import RootLayout from 'app/components/RootLayout'
import { useRouter } from 'next/router'
import { useLink } from 'solito/link'
import { trpc } from '../../../../apps/zapp/src/utils/trpc'
import { EntityContainer } from './EntityContainer'

function ProjectCard({ project, entityKey }: { project: { key: string }; entityKey: string }) {
  const linkProps = useLink({ as: `/${entityKey}/${project.key}`, href: '/[entityId]/[projectId]' })
  return (
    <Card
      bg="$gray2Light"
      p="$4"
      borderWidth={1}
      borderColor="#ccc"
      {...linkProps}
      cursor="pointer"
      hoverStyle={{
        bg: '$gray1Light',
      }}
    >
      <Card.Header fontFamily={'sans-serif'} fd="row" jc="space-between" ai="center">
        <Heading f={1} cursor="pointer">
          {project.key}
        </Heading>
      </Card.Header>
    </Card>
  )
}

export function EntityFeature() {
  const { query } = useRouter()
  const entity = trpc.entity.get.useQuery({ key: String(query.entityId) })
  return (
    <RootLayout title={`${query.entityId} Projects`}>
      <EntityContainer active="" title="Projects">
        <YStack space>
          {entity.data?.projects.map((project) => (
            <ProjectCard project={project} key={project.key} entityKey={String(query.entityId)} />
          ))}
          <XStack>
            <LinkButton href={`/${query.entityId}/new`} icon={Plus} theme="green">
              New Project
            </LinkButton>
          </XStack>
        </YStack>
      </EntityContainer>
    </RootLayout>
  )
}
