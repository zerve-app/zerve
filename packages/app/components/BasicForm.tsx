import { Button, Fieldset, Label, Spinner, XStack } from '@zerve/ui'
import { ReactNode, useCallback, useState } from 'react'

export function BasicForm<FD>({
  items,
  submitLabel,
  onSubmit,
  initData,
  isLoading,
  onEscape,
}: {
  items: {
    name: string
    label?: string
    input: (props: {
      state: FD
      id: string
      setState: (s: FD | ((s: FD) => FD)) => void
    }) => ReactNode
  }[]
  isLoading?: boolean
  submitLabel?: string
  onSubmit: (data: FD) => void
  initData: FD
  onEscape?: () => void
}) {
  const [data, setData] = useState(initData)
  return (
    <form
      onSubmit={useCallback(
        (e) => {
          e.preventDefault()
          onSubmit(data)
        },
        [data, onSubmit]
      )}
      onKeyPressCapture={useCallback(
        (e) => {
          if (e.key === 'Escape') {
            onEscape?.()
            e.preventDefault()
            console.log('escape')
          }
        },
        [onEscape]
      )}
    >
      {items.map((item, index) => (
        <Fieldset space="$4" horizontal key={index}>
          <Label w={160} justifyContent="flex-end" htmlFor={item.name}>
            {item.label || item.name}
          </Label>
          {item.input({ state: data, id: item.name, setState: setData })}
        </Fieldset>
      ))}
      <XStack ai="flex-end" jc="space-between" mt="$2">
        <XStack>{isLoading && <Spinner />}</XStack>
        <Button accessibilityRole="button">{submitLabel ?? 'Submit'}</Button>
      </XStack>
    </form>
  )
}
