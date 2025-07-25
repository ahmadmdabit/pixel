import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

export default async (req: any, res: any) => {
  const msgId = req.query?.msg || 'unknown'
  const timestamp = new Date().toISOString()

  console.log(`[TRACK] ${timestamp} Opened: ${msgId}`)

  // ⬇️ Log to Nhost via GraphQL API
  await fetch('https://nwoayqextsttsxegfldd.graphql.eu-central-1.nhost.run/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.NHOST_ADMIN_SECRET ?? '', // Use env for secrets
    },
    body: JSON.stringify({
      query: `
        mutation LogEmailOpen($msg_id: String!, $opened_at: timestamptz!) {
          insert_email_opens_one(object: { msg_id: $msg_id, opened_at: $opened_at }) {
            id
          }
        }
      `,
      variables: {
        msg_id: msgId,
        opened_at: timestamp,
      },
    }),
  })

  // 🖼️ Serve the tracking pixel
  const pixelPath = path.resolve(__dirname, 'pixel.png')
  const pixelBuffer = fs.readFileSync(pixelPath)

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'no-store')
  res.end(pixelBuffer)
}
