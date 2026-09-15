import { NextRequest, NextResponse } from 'next/server'
import { generatePersonalizedEmail } from '@/lib/ai/personalizer'
import { BusinessLead } from '@/types'
import { z } from 'zod'

const personalizeSchema = z.object({
  lead: z.custom<BusinessLead>(),
  companyOffer: z.string().min(1, 'Company offer is required'),
  senderName: z.string().optional().default('Modewebhost Team'),
  stepNumber: z.number().optional().default(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = personalizeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 })
    }

    const { lead, companyOffer, senderName, stepNumber } = parsed.data
    const emailResult = await generatePersonalizedEmail(lead, companyOffer, senderName, stepNumber)

    return NextResponse.json({
      success: true,
      email: emailResult,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
