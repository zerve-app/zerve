DeleteEntityButton

import { trpc } from '../../../apps/zapp/src/utils/trpc'
import { Button, Input } from '@zerve/ui'
import { DialogContent, useDialog } from './Dialog'
import { BasicForm } from './BasicForm'
import { useRouter } from 'next/router'

function DeleteEntityForm({
  onComplete,
  entityKey,
}: {
  onComplete: () => void
  entityKey: string
}) {
  const DeleteEntity = trpc.entity.destroy.useMutation()
  const { push } = useRouter()
  const utils = trpc.useContext()
  return (
    <BasicForm<string>
      onEscape={onComplete}
      items={[]}
      submitLabel="Destroy Entity"
      onSubmit={(data) => {
        DeleteEntity.mutateAsync(
          { key: entityKey },
          {
            onSuccess: () => {
              utils.entity.list.invalidate()
              utils.entity.list.setData(undefined, (entities) => {
                return entities?.filter((entity) => entity.key !== entityKey)
              })
              push('/profile/entities')
            },
          }
        ).then(onComplete)
      }}
      initData=""
      isLoading={DeleteEntity.isLoading}
    />
  )
}

export function DeleteEntityButton({ entityKey }: { entityKey: string }) {
  const [open, dialog] = useDialog((props) => {
    return (
      <DialogContent
        title="Delete Entity"
        description="Delete org/profile"
        children={<DeleteEntityForm entityKey={entityKey} onComplete={props.close} />}
      />
    )
  })
  return (
    <>
      <Button theme="red" themeInverse onPress={open}>
        Delete Entity
      </Button>
      {dialog}
    </>
  )
}
