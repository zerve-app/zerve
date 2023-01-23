import { PropsOf } from '@headlessui/react/dist/types'
import { Button } from '@zerve/ui'
import type { ReactElement } from 'react'
import { useLink } from 'solito/link'

export function IconButton({ onPress, icon }: { onPress: () => void; icon?: ReactElement }) {
  return (
    <button
      role="button"
      className="btn flex rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-400"
      onClick={onPress}
    >
      {icon || null}
    </button>
  )
}

export function LinkButton(props: PropsOf<typeof Button> & Parameters<typeof useLink>[0]) {
  if (!props.href) {
    return <Button disabled {...props} />
  }
  const { as, shallow, href, scroll, replace, experimental, ...buttonProps } = props
  const link = useLink({ as, shallow, href, scroll, replace, experimental })
  return <Button {...buttonProps} {...link} />
}
