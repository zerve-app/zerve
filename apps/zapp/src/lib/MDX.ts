import fs from 'fs'
import path, { basename } from 'path'

import compareVersions from 'compare-versions'
import glob from 'glob'
import matter from 'gray-matter'
import { bundleMDX } from 'mdx-bundler'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'

import type { Frontmatter } from './Frontmatter'
import rehypeHighlightCode from './rehype-highlight-code'

const ROOT_PATH = process.cwd()
export const DATA_PATH = path.join(ROOT_PATH, 'data')

export async function getAllFrontmatter(fromPath: string) {
  const PATH = path.join(DATA_PATH, fromPath)
  const paths = glob.sync(`${PATH}/**/*.mdx`)
  return Promise.all(
    paths.map(async (filePath: string) => {
      const source = fs.readFileSync(path.join(filePath), 'utf8')
      const { data, content } = matter(source)
      const slug = filePath.slice(PATH.length + 1, -4)
      return {
        ...data,
        slug: slug.split('/'),
      } as Frontmatter & { slug: string[] }
    })
  ).then((results) =>
    results.sort(
      (a, b) => Number(new Date(b.publishedAt || '')) - Number(new Date(a.publishedAt || ''))
    )
  )
}

export const getMdxBySlug = async (basePath: string, slug: string) => {
  const filePath = path.join(DATA_PATH, basePath, `${slug}.mdx`)
  const source = fs.readFileSync(filePath, 'utf8')
  const { frontmatter, code } = await bundleMDX({
    source,
    mdxOptions(options) {
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        // rehypeHighlightCode,
        rehypeAutolinkHeadings,
        rehypeSlug,
      ]
      return options
    },
  })

  return {
    frontmatter: {
      ...frontmatter,
    } as Frontmatter,
    code,
  }
}
