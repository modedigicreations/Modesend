import { Resend } from 'resend'

let resendInstance: Resend | null = null

export function getResendClient(): Resend | null {
  const apiKey = (process.env.RESEND_API_KEY || '').trim()
  if (!apiKey) return null

  if (!resendInstance) {
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

export interface SendEmailPayload {
  to: string
  from: string
  replyTo?: string
  subject: string
  bodyHtml: string
  bodyText?: string
  campaignId?: string
  leadId?: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
  isSandbox?: boolean
}

/**
 * Dispatches an outreach email via Resend API
 */
export async function sendOutreachEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const resend = getResendClient()

  if (!resend) {
    // Simulated delivery for local dev / preview mode before Resend key is pasted
    console.log('[Modesend Demo Delivery] Dispatched to:', payload.to, 'Subject:', payload.subject)
    return {
      success: true,
      id: `sim_resend_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      isSandbox: true,
    }
  }

  try {
    const cleanFrom = payload.from || 'Modesend <onboarding@resend.dev>'

    const response = await resend.emails.send({
      from: cleanFrom,
      to: payload.to,
      replyTo: payload.replyTo || undefined,
      subject: payload.subject,
      html: payload.bodyHtml,
      text: payload.bodyText || undefined,
      headers: {
        'X-Modesend-Campaign-ID': payload.campaignId || 'default',
        'X-Modesend-Lead-ID': payload.leadId || 'lead',
      },
      tags: [
        { name: 'campaign_id', value: payload.campaignId || 'general' },
        { name: 'lead_id', value: payload.leadId || 'prospect' },
      ],
    })

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Resend delivery failed',
      }
    }

    return {
      success: true,
      id: response.data?.id || `resend_${Date.now()}`,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      error: msg,
    }
  }
}
