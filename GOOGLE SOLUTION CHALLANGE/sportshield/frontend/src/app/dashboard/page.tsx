'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, DollarSign, Shield, TrendingUp, Users, Eye, 
  Heart, MoreVertical, Plus, Search, Filter, Wallet,
  CheckCircle, Clock, AlertTriangle, ArrowUpRight,
  Video, Image, Music, FileText
} from 'lucide-react'

// Mock data
const mockStats = {
  totalAssets: 24,
  totalEarnings: 4523.85,
  monthlyEarnings: 892.40,
  totalViews: 45600,
  totalLikes: 2340,
  pendingRoyalties: 198.00
}

const mockAssets = [
  {
    id: '1',
    title: 'Championship Goal Celebration',
    type: 'video',
    status: 'protected',
    price: 99,
    views: 1250,
    likes: 89,
    earnings: 445.50,
    createdAt: '2024-01-15',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=150&fit=crop'
  },
  {
    id: '2',
    title: 'Training Session Highlights',
    type: 'video',
    status: 'protected',
    price: 49,
    views: 890,
    likes: 56,
    earnings: 220.50,
    createdAt: '2024-01-12',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=150&fit=crop'
  },
  {
    id: '3',
    title: 'Victory Interview - Olympics',
    type: 'video',
    status: 'protected',
    price: 149,
    views: 2100,
    likes: 145,
    earnings: 670.50,
    createdAt: '2024-01-10',
    thumbnail: 'https://images.unsplash.com/photo-1554068865-24cecd4e34bf?w=200&h=150&fit=crop'
  },
  {
    id: '4',
    title: 'Pre-Game Ritual',
    type: 'image',
    status: 'pending',
    price: 29,
    views: 0,
    likes: 0,
    earnings: 0,
    createdAt: '2024-01-18',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=150&fit=crop'
  }
]

const mockTransactions = [
  { id: '1', type: 'sale', asset: 'Championship Goal Celebration', amount: 94.05, buyer: '0x8F...2a4', date: '2024-01-18' },
  { id: '2', type: 'sale', asset: 'Training Session Highlights', amount: 47.02, buyer: '0x3A...1b2', date: '2024-01-17' },
  { id: '3', type: 'royalty', asset: 'Secondary Sale - Goal', amount: 9.90, buyer: '0x7B...3c4', date: '2024-01-16' },
  { id: '4', type: 'sale', asset: 'Victory Interview', amount: 141.55, buyer: '0x9C...4d5', date: '2024-01-15' },
]

