import { XStack, YStack } from '@zerve/ui'
import type { ReactNode } from 'react'

export function ItemList<Item extends { key: string }>({
  items,
  renderItem,
  button,
  emptyLabel = 'No items',
}: {
  items: Item[]
  renderItem: (item: Item) => ReactNode
  button?: ReactNode
  emptyLabel?: string
}) {
  return (
    <YStack space>
      {items.length === 0 ? <div className="">{emptyLabel}</div> : null}
      {items.map((item) => (
        <div key={item.key} className="">
          {renderItem(item)}
        </div>
      ))}
      <XStack>{button}</XStack>
    </YStack>
  )
}
