import { Input, Spinner } from '@zerve/ui'
import { useSession } from 'next-auth/react'
import { trpc } from '../../../apps/zapp/src/utils/trpc'
import { PageSectionForm } from './PageSectionForm'

export function SetUsernameRow() {
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
