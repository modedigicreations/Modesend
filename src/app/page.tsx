'use client'

import React, { useState } from 'react'
import {
  Search,
  MapPin,
  Sparkles,
  Send,
  Mail,
  CheckCircle2,
  ExternalLink,
  Building2,
  Phone,
  Eye,
  RefreshCw,
  ChevronRight,
  Flame,
  Globe,
  Copy,
  Check,
  Zap,
  Shield,
  Users,
  UserPlus,
  Activity,
  Sliders,
  LogOut,
  Edit2,
  Trash2,
  Lock,
} from 'lucide-react'
import { BusinessLead, UserProfile, StaffActivity, StaffMemberStats } from '@/types'
import {
  getCurrentUser,
  setCurrentUser,
  getAllRegisteredUsers,
  registerNewUser,
  updateUserProfile,
  deleteUserAccount,
  logoutCurrentUser,
  isSessionActive,
  DEFAULT_ACCOUNTS,
} from '@/lib/auth'
import {
  getStaffActivities,
  logStaffActivity,
  getStaffPerformanceStats,
} from '@/lib/audit'

export default function ModesendDashboard() {
  // Session & Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') return isSessionActive()
    return true
  })
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')

  const [currentUser, setLocalCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') return getCurrentUser() || DEFAULT_ACCOUNTS[0]
    return DEFAULT_ACCOUNTS[0]
  })
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    if (typeof window !== 'undefined') return getAllRegisteredUsers()
    return DEFAULT_ACCOUNTS
  })

  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showNewStaffModal, setShowNewStaffModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<'staff' | 'super_admin'>('staff')

  // New Staff Form State
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'super_admin'>('staff')

  // Discovery State
  const [keyword, setKeyword] = useState('Schools')
  const [location, setLocation] = useState('Port Harcourt')
  const [isSearching, setIsSearching] = useState(false)
  const [leads, setLeads] = useState<BusinessLead[]>([])
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())

  // Personalization & Offer State
  const [companyOffer, setCompanyOffer] = useState(
    'We build modern digital websites, custom school management portals, and automated tuition payment systems for leading educational institutions.'
  )
  const [activeLeadForPreview, setActiveLeadForPreview] = useState<BusinessLead | null>(null)
  const [previewSubject, setPreviewSubject] = useState('')
  const [previewBody, setPreviewBody] = useState('')
  const [previewStep, setPreviewStep] = useState(1)
  const [isPersonalizing, setIsPersonalizing] = useState(false)

  // Resend Dispatcher State
  const [senderName, setSenderName] = useState(() => {
    if (typeof window !== 'undefined') return (getCurrentUser() || DEFAULT_ACCOUNTS[0]).fullName.split(' (')[0]
    return 'Mode Digital Creations Team'
  })
  const [senderEmail, setSenderEmail] = useState('Mode Digital Creations <onboarding@resend.dev>')
  const [replyToEmail, setReplyToEmail] = useState('info@modedigitalcreations.ng')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null)
  const [testRecipient, setTestRecipient] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  // Super Admin Monitoring State
  const [teamActivities, setTeamActivities] = useState<StaffActivity[]>(() => {
    if (typeof window !== 'undefined') return getStaffActivities()
    return []
  })
  const [staffStats, setStaffStats] = useState<StaffMemberStats[]>(() => {
    if (typeof window !== 'undefined') return getStaffPerformanceStats()
    return []
  })
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all')

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'finder' | 'personalizer' | 'campaigns' | 'admin_oversight'>('finder')

  // Quick Preset Queries
  const presets = [
    { label: 'Schools in Port Harcourt', kw: 'Schools', loc: 'Port Harcourt' },
    { label: 'Law Firms in Lagos', kw: 'Law Firms', loc: 'Lagos' },
    { label: 'Hospitals in Abuja', kw: 'Hospitals', loc: 'Abuja' },
    { label: 'Logistics in Port Harcourt', kw: 'Logistics Companies', loc: 'Port Harcourt' },
    { label: 'Tech Startups in Nairobi', kw: 'Tech Startups', loc: 'Nairobi' },
  ]

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail) return

    const users = getAllRegisteredUsers()
    const matched = users.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase())

    if (matched) {
      setCurrentUser(matched)
      setLocalCurrentUser(matched)
      setSenderName(matched.fullName.split(' (')[0])
      setIsLoggedIn(true)
    } else {
      // Auto-create or register account if new
      const registered = registerNewUser(
        loginEmail.split('@')[0].replace('.', ' '),
        loginEmail.trim(),
        'staff'
      )
      setAllUsers(getAllRegisteredUsers())
      setLocalCurrentUser(registered)
      setSenderName(registered.fullName.split(' (')[0])
      setIsLoggedIn(true)
    }
  }

  // Handle Logout
  const handleLogout = () => {
    logoutCurrentUser()
    setIsLoggedIn(false)
  }

  // Switch Active User Profile
  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user)
    setLocalCurrentUser(user)
    setSenderName(user.fullName.split(' (')[0])
    setShowAuthModal(false)

    setTeamActivities(getStaffActivities())
    setStaffStats(getStaffPerformanceStats())
  }

  // Open Edit Profile Modal
  const handleOpenEditModal = (user: UserProfile) => {
    setUserToEdit(user)
    setEditName(user.fullName)
    setEditEmail(user.email)
    setEditRole(user.role)
    setShowEditProfileModal(true)
  }

  // Save Profile Edit
  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userToEdit || !editName || !editEmail) return

    const updated = updateUserProfile(userToEdit.id, {
      fullName: editName,
      email: editEmail,
      role: editRole,
    })

    if (updated) {
      const updatedUsers = getAllRegisteredUsers()
      setAllUsers(updatedUsers)

      if (currentUser.id === updated.id) {
        setLocalCurrentUser(updated)
        setSenderName(updated.fullName.split(' (')[0])
      }

      logStaffActivity(
        currentUser,
        'login',
        `Updated account profile for ${updated.fullName} (${updated.email})`
      )

      setTeamActivities(getStaffActivities())
      setStaffStats(getStaffPerformanceStats())
    }

    setShowEditProfileModal(false)
    setUserToEdit(null)
  }

  // Delete Staff Account
  const handleDeleteStaffAccount = (user: UserProfile) => {
    if (confirm(`Are you sure you want to delete the account for ${user.fullName} (${user.email})?`)) {
      const { remainingUsers, nextActive } = deleteUserAccount(user.id)
      setAllUsers(remainingUsers)
      setLocalCurrentUser(nextActive)
      setCurrentUser(nextActive)
      setSenderName(nextActive.fullName.split(' (')[0])

      logStaffActivity(
        currentUser,
        'login',
        `Removed staff account: ${user.fullName} (${user.email})`
      )

      setTeamActivities(getStaffActivities())
      setStaffStats(getStaffPerformanceStats())
    }
  }

  // Register New Staff Member
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStaffName || !newStaffEmail) return

    const created = registerNewUser(newStaffName, newStaffEmail, newStaffRole)
    const updatedUsers = getAllRegisteredUsers()
    setAllUsers(updatedUsers)
    setLocalCurrentUser(created)
    setCurrentUser(created)
    setSenderName(created.fullName.split(' (')[0])

    logStaffActivity(
      currentUser,
      'login',
      `Onboarded new staff member: ${created.fullName} (${created.email})`
    )

    setTeamActivities(getStaffActivities())
    setStaffStats(getStaffPerformanceStats())

    setNewStaffName('')
    setNewStaffEmail('')
    setShowNewStaffModal(false)
  }

  // Search & Discover Leads
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!keyword || !location) return

    setIsSearching(true)
    setSendSuccessMessage(null)

    try {
      const res = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, location, extractEmails: true }),
      })

      const data = await res.json()
      if (data.success && data.leads) {
        setLeads(data.leads)
        const initialSelected = new Set<string>()
        data.leads.forEach((l: BusinessLead) => {
          if (l.email) initialSelected.add(l.id)
        })
        setSelectedLeadIds(initialSelected)

        if (data.leads.length > 0) {
          generatePreviewForLead(data.leads[0], 1)
        }

        logStaffActivity(
          currentUser,
          'search_leads',
          `Searched "${keyword} in ${location}" and discovered ${data.leads.length} leads`,
          { keyword, location, count: data.leads.length }
        )

        setTeamActivities(getStaffActivities())
        setStaffStats(getStaffPerformanceStats())
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Toggle selection
  const toggleSelectLead = (id: string) => {
    const next = new Set(selectedLeadIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedLeadIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === leads.length) {
      setSelectedLeadIds(new Set())
    } else {
      setSelectedLeadIds(new Set(leads.map((l) => l.id)))
    }
  }

  // Generate AI Email Preview
  const generatePreviewForLead = async (lead: BusinessLead, step: number = 1) => {
    setActiveLeadForPreview(lead)
    setPreviewStep(step)
    setIsPersonalizing(true)

    try {
      const res = await fetch('/api/ai/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          companyOffer,
          senderName,
          stepNumber: step,
        }),
      })

      const data = await res.json()
      if (data.success && data.email) {
        setPreviewSubject(data.email.subject)
        setPreviewBody(data.email.bodyText)

        logStaffActivity(
          currentUser,
          'personalize_copy',
          `Generated Step ${step} personalized outreach draft for ${lead.name}`,
          { leadName: lead.name, step }
        )
        setTeamActivities(getStaffActivities())
      }
    } catch (err) {
      console.error('Personalization failed:', err)
    } finally {
      setIsPersonalizing(false)
    }
  }

  // Copy Email to Clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  // Send Test Email to Self
  const handleSendTest = async () => {
    if (!testRecipient || !activeLeadForPreview) return
    setIsSendingTest(true)

    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: 'test_campaign',
          leads: [
            {
              ...activeLeadForPreview,
              email: testRecipient,
              generatedSubject: previewSubject,
              generatedBody: previewBody,
            },
          ],
          companyOffer,
          senderName,
          senderEmail,
          replyToEmail,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert(`Test email successfully dispatched to ${testRecipient}!`)
        logStaffActivity(
          currentUser,
          'send_test',
          `Dispatched test preview email to ${testRecipient}`,
          { recipient: testRecipient }
        )
        setTeamActivities(getStaffActivities())
      } else {
        alert(`Failed: ${data.error || 'Resend delivery failed'}`)
      }
    } catch (err) {
      alert(`Error sending test: ${err}`)
    } finally {
      setIsSendingTest(false)
    }
  }

  // Launch Outreach to Selected Leads
  const handleDispatchCampaign = async () => {
    const selectedLeads = leads.filter((l) => selectedLeadIds.has(l.id))
    if (selectedLeads.length === 0) return

    setIsSending(true)
    setSendSuccessMessage(null)

    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: `camp_${Date.now()}`,
          leads: selectedLeads,
          companyOffer,
          senderName,
          senderEmail,
          replyToEmail,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSendSuccessMessage(
          `Successfully dispatched ${data.successfulSends} personalized outreach emails via Resend API!`
        )
        setLeads((prev) =>
          prev.map((lead) => {
            if (selectedLeadIds.has(lead.id)) {
              return { ...lead, status: 'sent', sentAt: new Date().toLocaleTimeString() }
            }
            return lead
          })
        )

        logStaffActivity(
          currentUser,
          'send_campaign',
          `Launched cold outreach campaign: Sent ${data.successfulSends} emails via Resend`,
          { count: data.successfulSends, leadsSample: selectedLeads.slice(0, 3).map((l) => l.name) }
        )

        setTeamActivities(getStaffActivities())
        setStaffStats(getStaffPerformanceStats())
      } else {
        alert(`Dispatch error: ${data.error}`)
      }
    } catch (err) {
      alert(`Dispatch failed: ${err}`)
    } finally {
      setIsSending(false)
    }
  }

  // Filtered activities
  const filteredActivities =
    selectedStaffFilter === 'all'
      ? teamActivities
      : teamActivities.filter((a) => a.userId === selectedStaffFilter)

  // Computed totals
  const totalVerified = leads.filter((l) => l.email && l.emailStatus === 'verified').length
  const totalSent = leads.filter((l) => l.status === 'sent').length
  const isSuperAdmin = currentUser.role === 'super_admin'

  // ================= RENDER LOGIN PAGE IF NOT LOGGED IN =================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 selection:bg-blue-600/20">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-blue-500/5 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 mx-auto flex items-center justify-center">
              <div className="w-full h-full bg-blue-600 rounded-[14px] flex items-center justify-center text-white">
                <Zap className="w-6 h-6 fill-white/20" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Modesend</h1>
            <p className="text-xs text-slate-500 font-medium">
              Enterprise Autonomous B2B Prospecting Engine
            </p>
          </div>

          {/* Auth Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authTab === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authTab === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Create Staff Account
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@modewebhost.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
            >
              {authTab === 'login' ? 'Sign In to Modesend' : 'Create & Access Account'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Login List */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block text-center uppercase tracking-wider">
              Quick 1-Click Access
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setCurrentUser(u)
                    setLocalCurrentUser(u)
                    setSenderName(u.fullName.split(' (')[0])
                    setIsLoggedIn(true)
                  }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left text-xs flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${
                      u.role === 'super_admin' ? 'bg-indigo-600' : 'bg-blue-600'
                    }`}>
                      {u.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-700">{u.fullName}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role === 'super_admin' ? 'Super Admin' : 'Staff'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ================= MAIN AUTHENTICATED DASHBOARD =================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600/20 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-blue-600 rounded-[10px] flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-white/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Modesend</h1>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  Enterprise Outreach
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous B2B Prospecting & Resend Email Dispatcher</p>
            </div>
          </div>

          {/* User Account & Quick Role Indicator */}
          <div className="flex items-center gap-3">
            {/* Quick Metrics */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700">
                <span className="text-slate-400">Leads:</span>
                <span className="font-bold text-slate-900">{leads.length}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-800">
                <span className="text-blue-500">Verified:</span>
                <span className="font-bold">{totalVerified}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-800">
                <span className="text-indigo-500">Sent:</span>
                <span className="font-bold">{totalSent}</span>
              </div>
            </div>

            {/* Resend Status Badge */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-700 font-semibold shadow-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Resend Active
            </div>

            {/* Active User Pill / Switcher */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl text-xs transition-colors text-left"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${
                  isSuperAdmin ? 'bg-indigo-600' : 'bg-blue-600'
                }`}>
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                    {currentUser.fullName.split(' (')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                    {currentUser.email}
                  </div>
                </div>
                <Sliders className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Edit My Profile Button */}
              <button
                type="button"
                onClick={() => handleOpenEditModal(currentUser)}
                className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 rounded-xl text-xs transition-colors"
                title="Edit My Profile & Email"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 rounded-xl text-xs transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('finder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'finder'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            Lead Discovery
          </button>

          <button
            onClick={() => setActiveTab('personalizer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'personalizer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Personalization Studio
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'campaigns'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            Resend Outreach ({selectedLeadIds.size})
          </button>

          {/* Super Admin Monitoring Tab */}
          <button
            onClick={() => setActiveTab('admin_oversight')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'admin_oversight'
                ? 'bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-500" />
            Staff Activity Oversight
            {isSuperAdmin && (
              <span className="px-1.5 py-0.2 bg-white text-indigo-700 font-bold text-[10px] rounded-full">
                Admin
              </span>
            )}
          </button>
        </div>

        {/* ================= TAB 1: LEAD DISCOVERY ================= */}
        {activeTab === 'finder' && (
          <div className="space-y-8">
            {/* Search Box Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/70 rounded-full blur-3xl pointer-events-none -z-0" />

              <div className="mb-6 relative z-10">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
                  <Flame className="w-4 h-4" />
                  Keyword & Location Lead Engine
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Discover High-Intent Prospects & Verified Emails
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Logged in as: <span className="font-semibold text-slate-800">{currentUser.fullName}</span> ({currentUser.email}) • Searches are automatically logged for team oversight.
                </p>
              </div>

              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 relative z-10">
                <div className="md:col-span-5 relative">
                  <Building2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Industry / Keyword (e.g. Schools, Law Firms, Hospitals)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                  />
                </div>

                <div className="md:col-span-4 relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City / Location (e.g. Port Harcourt, Lagos, London)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full h-full min-h-[48px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Finding Verified Leads...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Discover Leads
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Presets */}
              <div className="mt-5 flex items-center gap-2 flex-wrap relative z-10">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-600" /> Suggestions:
                </span>
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setKeyword(p.kw)
                      setLocation(p.loc)
                    }}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            {leads.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Discovered Leads ({leads.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Target Area: <span className="font-semibold text-slate-700">{location}</span> • {totalVerified} verified emails ready for outreach
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors"
                    >
                      {selectedLeadIds.size === leads.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={() => setActiveTab('personalizer')}
                      className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Personalize Selected ({selectedLeadIds.size})
                    </button>
                  </div>
                </div>

                {/* Leads Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map((lead) => {
                    const isSelected = selectedLeadIds.has(lead.id)
                    return (
                      <div
                        key={lead.id}
                        onClick={() => toggleSelectLead(lead.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-500 shadow-sm shadow-blue-500/10'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectLead(lead.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{lead.name}</h4>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                                  {lead.category}
                                </span>
                                {lead.rating && (
                                  <span className="text-amber-500 text-xs font-semibold">
                                    ★ {lead.rating} ({lead.reviewsCount})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {lead.status === 'sent' ? (
                            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Sent
                            </span>
                          ) : lead.emailStatus === 'verified' ? (
                            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                              Unverified
                            </span>
                          )}
                        </div>

                        {/* Contact Meta */}
                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                          {lead.email && (
                            <div className="flex items-center justify-between gap-2 group">
                              <span className="flex items-center gap-1.5 text-blue-800 font-mono font-medium truncate">
                                <Mail className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                {lead.email}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyEmail(lead.email || '')
                                }}
                                className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-slate-800 transition-opacity flex items-center gap-1"
                              >
                                {copiedEmail === lead.email ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          )}

                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 truncate">
                              <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              {lead.phone}
                            </div>
                          )}

                          {lead.address && (
                            <div className="flex items-center gap-1.5 text-slate-500 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              {lead.address}
                            </div>
                          )}

                          {lead.website && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:underline flex items-center gap-1 truncate font-medium"
                              >
                                {lead.website.replace(/^https?:\/\//i, '')}
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Action Preview */}
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              generatePreviewForLead(lead, 1)
                              setActiveTab('personalizer')
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview AI Email
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: AI PERSONALIZATION STUDIO ================= */}
        {activeTab === 'personalizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Offer Setup */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Company Pitch & Value Proposition
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modesend tailors this core value proposition to each prospect’s operational profile.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    What are you offering?
                  </label>
                  <textarea
                    rows={4}
                    value={companyOffer}
                    onChange={(e) => setCompanyOffer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Email</label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeLeadForPreview) generatePreviewForLead(activeLeadForPreview, previewStep)
                    }}
                    disabled={isPersonalizing || !activeLeadForPreview}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPersonalizing ? 'animate-spin' : ''}`} />
                    Regenerate Copy with AI
                  </button>
                </div>
              </div>

              {/* Prospect Picker List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  Select Lead to Inspect ({leads.length})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {leads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => generatePreviewForLead(l, previewStep)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        activeLeadForPreview?.id === l.id
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <div className="truncate">{l.name}</div>
                      <div className="text-[11px] text-blue-700 truncate">{l.email || 'No email found'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Preview Column */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Live Outreach Preview
                    </h3>
                    <p className="text-xs text-slate-500">
                      Prospect: <span className="font-bold text-blue-700">{activeLeadForPreview?.name || 'Select a lead'}</span> ({activeLeadForPreview?.email})
                    </p>
                  </div>

                  {/* Step Selector */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                    {[1, 2, 3].map((step) => (
                      <button
                        key={step}
                        onClick={() => {
                          if (activeLeadForPreview) generatePreviewForLead(activeLeadForPreview, step)
                        }}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          previewStep === step
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Step {step}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={previewSubject}
                    onChange={(e) => setPreviewSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Body Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Body</label>
                  <textarea
                    rows={10}
                    value={previewBody}
                    onChange={(e) => setPreviewBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Test Send Section */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <div className="w-full sm:w-auto flex items-center gap-2 flex-1">
                    <input
                      type="email"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      placeholder="Send real test email to your inbox..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleSendTest}
                      disabled={isSendingTest || !testRecipient}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shrink-0 transition-colors disabled:opacity-50"
                    >
                      {isSendingTest ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('campaigns')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors"
                  >
                    Proceed to Campaign Dispatch
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: RESEND CAMPAIGN DISPATCHER ================= */}
        {activeTab === 'campaigns' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  Launch Cold Outreach via Resend API
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ready to dispatch personalized sequences to {selectedLeadIds.size} selected prospects.
                </p>
              </div>

              {sendSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {sendSuccessMessage}
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block font-medium">Selected Leads</span>
                  <span className="text-2xl font-bold text-slate-900">{selectedLeadIds.size}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block font-medium">Dispatched By</span>
                  <span className="text-sm font-bold text-blue-700 truncate block mt-1">{currentUser.fullName.split(' (')[0]}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block font-medium">Delivery Engine</span>
                  <span className="text-sm font-bold text-slate-800 block mt-1">Resend v2</span>
                </div>
              </div>

              {/* Dispatch Settings */}
              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">From Sender Address</label>
                  <input
                    type="text"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Use your verified Resend domain address (e.g. <code>outreach@yourdomain.com</code>).
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reply-To Address</label>
                  <input
                    type="text"
                    value={replyToEmail}
                    onChange={(e) => setReplyToEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Launch Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleDispatchCampaign}
                  disabled={isSending || selectedLeadIds.size === 0}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Dispatching Outreach Batch...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Dispatch Campaign to {selectedLeadIds.size} Prospects
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SUPER ADMIN STAFF ACTIVITY OVERSIGHT ================= */}
        {activeTab === 'admin_oversight' && (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                    <Shield className="w-4 h-4" />
                    Super Admin Console
                  </div>
                  <h2 className="text-2xl font-bold">Staff Activity & Outreach Oversight</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Live telemetry tracking all team member searches, lead prospecting batches, AI email generations, and Resend outreach campaigns.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(currentUser)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors border border-slate-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Admin Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewStaffModal(true)}
                    className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Onboard Staff Member
                  </button>
                </div>
              </div>
            </div>

            {/* Team Metrics Leaderboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Active Staff Accounts</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{allUsers.length}</div>
                <span className="text-[11px] text-blue-600 font-semibold mt-2 block">Organization Members</span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Total Team Searches</span>
                <div className="text-2xl font-bold text-blue-700 mt-1">
                  {staffStats.reduce((acc, curr) => acc + curr.totalSearches, 0)}
                </div>
                <span className="text-[11px] text-slate-500 mt-2 block">Keyword/Location queries</span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Total Leads Discovered</span>
                <div className="text-2xl font-bold text-indigo-700 mt-1">
                  {staffStats.reduce((acc, curr) => acc + curr.totalLeadsFound, 0)}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">Across all campaigns</span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Total Emails Dispatched</span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  {staffStats.reduce((acc, curr) => acc + curr.totalSent, 0)}
                </div>
                <span className="text-[11px] text-slate-500 mt-2 block">Via Resend Infrastructure</span>
              </div>
            </div>

            {/* Staff Members Breakdown Table with Edit & Delete */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Staff Accounts & Performance ({allUsers.length})
                  </h3>
                  <p className="text-xs text-slate-500">Manage team accounts, edit emails, or remove demo users</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Account Holder</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Searches</th>
                      <th className="py-3 px-4 text-center">Leads Discovered</th>
                      <th className="py-3 px-4 text-center">Outreach Sent</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((user) => {
                      const stat = staffStats.find((s) => s.userId === user.id) || {
                        totalSearches: 0,
                        totalLeadsFound: 0,
                        totalSent: 0,
                      }
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                user.role === 'super_admin' ? 'bg-indigo-600' : 'bg-blue-600'
                              }`}>
                                {user.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span>{user.fullName}</span>
                                  {currentUser.id === user.id && (
                                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">YOU</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-blue-700 font-medium">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              user.role === 'super_admin'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {user.role === 'super_admin' ? 'Super Admin' : 'Staff'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">{stat.totalSearches}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-indigo-600">{stat.totalLeadsFound}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{stat.totalSent}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(user)}
                                className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition-colors"
                                title="Edit Email / Name"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStaffAccount(user)}
                                className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg transition-colors"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Realtime Team Activity Stream */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Live Team Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500">Real-time stream of all staff operations</p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Filter by:</span>
                  <select
                    value={selectedStaffFilter}
                    onChange={(e) => setSelectedStaffFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="all">All Staff Members</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName.split(' (')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Feed List */}
              <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No activity recorded for this filter yet.</p>
                ) : (
                  filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          act.action === 'send_campaign'
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.action === 'search_leads'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {act.action === 'send_campaign' ? (
                            <Send className="w-3.5 h-3.5" />
                          ) : act.action === 'search_leads' ? (
                            <Search className="w-3.5 h-3.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-slate-900">
                            {act.userName.split(' (')[0]}
                            <span className="ml-2 font-normal text-slate-700">{act.summary}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {act.userEmail} • Role: {act.userRole}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: EDIT USER PROFILE ================= */}
      {showEditProfileModal && userToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProfileEdit}
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit Account Details
              </h3>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name & Title</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Update to your correct corporate email address.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'staff' | 'super_admin')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
              >
                <option value="staff">Staff Member (Prospecting & Outreach)</option>
                <option value="super_admin">Super Administrator (Full Team Oversight)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-blue-500/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: SWITCH ACTIVE ACCOUNT ================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Switch Active Account
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an account to simulate staff or administrator workflows:
            </p>

            <div className="space-y-2">
              {allUsers.map((u) => {
                const isSelected = currentUser.id === u.id
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSwitchUser(u)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                        u.role === 'super_admin' ? 'bg-indigo-600' : 'bg-blue-600'
                      }`}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-blue-700 font-medium text-[11px]">{u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'Staff'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false)
                  setShowNewStaffModal(true)
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Onboard New Staff
              </button>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ONBOARD NEW STAFF ================= */}
      {showNewStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Onboard New Team Member
              </h3>
              <button
                type="button"
                onClick={() => setShowNewStaffModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name & Title</label>
              <input
                type="text"
                required
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="e.g. John Doe (Lead Outbound)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Email</label>
              <input
                type="email"
                required
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="john.doe@modewebhost.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value as 'staff' | 'super_admin')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
              >
                <option value="staff">Staff Member (Prospecting & Outreach)</option>
                <option value="super_admin">Super Administrator (Full Team Oversight)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewStaffModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-blue-500/20"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
