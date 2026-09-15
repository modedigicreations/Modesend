import { BusinessLead } from '@/types'

export interface PersonalizationResult {
  subject: string
  bodyText: string
  bodyHtml: string
}

export const COMPANY_SIGNATURE = `Best regards,

{senderName}
Mode Digital Creations Outreach Team
Tel: 08065180018
Email: info@modecbt.com`

type IndustrySector = 'schools' | 'hotels' | 'hospitals' | 'law' | 'realestate' | 'tech' | 'logistics' | 'general'

/**
 * Detects the business sector/industry from category, name, and description
 */
export function detectIndustrySector(category: string, name: string, description: string = ''): IndustrySector {
  const combined = `${category} ${name} ${description}`.toLowerCase()

  if (/(school|college|academy|secondary|primary|nursery|creche|education|university|polytechnic|institution|tuition|curriculum|grammar school)/i.test(combined)) {
    return 'schools'
  }
  if (/(hotel|suites|resort|hospitality|lodge|guest house|inn|motel|apartments|bed and breakfast)/i.test(combined)) {
    return 'hotels'
  }
  if (/(hospital|clinic|health|medical|diagnostic|dentist|pharmacy|orthopaedic|maternity|wellness|doctor)/i.test(combined)) {
    return 'hospitals'
  }
  if (/(law|legal|solicitor|advocate|chambers|attorney|barrister|counsel|arbitration)/i.test(combined)) {
    return 'law'
  }
  if (/(real estate|property|realtor|homes|estate|developer|properties|housing|lands)/i.test(combined)) {
    return 'realestate'
  }
  if (/(logistics|haulage|courier|transport|freight|cargo|delivery|shipping)/i.test(combined)) {
    return 'logistics'
  }
  if (/(tech|software|fintech|app|digital|ai|cloud|startup)/i.test(combined)) {
    return 'tech'
  }
  return 'general'
}

/**
 * Returns dynamic sector-tailored value proposition and pitch
 */
export function getSectorPitch(sector: IndustrySector, locCity: string, customOffer?: string): string {
  if (customOffer && customOffer.trim().length > 15 && !customOffer.includes('custom school management portals') && !customOffer.includes('MODECBT')) {
    return customOffer.trim()
  }

  switch (sector) {
    case 'schools':
      return `We deploy the MODECBT Portal (an automated Computer-Based Testing & examination engine for entrance exams and termly assessments) alongside a custom School Management System for leading schools in ${locCity}. Our platform automates online tuition fee collections, eliminates manual payment reconciliation, computes termly student result sheets instantly, and gives parents a seamless mobile portal.`

    case 'hotels':
      return `We build direct 0%-commission room reservation engines, 360° virtual room showcases, and automated mobile guest check-in systems for premier hotels in ${locCity}. This allows your guests to book and pay directly from their phones while eliminating high 15–20% OTA third-party commission fees.`

    case 'hospitals':
      return `We build automated online patient appointment booking systems, secure Electronic Medical Records (EMR) portals, and modern medical center websites for leading healthcare providers in ${locCity}. This eliminates front-desk queue congestion and provides patients with 24/7 digital booking.`

    case 'law':
      return `We build secure encrypted client document vaults, automated consultation booking systems, and high-converting modern websites for reputable law firms in ${locCity}. This accelerates client intake and safeguards sensitive case documentation.`

    case 'realestate':
      return `We build interactive property listing platforms with immersive 3D virtual tours, automated inspection booking, and buyer lead-capture systems for real estate leaders in ${locCity}. This attracts high-intent buyers and automates property viewing follow-ups.`

    case 'logistics':
      return `We build real-time shipment tracking portals, automated waybill generation systems, and customer booking apps for transport and logistics operators in ${locCity}. This reduces manual dispatch inquiries and speeds up fulfillment.`

    case 'tech':
      return `We design high-converting product landing pages, custom SaaS web platforms, and automated client billing systems for innovative tech companies in ${locCity}.`

    default:
      return `We build custom web platforms, automated client management systems, and modern digital web applications tailored for growing enterprises in ${locCity} to streamline daily operations and drive revenue.`
  }
}

/**
 * Returns dynamic, high-converting, scroll-stopping subject lines
 */
