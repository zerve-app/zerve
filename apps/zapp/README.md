# ZApp Starter App

Provides the following features:

- Auth
- Entity/Organization with profile URLs
- Projects

Coming soon:

- Billing
- Notifications
- Discussions

Built using the following technologies:

- React + Next.js
- Tamagui
- Prisma
- Auth.js
- TRPC

## Deployment

A full deployment of this app requires the following services, and we recommend these companies (although many hosts offer similar services).

- App Platform: Vercel (Next.js host)
- Database: PlanetScale (MySQL)
- Asset Storage: Cloudflare R2 (S3-compatible bucket API)
- Transactional Emails: Sendgrid (SMTP API)

## Based on T3 App

This app is based on the [T3 Stack](https://create.t3.gg/). It has been combined with the starter monorepo for [Tamagui](https://tamagui.dev), the cross-platform UI library we use instead of Tailwind.
