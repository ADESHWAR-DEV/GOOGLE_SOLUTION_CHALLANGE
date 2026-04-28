'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Eye, Lock,
  TrendingUp, Users, FileWarning, Clock, Search
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'

interface Violation {
  id: string
  type: string
  status: string
  confidence_score: number
  suspected_asset: { title: string; asset_id: string }
  original_asset: { title: string; owner_id: string }
  detected_at: string
}

const mockViolations: Violation[] = [
  {
    id: 'v1',
    type: 'unauthorized_duplicate',
    status: 'pending',
    confidence_score: 0.94,
    suspected_asset: { title: 'Championship Goal Copy', asset_id: 'asset_001' },
    original_asset: { title: 'Championship Goal Celebration', owner_id: 'user_1' },
    detected_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'v2',
    type: 'deepfake',
    status: 'pending',
    confidence_score: 0.87,
    suspected_asset: { title: 'Fake Interview Clip', asset_id: 'asset_002' },
    original_asset: { title: 'Victory Interview', owner_id: 'user_2' },
    detected_at: '2024-01-19T14:30:00Z',
  },
  {
    id: 'v3',
    type: 'unauthorized_duplicate',
    status: 'approved',
    confidence_score: 0.91,
    suspected_asset: { title: 'Stolen Highlight', asset_id: 'asset_003' },
    original_asset: { title: 'Training Session Highlights', owner_id: 'user_3' },
    detected_at: '2024-01-18T09:15:00Z',
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('violations')
  const [violations, setViolations] = useState<Violation[]>(mockViolations)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) return null
  if (!user || user.role !== 'admin') return null

  const filtered = violations.filter(
    (v) =>
      v.suspected_asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.original_asset.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = violations.filter((v) => v.status === 'pending').length
  const approvedCount = violations.filter((v) => v.status === 'approved').length
  const rejectedCount = violations.filter((v) => v.status === 'rejected').length

  const handleApprove = (id: string) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'approved' } : v))
    )
  }

  const handleReject = (id: string) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'rejected' } : v))
    )
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-sport-dark/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
              <p className="text-sport-gray">Monitor fraud reports and manage violations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileWarning} label="Pending" value={pendingCount} color="yellow" />
          <StatCard icon={CheckCircle} label="Approved" value={approvedCount} color="green" />
          <StatCard icon={XCircle} label="Rejected" value={rejectedCount} color="red" />
          <StatCard icon={TrendingUp} label="Total Reports" value={violations.length} color="blue" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['violations', 'users', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-sport-dark text-sport-gray hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'violations' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sport-gray" />
                <input
                  type="text"
                  placeholder="Search violations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-sport-dark border border-white/10 rounded-lg text-white placeholder-sport-gray focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-sport-dark/50">
                  <tr>
                    <th className="text-left p-4 text-sport-gray font-medium">Type</th>
                    <th className="text-left p-4 text-sport-gray font-medium">Suspected Asset</th>
                    <th className="text-left p-4 text-sport-gray font-medium">Original Owner</th>
                    <th className="text-left p-4 text-sport-gray font-medium">Confidence</th>
                    <th className="text-left p-4 text-sport-gray font-medium">Status</th>
                    <th className="text-right p-4 text-sport-gray font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          v.type === 'deepfake'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {v.type}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{v.suspected_asset.title}</td>
                      <td className="p-4 text-sport-gray">{v.original_asset.owner_id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-sport-dark rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                v.confidence_score > 0.9 ? 'bg-red-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${v.confidence_score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{(v.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          v.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : v.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {v.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(v.id)}
                              className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                              title="Approve & Freeze"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(v.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card p-8 text-center">
            <Users className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">User Management</h2>
            <p className="text-sport-gray max-w-md mx-auto">
              Full user management with role editing and verification status will be available here.
            </p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-card p-8 text-center">
            <TrendingUp className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Fraud Analytics</h2>
            <p className="text-sport-gray max-w-md mx-auto">
              Detailed analytics including detection trends, geographic distribution, and accuracy metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-500/20 text-yellow-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    blue: 'bg-blue-500/20 text-blue-400',
  }
  return (
    <div className="glass-card p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sport-gray text-sm">{label}</div>
    </div>
  )
}