function getCatchySubject(shortName: string, sector: IndustrySector, stepNumber: number): string {
  if (stepNumber === 1) {
    switch (sector) {
      case 'schools':
        return `Quick question regarding ${shortName}'s MODECBT Portal & School System`
      case 'hotels':
        return `Zero-commission direct booking idea for ${shortName}`
      case 'hospitals':
        return `Automating patient booking & portal at ${shortName}`
      case 'law':
        return `Secure client intake & document portal for ${shortName}`
      case 'realestate':
        return `3D virtual tours & buyer leads for ${shortName}`
      case 'logistics':
        return `Real-time tracking & dispatch portal for ${shortName}`
      default:
        return `Quick question for ${shortName} leadership`
    }
  } else if (stepNumber === 2) {
    switch (sector) {
      case 'schools':
        return `Re: MODECBT Examination & Fee Management at ${shortName}`
      case 'hotels':
        return `Re: Direct room reservations at ${shortName}`
      case 'hospitals':
        return `Re: Patient scheduling idea for ${shortName}`
      case 'law':
        return `Re: Digital client portal for ${shortName}`
      default:
        return `Re: Quick thought for ${shortName} this week`
    }
  } else {
    return `Final check-in: MODECBT & digital systems for ${shortName}`
  }
}

/**
 * Generates personalized cold email copy tailored to the specific business lead and company offer
 */
