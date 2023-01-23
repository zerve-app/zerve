import { Heading } from '@zerve/ui'
import RootLayout from 'app/components/RootLayout'
import React from 'react'
import { ProjectContainer } from './ProjectContainer'

export function ProjectServersFeature() {
  return (
    <RootLayout>
      <ProjectContainer active="servers" title="Media">
        <Heading>Servers?</Heading>
      </ProjectContainer>
    </RootLayout>
  )
}
