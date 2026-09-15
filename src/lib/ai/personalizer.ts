import { BusinessLead } from '@/types'

export interface PersonalizationResult {
  subject: string
  bodyText: string
  bodyHtml: string
}

/**
 * Generates personalized cold email copy tailored to the specific business lead and company offer
 */
export async function generatePersonalizedEmail(
  lead: BusinessLead,
  companyOffer: string,
  senderName: string = 'Modewebhost Team',
  stepNumber: number = 1
): Promise<PersonalizationResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (geminiApiKey) {
    try {
      const prompt = `
You are an expert B2B cold email copywriter. Write a highly personalized, natural, non-spammy outreach email.

Target Prospect Details:
- Business Name: ${lead.name}
- Category: ${lead.category}
- Location: ${lead.location}
- Address: ${lead.address || 'N/A'}
- Background: ${lead.enrichedData?.description || 'Reputable organization in ' + lead.location}

Our Company's Value Proposition / Offer:
"${companyOffer}"

Email Sequence Step: Step ${stepNumber} (1 = Initial Value Hook, 2 = 3-Day Polite Follow-up, 3 = Case Study / Low friction CTA)
Sender Name: ${senderName}

Guidelines:
1. Subject line: Short (under 7 words), intriguing, personalized with prospect's name or city.
2. Opening line: Mention their specific institution (${lead.name}) and acknowledge their presence in ${lead.location}.
3. The Pitch: Directly explain how our offer solves a real operational problem for them without fluff.
4. Call to Action (CTA): Low friction (e.g., "Would you be against a 3-minute video overview this week?").
5. Tone: Professional, direct, respectful, concise (under 120 words).

Respond ONLY with valid JSON in this format:
{
  "subject": "Subject line text",
  "bodyText": "Plain text email body with linebreaks"
}
`
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (textContent) {
          const parsed = JSON.parse(textContent)
          if (parsed.subject && parsed.bodyText) {
            return {
              subject: parsed.subject,
              bodyText: parsed.bodyText,
              bodyHtml: formatHtmlEmail(parsed.bodyText),
            }
          }
        }
      }
    } catch {
      // Fall through to algorithmic template engine
    }
  }

  // Fallback high-converting copywriting rule engine
  return generateAlgorithmicEmail(lead, companyOffer, senderName, stepNumber)
}

/**
 * Algorithmic copywriting engine producing tailored email variations per step
 */
function generateAlgorithmicEmail(
  lead: BusinessLead,
  companyOffer: string,
  senderName: string,
  stepNumber: number
): PersonalizationResult {
  const shortName = lead.name.split(' (')[0].trim()
  const locCity = lead.location.split(',')[0].trim()

  let subject = ''
  let bodyText = ''

  if (stepNumber === 1) {
    subject = `Quick question for ${shortName}`
    bodyText = `Hi ${shortName} Team,

I came across ${shortName} while reviewing leading institutions in ${locCity} and wanted to reach out directly.

${companyOffer}

We recently helped similar organizations in your sector streamline their day-to-day operations and accelerate client engagement. Given your strong reputation in ${locCity}, I believe this could be a great fit for your current goals.

Would you be open to a quick 3-minute chat or brief walkthrough this week?

Best regards,

${senderName}
Modesend Outreach Team`
  } else if (stepNumber === 2) {
    subject = `Re: Quick question for ${shortName}`
    bodyText = `Hi ${shortName} Team,

Following up on my previous note regarding ${shortName}. 

I know how busy your schedule can get, so I wanted to share a quick idea on how our solution can directly support your team:

${companyOffer}

If this sounds relevant, what does your calendar look like for a brief 5-minute call on Thursday or Friday?

Best,

${senderName}`
  } else {
    subject = `Resource for ${shortName} — final check-in`
    bodyText = `Hi ${shortName} Team,

I wanted to send one last quick note in case our previous emails were missed.

We'd love the opportunity to share a customized case study showing how we deliver:
"${companyOffer}"

If the timing isn't right, no problem at all. Should you ever need support with this in ${locCity}, feel free to keep us in mind!

Warm regards,

${senderName}`
  }

  return {
    subject,
    bodyText,
    bodyHtml: formatHtmlEmail(bodyText),
  }
}

export function formatHtmlEmail(bodyText: string): string {
  if (!bodyText) return ''
  
  if (bodyText.includes('<html') || bodyText.includes('<!DOCTYPE')) {
    return bodyText
  }

  const normalized = bodyText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((block) => {
      const formattedLines = block.trim().replace(/\n/g, '<br />')
      return `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formattedLines}</p>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.65; color: #1e293b; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 12px;">
    ${paragraphs}
  </div>
</body>
</html>`
}
