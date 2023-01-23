import nodemailer from 'nodemailer'
import { env } from 'src/env/server.mjs'
import {
  render,
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlPreview,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlButton,
  MjmlImage,
} from 'mjml-react'
import { JSXElementConstructor, ReactElement, ReactNode } from 'react'
import { getTokens } from 'tamagui'

// create reusable transporter object using the default SMTP transport
const nodeTransport = nodemailer.createTransport({
  host: env.EMAIL_SERVER_HOST,
  port: env.EMAIL_SERVER_PORT ? Number(env.EMAIL_SERVER_PORT) : 587,
  auth: {
    user: env.EMAIL_SERVER_USER, // sg: "apikey"
    pass: env.EMAIL_SERVER_PASSWORD, // sg: api key (with send permissions)
  },
  secure: true,
})

export async function sendSimpleEmail(to: string, subject: string, body: string) {
  await nodeTransport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text: body,
    html: `<p>${body}</p>`,
  })
}

export async function sendExampleEmail(to: string, input: any): Promise<void> {
  const t = getTokens()
  const body = (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>Last Minute Offer</MjmlTitle>
        <MjmlPreview>Last Minute Offer...</MjmlPreview>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor="#efefef">
          <MjmlColumn>
            <MjmlImage src="https://static.wixstatic.com/media/5cb24728abef45dabebe7edc1d97ddd2.jpg" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection>
          <MjmlColumn>
            <MjmlButton
              padding="20px"
              backgroundColor={t.color.purple10Light.val}
              href={env.NEXTAUTH_URL}
            >
              Take you Home
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  )
  const textBody = `
    Last Minute Offer
    `
  await sendMjmlEmail(to, `example subj`, body, textBody)
}

export async function sendMjmlEmail(
  to: string,
  subject: string,
  body: ReactElement<any, string | JSXElementConstructor<any>>,
  textBody: string
) {
  const { html, errors } = render(body, { validationLevel: 'soft' })
  const meta = await nodeTransport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text: textBody,
    html,
  })
}
