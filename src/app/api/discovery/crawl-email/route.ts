import { NextRequest, NextResponse } from 'next/server'
import { crawlWebsiteForEmails } from '@/lib/discovery/email-finder'
import { z } from 'zod'

const crawlSchema = z.object({
  website: z.string().min(1, 'Website URL is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = crawlSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 })
    }

    const { website } = parsed.data
    const result = await crawlWebsiteForEmails(website)

    return NextResponse.json({
      success: true,
      website,
      result,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
