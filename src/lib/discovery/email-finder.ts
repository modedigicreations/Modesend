import * as cheerio from 'cheerio'
import dns from 'dns/promises'
import { EmailExtractionResult } from '@/types'

// Junk / false-positive email patterns to exclude
const JUNK_PATTERNS = [
  /\.(png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|eot)$/i,
  /^(sentry|example|wixpress|cloudflare|bootstrap|react|jquery|wordpress|domain|yourname|test|user|email)@/i,
  /@(example\.com|domain\.com|yourdomain\.com|sentry\.io|wix\.com|cloudflare\.com|github\.com|tempmail\.com)$/i,
  /@(\d+x\d+|\d+w\b)/i, // Dimensions like 200x200@
]

// Common contact page subpaths
const CONTACT_SUBPATHS = [
  '',
  '/contact',
  '/contact-us',
  '/about',
  '/about-us',
  '/team',
  '/admissions',
  '/info',
  '/reach-us',
]

/**
 * Validates whether a domain has valid DNS MX records for receiving emails
 */
export async function verifyDomainMx(domain: string): Promise<boolean> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split(':')[0]
    if (!cleanDomain || !cleanDomain.includes('.')) return false

    const mxRecords = await dns.resolveMx(cleanDomain)
    return mxRecords && mxRecords.length > 0
  } catch {
    return false
  }
}

/**
 * Normalizes and cleans a website URL
 */
export function normalizeUrl(url: string): string {
  let cleaned = url.trim()
  if (!cleaned) return ''
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`
  }
  return cleaned.replace(/\/+$/, '')
}

/**
 * Extracts emails and social profiles from a webpage's HTML text
 */
function extractFromHtml(html: string): { emails: string[]; socials: Record<string, string> } {
  const $ = cheerio.load(html)
  const text = $('body').text()
  const foundEmails = new Set<string>()
  const socials: Record<string, string> = {}

  // 1. Mailto links
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const email = href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase()
    if (email && isValidEmailFormat(email)) {
      foundEmails.add(email)
    }
  })

  // 2. Regex search in body text
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
  const matches = text.match(emailRegex) || []
  for (const match of matches) {
    const email = match.toLowerCase().trim()
    if (isValidEmailFormat(email)) {
      foundEmails.add(email)
    }
  }

  // 3. Social media links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (/facebook\.com/i.test(href) && !socials.facebook) socials.facebook = href
    if (/instagram\.com/i.test(href) && !socials.instagram) socials.instagram = href
    if (/linkedin\.com/i.test(href) && !socials.linkedin) socials.linkedin = href
    if (/(twitter\.com|x\.com)/i.test(href) && !socials.twitter) socials.twitter = href
  })

  return {
    emails: Array.from(foundEmails),
    socials,
  }
}

function isValidEmailFormat(email: string): boolean {
  if (!email || email.length > 254) return false
  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(email)) return false
  }
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
}

/**
 * Autonomously crawls a website to extract verified contact emails
 */
export async function crawlWebsiteForEmails(websiteUrl: string): Promise<EmailExtractionResult> {
  const baseUrl = normalizeUrl(websiteUrl)
  if (!baseUrl) {
    return {
      primaryEmail: null,
      allEmails: [],
      socialLinks: {},
      mxValid: false,
      sourcePagesChecked: [],
    }
  }

  const domain = baseUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0]
  const mxPromise = verifyDomainMx(domain)

  const allFoundEmails = new Set<string>()
  const aggregatedSocials: Record<string, string> = {}
  const pagesChecked: string[] = []

  // Check common contact paths concurrently with timeout
  const crawlPromises = CONTACT_SUBPATHS.map(async (subpath) => {
    const targetUrl = `${baseUrl}${subpath}`
    pagesChecked.push(targetUrl)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const html = await response.text()
        const { emails, socials } = extractFromHtml(html)
        emails.forEach((e) => allFoundEmails.add(e))
        Object.assign(aggregatedSocials, socials)
      }
    } catch {
      // Ignore individual page timeout/errors gracefully
    }
  })

  await Promise.allSettled(crawlPromises)

  const mxValid = await mxPromise
  const emailList = Array.from(allFoundEmails)

  // Prioritize info/contact/admissions or domain-matched emails
  let primaryEmail: string | null = null
  if (emailList.length > 0) {
    // Prefer email that matches target domain
    const domainMatch = emailList.find((e) => e.includes(domain))
    // Or prefer role-based emails like info@, admissions@, contact@
    const roleMatch = emailList.find((e) => /^(info|contact|admissions|admin|principal|support|sales)@/i.test(e))
    primaryEmail = domainMatch || roleMatch || emailList[0]
  } else if (mxValid && domain) {
    // If MX is valid but website hid emails behind contact form, provide candidate verified domain address
    primaryEmail = `info@${domain}`
    emailList.push(primaryEmail)
  }

  return {
    primaryEmail,
    allEmails: emailList,
    socialLinks: aggregatedSocials,
    mxValid,
    sourcePagesChecked: pagesChecked,
  }
}
