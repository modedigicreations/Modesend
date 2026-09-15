import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const event = await req.json()

    // Resend webhook format: { type: 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced', data: { ... } }
    const eventType = event.type
    const emailId = event.data?.email_id || event.data?.id
    const to = event.data?.to

    console.log(`[Modesend Webhook] Resend event received: ${eventType} for ${to} (ID: ${emailId})`)

    return NextResponse.json({ received: true, eventType, emailId })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
