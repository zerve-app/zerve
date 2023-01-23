import { Button, Card, Heading, Progress, Spinner, Stack, XStack } from '@zerve/ui'
import RootLayout from 'app/components/RootLayout'
import React, { ChangeEventHandler, DragEventHandler, useState } from 'react'
import { useRouter } from 'next/router'
import { ProjectContainer } from './ProjectContainer'
import { trpc } from '../../../../../apps/zapp/src/utils/trpc'
import { uploadFile } from 'app/provider/upload'
import {
  Download,
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileJson,
  FileVideo,
  FolderPlus,
  Trash,
  Upload,
} from '@tamagui/lucide-icons'
import { DialogContent, useDialog } from 'app/components/Dialog'
import { BasicForm } from 'app/components/BasicForm'

function getFileIcon({ contentType, extension }: { contentType: string; extension: string }) {
  if (contentType.startsWith('image/')) return FileImage
  if (contentType.startsWith('audio/')) return FileAudio
  if (contentType.startsWith('video/')) return FileVideo
  if (contentType === 'application/json') return FileJson
  if (contentType === 'application/zip') return FileArchive
  if (extension === 'mkv') return FileVideo
  if (extension === 'dmg') return FileArchive
  console.log('unknown content type', extension, contentType)
  return File
}

const BYTES_IN_GB = 1000 * 1000 * 1000
const BYTES_IN_MB = 1000 * 1000
const BYTES_IN_KB = 1000

function getHumanReadableSize(size: number) {
  if (size > BYTES_IN_GB) return `${(size / BYTES_IN_GB).toFixed(2)} GB`
  if (size > BYTES_IN_MB) return `${(size / BYTES_IN_MB).toFixed(2)} MB`
  if (size > BYTES_IN_KB) return `${(size / BYTES_IN_KB).toFixed(2)} KB`
  return `${size} B`
}

function MediaList({ entityKey, projectKey }: { entityKey: string; projectKey: string }) {
  const { data: project, isLoading } = trpc.project.assets.useQuery(
    { entityKey, projectKey },
    {
      enabled: !!entityKey && !!projectKey,
    }
  )
  if (isLoading) return <Spinner />
  return (
    <Stack>
      {project
        ? project.assets.map((asset) => {
            const Icon = getFileIcon(asset)
            return (
              <Card key={asset.id} flexDirection="row">
                <Icon />
                <Heading f={1}>{asset.key}</Heading>
                <Heading>{getHumanReadableSize(asset.size)}</Heading>
                <Button
                  icon={Download}
                  onPress={() => {
                    window.open(asset.url)
                  }}
                />
                <DestroyAssetButton entityKey={entityKey} projectKey={projectKey} asset={asset} />
              </Card>
            )
          })
        : null}
    </Stack>
  )
}

function DestroyAssetForm({
  entityKey,
  projectKey,
  asset,
  onComplete,
}: {
  entityKey: string
  projectKey: string
  asset: { id: string; key: string }
  onComplete: () => void
}) {
  const destroyAsset = trpc.project.destroyAsset.useMutation()
  const utils = trpc.useContext()
  const { push, query } = useRouter()
  return (
    <BasicForm<string>
      onEscape={onComplete}
      items={[]}
      submitLabel="Destroy Asset"
      onSubmit={(data) => {
        destroyAsset
          .mutateAsync(
            { projectKey, entityKey, assetId: asset.id },
            {
              onSuccess: () => {
                // lolz idk
              },
            }
          )
          .then(onComplete)
      }}
      initData=""
      isLoading={destroyAsset.isLoading}
    />
  )
}

function DestroyAssetButton({
  entityKey,
  projectKey,
  asset,
}: {
  entityKey: string
  projectKey: string
  asset: { id: string; key: string }
}) {
  const [open, dialog] = useDialog((props) => {
    return (
      <DialogContent
        title="Delete Asset"
        // description="Delete asset"
        children={
          <DestroyAssetForm
            entityKey={entityKey}
            projectKey={projectKey}
            onComplete={props.close}
            asset={asset}
          />
        }
      />
    )
  })

  return (
    <>
      {dialog}
      <Button icon={Trash} onPress={open} />
    </>
  )
}
function MediaPage({ entityKey, projectKey }: { entityKey: string; projectKey: string }) {
  const uploadAsset = trpc.project.uploadAsset.useMutation()
  const utils = trpc.useContext()

  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = React.useState<null | Promise<void>>(null)
  const [isHovering, setIsHovering] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    const extensionMatch = file.name.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)
    const extension = extensionMatch?.[1]
    if (!extension) throw new Error('File extension not detected')

    const uploadDest = await uploadAsset.mutateAsync({
      projectKey,
      entityKey,
      contentType: file.type,
      name: file?.name || 'Untitled',
      extension,
      size: file.size,
    })

    const uploadResult = await uploadFile(uploadDest.putUrl, file, setProgress)

    utils.project.assets.invalidate({ entityKey, projectKey })
    console.log({ uploadDest, uploadResult })
  }
  function handleFileSync(file: File) {
    setIsUploading(
      handleFile(file).finally(() => {
        setIsUploading(null)
      })
    )
  }
  function handleDrop(e: Parameters<DragEventHandler<HTMLDivElement>>[0]) {
    e.preventDefault()
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 1) {
      alert('only one file at a time please')
    }
    const file = droppedFiles[0]
    if (!file) {
      throw new Error('no files dropped?!')
    }
    handleFileSync(file)
  }
  const onFileChange = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0]) => {
    const inputFiles = e.target.files
    const file = inputFiles?.[0]
    if (!file) return
    handleFileSync(file)
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
      <ProjectContainer active="media" title="Media">
        <Stack
          borderStyle={isHovering ? 'dashed' : undefined}
          backgroundColor={isHovering ? '$blue3Light' : undefined}
        >
          {isUploading ? (
            <Progress value={progress}>
              <Progress.Indicator animation="bouncy" />
            </Progress>
          ) : null}
          <XStack>
            <Button
              disabled={isUploading !== null}
              onPress={() => {
                fileInputRef.current?.click()
              }}
              icon={Upload}
            >
              {isUploading ? <Spinner /> : 'Upload File'}
            </Button>
            <Button onPress={() => {}} icon={FolderPlus}>
              New Folder
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </XStack>

          <MediaList entityKey={entityKey} projectKey={projectKey} />
        </Stack>
      </ProjectContainer>
    </div>
  )
}

export function ProjectMediaFeature() {
  const { query } = useRouter()
  return (
    <RootLayout>
      <MediaPage entityKey={query.entityId as string} projectKey={query.projectId as string} />
    </RootLayout>
  )
}
