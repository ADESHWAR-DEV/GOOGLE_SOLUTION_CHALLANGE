'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Shield, CheckCircle, AlertTriangle, Clock, 
  User, FileText, Link2, History, Copy, ExternalLink,
  Lock, Unlock, Verified
} from 'lucide-react'

// Mock verification data
const mockVerificationData = {
  'SS-2024-001': {
    id: 'SS-2024-001',
    title: 'Championship Goal Celebration',
    creator: 'Marcus Thompson',
    creatorVerified: true,
    createdAt: '2024-01-15T14:32:00Z',
    status: 'verified',
    license: 'Exclusive',
    price: 99,
    blockchain: {
      network: 'Polygon Mumbai',
      txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8',
      blockNumber: 45234567,
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
    },
    c2pa: {
      manifest: {
        claim: 'SportShield Protected',
        timestamp: '2024-01-15T14:32:00Z',
        algorithm: 'SHA-256',
        signature: 'Valid',
        signer: 'SportShield CA'
      },
      contentHash: 'a7b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
      editHistory: []
    },
    ownershipHistory: [
      { date: '2024-01-15', from: '0x0000...0000', to: '0xA1B2...3C4D', action: 'Minted' },
      { date: '2024-01-16', from: '0xA1B2...3C4D', to: '0x8F7A...2B3C', action: 'Sold' },
      { date: '2024-01-18', from: '0x8F7A...2B3C', to: '0x9C4D...1E2F', action: 'Sold' }
    ]
  },
  'SS-2024-002': {
    id: 'SS-2024-002',
    title: 'Training Session Highlights',
    creator: 'Sofia Rodriguez',
    creatorVerified: true,
    createdAt: '2024-01-12T10:15:00Z',
    status: 'verified',
    license: 'Non-Exclusive',
    price: 49,
    blockchain: {
      network: 'Polygon Mumbai',
      txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      blockNumber: 45123456,
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
    },
    c2pa: {
      manifest: {
        claim: 'SportShield Protected',
        timestamp: '2024-01-12T10:15:00Z',
        algorithm: 'SHA-256',
        signature: 'Valid',
        signer: 'SportShield CA'
      },
      contentHash: 'b8c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5',
      editHistory: []
    },
    ownershipHistory: [
      { date: '2024-01-12', from: '0x0000...0000', to: '0xB2C3...4D5E', action: 'Minted' }
    ]
  }
}

