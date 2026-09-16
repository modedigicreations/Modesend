export type EmailStatus = 'verified' | 'unverified' | 'discovering' | 'failed'
export type LeadStatus = 'discovered' | 'ready' | 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced'
export type CampaignStatus = 'draft' | 'prospecting' | 'ready' | 'active' | 'paused' | 'completed'
export type UserRole = 'super_admin' | 'staff'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export type StaffActionType =
  | 'search_leads'
  | 'enrich_email'
  | 'personalize_copy'
  | 'send_campaign'
  | 'send_test'
  | 'login'

export interface StaffActivity {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: UserRole
  action: StaffActionType
  summary: string
  details?: Record<string, unknown>
  timestamp: string
}

export interface StaffMemberStats {
  userId: string
  userName: string
  userEmail: string
  role: UserRole
  totalSearches: number
  totalLeadsFound: number
  totalSent: number
  lastActive: string
}

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
  discoveredBy?: string
  discoveredByName?: string
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
  currentSequenceStep?: number
  maxSequenceSteps?: number
  sequenceHistory?: Array<{
    step: number
    subject: string
    body: string
    sentAt: string
    resendId?: string
  }>
  nextFollowUpDue?: string
  followUpStatus?: 'not_started' | 'step_1_sent' | 'step_2_sent' | 'step_3_sent' | 'step_4_sent' | 'completed'
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
  name: string
  description: string
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
  createdBy: string
  createdByName: string
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
  userId?: string
  userName?: string
}

export interface EmailExtractionResult {
  primaryEmail: string | null
  allEmails: string[]
  socialLinks: Record<string, string>
  mxValid: boolean
  sourcePagesChecked: string[]
}
