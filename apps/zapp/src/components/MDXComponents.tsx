import { Link, CheckCircle, Clipboard } from '@tamagui/lucide-icons'
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import { NextLink } from 'solito/build/link/next-link'
import {
  Button,
  H1,
  H2,
  H3,
  H4,
  H5,
  Image,
  type ImageProps,
  Paragraph,
  Separator,
  Spacer,
  Text,
  Theme,
  ThemeableStack,
  TooltipSimple,
  XStack,
  type XStackProps,
  YStack,
  styled,
  EnsureFlexed,
} from '@zerve/ui'
import { useClipboard } from '@lib/Clipboard'

export function ExternalIcon() {
  return (
    <svg
      style={{ opacity: 0.4 }}
      width="10"
      height="10"
      viewBox="0 0 15 15"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
        fill="var(--color)"
      />
    </svg>
  )
}

export const Pre = styled(YStack, {
  overflow: 'visible',
  tag: 'pre',
  padding: '$4',
  borderRadius: '$4',
  bc: '$background',
})

export const Code = styled(Paragraph, {
  name: 'Code',
  tag: 'code',
  fontFamily: '$mono',
  size: '$3',
  lineHeight: 18,
  cursor: 'inherit',
  whiteSpace: 'pre',
  padding: '$1',
  borderRadius: '$4',

  variants: {
    colored: {
      true: {
        color: '$color',
        backgroundColor: '$background',
      },
    },
  } as const,
})

export const CodeInline = styled(Paragraph, {
  name: 'CodeInline',
  tag: 'code',
  fontFamily: '$mono',
  color: '$colorHover',
  backgroundColor: '$background',
  cursor: 'inherit',
  br: '$3',
  fontSize: 'inherit',
  p: '$1.5',
})

export const HR = () => (
  <YStack my="$10" mx="auto" maxWidth="50%">
    <EnsureFlexed />
    <YStack borderBottomColor="$borderColor" borderBottomWidth={1} flex={1} />
  </YStack>
)

export const LI = styled(Paragraph, {
  display: 'list-item' as any,
  tag: 'li',
  size: '$5',
  pb: '$1',
})

export const UL = styled(YStack, {
  tag: 'ul',
  my: '$1',
  ml: '$4',
  mr: '$2',
})

const TableFrame = styled(ThemeableStack, {
  bordered: true,
  br: '$4',
  ov: 'hidden',
  my: '$4',
})

export const DocCodeBlock = forwardRef(function CodeDocBlock(props: any, ref) {
  const {
    className,
    children,
    id,
    showLineNumbers = false,
    isHero = false,
    isCollapsible = false,
    isHighlightingLines,
  } = props
  const [isCollapsed, setIsCollapsed] = useState(isHero || isCollapsible)
  const [code, setCode] = useState(undefined)
  const preRef = useRef<any>(null)
  const { hasCopied, onCopy, value } = useClipboard(code)
  // const frontmatter = useContext(FrontmatterContext)

  useEffect(() => {
    try {
      if (preRef.current) {
        const codeElement = preRef.current.querySelector('code')
        if (codeElement) {
          // remove double line breaks
          const code = codeElement.innerText.replace(/\n{3,}/g, '\n')
          setCode(code)
        } else {
          // not collapsible
        }
      }
    } catch {
      // ok
    }
  }, [preRef])

  return (
    <YStack
      ref={ref}
      position="relative"
      mb="$4"
      {...(isHero && {
        px: '$4',
        mx: '$-4',
        $gtMd: {
          mx: '$-7',
        },
      })}
    >
      {isCollapsible && (
        <XStack
          space="$2"
          position="absolute"
          display="inline-flex"
          alignItems="center"
          justifyContent="flex-end"
          top={-70}
          r="$6"
          $gtMd={{
            r: '$7',
          }}
        >
          <Button
            accessibilityLabel="Show or hide code"
            size="$2"
            onPress={() => setIsCollapsed((x) => !x)}
          >
            {isCollapsed ? 'Show code' : 'Hide code'}
          </Button>
        </XStack>
      )}

      {(!isCollapsed || !isCollapsible) && (
        <YStack position="relative">
          <Pre
            ref={preRef}
            data-invert-line-highlight={isHighlightingLines}
            data-line-numbers={showLineNumbers}
            className={className}
            p={0}
            mb={0}
            id={id}
          >
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ minWidth: '100%' }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Code p="$4" backgroundColor="transparent" f={1} className={className}>
                {children}
              </Code>
            </ScrollView>
          </Pre>
          <TooltipSimple label={hasCopied ? 'Copied' : 'Copy to clipboard'}>
            <Button
              aria-label="Copy code to clipboard"
              position="absolute"
              size="$2"
              top="$3"
              right="$3"
              display="inline-flex"
              icon={hasCopied ? CheckCircle : Clipboard}
              onPress={onCopy}
              $xs={{
                display: 'none',
              }}
            />
          </TooltipSimple>
        </YStack>
      )}
    </YStack>
  )
})