export default function Verify() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleVerify = async () => {
    if (!searchQuery.trim()) return
    
    setIsVerifying(true)
    setError('')
    setVerificationResult(null)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const result = mockVerificationData[searchQuery as keyof typeof mockVerificationData]
    if (result) {
      setVerificationResult(result)
    } else {
      setError('Asset not found. Please check the ID and try again.')
    }

    setIsVerifying(false)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-sport-dark/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              Verify <span className="gradient-text">Content Authenticity</span>
            </h1>
            <p className="text-sport-gray text-lg max-w-2xl mx-auto">
              Enter an asset ID to verify its authenticity using C2PA standards and 
              blockchain ownership records.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="glass-card p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sport-gray" />
              <input
                type="text"
                placeholder="Enter Asset ID (e.g., SS-2024-001)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="w-full pl-12 pr-4 py-4 bg-sport-dark border border-white/10 rounded-xl text-white placeholder-sport-gray focus:outline-none focus:border-primary-500 text-lg"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={isVerifying || !searchQuery.trim()}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-red-500/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-400">Verification Failed</h3>
                <p className="text-sport-gray">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Verified Badge */}
            <div className="glass-card p-6 border-green-500/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400">✓ Verified</h2>
                  <p className="text-sport-gray">This content is authentic and protected by SportShield</p>
                </div>
              </div>
            </div>

            {/* Asset Details */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" />
                Asset Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sport-gray text-sm">Asset ID</label>
                    <p className="font-mono text-lg">{verificationResult.id}</p>
                  </div>
                  <div>
                    <label className="text-sport-gray text-sm">Title</label>
                    <p className="text-lg">{verificationResult.title}</p>
                  </div>
                  <div>
                    <label className="text-sport-gray text-sm">Creator</label>
                    <div className="flex items-center gap-2">
                      <p>{verificationResult.creator}</p>
                      {verificationResult.creatorVerified && (
                        <Verified className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sport-gray text-sm">Created</label>
                    <p>{new Date(verificationResult.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sport-gray text-sm">License</label>
                    <p>{verificationResult.license}</p>
                  </div>
                  <div>
                    <label className="text-sport-gray text-sm">Price</label>
                    <p>${verificationResult.price}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* C2PA Verification */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-400" />
                C2PA Verification
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-sport-dark/50 rounded-lg">
                    <label className="text-sport-gray text-sm">Claim</label>
                    <p className="font-medium">{verificationResult.c2pa.manifest.claim}</p>
                  </div>
                  <div className="p-4 bg-sport-dark/50 rounded-lg">
                    <label className="text-sport-gray text-sm">Signature</label>
                    <p className="font-medium text-green-400">{verificationResult.c2pa.manifest.signature}</p>
                  </div>
                  <div className="p-4 bg-sport-dark/50 rounded-lg">
                    <label className="text-sport-gray text-sm">Algorithm</label>
                    <p className="font-medium">{verificationResult.c2pa.manifest.algorithm}</p>
                  </div>
                  <div className="p-4 bg-sport-dark/50 rounded-lg">
                    <label className="text-sport-gray text-sm">Signer</label>
                    <p className="font-medium">{verificationResult.c2pa.manifest.signer}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sport-gray text-sm">Content Hash</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-sport-dark/50 rounded font-mono text-sm break-all">
                      {verificationResult.c2pa.contentHash}
                    </code>
                    <button className="p-2 hover:bg-white/5 rounded">
                      <Copy className="w-4 h-4 text-sport-gray" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary-400" />
                Blockchain Record
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sport-gray text-sm">Network</label>
                    <p className="font-medium">{verificationResult.blockchain.network}</p>
                  </div>
                  <div>
                    <label className="text-sport-gray text-sm">Block Number</label>
                    <p className="font-mono">{verificationResult.blockchain.blockNumber}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sport-gray text-sm">Transaction Hash</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-sport-dark/50 rounded font-mono text-sm break-all">
                      {verificationResult.blockchain.txHash}
                    </code>
                    <a 
                      href={`https://mumbai.polygonscan.com/tx/${verificationResult.blockchain.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/5 rounded"
                    >
                      <ExternalLink className="w-4 h-4 text-sport-gray" />
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sport-gray text-sm">Contract Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-sport-dark/50 rounded font-mono text-sm break-all">
                      {verificationResult.blockchain.contractAddress}
                    </code>
                    <button className="p-2 hover:bg-white/5 rounded">
                      <Copy className="w-4 h-4 text-sport-gray" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership History */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-primary-400" />
                Ownership History
              </h3>
              <div className="space-y-3">
                {verificationResult.ownershipHistory.map((record: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-sport-dark/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                      {index === 0 ? <Unlock className="w-5 h-5 text-primary-400" /> : <History className="w-5 h-5 text-primary-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{record.action}</div>
                      <div className="text-sm text-sport-gray">
                        {record.from} → {record.to}
                      </div>
                    </div>
                    <div className="text-sport-gray text-sm">{record.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Demo Hint */}
        {!verificationResult && !error && (
          <div className="text-center py-12">
            <p className="text-sport-gray mb-4">Try these demo IDs:</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setSearchQuery('SS-2024-001')}
                className="px-4 py-2 bg-sport-dark border border-white/10 rounded-lg font-mono hover:border-primary-500/50 transition-colors"
              >
                SS-2024-001
              </button>
              <button 
                onClick={() => setSearchQuery('SS-2024-002')}
                className="px-4 py-2 bg-sport-dark border border-white/10 rounded-lg font-mono hover:border-primary-500/50 transition-colors"
              >
                SS-2024-002
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}