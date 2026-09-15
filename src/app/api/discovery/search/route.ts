import { NextRequest, NextResponse } from 'next/server'
import { discoverBusinesses } from '@/lib/discovery/search'
import { z } from 'zod'

const searchSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required'),
  location: z.string().min(1, 'Location is required'),
  limit: z.number().min(1).max(50).optional().default(20),
  extractEmails: z.boolean().optional().default(true),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = searchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { keyword, location, limit, extractEmails } = parsed.data
    const leads = await discoverBusinesses({ keyword, location, limit, extractEmails })

    return NextResponse.json({
      success: true,
      query: { keyword, location },
      totalFound: leads.length,
      leads,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Discovery search error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
