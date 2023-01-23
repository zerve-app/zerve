import {
  Button,
  DialogTitle,
  Header,
  Heading,
  Input,
  Paragraph,
  Spinner,
  XStack,
  YStack,
} from '@zerve/ui'
import { BasicForm } from 'app/components/BasicForm'
import { useRouter } from 'next/router'
import { DialogContent, useDialog } from 'app/components/Dialog'
import RootLayout from 'app/components/RootLayout'
import { EntityContainer } from './EntityContainer'
import { trpc } from '../../../../apps/zapp/src/utils/trpc'
import { PageSection, PageSectionStack } from 'app/components/PageSection'
import { PlusCircle, XCircle } from '@tamagui/lucide-icons'
import { useMemo } from 'react'
// import type { Cookie,  } from 'next-auth'

function InviteMemberDialog({
  onComplete,
  entityKey,
}: {
  onComplete: () => void
  entityKey: string
}) {
  const invite = trpc.entity.inviteMember.useMutation()
  const utils = trpc.useContext()
  return (
    <DialogContent title="Invite Team Member">
      <BasicForm<string>
        onEscape={onComplete}
        items={[
          {
            label: 'Email',
            name: 'email',
            input: ({ state, setState, id }) => (
              <Input id={id} value={state} onChangeText={setState} />
            ),
          },
        ]}
        submitLabel="Invite"
        onSubmit={(data) => {
          invite
            .mutateAsync({
              email: data,
              entityKey: entityKey,
            })
            .then(() => {
              utils.entity.listTeams.invalidate(entityKey)
            })
            .then(onComplete)
        }}
        initData=""
        isLoading={invite.isLoading}
      />
    </DialogContent>
  )
}

function CreateTeamDialog({
  onComplete,
  entityKey,
}: {
  onComplete: () => void
  entityKey: string
}) {
  const invite = trpc.entity.createTeam.useMutation()
  const utils = trpc.useContext()
  return (
    <DialogContent title="Create Team">
      <BasicForm<string>
        onEscape={onComplete}
        items={[
          {
            label: 'Name',
            name: 'name',
            input: ({ state, setState, id }) => (
              <Input id={id} value={state} onChangeText={setState} />
            ),
          },
        ]}
        submitLabel="Invite"
        onSubmit={(data) => {
          invite
            .mutateAsync({
              name: data,
              entityKey: entityKey,
            })
            .then(() => {
              utils.entity.listTeams.invalidate(entityKey)
            })
            .then(onComplete)
        }}
        initData=""
        isLoading={invite.isLoading}
      />
    </DialogContent>
  )
}

function InviteMemberButton({ entityKey }: { entityKey: string }) {
  const [openDialog, dialog] = useDialog(({ close }) => (
    <InviteMemberDialog onComplete={close} entityKey={entityKey} />
  ))
  return (
    <>
      {dialog}
      <Button theme="green" icon={PlusCircle} onPress={openDialog}>
        Invite Member
      </Button>
    </>
  )
}

function CreateTeamButton({ entityKey }: { entityKey: string }) {
  const [openDialog, dialog] = useDialog(({ close }) => (
    <CreateTeamDialog onComplete={close} entityKey={entityKey} />
  ))
  return (
    <>
      {dialog}
      <Button icon={PlusCircle} theme="green" onPress={openDialog}>
        Create Team
      </Button>
    </>
  )
}

function RevokeInviteButton({ inviteId, entityKey }: { inviteId: string; entityKey: string }) {
  const utils = trpc.useContext()
  const revoke = trpc.entity.revokeInvite.useMutation({
    onSuccess: () => {
      utils.entity.listTeams.invalidate(entityKey)
    },
  })
  return (
    <Button
      icon={XCircle}
      theme="red"
      onPress={() => {
        revoke.mutate({ inviteId, entityKey })
      }}
    >
      {revoke.isLoading ? <Spinner /> : 'Revoke Invite'}
    </Button>
  )
}

function EntityTeam({ entityKey }: { entityKey: string }) {
  const team = trpc.entity.listTeams.useQuery(entityKey)
  const [admins, members] = useMemo(() => {
    const admins = []
    const members = []
    team.data?.members.forEach((m) => {
      if (m.isEntityAdmin) admins.push(m)
      else members.push(m)
    })
    return [admins, members]
  }, [team.data?.members])
  return (
    <PageSectionStack>
      <PageSection title="Admins">
        {admins.map((member) => (
          <XStack key={member.user.id}>
            <Paragraph f={1}>{member.user.name}</Paragraph>
          </XStack>
        ))}
      </PageSection>
      <PageSection title="Members">
        <XStack>
          <InviteMemberButton entityKey={entityKey} />
        </XStack>
        {members.map((member) => (
          <XStack key={member.user.id}>
            <Paragraph f={1}>{member.user.name}</Paragraph>
          </XStack>
        ))}
      </PageSection>
      <PageSection title="Organization Invites">
        {team.data?.invites.map((invite) => (
          <XStack key={invite.email}>
            <Paragraph f={1}>{invite.email}</Paragraph>
            <RevokeInviteButton entityKey={entityKey} inviteId={invite.id} />
          </XStack>
        ))}
      </PageSection>
      <PageSection title="Teams">
        {team.data?.teams.map((team) => (
          <XStack key={team.key}>
            <Paragraph f={1}>{team.key}</Paragraph>
          </XStack>
        ))}
        <XStack>
          <CreateTeamButton entityKey={entityKey} />
        </XStack>
      </PageSection>
    </PageSectionStack>
  )
}
export function EntityTeamFeature() {
  const { query } = useRouter()
  return (
    <RootLayout>
      <EntityContainer active="team" title="Team">
        <EntityTeam entityKey={String(query.entityId)} />
      </EntityContainer>
    </RootLayout>
  )
}
