'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, Heart, Eye, User, Shield, Zap, Loader2 } from 'lucide-react'

interface Asset {
  asset_id: string
  title: string
  owner_id: string
  owner_wallet?: string
  price: number
  media_url: string
  sports_category: string
  status: string
  created_at: string
}

const categories = ['All', 'Soccer', 'Basketball', 'Tennis', 'Running', 'Golf', 'Boxing', 'Surfing']

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export default function Marketplace() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/assets/`)
      const data = await res.json()
      if (data.success) {
        setAssets(data.assets || [])
      } else {
        setError('Failed to load assets')
      }
    } catch (err) {
      setError('Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'All' || asset.sports_category === selectedCategory
    const matchesSearch =
      !searchQuery ||
      asset.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.owner_wallet?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && asset.status === 'active'
  })

  if (!mounted) return null

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-sport-dark/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              Sports Content <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="text-sport-gray text-lg max-w-2xl mx-auto">
              Discover and collect authentic sports content from your favorite athletes.
              Every purchase is verified and protected.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-sport-darker/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sport-gray" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-sport-dark border border-white/10 rounded-lg text-white placeholder-sport-gray focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-sport-dark text-sport-gray hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-sport-gray hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-sport-gray hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            <span className="ml-3 text-sport-gray">Loading assets...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : (
          <>
            <p className="text-sport-gray mb-6">
              {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
            </p>

            {filteredAssets.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sport-gray text-lg">No assets found matching your criteria.</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.asset_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-card overflow-hidden hover:border-primary-500/50 transition-all group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : ''}`}>
                      <img
                        src={asset.media_url}
                        alt={asset.title}
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'list' ? 'h-32' : 'h-48'
                        }`}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop'
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          <Shield className="w-3 h-3" />
                          Verified
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                          <Zap className="w-3 h-3" />
                          NFT
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <Link href={`/asset/${asset.asset_id}`}>
                        <h3 className="font-semibold mb-1 group-hover:text-primary-400 transition-colors line-clamp-1">
                          {asset.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-sport-gray mb-3">
                        <User className="w-4 h-4" />
                        {asset.owner_wallet?.slice(0, 6)}...{asset.owner_wallet?.slice(-4) || 'Unknown'}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold gradient-text">${asset.price}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sport-gray text-sm">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {Math.floor(Math.random() * 2000) + 100}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

