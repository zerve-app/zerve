import Link from 'next/link'
import { getTokens, Heading, Paragraph, XStack, YStack } from '@zerve/ui'
import { ReactNode } from 'react'

function FooterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack width="$20" p="$6">
      <Heading color={'$gray5Light'}>{title}</Heading>
      {children}
    </YStack>
  )
}
function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  console.log(getTokens().color.gray5Light.val)
  return (
    <Link
      href={href}
      style={{
        // 😭
        color: getTokens().color.gray5Light.val,
        textDecoration: 'none',
        fontFamily:
          'Inter, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {children}
    </Link>
  )
}

export function HomeFooter() {
  const tokens = getTokens()
  return (
    <>
      <YStack alignItems="center" bg={tokens.color.blue5Dark} paddingVertical="$6">
        <XStack fw="wrap">
          <FooterSection title="Docs">
            <FooterLink href="">Intro</FooterLink>
            <FooterLink href="">Vision</FooterLink>
            <FooterLink href="">Get Started</FooterLink>
          </FooterSection>
          <FooterSection title="Community">
            <FooterLink href="https://discord.gg/UDBJZRMQTp">Discord</FooterLink>
            <FooterLink href="https://www.youtube.com/evicenti">YouTube</FooterLink>
            <FooterLink href="https://twitter.com/ZerveApp">Twitter</FooterLink>
            <FooterLink href="https://github.com/zerve-app/zerve">GitHub</FooterLink>
          </FooterSection>
          <FooterSection title="More">
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
            <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
          </FooterSection>
        </XStack>
        <Paragraph color={'$gray7Light'} mt={'$6'} fontSize="$3">
          Copyright © {new Date().getFullYear()} Zerve, LLC.
        </Paragraph>
      </YStack>
    </>
  )
}
