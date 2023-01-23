import { Heading } from '@zerve/ui'
import RootLayout from 'app/components/RootLayout'
import React from 'react'
import { ProjectContainer } from './ProjectContainer'

export function ProjectHistoryFeature() {
  return (
    <RootLayout>
      <ProjectContainer active="history" title="History">
        <Heading>History?</Heading>
      </ProjectContainer>
    </RootLayout>
  )
}
