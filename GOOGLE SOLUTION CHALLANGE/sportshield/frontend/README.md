# SportShield Frontend

## Overview

Next.js 14 application with TypeScript and Tailwind CSS for the SportShield platform.

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── athlete/       # Athlete dashboard
│   │   │   ├── buyer/         # Buyer marketplace
│   │   │   └── admin/         # Admin panel
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── marketplace/       # Marketplace components
│   │   └── auth/              # Auth components
│   ├── lib/
│   │   ├── firebase.ts        # Firebase config
│   │   ├── blockchain.ts      # Web3 utils
│   │   └── api.ts             # API client
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── public/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## Installation

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_POLYGON_NETWORK=mumbai
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

---

## Key Components

### Navigation

```tsx
// filepath: frontend/src/components/ui/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              SportShield
            </Link>
            
            {user && (
              <div className="ml-10 flex space-x-4">
                <Link 
                  href="/dashboard/athlete" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/marketplace" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                >
                  Marketplace
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### Asset Card

```tsx
// filepath: frontend/src/components/marketplace/AssetCard.tsx
'use client';

import Image from 'next/image';
import { formatPrice } from '@/utils/format';

interface AssetCardProps {
  asset: {
    asset_id: string;
    title: string;
    media_url: string;
    price: string;
    sports_category: string;
    owner_wallet: string;
  };
  onPurchase?: (assetId: string) => void;
}

export function AssetCard({ asset, onPurchase }: AssetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        <Image
          src={asset.media_url}
          alt={asset.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          {asset.sports_category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {asset.title}
        </h3>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(asset.price)} MATIC
          </span>
          
          {onPurchase && (
            <button
              onClick={() => onPurchase(asset.asset_id)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Buy Now
            </button>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Owner: {asset.owner_wallet.slice(0, 6)}...{asset.owner_wallet.slice(-4)}
        </div>
      </div>
    </div>
  );
}
```

### Upload Form

```tsx
// filepath: frontend/src/components/dashboard/AssetUploadForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AssetUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'image',
    media_url: '',
    sports_category: '',
    event: '',
    price: '',
    royalty_percentage: 10
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/assets/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/dashboard/athlete');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Media Type
          </label>
          <select
            value={formData.media_type}
            onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sports Category
          </label>
          <select
            value={formData.sports_category}
            onChange={(e) => setFormData({ ...formData, sports_category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select category</option>
            <option value="basketball">Basketball</option>
            <option value="football">Football</option>
            <option value="soccer">Soccer</option>
            <option value="tennis">Tennis</option>
            <option value="baseball">Baseball</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Media URL
        </label>
        <input
          type="url"
          required
          value={formData.media_url}
          onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="https://storage.googleapis.com/..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (MATIC)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Royalty %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.royalty_percentage}
            onChange={(e) => setFormData({ ...formData, royalty_percentage: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Registering...' : 'Register Asset'}
      </button>
    </form>
  );
}
```

---

## Pages

### Landing Page

```tsx
// filepath: frontend/src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Protect Your Sports Content
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            SportShield protects athletes, creators, and sports organizations 
            from unauthorized use of digital sports media using AI and blockchain.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-3 text-lg font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why SportShield?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Detection</h3>
              <p className="text-gray-600">
                Advanced AI detects unauthorized duplicates, deepfakes, and manipulated content.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Blockchain Verified</h3>
              <p className="text-gray-600">
                Ownership and transactions secured on Polygon blockchain with transparent royalty distribution.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">C2PA Certified</h3>
              <p className="text-gray-600">
                Content authenticity verified through C2PA standard for provenance and integrity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

### Athlete Dashboard

```tsx
// filepath: frontend/src/app/(dashboard)/athlete/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { AssetCard } from '@/components/marketplace/AssetCard';
import { AssetUploadForm } from '@/components/dashboard/AssetUploadForm';

export default function AthleteDashboard() {
  const [assets, setAssets] = useState([]);
  const [activeTab, setActiveTab] = useState<'assets' | 'upload' | 'earnings'>('assets');

  useEffect(() => {
    // Fetch user's assets
    fetch('/api/v1/assets', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('idToken')}`
      }
    })
      .then(res => res.json())
      .then(data => setAssets(data.assets || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Athlete Dashboard
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('assets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Assets
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload New
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'earnings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Earnings
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assets.map((asset: any) => (
              <AssetCard key={asset.asset_id} asset={asset} />
            ))}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-2xl">
            <AssetUploadForm />
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Total Earnings</h2>
            <p className="text-4xl font-bold text-green-600">5,000 MATIC</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Marketplace

```tsx
// filepath: frontend/src/app/(dashboard)/marketplace/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { AssetCard } from '@/components/marketplace/AssetCard';

export default function MarketplacePage() {
  const [assets, setAssets] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    const params = new URLSearchParams(filters as any);
    fetch(`/api/v1/assets?${params}`)
      .then(res => res.json())
      .then(data => setAssets(data.assets || []));
  }, [filters]);

  const handlePurchase = async (assetId: string) => {
    // Connect wallet and purchase
    const response = await fetch('/api/v1/assets/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('idToken')}`
      },
      body: JSON.stringify({
        asset_id: assetId,
        buyer_wallet: window.ethereum?.selectedAddress
      })
    });

    if (response.ok) {
      alert('Purchase successful!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Sports Media Marketplace
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="rounded-md border-gray-300"
            >
              <option value="">All Categories</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="soccer">Soccer</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="rounded-md border-gray-300"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="rounded-md border-gray-300"
            />

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="rounded-md border-gray-300"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets.map((asset: any) => (
            <AssetCard 
              key={asset.asset_id} 
              asset={asset}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Authentication

### Firebase Auth Hook

```tsx
// filepath: frontend/src/hooks/useAuth.ts
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## Utility Functions

```typescript
// filepath: frontend/src/utils/format.ts
export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return num.toFixed(2);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
```