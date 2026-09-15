import { StaffActivity, StaffMemberStats, UserProfile } from '@/types'
import { getAllRegisteredUsers } from './auth'

const ACTIVITIES_STORAGE_KEY = 'modesend_team_activities'

// Starter demonstration activities
const INITIAL_DEMO_ACTIVITIES: StaffActivity[] = [
  {
    id: 'act_1',
    userId: 'user_staff_1',
    userName: 'Sarah Johnson (Outreach Specialist)',
    userEmail: 'sarah.outreach@modewebhost.com',
    userRole: 'staff',
    action: 'search_leads',
    summary: 'Searched "Schools in Port Harcourt" and discovered 10 verified institutions',
    details: { keyword: 'Schools', location: 'Port Harcourt', count: 10 },
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'act_2',
    userId: 'user_staff_1',
    userName: 'Sarah Johnson (Outreach Specialist)',
    userEmail: 'sarah.outreach@modewebhost.com',
    userRole: 'staff',
    action: 'send_campaign',
    summary: 'Dispatched 8 personalized outreach emails to Port Harcourt Schools via Resend',
    details: { count: 8, recipientSample: 'principal@jesuitmemorial.org' },
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'act_3',
    userId: 'user_staff_2',
    userName: 'David Okafor (Lead Researcher)',
    userEmail: 'david.b2b@modewebhost.com',
    userRole: 'staff',
    action: 'search_leads',
    summary: 'Searched "Law Firms in Lagos" and imported 12 corporate practices',
    details: { keyword: 'Law Firms', location: 'Lagos', count: 12 },
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'act_4',
    userId: 'user_staff_2',
    userName: 'David Okafor (Lead Researcher)',
    userEmail: 'david.b2b@modewebhost.com',
    userRole: 'staff',
    action: 'personalize_copy',
    summary: 'Generated 1-to-1 tailored pitch copy for 12 Lagos Law Firm partners',
    details: { count: 12 },
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
]

/**
 * Returns all logged team activities (newest first)
 */
export function getStaffActivities(): StaffActivity[] {
  if (typeof window === 'undefined') {
    return INITIAL_DEMO_ACTIVITIES
  }

  try {
    const stored = localStorage.getItem(ACTIVITIES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {}

  return INITIAL_DEMO_ACTIVITIES
}

/**
 * Logs a new staff action into the team audit trail
 */
export function logStaffActivity(
  user: UserProfile,
  action: StaffActivity['action'],
  summary: string,
  details?: Record<string, unknown>
): StaffActivity {
  const current = getStaffActivities()

  const newActivity: StaffActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    userRole: user.role,
    action,
    summary,
    details,
    timestamp: new Date().toISOString(),
  }

  const updated = [newActivity, ...current].slice(0, 150) // keep last 150 actions

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  return newActivity
}

/**
 * Computes performance analytics for each staff member
 */
export function getStaffPerformanceStats(): StaffMemberStats[] {
  const users = getAllRegisteredUsers()
  const activities = getStaffActivities()

  return users.map((user) => {
    const userActivities = activities.filter((a) => a.userId === user.id)

    let totalSearches = 0
    let totalLeadsFound = 0
    let totalSent = 0
    let lastActive = user.createdAt

    userActivities.forEach((act) => {
      if (!lastActive || new Date(act.timestamp) > new Date(lastActive)) {
        lastActive = act.timestamp
      }

      if (act.action === 'search_leads') {
        totalSearches += 1
        const count = typeof act.details?.count === 'number' ? act.details.count : 10
        totalLeadsFound += count
      } else if (act.action === 'send_campaign') {
        const count = typeof act.details?.count === 'number' ? act.details.count : 1
        totalSent += count
      }
    })

    return {
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      role: user.role,
      totalSearches,
      totalLeadsFound,
      totalSent,
      lastActive,
    }
  })
}
