import { trpc } from '../../../../../apps/zapp/src/utils/trpc'
import { Input } from '@zerve/ui'
import { BasicForm } from 'app/components/BasicForm'
import RootLayout from 'app/components/RootLayout'
import { EntityContainer } from '../EntityContainer'
import { useRouter } from 'next/router'

export function NewProjectFeature({ onComplete }: { onComplete: () => void }) {
  const createProject = trpc.project.create.useMutation()
  const { query, push } = useRouter()

  const utils = trpc.useContext()
  return (
    <RootLayout>
      <EntityContainer active="" title="New Project">
        <BasicForm<string>
          onEscape={onComplete}
          items={[
            {
              name: 'Name',
              input: ({ state, id, setState }) => {
                return <Input f={1} id={id} value={state} onChangeText={setState} />
              },
            },
          ]}
          submitLabel="Create Project"
          onSubmit={(data) => {
            createProject
              .mutateAsync(
                { key: data, entityKey: String(query.entityId) },
                {
                  onSuccess: () => {
                    utils.project.list.invalidate({ entityKey: String(query.entityId) })
                    utils.entity.get.setData({ key: String(query.entityId) }, (entity) => {
                      if (!entity) return undefined
                      return {
                        ...entity,
                        projects: [
                          ...entity.projects,
                          {
                            key: data,
                          },
                        ].sort((a, b) => a.key.localeCompare(b.key)),
                      }
                    })
                    push('/[entityId]/[projectId]', `/${query.entityId}/${data}`)
                  },
                }
              )
              .then(onComplete)
          }}
          initData=""
          isLoading={createProject.isLoading}
        />
      </EntityContainer>
    </RootLayout>
  )
}
