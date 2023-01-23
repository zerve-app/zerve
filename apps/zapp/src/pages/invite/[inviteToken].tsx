import RootLayout from 'app/components/RootLayout'
import type { GetServerSidePropsContext } from 'next'
import { Heading, Button, XStack } from '@zerve/ui'
import { getServerTrpc } from 'src/server/common/trpc'
import { Check, X } from '@tamagui/lucide-icons'

export default function InvitePage({ entity }: { entity: { name: string; key: string } }) {
  return (
    <RootLayout title="Invite">
      <Heading>You have been invited to &quot;{entity.name}&quot;</Heading>
      <XStack space>
        <Button icon={Check} theme="green">
          Accept
        </Button>
        <Button icon={X} theme="red">
          Ignore
        </Button>
      </XStack>
    </RootLayout>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { trpc, session } = await getServerTrpc(ctx)
  //   ctx.query.inviteToken
  const { inviteToken } = ctx.query
  const invite = await trpc.entity.lookupInvite(String(inviteToken))
  if (!invite) {
    return {
      redirect: {
        location: '/',
      },
    }
  }
  console.log(ctx.query.inviteToken, invite)
  return {
    props: {
      entity: invite.entity,
    },
  }
}
