import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@zerve/ui'

export function SignOutButton() {
  const session = useSession()
  const router = useRouter()

  return session.data ? (
    <Button
      onPress={() => {
        signOut().then(() => {
          router.push('/')
        })
      }}
    >
      Sign Out
    </Button>
  ) : null
}
