import { UserProfile, UserRole } from '@/types'

// Default starter accounts
export const DEFAULT_ACCOUNTS: UserProfile[] = [
  {
    id: 'user_admin_1',
    email: 'admin@modewebhost.com',
    fullName: 'Super Administrator',
    role: 'super_admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_staff_1',
    email: 'sarah.outreach@modewebhost.com',
    fullName: 'Sarah Johnson (Outreach Specialist)',
    role: 'staff',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_staff_2',
    email: 'david.b2b@modewebhost.com',
    fullName: 'David Okafor (Lead Researcher)',
    role: 'staff',
    createdAt: new Date().toISOString(),
  },
]

const AUTH_STORAGE_KEY = 'modesend_current_user'
const USERS_STORAGE_KEY = 'modesend_registered_users'
const SESSION_ACTIVE_KEY = 'modesend_session_active'

/**
 * Checks if user is currently logged in
 */
export function isSessionActive(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(SESSION_ACTIVE_KEY) === 'true'
  } catch {
    return true
  }
}

/**
 * Retrieves the currently active user profile from storage or returns Super Admin default
 */
export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCOUNTS[0]
  }

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {}

  return DEFAULT_ACCOUNTS[0]
}

/**
 * Sets the active logged-in user profile and marks session active
 */
export function setCurrentUser(user: UserProfile): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    localStorage.setItem(SESSION_ACTIVE_KEY, 'true')
  } catch {}
}

/**
 * Logs out the current user session
 */
export function logoutCurrentUser(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SESSION_ACTIVE_KEY, 'false')
  } catch {}
}

/**
 * Returns all registered staff and admin accounts
 */
export function getAllRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCOUNTS
  }

  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {}

  return DEFAULT_ACCOUNTS
}

/**
 * Creates and registers a new staff or admin user
 */
export function registerNewUser(
  fullName: string,
  email: string,
  role: UserRole = 'staff'
): UserProfile {
  const users = getAllRegisteredUsers()
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    setCurrentUser(existing)
    return existing
  }

  const newUser: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    fullName,
    email,
    role,
    createdAt: new Date().toISOString(),
  }

  const updatedUsers = [...users, newUser]
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      localStorage.setItem(SESSION_ACTIVE_KEY, 'true')
    } catch {}
  }

  return newUser
}

/**
 * Updates an existing user profile's email, name, or role
 */
export function updateUserProfile(
  userId: string,
  updates: { fullName?: string; email?: string; role?: UserRole }
): UserProfile | null {
  const users = getAllRegisteredUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return null

  const updatedUser: UserProfile = {
    ...users[index],
    ...(updates.fullName ? { fullName: updates.fullName } : {}),
    ...(updates.email ? { email: updates.email } : {}),
    ...(updates.role ? { role: updates.role } : {}),
  }

  users[index] = updatedUser

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      const current = getCurrentUser()
      if (current && current.id === userId) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
      }
    } catch {}
  }

  return updatedUser
}

/**
 * Deletes a staff account from storage
 */
export function deleteUserAccount(userId: string): { remainingUsers: UserProfile[]; nextActive: UserProfile } {
  const users = getAllRegisteredUsers()
  const remaining = users.filter((u) => u.id !== userId)

  // Ensure there's always at least 1 account
  const finalUsers = remaining.length > 0 ? remaining : DEFAULT_ACCOUNTS.slice(0, 1)

  const current = getCurrentUser()
  const nextActive = current && current.id !== userId ? current : finalUsers[0]

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(finalUsers))
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextActive))
    } catch {}
  }

  return {
    remainingUsers: finalUsers,
    nextActive,
  }
}
