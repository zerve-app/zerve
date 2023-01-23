import { trpc } from '../../../apps/zapp/src/utils/trpc'
import { Button } from '@zerve/ui'
import { DialogContent, useDialog } from './Dialog'
import { BasicForm } from './BasicForm'
import { useRouter } from 'next/router'

function DeleteProjectForm({
  onComplete,
  entityKey,
  projectKey,
}: {
  onComplete: () => void
  entityKey: string
  projectKey: string
}) {
  const deleteProject = trpc.project.destroy.useMutation()
  const utils = trpc.useContext()
  const { push, query } = useRouter()
  return (
    <BasicForm<string>
      onEscape={onComplete}
      items={[]}
      submitLabel="Destroy Project"
      onSubmit={(data) => {
        deleteProject
          .mutateAsync(
            { projectKey, entityKey },
            {
              onSuccess: () => {
                utils.project.list.invalidate({ entityKey: String(query.entityId) })
                utils.entity.get.setData({ key: String(query.entityId) }, (entity) => {
                  if (!entity) return undefined
                  return {
                    ...entity,
                    projects: entity.projects.filter((project) => project.key !== projectKey),
                  }
                })

                push(`/${entityKey}`)
              },
            }
          )
          .then(onComplete)
      }}
      initData=""
      isLoading={deleteProject.isLoading}
    />
  )
}

export function DeleteProjectButton({
  entityKey,
  projectKey,
}: {
  entityKey: string
  projectKey: string
}) {
  const [open, dialog] = useDialog((props) => {
    return (
      <DialogContent
        title="Delete Project"
        description="Delete project"
        children={
          <DeleteProjectForm
            entityKey={entityKey}
            projectKey={projectKey}
            onComplete={props.close}
          />
        }
      />
    )
  })
  return (
    <>
      <Button theme="red" themeInverse onPress={open}>
        Destroy Project
      </Button>
      {dialog}
    </>
  )
}
