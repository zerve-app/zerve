import { XStack, YStack } from '@zerve/ui'
import { ComponentPropsWithoutRef, ReactNode } from 'react'

export function PageFrame({
  children,
  ...props
}: { children: ReactNode } & ComponentPropsWithoutRef<typeof XStack>) {
  // const { color } = getTokens()
  const {
    f,
    borderBottomColor,
    borderBottomEndRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    borderBottomStartRadius,
    borderColor,
    borderBottomWidth,
    borderEndColor,
    borderEndWidth,
    borderLeftColor,
    borderLeftWidth,
    borderRadius,
    borderRightColor,
    borderRightWidth,
    borderStartColor,
    borderStartWidth,
    borderStyle,
    borderTopColor,
    borderTopEndRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderTopStartRadius,
    borderTopWidth,
    borderWidth,
    ...innerProps
  } = props
  return (
    <XStack
      justifyContent="center"
      f={f}
      borderBottomColor={borderBottomColor}
      borderBottomEndRadius={borderBottomEndRadius}
      borderBottomLeftRadius={borderBottomLeftRadius}
      borderBottomRightRadius={borderBottomRightRadius}
      borderBottomStartRadius={borderBottomStartRadius}
      borderColor={borderColor}
      borderBottomWidth={borderBottomWidth}
      borderEndColor={borderEndColor}
      borderEndWidth={borderEndWidth}
      borderLeftColor={borderLeftColor}
      borderLeftWidth={borderLeftWidth}
      borderRadius={borderRadius}
      borderRightColor={borderRightColor}
      borderRightWidth={borderRightWidth}
      borderStartColor={borderStartColor}
      borderStartWidth={borderStartWidth}
      borderStyle={borderStyle}
      borderTopColor={borderTopColor}
      borderTopEndRadius={borderTopEndRadius}
      borderTopLeftRadius={borderTopLeftRadius}
      borderTopRightRadius={borderTopRightRadius}
      borderTopStartRadius={borderTopStartRadius}
      borderTopWidth={borderTopWidth}
      borderWidth={borderWidth}
    >
      <YStack f={1} maxWidth={1280} flexWrap="wrap" {...innerProps}>
        {children}
      </YStack>
    </XStack>
  )
}
