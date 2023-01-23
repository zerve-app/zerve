import { YStack } from '@zerve/ui'
import { ReactNode } from 'react'
import { MDContent } from './MDContent'
import { PublicLayout } from './PublicLayout'

export function DocLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PublicLayout footer title={title}>
      <YStack maxWidth={1200} alignSelf="center" paddingHorizontal="$4" paddingVertical="$12">
        <MDContent>{children}</MDContent>
      </YStack>
    </PublicLayout>
  )
}
