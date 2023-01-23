import { trpc } from '../../../apps/zapp/src/utils/trpc'
import { Button, Input } from '@zerve/ui'
import { DialogContent, useDialog } from './Dialog'
import { Plus } from '@tamagui/lucide-icons'
import { BasicForm } from './BasicForm'
import { useRouter } from 'next/router'

function CreateEntityForm({ onComplete }: { onComplete: () => void }) {
  const createEntity = trpc.entity.create.useMutation()
  const utils = trpc.useContext()
  const { push } = useRouter()
  return (
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
      submitLabel="Create"
      onSubmit={(data) => {
        createEntity
          .mutateAsync(
            { name: data, key: data },
            {
              onSuccess: () => {
                utils.entity.list.invalidate()
                push({ pathname: '/[entityKey]' }, `/${data}`)
              },
            }
          )
          .then(onComplete)
      }}
      initData=""
      isLoading={createEntity.isLoading}
    />
  )
}

export function CreateEntityButton() {
  const [open, dialog] = useDialog((props) => {
    return (
      <DialogContent
        title="Create Entity"
        description="Create a new organization/profile with unique public URL"
        children={<CreateEntityForm onComplete={props.close} />}
      />
    )
  })
  return (
    <>
      <Button theme="green" icon={Plus} onPress={open}>
        Create Entity
      </Button>
      {dialog}
    </>
  )
}
