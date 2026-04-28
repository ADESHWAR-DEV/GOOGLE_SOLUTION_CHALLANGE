'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield, CheckCircle, Clock, User, DollarSign, Lock,
  History, ExternalLink, Heart, Share2, AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'

interface AssetDetail {
  asset_id: string
  title: string
  description: string
  media_url: string
  media_type: string
  price: number
  royalty_percentage: number
  status: string
  owner_id: string
  owner_wallet: string
  sports_category: string
  created_at: string
  content_hash: string
  c2pa_manifest: any
  blockchain: any
  ownership_history: any[]
  ai_detection: any
}

const mockAsset: AssetDetail = {
  asset_id: 'asset_demo_001',
  title: 'Championship Goal Celebration',
  description: 'The winning goal from the 2024 Championship final. Exclusive footage.',
  media_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
  media_type: 'image',
  price: 99,
  royalty_percentage: 10,
  status: 'active',
  owner_id: 'user_1',
  owner_wallet: '0xA1B2...3C4D',
  sports_category: 'Soccer',
  created_at: '2024-01-15T14:32:00Z',
  content_hash: 'a7b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
  c2pa_manifest: {
    claim: 'AthletiChain Protected',
    timestamp: '2024-01-15T14:32:00Z',
    algorithm: 'SHA-256',
    signature: 'Valid',
    signer: 'AthletiChain CA',
  },
  blockchain: {
    network: 'Polygon Mumbai',
    token_id: '42',
    contract_address: '0x1234567890abcdef1234567890abcdef12345678',
    transaction_hash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8',
  },
  ownership_history: [
    { action: 'minted', from: '0x0000...0000', to: '0xA1B2...3C4D', date: '2024-01-15' },
  ],
  ai_detection: {
    baseline_fraud_detected: false,
    baseline_confidence: 0.0,
    deepfake_probability: 0.02,
  },
}

export default function AssetDetail() {
  const params = useParams()
  const { user } = useAuth()
  const [asset, setAsset] = useState<AssetDetail>(mockAsset)
  const [purchasing, setPurchasing] = useState(false)

  const handlePurchase = async () => {
    setPurchasing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setPurchasing(false)
    alert('Purchase simulated! In production this would call the smart contract.')
  }

  const isOwner = user?.uid === asset.owner_id

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Media */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card overflow-hidden"
          >
            <div className="relative">
              <img
                src={asset.media_url}
                alt={asset.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
                {asset.status === 'frozen' && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Frozen
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sport-gray text-sm">
                  <Clock className="w-4 h-4" />
                  {new Date(asset.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <h1 className="text-3xl font-bold mb-2">{asset.title}</h1>
              <p className="text-sport-gray mb-4">{asset.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-sport-gray" />
                  <span className="text-sm">{asset.owner_wallet}</span>
                </div>
                <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                  {asset.sports_category}
                </span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sport-gray text-sm">Price</p>
                  <p className="text-3xl font-bold gradient-text">${asset.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sport-gray text-sm">Royalty</p>
                  <p className="text-lg font-semibold">{asset.royalty_percentage}%</p>
                </div>
              </div>

              {!isOwner && asset.status === 'active' && (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white rounded-xl font-semibold transition-all"
                >
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </button>
              )}

              {isOwner && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center">
                  You own this asset
                </div>
              )}

              {asset.status === 'frozen' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  This asset has been frozen due to a fraud report.
                </div>
              )}
            </div>

            {/* C2PA Badge */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Authenticity Certified</h3>
                  <p className="text-sport-gray text-sm">C2PA-Inspired Metadata Layer</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-sport-dark/50 rounded-lg">
                  <p className="text-sport-gray">Algorithm</p>
                  <p className="font-medium">{asset.c2pa_manifest.algorithm}</p>
                </div>
                <div className="p-3 bg-sport-dark/50 rounded-lg">
                  <p className="text-sport-gray">Signature</p>
                  <p className="font-medium text-green-400">{asset.c2pa_manifest.signature}</p>
                </div>
                <div className="p-3 bg-sport-dark/50 rounded-lg col-span-2">
                  <p className="text-sport-gray">Content Hash</p>
                  <p className="font-mono text-xs break-all">{asset.content_hash}</p>
                </div>
              </div>
            </div>

            {/* Blockchain */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-primary-400" />
                Blockchain Record
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-sport-gray">Network</span>
                  <span>{asset.blockchain.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sport-gray">Token ID</span>
                  <span className="font-mono">#{asset.blockchain.token_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sport-gray">Contract</span>
                  <a
                    href={`https://mumbai.polygonscan.com/address/${asset.blockchain.contract_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary-400 hover:underline flex items-center gap-1"
                  >
                    {asset.blockchain.contract_address.slice(0, 12)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Ownership History */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Ownership History</h3>
              <div className="space-y-3">
                {asset.ownership_history.map((record, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-sport-dark/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{record.action}</p>
                      <p className="text-sport-gray text-xs">
                        {record.from} → {record.to}
                      </p>
                    </div>
                    <span className="text-sport-gray text-xs">{record.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