const Table = ({ heading, children, ...props }) => {
  return (
    <TableFrame className="no-scrollbar" overflow={'scroll' as any} {...props}>
      {!!heading && (
        <TableCell size="$4" bc="$color1" fow="500" color="$color9">
          {heading}
        </TableCell>
      )}
      <XStack minWidth="100%" ai="stretch">
        {children}
      </XStack>
    </TableFrame>
  )
}

const code = (props) => {
  const { hero, line, scrollable, className, children, id, showLineNumbers, collapsible, ...rest } =
    props
  if (!className) {
    return <CodeInline>{unwrapText(children)}</CodeInline>
  }
  return (
    <YStack mt="$3">
      <DocCodeBlock
        isHighlightingLines={line !== undefined}
        className={className}
        isHero={hero !== undefined}
        isCollapsible={hero !== undefined || collapsible !== undefined}
        isScrollable={scrollable !== undefined}
        showLineNumbers={showLineNumbers !== undefined}
        {...rest}
      >
        {children}
      </DocCodeBlock>
    </YStack>
  )
}

export const OffsetBox = styled(YStack, {
  name: 'OffsetBox',
  variants: {
    size: {
      hero: {
        $gtSm: { mx: '$-2' },
        $gtMd: { mx: '$-4' },
        $gtLg: { mx: '$-6' },
      },
    },
  } as const,
})

const TableCell = styled(Paragraph, {
  bbw: 1,
  bbc: '$borderColor',
  fd: 'row',
  ai: 'center',
  pos: 'relative',
  f: 1,
  jc: 'center',
  ta: 'center',
  h: '$4',
  p: '$2',
  px: '$3',
  size: '$5',
  ellipse: true,

  variants: {
    head: {
      true: {
        bc: '$color1',
      },
    },
    highlight: {
      true: {
        bc: '$yellow2',
      },
    },
  },
})

const TableCol = styled(ThemeableStack, {
  brw: 1,
  brc: '$borderColor',
  f: 1,
  mr: -1,
  fd: 'column',
})

const TableHighlight = styled(YStack, {
  fullscreen: true,
  bc: '$yellow1',
})

const LinkHeading = ({ id, children, ...props }: { id: string } & XStackProps) => (
  <XStack
    tag="a"
    href={`#${id}`}
    id={id}
    data-id={id}
    display="inline-flex"
    ai="center"
    space
    {...props}
  >
    {children}
    <YStack tag="span" opacity={0.3}>
      <Link size={12} color="var(--color)" aria-hidden />
    </YStack>
  </XStack>
)

const getNonTextChildren = (children) => {
  return React.Children.map(children, (x) => {
    if (typeof x === 'string') return null
    if (x['type'] === code) return null
    return x
  }).flat()
}

