import { Heading, Section, XStack, YStack } from '@zerve/ui'
import { ComponentProps, ReactNode } from 'react'

export function PageSection({
  children,
  footer,
  title,
  danger,
  borderStyle,
  backgroundColor,
}: {
  children: ReactNode
  title?: string
  footer?: ReactNode
  borderStyle?: ComponentProps<typeof Section>['borderStyle']
  danger?: boolean
  backgroundColor?: ComponentProps<typeof Section>['backgroundColor']
}) {
  const borderColor = danger ? '$red10Light' : '$gray8Light'
  return (
    <Section
      borderRadius={'$3'}
      overflow="hidden"
      borderStyle={borderStyle}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      borderWidth="1"
    >
      <YStack space p="$4">
        {title && <Heading size="$7">{title}</Heading>}
        {children}
      </YStack>
      {footer && (
        <XStack
          backgroundColor="$gray2Light"
          borderTopWidth={1}
          borderColor={borderColor}
          paddingVertical="$3"
          paddingHorizontal="$4"
          minHeight={70}
          jc="flex-end"
        >
          {footer}
        </XStack>
      )}
    </Section>
  )
}

export function PageSectionStack({ children }: { children: ReactNode }) {
  return <YStack space>{children}</YStack>
}
