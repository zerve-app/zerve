import { Image, Paragraph } from '@zerve/ui'
import { DragEventHandler, ChangeEventHandler, useRef } from 'react'
import React, { useState } from 'react'
import { PageSection } from './PageSection'
import { resolveLargeAvatarURL } from 'app/provider/media'
import { uploadFormFile } from 'app/provider/upload'

export function AvatarUploadSection({
  image,
  token,
  endpoint,
  onResolved,
  title,
  description,
  circle,
}: {
  image?: string | null
  token: any
  endpoint: string
  onResolved?: (response: any) => void
  title?: string
  description?: string
  circle?: boolean
}) {
  const [isHovering, setIsHovering] = useState(false)
  const [progress, setProgress] = useState(0)
  const input = useRef<HTMLInputElement | null>(null)

  function handleFileSelect(file: File) {
    uploadFormFile(`/api/upload/${endpoint}`, file, token, setProgress)
      .then((uploadResponse) => {})
      .catch((e) => {
        // todo:error handling
      })
  }

  function handleDrop(e: Parameters<DragEventHandler<HTMLDivElement>>[0]) {
    e.preventDefault()

    const droppedFiles = e.dataTransfer.files
    const file = droppedFiles[0]
    if (!file) return
    setIsHovering(false)
    handleFileSelect(file)
  }

  const handleInputChange = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0]) => {
    const inputFiles = e.target.files
    const file = inputFiles?.[0]
    if (!file) return
    handleFileSelect(file)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        justifySelf: 'stretch',
      }}
      onDrop={handleDrop}
      onDragLeave={(e) => {
        setIsHovering(false)
      }}
      onDragOver={(e) => {
        setIsHovering(true)
        e.preventDefault()
      }}
    >
      <PageSection
        title={title}
        borderStyle={isHovering ? 'dashed' : undefined}
        backgroundColor={isHovering ? '$blue3Light' : undefined}
        footer={<Paragraph f={1}>{description}</Paragraph>}
      >
        {progress > 0 && <progress value={progress} max="100"></progress>}
        {image && (
          <Image
            src={resolveLargeAvatarURL(image)}
            alt="current profile photo"
            width={200}
            height={200}
            borderRadius={circle ? 100 : 0}
            onPress={() => {
              input.current?.click()
            }}
            alignSelf="center"
            hoverStyle={{ opacity: 0.5 }}
            cursor="pointer"
          />
        )}
        <input type="file" ref={input} onChange={handleInputChange} style={{ display: 'none' }} />
      </PageSection>
    </div>
  )
}
