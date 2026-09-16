import { NextRequest, NextResponse } from 'next/server'
import { sendOutreachEmail } from '@/lib/resend/client'
import { generatePersonalizedEmail, formatHtmlEmail } from '@/lib/ai/personalizer'
import { BusinessLead } from '@/types'
import { z } from 'zod'

const sendCampaignSchema = z.object({
  campaignId: z.string().optional().default('default_campaign'),
  leads: z.array(z.custom<BusinessLead>()).min(1, 'At least one lead is required'),
  companyOffer: z.string().min(1, 'Company offer is required'),
  senderName: z.string().optional().default('Mode Digital Creations Team'),
  senderEmail: z.string().optional().default('Mode Digital Creations <info@modecbt.com>'),
  replyToEmail: z.string().optional().default('info@modecbt.com'),
  stepNumber: z.number().min(1).max(4).optional().default(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = sendCampaignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid campaign dispatch payload', details: parsed.error.format() }, { status: 400 })
    }

    const { campaignId, leads, companyOffer, senderName, senderEmail, replyToEmail, stepNumber } = parsed.data

    const results: Array<{
      leadId: string
      email: string
      success: boolean
      resendId?: string
      error?: string
      subject: string
      step: number
      nextFollowUpDue?: string
      followUpStatus: string
    }> = []

    // Next step delay schedule in days
    const stepDelays: Record<number, number> = {
      1: 3, // Step 2 due in 3 days
      2: 4, // Step 3 due in 4 days (Day 7)
      3: 5, // Step 4 due in 5 days (Day 12)
      4: 0, // Sequence completed
    }

    const followUpStatusMap: Record<number, string> = {
      1: 'step_1_sent',
      2: 'step_2_sent',
      3: 'step_3_sent',
      4: 'completed',
    }

    const now = new Date()
    const delayDays = stepDelays[stepNumber] || 0
    const nextDue = delayDays > 0 ? new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000).toISOString() : undefined

    for (const lead of leads) {
      if (!lead.email) {
        results.push({
          leadId: lead.id,
          email: '',
          success: false,
          error: 'No email address found for lead',
          subject: '',
          step: stepNumber,
          followUpStatus: lead.followUpStatus || 'not_started',
        })
        continue
      }

      // Generate personalization for this specific sequence step if not pre-generated
      let subject = lead.generatedSubject
      let bodyText = lead.generatedBody
      let bodyHtml = ''

      if (!subject || !bodyText || lead.currentSequenceStep !== stepNumber) {
        const generated = await generatePersonalizedEmail(lead, companyOffer, senderName, stepNumber)
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
        step: stepNumber,
        nextFollowUpDue: nextDue,
        followUpStatus: followUpStatusMap[stepNumber] || 'step_1_sent',
      })
    }

    const successfulSends = results.filter((r) => r.success).length

    return NextResponse.json({
      success: true,
      stepNumber,
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
