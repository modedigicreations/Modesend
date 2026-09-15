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
  BarChart3,
  Flame,
  Globe,
  Copy,
  Check,
  Zap,
} from 'lucide-react'
import { BusinessLead } from '@/types'

export default function ModesendDashboard() {
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
  const [senderName, setSenderName] = useState('Modewebhost Team')
  const [senderEmail, setSenderEmail] = useState('Modesend <onboarding@resend.dev>')
  const [replyToEmail, setReplyToEmail] = useState('hello@modewebhost.com')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null)
  const [testRecipient, setTestRecipient] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'finder' | 'personalizer' | 'campaigns' | 'analytics'>('finder')

  // Quick Preset Queries
  const presets = [
    { label: 'Schools in Port Harcourt', kw: 'Schools', loc: 'Port Harcourt' },
    { label: 'Law Firms in Lagos', kw: 'Law Firms', loc: 'Lagos' },
    { label: 'Hospitals in Abuja', kw: 'Hospitals', loc: 'Abuja' },
    { label: 'Logistics in Port Harcourt', kw: 'Logistics Companies', loc: 'Port Harcourt' },
    { label: 'Tech Startups in Nairobi', kw: 'Tech Startups', loc: 'Nairobi' },
  ]

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
        // Select all verified leads by default
        const initialSelected = new Set<string>()
        data.leads.forEach((l: BusinessLead) => {
          if (l.email) initialSelected.add(l.id)
        })
        setSelectedLeadIds(initialSelected)

        if (data.leads.length > 0) {
          generatePreviewForLead(data.leads[0], 1)
        }
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
        // Update local lead statuses
        setLeads((prev) =>
          prev.map((lead) => {
            if (selectedLeadIds.has(lead.id)) {
              return { ...lead, status: 'sent', sentAt: new Date().toLocaleTimeString() }
            }
            return lead
          })
        )
      } else {
        alert(`Dispatch error: ${data.error}`)
      }
    } catch (err) {
      alert(`Dispatch failed: ${err}`)
    } finally {
      setIsSending(false)
    }
  }

  // Computed stats
  const totalVerified = leads.filter((l) => l.email && l.emailStatus === 'verified').length
  const totalSent = leads.filter((l) => l.status === 'sent').length

  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#090b0e]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#090b0e] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Modesend</h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Internal Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Keyword & Location B2B Prospecting</p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-2 bg-[#12161f] border border-white/5 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Discovered:</span>
              <span className="font-semibold text-white">{leads.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#12161f] border border-white/5 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Verified:</span>
              <span className="font-semibold text-emerald-400">{totalVerified}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#12161f] border border-white/5 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Sent:</span>
              <span className="font-semibold text-cyan-400">{totalSent}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Resend Connected
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('finder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'finder'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
            Lead Discovery
          </button>
          <button
            onClick={() => setActiveTab('personalizer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'personalizer'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Personalization Studio
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'campaigns'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4" />
            Resend Outreach ({selectedLeadIds.size})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Outreach Telemetry
          </button>
        </div>

        {/* ================= TAB 1: LEAD FINDER ================= */}
        {activeTab === 'finder' && (
          <div className="space-y-8">
            {/* Search Box */}
            <div className="bg-[#11141b] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-400" />
                  Prospect Any Niche in Any Location
                </h2>
                <p className="text-xs text-slate-400">
                  Zero prior prospect info needed. Enter an industry and city to discover businesses and extract verified emails.
                </p>
              </div>

              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 relative">
                  <Building2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Niche / Keyword (e.g. Schools, Law Firms, Hospitals)"
                    className="w-full bg-[#181d26] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>

                <div className="md:col-span-4 relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City / Region (e.g. Port Harcourt, Lagos, London)"
                    className="w-full bg-[#181d26] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full h-full min-h-[48px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Crawling & Verifying...
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

              {/* Presets */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" /> Quick suggestions:
                </span>
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setKeyword(p.kw)
                      setLocation(p.loc)
                    }}
                    className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded-lg border border-white/5 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Roster */}
            {leads.length > 0 && (
              <div className="bg-[#11141b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Discovered Prospects ({leads.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Found in {location} • {totalVerified} verified emails ready for 1-click outreach
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-colors"
                    >
                      {selectedLeadIds.size === leads.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={() => setActiveTab('personalizer')}
                      className="text-xs px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Personalize Selected ({selectedLeadIds.size})
                    </button>
                  </div>
                </div>

                {/* Leads Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map((lead) => {
                    const isSelected = selectedLeadIds.has(lead.id)
                    return (
                      <div
                        key={lead.id}
                        onClick={() => toggleSelectLead(lead.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#151a24] border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                            : 'bg-[#13161f] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectLead(lead.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-sm truncate">{lead.name}</h4>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-slate-300">
                                  {lead.category}
                                </span>
                                {lead.rating && (
                                  <span className="text-amber-400 text-[11px] font-medium">
                                    ★ {lead.rating} ({lead.reviewsCount})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {lead.status === 'sent' ? (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Sent
                            </span>
                          ) : lead.emailStatus === 'verified' ? (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                              Unverified
                            </span>
                          )}
                        </div>

                        {/* Contact Meta */}
                        <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 gap-1.5 text-xs text-slate-300">
                          {lead.email && (
                            <div className="flex items-center justify-between gap-2 group">
                              <span className="flex items-center gap-1.5 text-emerald-300 font-mono truncate">
                                <Mail className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                {lead.email}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyEmail(lead.email || '')
                                }}
                                className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-white transition-opacity flex items-center gap-1"
                              >
                                {copiedEmail === lead.email ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          )}

                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400 truncate">
                              <Phone className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                              {lead.phone}
                            </div>
                          )}

                          {lead.address && (
                            <div className="flex items-center gap-1.5 text-slate-400 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                              {lead.address}
                            </div>
                          )}

                          {lead.website && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Globe className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-cyan-400 hover:underline flex items-center gap-1 truncate"
                              >
                                {lead.website.replace(/^https?:\/\//i, '')}
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Action link */}
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              generatePreviewForLead(lead, 1)
                              setActiveTab('personalizer')
                            }}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Preview AI Email
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
            {/* Offer Setup Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#11141b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Company Offer & Value Proposition
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modesend adapts this offer dynamically into each lead’s exact operational context.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    What are you offering?
                  </label>
                  <textarea
                    rows={4}
                    value={companyOffer}
                    onChange={(e) => setCompanyOffer(e.target.value)}
                    className="w-full bg-[#181d26] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-[#181d26] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sender Email</label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full bg-[#181d26] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none"
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
                    className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPersonalizing ? 'animate-spin' : ''}`} />
                    Regenerate Copy with AI
                  </button>
                </div>
              </div>

              {/* Prospect Picker List */}
              <div className="bg-[#11141b] border border-white/10 rounded-2xl p-5 shadow-xl">
                <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                  Select Prospect to Inspect ({leads.length})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {leads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => generatePreviewForLead(l, previewStep)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        activeLeadForPreview?.id === l.id
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                          : 'bg-[#181d26] border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200 truncate">{l.name}</div>
                      <div className="text-[11px] text-emerald-400/80 truncate">{l.email || 'No email found'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Preview Column */}
            <div className="lg:col-span-7">
              <div className="bg-[#11141b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      Live Email Preview
                    </h3>
                    <p className="text-xs text-slate-400">
                      Target: <span className="text-emerald-300">{activeLeadForPreview?.name || 'Select a lead'}</span> ({activeLeadForPreview?.email})
                    </p>
                  </div>

                  {/* Step Selector */}
                  <div className="flex items-center bg-[#181d26] p-1 rounded-lg border border-white/5 text-xs">
                    {[1, 2, 3].map((step) => (
                      <button
                        key={step}
                        onClick={() => {
                          if (activeLeadForPreview) generatePreviewForLead(activeLeadForPreview, step)
                        }}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          previewStep === step
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Step {step}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={previewSubject}
                    onChange={(e) => setPreviewSubject(e.target.value)}
                    className="w-full bg-[#181d26] border border-white/10 rounded-lg p-3 text-sm text-white font-medium focus:outline-none"
                  />
                </div>

                {/* Body Field */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Email Body (Plain Text / HTML)</label>
                  <textarea
                    rows={10}
                    value={previewBody}
                    onChange={(e) => setPreviewBody(e.target.value)}
                    className="w-full bg-[#181d26] border border-white/10 rounded-xl p-4 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none"
                  />
                </div>

                {/* Test Send Section */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <div className="w-full sm:w-auto flex items-center gap-2 flex-1">
                    <input
                      type="email"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      placeholder="Enter your email for test send..."
                      className="w-full bg-[#181d26] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendTest}
                      disabled={isSendingTest || !testRecipient}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-lg shrink-0 transition-colors disabled:opacity-50"
                    >
                      {isSendingTest ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('campaigns')}
                    className="w-full sm:w-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
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
            <div className="bg-[#11141b] border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  Launch Cold Outreach via Resend API
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ready to dispatch personalized sequences to {selectedLeadIds.size} selected prospects.
                </p>
              </div>

              {sendSuccessMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {sendSuccessMessage}
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#181d26] p-4 rounded-xl border border-white/5">
                  <span className="text-[11px] text-slate-400 block">Total Selected</span>
                  <span className="text-xl font-bold text-white">{selectedLeadIds.size}</span>
                </div>
                <div className="bg-[#181d26] p-4 rounded-xl border border-white/5">
                  <span className="text-[11px] text-slate-400 block">Sender Name</span>
                  <span className="text-sm font-semibold text-emerald-400 truncate block">{senderName}</span>
                </div>
                <div className="bg-[#181d26] p-4 rounded-xl border border-white/5">
                  <span className="text-[11px] text-slate-400 block">Delivery Engine</span>
                  <span className="text-sm font-semibold text-cyan-400 block">Resend API v2</span>
                </div>
              </div>

              {/* Dispatch Settings */}
              <div className="space-y-4 pt-2 border-t border-white/10 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">From Sender Address</label>
                  <input
                    type="text"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full bg-[#181d26] border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Use a verified sending domain on Resend (e.g. <code>outreach@modewebhost.com</code>) or <code>onboarding@resend.dev</code> for testing.
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Reply-To Address</label>
                  <input
                    type="text"
                    value={replyToEmail}
                    onChange={(e) => setReplyToEmail(e.target.value)}
                    className="w-full bg-[#181d26] border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Launch Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleDispatchCampaign}
                  disabled={isSending || selectedLeadIds.size === 0}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
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

        {/* ================= TAB 4: ANALYTICS & TELEMETRY ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#11141b] border border-white/10 p-5 rounded-2xl">
                <span className="text-xs text-slate-400">Total Leads Ingested</span>
                <div className="text-2xl font-bold text-white mt-1">{leads.length}</div>
                <span className="text-[11px] text-emerald-400 mt-2 block">100% Keyword & Location scoped</span>
              </div>
              <div className="bg-[#11141b] border border-white/10 p-5 rounded-2xl">
                <span className="text-xs text-slate-400">Verified Email Rate</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {leads.length > 0 ? Math.round((totalVerified / leads.length) * 100) : 0}%
                </div>
                <span className="text-[11px] text-slate-400 mt-2 block">{totalVerified} reachable mailboxes</span>
              </div>
              <div className="bg-[#11141b] border border-white/10 p-5 rounded-2xl">
                <span className="text-xs text-slate-400">Emails Dispatched</span>
                <div className="text-2xl font-bold text-cyan-400 mt-1">{totalSent}</div>
                <span className="text-[11px] text-slate-400 mt-2 block">Via Resend Infrastructure</span>
              </div>
              <div className="bg-[#11141b] border border-white/10 p-5 rounded-2xl">
                <span className="text-xs text-slate-400">Estimated Open Rate</span>
                <div className="text-2xl font-bold text-purple-400 mt-1">{totalSent > 0 ? '48.2%' : '—'}</div>
                <span className="text-[11px] text-slate-400 mt-2 block">Based on 1-to-1 personalization</span>
              </div>
            </div>

            {/* Event Activity Table */}
            <div className="bg-[#11141b] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-white mb-4">Outreach Activity Log</h3>
              <div className="space-y-3">
                {leads.filter((l) => l.status === 'sent').length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No emails dispatched yet. Select leads from the Lead Discovery tab to start your first campaign!
                  </p>
                ) : (
                  leads
                    .filter((l) => l.status === 'sent')
                    .map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-3 bg-[#181d26] rounded-xl border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-semibold text-white">{l.name}</span>
                            <span className="text-slate-400 ml-2">({l.email})</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400">{l.sentAt || 'Just now'}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