export async function generatePersonalizedEmail(
  lead: BusinessLead,
  companyOffer: string,
  senderName: string = 'Mode Digital Creations Team',
  stepNumber: number = 1
): Promise<PersonalizationResult> {
  const shortName = lead.name.split(' (')[0].replace(/^Welcome to /i, '').trim()
  const locCity = lead.location.split(',')[0].trim() || 'your city'
  const sector = detectIndustrySector(lead.category, lead.name, lead.enrichedData?.description)
  const sectorPitch = getSectorPitch(sector, locCity, companyOffer)

  const signatureText = `Best regards,

${senderName}
Mode Digital Creations Outreach Team
Tel: 08065180018
Email: info@modecbt.com`

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (geminiApiKey) {
    try {
      const prompt = `
You are an expert B2B cold outreach copywriter for Mode Digital Creations. Write a highly personalized, compelling, scroll-stopping outreach email.

Target Prospect Details:
- Business Name: ${lead.name}
- Industry Sector: ${sector.toUpperCase()} (${lead.category})
- Location: ${lead.location}
- Background: ${lead.enrichedData?.description || 'Reputable organization in ' + lead.location}

Value Proposition for ${sector.toUpperCase()}:
"${sectorPitch}"
${
  sector === 'schools'
    ? 'NOTE: For schools, emphasize the MODECBT Portal (Computer-Based Testing, entrance exam automation, instant grading) and the School Management System (online tuition collection, student report computation, parent portal).'
    : ''
}

Sequence Step: Step ${stepNumber} (1 = Initial Value Hook, 2 = 3-Day Polite Follow-up, 3 = Case Study / Low friction CTA)
Sender Name: ${senderName}

Required Signature (You MUST append this exact signature):
${signatureText}

Guidelines:
1. Subject Line: Catchy, scroll-stopping, high open rate, customized with prospect name (${shortName}) and their sector focus (${sector === 'schools' ? 'MODECBT & School Portal' : sector}).
2. Opening: Greet them with their name (${shortName}) and acknowledge their leading status in ${locCity}.
3. The Pitch: Focus sharply on ${sector === 'schools' ? 'MODECBT Portal & School Management System' : sectorPitch}.
4. Low Friction CTA: e.g. "Would you be open to a quick 3-minute demo or brief video walkthrough this week?"
5. Permanent Signature: Include the exact signature provided above with Tel: 08065180018 and Email: info@modecbt.com.
6. Tone: Executive, concise, warm, professional (under 130 words).

Respond ONLY with valid JSON:
{
  "subject": "Catchy scroll-stopping subject",
  "bodyText": "Formatted email body text including signature and linebreaks"
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
            let fullBody = parsed.bodyText.trim()
            if (!fullBody.includes('08065180018') || !fullBody.includes('info@modecbt.com')) {
              fullBody = `${fullBody}\n\n${signatureText}`
            }
            return {
              subject: parsed.subject,
              bodyText: fullBody,
              bodyHtml: formatHtmlEmail(fullBody),
            }
          }
        }
      }
    } catch {
      // Fall through to algorithmic engine
    }
  }

  // High-converting algorithmic engine
  return generateAlgorithmicEmail(lead, companyOffer, senderName, stepNumber)
}

/**
 * Algorithmic copywriting engine producing sector-tailored email copy with permanent signature
 */
function generateAlgorithmicEmail(
  lead: BusinessLead,
  companyOffer: string,
  senderName: string,
  stepNumber: number
): PersonalizationResult {
  const shortName = lead.name.split(' (')[0].replace(/^Welcome to /i, '').trim()
  const locCity = lead.location.split(',')[0].trim() || 'your city'
  const sector = detectIndustrySector(lead.category, lead.name, lead.enrichedData?.description)
  const sectorPitch = getSectorPitch(sector, locCity, companyOffer)

  const signature = `Best regards,

${senderName}
Mode Digital Creations Outreach Team
Tel: 08065180018
Email: info@modecbt.com`

  const subject = getCatchySubject(shortName, sector, stepNumber)
  let bodyText = ''

  if (stepNumber === 1) {
    if (sector === 'schools') {
      bodyText = `Hi ${shortName} Team,

I came across ${shortName} while reviewing leading educational institutions in ${locCity} and wanted to reach out directly.

We deploy the MODECBT Portal alongside our custom School Management System for top schools in Nigeria. Our platform provides:
• MODECBT Exam Engine: Automated Computer-Based Testing for entrance exams, mock assessments, and termly tests with instant grading.
• School Management System: Automated tuition & school fees payment processing, instant SMS/Email receipts, student result computation, and parent-student dashboards.

Given your strong reputation in ${locCity}, I believe this could significantly reduce administrative workload for your teachers and administrative staff.

Would you be open to a quick 3-minute demo or brief walkthrough this week?

${signature}`
    } else {
      bodyText = `Hi ${shortName} Team,

I came across ${shortName} while reviewing leading organizations in ${locCity} and wanted to reach out directly.

${sectorPitch}

We recently helped similar organizations in your sector eliminate administrative bottlenecks and accelerate client engagement. Given your strong reputation in ${locCity}, I believe this would be an outstanding fit for your current goals.

Would you be open to a quick 3-minute chat or a brief walkthrough this week?

${signature}`
    }
  } else if (stepNumber === 2) {
    if (sector === 'schools') {
      bodyText = `Hi ${shortName} Team,

Following up on my previous note regarding ${shortName}.

I know how busy academic terms can get, so I wanted to share a quick overview of how our MODECBT Portal and School Management System directly support school administrators:

${sectorPitch}

If this sounds relevant for ${shortName}, what does your calendar look like for a brief 5-minute call on Thursday or Friday?

${signature}`
    } else {
      bodyText = `Hi ${shortName} Team,

Following up on my previous note regarding ${shortName}.

I know how busy your schedule can get, so I wanted to share a quick idea on how we can directly support your team:

${sectorPitch}

If this sounds relevant, what does your calendar look like for a brief 5-minute call on Thursday or Friday?

${signature}`
    }
  } else {
    bodyText = `Hi ${shortName} Team,

I wanted to send one last quick note in case my earlier messages were missed.

We would love the opportunity to share a customized case study showing how we deliver:
"${sectorPitch}"

If the timing is not right, no problem at all. Should your team ever need support with modern digital systems or CBT exam portals in ${locCity}, feel free to keep us in mind!

${signature}`
  }

  return {
    subject,
    bodyText,
    bodyHtml: formatHtmlEmail(bodyText),
  }
}

/**
 * Converts plain text email bodies into styled, responsive HTML emails with proper paragraph and signature rendering
 */
export function formatHtmlEmail(bodyText: string): string {
  if (!bodyText) return ''

  if (bodyText.includes('<html') || bodyText.includes('<!DOCTYPE')) {
    return bodyText
  }

  const normalized = bodyText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((block) => {
      // Convert single line breaks within a block to <br />
      let formatted = block.trim().replace(/\n/g, '<br />')

      // Make email addresses and phone numbers clickable in signature
      formatted = formatted.replace(
        /info@modecbt\.com/g,
        '<a href="mailto:info@modecbt.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">info@modecbt.com</a>'
      )
      formatted = formatted.replace(
        /info@modedigitalcreations\.ng/g,
        '<a href="mailto:info@modedigitalcreations.ng" style="color: #2563eb; text-decoration: none; font-weight: 600;">info@modedigitalcreations.ng</a>'
      )
      formatted = formatted.replace(
        /08065180018/g,
        '<a href="tel:08065180018" style="color: #2563eb; text-decoration: none; font-weight: 600;">08065180018</a>'
      )

      return `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatted}</p>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.65; color: #1e293b; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 24px 28px; border-radius: 8px; border: 1px solid #e2e8f0;">
    ${paragraphs}
  </div>
</body>
</html>`
}