const assetTypes = [
  { id: 'video', label: 'Video', icon: Video },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'document', label: 'Document', icon: FileText },
]

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-sport-dark/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 font-display">Athlete Dashboard</h1>
              <p className="text-sport-gray">Manage your content, track earnings, and monitor protection.</p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Register New Asset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Shield} label="Total Assets" value={mockStats.totalAssets} color="primary" />
          <StatCard icon={DollarSign} label="Total Earnings" value={`$${mockStats.totalEarnings.toLocaleString()}`} color="green" />
          <StatCard icon={TrendingUp} label="This Month" value={`+$${mockStats.monthlyEarnings}`} color="green" />
          <StatCard icon={Eye} label="Total Views" value={mockStats.totalViews.toLocaleString()} color="blue" />
          <StatCard icon={Heart} label="Total Likes" value={mockStats.totalLikes.toLocaleString()} color="red" />
          <StatCard icon={Clock} label="Pending" value={`$${mockStats.pendingRoyalties}`} color="yellow" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', 'assets', 'transactions', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-sport-dark text-sport-gray hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Assets */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Assets</h2>
                <button 
                  onClick={() => setActiveTab('assets')}
                  className="text-primary-400 text-sm hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {mockAssets.slice(0, 3).map((asset) => (
                  <div key={asset.id} className="flex items-center gap-4 p-3 bg-sport-dark/50 rounded-lg">
                    <img 
                      src={asset.thumbnail} 
                      alt={asset.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{asset.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-sport-gray">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {asset.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {asset.likes}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-400">${asset.earnings}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        asset.status === 'protected' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className="text-primary-400 text-sm hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-sport-dark/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'sale' ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'
                      }`}>
                        {tx.type === 'sale' ? <ArrowUpRight className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{tx.asset}</h3>
                        <p className="text-xs text-sport-gray">{tx.date} • {tx.buyer}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${tx.type === 'sale' ? 'text-green-400' : 'text-primary-400'}`}>
                      +${tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sport-gray" />
                <input
                  type="text"
                  placeholder="Search your assets..."
                  className="w-full pl-10 pr-4 py-2 bg-sport-dark border border-white/10 rounded-lg text-white placeholder-sport-gray focus:outline-none focus:border-primary-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-sport-dark border border-white/10 rounded-lg text-sport-gray hover:text-white">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockAssets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card overflow-hidden hover:border-primary-500/50 transition-all group"
                >
                  <div className="relative">
                    <img
                      src={asset.thumbnail}
                      alt={asset.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        asset.status === 'protected' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {asset.status === 'protected' ? '✓ Protected' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 truncate">{asset.title}</h3>
                    <div className="flex items-center justify-between text-sm text-sport-gray mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {asset.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {asset.likes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">${asset.price}</span>
                      <span className="text-green-400 text-sm">${asset.earnings} earned</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-sport-dark/50">
                <tr>
                  <th className="text-left p-4 text-sport-gray font-medium">Type</th>
                  <th className="text-left p-4 text-sport-gray font-medium">Asset</th>
                  <th className="text-left p-4 text-sport-gray font-medium">Buyer</th>
                  <th className="text-left p-4 text-sport-gray font-medium">Date</th>
                  <th className="text-right p-4 text-sport-gray font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.type === 'sale' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-primary-500/20 text-primary-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{tx.asset}</td>
                    <td className="p-4 text-sport-gray font-mono text-sm">{tx.buyer}</td>
                    <td className="p-4 text-sport-gray">{tx.date}</td>
                    <td className="p-4 text-right font-semibold text-green-400">+${tx.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-card p-8 text-center">
            <TrendingUp className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Analytics Coming Soon</h2>
            <p className="text-sport-gray max-w-md mx-auto">
              Detailed analytics including viewer demographics, engagement trends, 
              and revenue forecasting will be available in the next update.
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Register New Asset</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-sport-gray hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center mb-6 hover:border-primary-500/50 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-sport-gray mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drop your content here</p>
              <p className="text-sport-gray text-sm">or click to browse • Max 500MB</p>
            </div>

            {/* Asset Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Asset Type</label>
              <div className="grid grid-cols-4 gap-3">
                {assetTypes.map((type) => (
                  <button
                    key={type.id}
                    className="flex flex-col items-center gap-2 p-4 bg-sport-dark border border-white/10 rounded-lg hover:border-primary-500/50 transition-colors"
                  >
                    <type.icon className="w-6 h-6 text-sport-gray" />
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter asset title"
                  className="w-full px-4 py-3 bg-sport-dark border border-white/10 rounded-lg text-white placeholder-sport-gray focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your content..."
                  className="w-full px-4 py-3 bg-sport-dark border border-white/10 rounded-lg text-white placeholder-sport-gray focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select className="w-full px-4 py-3 bg-sport-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500">
                    <option>Basketball</option>
                    <option>Soccer</option>
                    <option>Tennis</option>
                    <option>Running</option>
                    <option>Golf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (USD)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-sport-dark border border-white/10 rounded-lg text-white placeholder-sport-gray focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-all">
              Register & Protect Asset
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  const colorClasses = {
    primary: 'bg-primary-500/20 text-primary-400',
    green: 'bg-green-500/20 text-green-400',
    blue: 'bg-blue-500/20 text-blue-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
  }

  return (
    <div className="glass-card p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sport-gray text-sm">{label}</div>
    </div>
  )
}