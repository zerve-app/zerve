import { Heading, Image } from '@zerve/ui'
import { resolveSmallAvatarURL } from 'app/provider/media'
import { ReactNode } from 'react'
import { PageFrame } from './PageFrame'

const HEADER_IMAGE_SIZE = 54

export function PageHeader({
  title,
  pageTitle,
  imageUri,
  imageCircle,
}: {
  title?: string | ReactNode
  pageTitle?: string
  imageCircle?: boolean
  imageUri?: string | null
}) {
  return (
    <PageFrame flexDirection="row" ai="center" minHeight={110} paddingHorizontal="$4" space>
      {imageUri && (
        <Image
          src={resolveSmallAvatarURL(imageUri)}
          accessibilityLabel={'profile'}
          alt={`${title} photo`}
          height={HEADER_IMAGE_SIZE}
          width={HEADER_IMAGE_SIZE}
          borderRadius={imageCircle ? HEADER_IMAGE_SIZE / 2 : 0}
        />
      )}
      <Heading>{title}</Heading>
      <Heading color="$gray10Light">{pageTitle}</Heading>
    </PageFrame>
  )
}
