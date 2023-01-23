import { Paragraph } from '@zerve/ui'
import { EntitySettingsContainer } from './EntitySettingsContainer'
import RootLayout from 'app/components/RootLayout'
import { PageSection, PageSectionStack } from 'app/components/PageSection'
import { useRouter } from 'next/router'
import { DeleteEntityButton } from 'app/components/DeleteEntityButton'

export function EntitySettingsFeature() {
  const { query } = useRouter()
  return (
    <RootLayout>
      <EntitySettingsContainer active="general" title="General Settings">
        <PageSectionStack>
          <PageSection
            title="Delete Entity"
            footer={<DeleteEntityButton entityKey={String(query.entityId)} />}
            danger
          >
            <Paragraph>
              Permanently delete the "{query.entityId}" entity and all data and projects.
            </Paragraph>
          </PageSection>
        </PageSectionStack>
      </EntitySettingsContainer>
    </RootLayout>
  )
}
