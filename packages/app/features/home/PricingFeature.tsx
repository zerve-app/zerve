import { Check, CheckCircle } from '@tamagui/lucide-icons'
import { Heading, Label, Paragraph, Text, XStack, YStack } from '@zerve/ui'
import { PublicLayout } from 'app/components/PublicLayout'
import type { PLANS } from '../../../../apps/zapp/src/utils/billing'

function PricingCell({
  monthly,
  yearly,
  children,
}: {
  monthly: number
  yearly: number
  children?: React.ReactNode
}) {
  return (
    <YStack>
      <Label>${monthly}/mo</Label>
      <Label>${yearly}/yr</Label>
    </YStack>
  )
}
function FeatureCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <XStack jc="space-between" ai="center" space>
      <Label>{label}</Label>
      {children}
    </XStack>
  )
}

export function PricingFeature({ plans }: { plans: typeof PLANS }) {
  return (
    <PublicLayout footer active="pricing">
      <XStack fw="wrap" jc="center">
        {plans.map((plan) => {
          return (
            <YStack p="$6">
              <Heading key={plan.key}>{plan.title}</Heading>
              <FeatureCell label="License to Latest Open Source">
                <CheckCircle />
              </FeatureCell>
              <FeatureCell label="Exclusive Videos & Guides">
                <CheckCircle />
              </FeatureCell>
              <FeatureCell label="Private Support Community">
                <CheckCircle />
              </FeatureCell>

              <FeatureCell label="DB Nodes">{plan.maxNodes}</FeatureCell>
              <FeatureCell label="Asset Storage">
                <Text>{plan.maxStorageGb} GB</Text>
              </FeatureCell>
              <FeatureCell label="Support">{plan.support}</FeatureCell>
              <PricingCell monthly={plan.listedPriceMonthly} yearly={plan.listedPriceYearly} />
            </YStack>
          )
        })}
      </XStack>
      <Heading>Enterprise</Heading>
      <Paragraph>Pay More. Get more. Better Service.</Paragraph>
    </PublicLayout>
  )
}
