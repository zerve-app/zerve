import { Heading } from '@zerve/ui'
import RootLayout from 'app/components/RootLayout'
import React from 'react'
import { useRouter } from 'next/router'
import { ProjectContainer } from './ProjectContainer'

export function ProjectDataFeature() {
  const { query } = useRouter()
  return (
    <RootLayout title={`${query.projectId}`}>
      <ProjectContainer active="data" title="Data">
        <Heading>Data?</Heading>
      </ProjectContainer>
    </RootLayout>
  )
}
