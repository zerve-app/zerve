import {
  Bell,
  Database,
  Files,
  Fingerprint,
  FolderLock,
  Home,
  LayoutDashboard,
  Mails,
  Rocket,
  Server,
  SlidersHorizontal,
  Users,
  Wallet,
} from '@tamagui/lucide-icons'
import {
  Anchor,
  getTokens,
  H1,
  Heading,
  Paragraph,
  Text,
  useCurrentColor,
  XStack,
  YStack,
} from '@zerve/ui'
import { PublicLayout } from 'app/components/PublicLayout'
import Link from 'next/link'
import React, { ReactNode } from 'react'
import { NextLink } from 'solito/build/link/next-link'

function MarketingSection({
  children,
  title,
  id,
  subTitle,
}: {
  children: React.ReactNode
  title: string | React.ReactNode
  id?: string
  subTitle?: string
}) {
  return (
    <XStack id={id} padding={160} space jc="space-between">
      <YStack space>
        <Heading fontSize={'$10'}>{title}</Heading>
        {subTitle && (
          <Heading color="$gray10Light" fontSize={'$9'} mt="$4">
            {subTitle}
          </Heading>
        )}
      </YStack>
      {children}
    </XStack>
  )
}

function FeatureGrid({
  features,
}: {
  features: { title: string; text: string; color: string; icon: any }[]
}) {
  return (
    <XStack maxWidth={800} fw="wrap" jc="flex-end">
      {features.map((feature, featureIndex) => {
        return (
          <YStack key={featureIndex} width={200} margin="$3">
            <Heading color={feature.color}>
              <feature.icon color={feature.color} /> {feature.title}
            </Heading>
            <Paragraph color="$gray10Dark">{feature.text}</Paragraph>
          </YStack>
        )
      })}
    </XStack>
  )
}

export function HomeFeature() {
  return (
    <PublicLayout footer>
      <MarketingSection
        title={
          <>
            Your new App,{' '}
            <Heading className="ZGradientText" fontSize={'$10'}>
              Boosted.
            </Heading>
          </>
        }
        subTitle="Full-Featured SaaS Starter"
      >
        {null}
        <FeatureGrid
          features={[
            {
              title: 'Next.js',
              text: 'Full-Stack React setup, based on T3 app',
              icon: Home,
              color: 'hsl(15, 80%, 62%)',
            },
            {
              title: 'Database',
              text: 'App connected with Prisma, Zod, and TRPC',
              icon: Database,
              color: 'hsl(30, 80%, 62%)',
            },
            {
              title: 'Deployment',
              text: 'Deployable on Vercel, S3, Render, Heroku (+many more!)',
              icon: Server,
              color: 'hsl(45, 80%, 62%)',
            },
            {
              title: 'File Uploads',
              text: 'Drag-Drop file uploads to S3 storage, with and image resizing for avatars',
              icon: Files,
              color: 'hsl(75, 80%, 44%)',
            },
            {
              title: 'Mono-Repo',
              text: 'Uses Turborepo to support many apps and packages in one repo',
              icon: Rocket,
              color: 'hsl(90, 80%, 47%)',
            },
            {
              title: 'Auth',
              text: 'Built with Next Auth, supports Email and OAuth providers',
              icon: Fingerprint,
              color: 'hsl(105, 80%, 47%)',
            },
            {
              title: 'Emails',
              text: '(Coming Soon) custom emails ',
              icon: Mails,
              color: 'hsl(135, 80%,  47%)',
            },
            {
              title: 'Notifications',
              text: 'Coming Soon',
              icon: Bell,
              color: 'hsl(150, 80%, 47%)',
            },
            {
              title: 'Rules + Events',
              text: '(Coming Soon), permission and event system for users, orgs, and projects',
              icon: FolderLock,
              color: 'hsl(165, 80%,  44%)',
            },
            {
              title: 'Billing',
              icon: Wallet,
              text: 'Uses Stripe to support plans with resource limits',

              color: 'hsl(195, 80%, 55%)',
            },
            {
              title: 'Orgs & Teams',
              icon: Users,
              text: 'Entities with unique URLs, member invite workflow, admins, and teams',
              color: 'hsl(210, 80%, 62%)',
            },
            {
              title: 'UI + Marketing',
              icon: LayoutDashboard,
              text: "Built with Tamagui, you're looking at it.",

              color: 'hsl(225, 80%, 62%)',
            },
          ]}
        />
      </MarketingSection>
      <MarketingSection title="Build with Z Content System.">{null}</MarketingSection>
      <MarketingSection title="Open Source, in 7 days">
        <Paragraph>
          The fresh, latest code of Zerve is exclusive to{' '}
          <NextLink href="#support">supporters</NextLink>, who also enjoy bonus content and
          community access.
        </Paragraph>
        <Paragraph>
          Last week's code is{' '}
          <NextLink href="https://github.com/zerve-app/zerve">open source on GitHub</NextLink>.
        </Paragraph>
      </MarketingSection>
      <MarketingSection id="support" title="Support Zerve.">
        <Paragraph>
          Plans for individual devs and startups who enjoy Zerve content and want to support
        </Paragraph>
      </MarketingSection>
    </PublicLayout>
  )
}
