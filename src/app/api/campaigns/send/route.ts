import { NextRequest, NextResponse } from 'next/server'
import { sendOutreachEmail } from '@/lib/resend/client'
import { generatePersonalizedEmail, formatHtmlEmail } from '@/lib/ai/personalizer'
import { BusinessLead } from '@/types'
import { z } from 'zod'

const sendCampaignSchema = z.object({
  campaignId: z.string().optional().default('default_campaign'),
  leads: z.array(z.custom<BusinessLead>()).min(1, 'At least one lead is required'),
  companyOffer: z.string().min(1, 'Company offer is required'),
  senderName: z.string().optional().default('Modewebhost Team'),
  senderEmail: z.string().optional().default('Modesend <onboarding@resend.dev>'),
  replyToEmail: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = sendCampaignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid campaign dispatch payload' }, { status: 400 })
    }

    const { campaignId, leads, companyOffer, senderName, senderEmail, replyToEmail } = parsed.data

    const results: Array<{
      leadId: string
      email: string
      success: boolean
      resendId?: string
      error?: string
      subject: string
    }> = []

    for (const lead of leads) {
      if (!lead.email) {
        results.push({
          leadId: lead.id,
          email: '',
          success: false,
          error: 'No email address found for lead',
          subject: '',
        })
        continue
      }

      // Generate personalization if not already generated
      let subject = lead.generatedSubject
      let bodyText = lead.generatedBody
      let bodyHtml = ''

      if (!subject || !bodyText) {
        const generated = await generatePersonalizedEmail(lead, companyOffer, senderName, 1)
        subject = generated.subject
        bodyText = generated.bodyText
        bodyHtml = generated.bodyHtml
      } else {
        bodyHtml = formatHtmlEmail(bodyText)
      }

      const sendResult = await sendOutreachEmail({
        to: lead.email,
        from: senderEmail,
        replyTo: replyToEmail,
        subject,
        bodyHtml,
        bodyText,
        campaignId,
        leadId: lead.id,
      })

      results.push({
        leadId: lead.id,
        email: lead.email,
        success: sendResult.success,
        resendId: sendResult.id,
        error: sendResult.error,
        subject,
      })
    }

    const successfulSends = results.filter((r) => r.success).length

    return NextResponse.json({
      success: true,
      totalProcessed: leads.length,
      successfulSends,
      failedSends: leads.length - successfulSends,
      results,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
