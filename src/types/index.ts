export type EmailStatus = 'verified' | 'unverified' | 'discovering' | 'failed'
export type LeadStatus = 'discovered' | 'ready' | 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced'
export type CampaignStatus = 'draft' | 'prospecting' | 'ready' | 'active' | 'paused' | 'completed'

export interface BusinessLead {
  id: string
  campaignId: string
  name: string
  category: string
  location: string
  address?: string
  phone?: string
  website?: string
  email?: string
  secondaryEmails?: string[]
  emailStatus: EmailStatus
  rating?: number
  reviewsCount?: number
  enrichedData?: {
    socialLinks?: {
      facebook?: string
      instagram?: string
      linkedin?: string
      twitter?: string
    }
    keyPersons?: string[]
    description?: string
    mxValid?: boolean
  }
  status: LeadStatus
  generatedSubject?: string
  generatedBody?: string
  resendEmailId?: string
  sentAt?: string
  openedAt?: string
  clickedAt?: string
  repliedAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface SequenceStep {
  stepNumber: number
  delayDays: number
  subjectTemplate: string
  bodyTemplate: string
}

export interface Campaign {
  id: string
  name: string
  keyword: string
  location: string
  companyOffer: string
  senderName: string
  senderEmail: string
  replyToEmail?: string
  dailyLimit: number
  status: CampaignStatus
  leadsCount: number
  verifiedCount: number
  sentCount: number
  openedCount: number
  clickedCount: number
  repliedCount: number
  bouncedCount: number
  steps: SequenceStep[]
  createdAt: string
  updatedAt: string
}

export interface DiscoverySearchParams {
  keyword: string
  location: string
  limit?: number
  extractEmails?: boolean
}

export interface EmailExtractionResult {
  primaryEmail: string | null
  allEmails: string[]
  socialLinks: Record<string, string>
  mxValid: boolean
  sourcePagesChecked: string[]
}
