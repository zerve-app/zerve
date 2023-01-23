import { signIn } from 'next-auth/react'
import { Button } from '@zerve/ui'

export function SignInButton() {
  return (
    <Button
      onPress={() => {
        signIn()
        return
      }}
    >
      Sign In
    </Button>
  )
}
