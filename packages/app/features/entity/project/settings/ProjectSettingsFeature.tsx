import { Paragraph } from '@zerve/ui'
import RootLayout from 'app/components/RootLayout'
import { PageSection, PageSectionStack } from 'app/components/PageSection'
import { useRouter } from 'next/router'
import { ProjectSettingsContainer } from './ProjectSettingsContainer'
import { DeleteProjectButton } from 'app/components/DeleteProjectButton'

export function ProjectSettingsFeature() {
  const { query } = useRouter()
  return (
    <RootLayout>
      <ProjectSettingsContainer active="general" title="General Settings">
        <PageSectionStack>
          <PageSection
            title="Delete Project"
            footer={
              <DeleteProjectButton
                entityKey={String(query.entityId)}
                projectKey={String(query.projectId)}
              />
            }
            danger
          >
            <Paragraph>Permanently delete the "{query.projectId}" project and all media.</Paragraph>
          </PageSection>
        </PageSectionStack>
      </ProjectSettingsContainer>
    </RootLayout>
  )
}
