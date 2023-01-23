import { components } from '@components/MDXComponents'
import { getAllFrontmatter, getMdxBySlug } from '@lib/MDX'
import { getMDXComponent } from 'mdx-bundler/client'
import React, { useMemo } from 'react'
import { Heading, Spacer } from '@zerve/ui'

import type { Frontmatter } from '@lib/Frontmatter'
import { PublicLayout } from 'app/components/PublicLayout'

type Doc = {
  frontmatter: Frontmatter
  code: any
}

export default function DocsCorePage({ frontmatter, code }: Doc) {
  const Component = useMemo(() => getMDXComponent(code), [code])
  return (
    <PublicLayout title={frontmatter.title} footer>
      <Heading>{frontmatter.title}</Heading>
      <Spacer size="$1" />
      <Component components={components as any} />
    </PublicLayout>
  )
}

export async function getStaticPaths() {
  const frontmatters = await getAllFrontmatter('docs')
  console.log('FMS', JSON.stringify(frontmatters, null, 2))
  const paths = frontmatters.map((matter) => ({
    params: { slug: matter.slug.join('/').replace('docs/', '').split('/') },
  }))
  console.log('paths', JSON.stringify(frontmatters, null, 2))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const { frontmatter, code } = await getMdxBySlug('docs', context.params.slug.join('/'))
  return {
    props: {
      frontmatter,
      code,
    },
  }
}