export const components = {
  Wide: (props) => (
    <YStack mx="$-8" $sm={{ mx: '$-2' }}>
      {props.children}
    </YStack>
  ),

  Table,
  TableCell,
  TableHighlight,
  TableCol,

  Spacer,
  ScrollView,
  Text,
  Paragraph,
  YStack,
  XStack,
  Theme,
  Separator,
  Code,
  TooltipSimple,
  UL,
  LI,
  Button,

  h1: (props) => <H1 width="max-content" pos="relative" mb="$2" {...props} />,

  h2: ({ children, ...props }) => (
    <H2
      pos="relative"
      width={`fit-content` as any}
      pt="$8"
      mt="$-4"
      mb="$2"
      data-heading
      {...props}
    >
      {children}
    </H2>
  ),

  h3: ({ children, id, ...props }) => (
    <LinkHeading pt="$8" mt="$-4" mb="$1" id={id}>
      <H3 pos="relative" width={`fit-content` as any} nativeID={id} data-heading {...props}>
        {children}
      </H3>
      {getNonTextChildren(children)}
    </LinkHeading>
  ),

  h4: (props) => <H4 pos="relative" width={`fit-content` as any} mt="$4" mb="$3" {...props} />,

  h5: (props) => <H5 mt="$4" {...props} />,

  p: (props) => (
    <Paragraph className="docs-paragraph" display="block" my="$2.5" size="$5" {...props} />
  ),

  a: ({ href = '', children, ...props }) => {
    return (
      <NextLink className="link" href={href}>
        {/* @ts-ignore */}
        <Paragraph tag="span" fontSize="inherit" display="inline" cursor="pointer" {...props}>
          {children}
          {href.startsWith('http') ? (
            <>
              &nbsp;
              <Text fontSize="inherit" display="inline-flex" y={2} ml={-1}>
                <ExternalIcon />
              </Text>
            </>
          ) : null}
        </Paragraph>
      </NextLink>
    )
  },

  hr: HR,

  ul: ({ children }) => {
    return (
      <UL my="$4">
        {React.Children.toArray(children).map((x) => (typeof x === 'string' ? null : x))}
      </UL>
    )
  },

  ol: (props) => <YStack {...props} tag="ol" mb="$3" />,

  li: (props) => {
    return <LI my="$1">{props.children}</LI>
  },

  strong: (props) => <Paragraph tag="strong" fontSize="inherit" {...props} fontWeight="700" />,

  img: ({ ...props }) => (
    <YStack tag="span" my="$6">
      {/* TODO make this a proper <Image /> component */}
      <YStack tag="img" {...props} maxWidth="100%" />
    </YStack>
  ),

  pre: ({ children }) => <>{children}</>,

  code,

  Image: ({
    children,
    size,
    overlap,
    linked,
    ...props
  }: ImageProps & { size?: 'hero'; overlap?: boolean; linked?: boolean }) => {
    const content = (
      <OffsetBox
        size={size}
        tag="figure"
        f={1}
        mx={0}
        mb="$3"
        ai="center"
        jc="center"
        ov="hidden"
        {...(overlap && {
          mt: '$-6',
        })}
      >
        <Image maxWidth="100%" {...props} />
        {!!children && (
          <Text tag="figcaption" lineHeight={23} color="$colorPress" mt="$2">
            {children}
          </Text>
        )}
      </OffsetBox>
    )

    if (linked) {
      return (
        <NextLink target="_blank" href={props.src as string}>
          {content}
        </NextLink>
      )
    }

    return content
  },

  blockquote: ({ children, ...props }) => {
    return (
      <YStack
        my="$4"
        px="$6"
        ml="$3"
        borderLeftWidth={1}
        borderColor="$borderColor"
        jc="center"
        {...props}
      >
        <Paragraph
          fontFamily="$silkscreen"
          whiteSpace="revert"
          size="$8"
          lh="$9"
          fow="300"
          ls="$0"
          color="$color"
          opacity={0.65}
        >
          {unwrapText(children)}
        </Paragraph>
      </YStack>
    )
  },
}

export function unwrapText(children: any) {
  // console.log('React.Children.toArray(children)', React.Children.toArray(children))
  return React.Children.toArray(children).map((x) => {
    // console.log('x', x.type)
    // @ts-ignore
    return x?.props?.children ? x.props.children : x
  })
}
