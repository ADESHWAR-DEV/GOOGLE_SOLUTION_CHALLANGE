# SportShield Firebase Database Schema

## Overview

This document outlines the Firestore schema for SportShield, designed for the MVP with scalability in mind.

---

## Collection Structure

```
sportshield-project/
├── users/
│   └── {userId}/
│       ├── profile/
│       └── settings/
├── assets/
│   └── {assetId}/
│       ├── metadata/
│       └── analytics/
├── transactions/
│   └── {transactionId}/
├── violations/
│   └── {violationId}/
└── certificates/
    └── {certificateId}/
```

---

## Users Collection

### Document: `users/{userId}`

```json
{
  "wallet_address": "0x1234...abcd",
  "email": "athlete@example.com",
  "display_name": "John Doe",
  "role": "athlete",
  "verification_status": "verified",
  "avatar_url": "https://storage.googleapis.com/...",
  "bio": "Professional basketball player",
  "sport": "basketball",
  "league": "NBA",
  "team": "Los Angeles Lakers",
  "social_links": {
    "instagram": "https://instagram.com/...",
    "twitter": "https://twitter.com/...",
    "youtube": "https://youtube.com/..."
  },
  "wallet_balance": "1.5",
  "total_earnings": "5000.00",
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-04-20T14:22:00Z",
  "last_login": "2026-04-28T09:15:00Z"
}
```

### Sub-collection: `users/{userId}/assets`

```json
{
  "asset_id": "asset_abc123",
  "added_at": "2026-04-15T10:30:00Z"
}
```

### Sub-collection: `users/{userId}/notifications`

```json
{
  "type": "violation_detected",
  "title": "Potential infringement detected",
  "message": "Similar content found for your asset",
  "read": false,
  "created_at": "2026-04-28T11:00:00Z"
}
```

---

## Assets Collection

### Document: `assets/{assetId}`

```json
{
  "asset_id": "asset_abc123",
  "title": "Championship Dunk Highlight",
  "description": "Official highlight from the 2026 championship game",
  "media_type": "video",
  "media_url": "https://storage.googleapis.com/sportshield-media/...",
  "thumbnail_url": "https://storage.googleapis.com/sportshield-processed/...",
  "owner_id": "user_xyz789",
  "owner_wallet": "0x1234...abcd",
  
  "blockchain": {
    "network": "polygon_mumbai",
    "token_id": "1234",
    "contract_address": "0xABCD...1234",
    "tx_id": "0xabcdef...",
    "block_number": 12345678
  },
  
  "c2pa": {
    "certificate_id": "c2pa_cert_001",
    "manifest": "base64_encoded_manifest",
    "signature_valid": true,
    "issued_at": "2026-04-15T10:30:00Z"
  },
  
  "metadata": {
    "hash": "sha256:abc123...",
    "file_size": 15000000,
    "duration": 30,
    "resolution": "1920x1080",
    "format": "mp4",
    "tags": ["basketball", "dunk", "championship"],
    "sports_category": "basketball",
    "event": "NBA Finals 2026",
    "players": ["player_123", "player_456"],
    "location": "Los Angeles, CA",
    "recorded_at": "2026-04-14T20:00:00Z"
  },
  
  "ownership": {
    "original_creator": "user_xyz789",
    "current_owner": "user_xyz789",
    "previous_owners": [],
    "transfer_count": 0,
    "last_transferred": null
  },
  
  "licensing": {
    "royalty_percentage": 10,
    "exclusive_rights": true,
    "usage_rights": ["personal", "commercial"],
    "territories": ["worldwide"],
    "expiration_date": null
  },
  
  "pricing": {
    "currency": "MATIC",
    "price": "100",
    "price_usd": 75.00,
    "listing_status": "active",
    "listed_at": "2026-04-15T12:00:00Z"
  },
  
  "analytics": {
    "views": 1250,
    "purchases": 5,
    "violations_detected": 2,
    "last_viewed": "2026-04-28T08:30:00Z"
  },
  
  "status": "active",
  "created_at": "2026-04-15T10:30:00Z",
  "updated_at": "2026-04-20T14:22:00Z"
}
```

---

## Transactions Collection

### Document: `transactions/{transactionId}`

```json
{
  "transaction_id": "tx_abc123",
  "type": "purchase",
  
  "buyer": {
    "user_id": "user_buyer123",
    "wallet_address": "0xbuyer...",
    "email": "buyer@example.com"
  },
  
  "seller": {
    "user_id": "user_seller456",
    "wallet_address": "0xseller...",
    "email": "seller@example.com"
  },
  
  "asset": {
    "asset_id": "asset_abc123",
    "title": "Championship Dunk Highlight",
    "media_type": "video"
  },
  
  "pricing": {
    "currency": "MATIC",
    "amount": "100",
    "amount_usd": 75.00,
    "gas_fee": "0.01",
    "total": "100.01"
  },
  
  "royalty_split": {
    "athlete": {
      "percentage": 80,
      "amount": "80",
      "recipient": "0xathlete..."
    },
    "creator": {
      "percentage": 10,
      "amount": "10",
      "recipient": "0xcreator..."
    },
    "platform": {
      "percentage": 10,
      "amount": "10",
      "recipient": "0xplatform..."
    }
  },
  
  "blockchain": {
    "network": "polygon_mumbai",
    "tx_hash": "0xabcdef...",
    "block_number": 12345678,
    "confirmed_at": "2026-04-20T14:22:00Z"
  },
  
  "status": "completed",
  "created_at": "2026-04-20T14:20:00Z",
  "completed_at": "2026-04-20T14:22:00Z"
}
```

---

## Violations Collection

### Document: `violations/{violationId}`

```json
{
  "violation_id": "violation_001",
  "type": "unauthorized_duplicate",
  
  "suspected_asset": {
    "asset_id": "asset_suspect123",
    "media_url": "https://storage.googleapis.com/...",
    "owner_id": "user_suspect789",
    "uploaded_at": "2026-04-28T10:00:00Z"
  },
  
  "original_asset": {
    "asset_id": "asset_original456",
    "media_url": "https://storage.googleapis.com/...",
    "owner_id": "user_original123",
    "title": "Original Championship Highlight"
  },
  
  "detection": {
    "confidence_score": 0.95,
    "similarity_percentage": 94.5,
    "method": "ai_similarity",
    "detected_by": "vertex_ai_model_v2",
    "features_matched": ["scene", "action", "audio"],
    "false_positive_risk": "low"
  },
  
  "status": "pending",
  
  "actions": [
    {
      "action": "alert_sent",
      "timestamp": "2026-04-28T10:05:00Z",
      "performed_by": "system"
    },
    {
      "action": "asset_frozen",
      "timestamp": "2026-04-28T10:05:00Z",
      "performed_by": "system"
    }
  ],
  
  "resolution": {
    "outcome": null,
    "resolved_at": null,
    "resolved_by": null,
    "notes": null
  },
  
  "detected_at": "2026-04-28T10:05:00Z",
  "updated_at": "2026-04-28T10:05:00Z"
}
```

---

## Certificates Collection (C2PA)

### Document: `certificates/{certificateId}`

```json
{
  "certificate_id": "c2pa_cert_001",
  "asset_id": "asset_abc123",
  
  "manifest": {
    "claim_generator": "SportShield/1.0",
    "claim_created": "2026-04-15T10:30:00Z",
    "claim_signature": "base64_signature...",
    "algorithm": "ES384",
    "certificate_chain": ["base64_cert_1", "base64_cert_2"]
  },
  
  "metadata": {
    "title": "Championship Dunk Highlight",
    "author": "user_xyz789",
    "copyright": "© 2026 Athlete Name",
    "license": "SportShield NFT License",
    "creation_tool": "SportShield Recording SDK"
  },
  
  "ingredients": [],
  
  "assertions": [
    {
      "label": "c2pa.actions",
      "data": {
        "actions": [
          {
            "action": "c2pa.created",
            "timestamp": "2026-04-15T10:30:00Z"
          }
        ]
      }
    },
    {
      "label": "c2pa.stds.schema_org.CreativeWork",
      "data": {
        "@type": "CreativeWork",
        "name": "Championship Dunk Highlight",
        "author": [{"@type": "Person", "name": "Athlete Name"}]
      }
    }
  ],
  
  "validation": {
    "signature_valid": true,
    "chain_valid": true,
    "timestamp_verified": true,
    "validated_at": "2026-04-15T10:30:01Z"
  },
  
  "created_at": "2026-04-15T10:30:00Z"
}
```

---

## Indexing Strategy

### Firestore Indexes

```json
{
  "indexes": [
    {
      "collection": "assets",
      "fields": [
        {"fieldPath": "owner_id", "order": "ASC"},
        {"fieldPath": "status", "order": "ASC"},
        {"fieldPath": "created_at", "order": "DESC"}
      ]
    },
    {
      "collection": "assets",
      "fields": [
        {"fieldPath": "pricing.listing_status", "order": "ASC"},
        {"fieldPath": "pricing.price", "order": "ASC"},
        {"fieldPath": "created_at", "order": "DESC"}
      ]
    },
    {
      "collection": "transactions",
      "fields": [
        {"fieldPath": "buyer.user_id", "order": "ASC"},
        {"fieldPath": "created_at", "order": "DESC"}
      ]
    },
    {
      "collection": "transactions",
      "fields": [
        {"fieldPath": "seller.user_id", "order": "ASC"},
        {"fieldPath": "created_at", "order": "DESC"}
      ]
    },
    {
      "collection": "violations",
      "fields": [
        {"fieldPath": "status", "order": "ASC"},
        {"fieldPath": "detected_at", "order": "DESC"}
      ]
    },
    {
      "collection": "violations",
      "fields": [
        {"fieldPath": "suspected_asset.owner_id", "order": "ASC"},
        {"fieldPath": "detected_at", "order": "DESC"}
      ]
    }
  ]
}
```

---

## Security Rules

```javascript
// firestore.rules

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isVerified() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.verification_status == 'verified';
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      
      // Users can create their own profile
      allow create: if isAuthenticated() && isOwner(userId);
      
      // Users can update their own profile
      allow update: if isAuthenticated() && isOwner(userId) 
        && request.resource.data.keys().hasAll(['display_name', 'avatar_url', 'bio', 'social_links'])
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'verification_status', 'wallet_address']);
      
      // Admins can update any profile
      allow update: if isAuthenticated() && isAdmin();
    }
    
    // Assets collection
    match /assets/{assetId} {
      // Anyone can read active assets
      allow read: if resource.data.status == 'active' || isOwner(resource.data.owner_id) || isAdmin();
      
      // Verified users can create assets
      allow create: if isAuthenticated() && isVerified();
      
      // Owners can update their own assets
      allow update: if isAuthenticated() && (isOwner(resource.data.owner_id) || isAdmin());
      
      // Admins can delete
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      // Parties involved can read
      allow read: if isAuthenticated() 
        && (resource.data.buyer.user_id == request.auth.uid 
            || resource.data.seller.user_id == request.auth.uid 
            || isAdmin());
      
      // System can create (via smart contract webhook)
      allow create: if isAuthenticated() && isAdmin();
    }
    
    // Violations collection
    match /violations/{violationId} {
      // Admins can read all
      // Asset owners can read violations for their assets
      allow read: if isAuthenticated() && (
        isAdmin() || 
        resource.data.original_asset.owner_id == request.auth.uid
      );
      
      // System can create
      allow create: if isAuthenticated() && isAdmin();
      
      // Admins can update
      allow update: if isAuthenticated() && isAdmin();
    }
    
    // Certificates collection (read-only for verification)
    match /certificates/{certificateId} {
      allow read: if true;
      allow write: if isAuthenticated() && isAdmin();
    }
  }
}
```

---

## Data Migration Strategy

### Version 1.0 (MVP) → Version 2.0

```javascript
// Migration script for adding new fields

exports.migrateAssetsV2 = functions.firestore
  .document('assets/{assetId}')
  .onWrite(async (change, context) => {
    const asset = change.after.data();
    
    if (!asset.analytics) {
      return change.after.ref.set({
        analytics: {
          views: 0,
          purchases: 0,
          violations_detected: 0,
          last_viewed: null
        }
      }, { merge: true });
    }
  });
```

---

## Backup & Recovery

| Strategy | Frequency | Retention |
|----------|-----------|-----------|
| Firestore Auto-backup | Daily | 30 days |
| Export to GCS | Weekly | 1 year |
| Point-in-time Recovery | Enabled | 7 days |

---

## Performance Optimization

### Collection Group Queries

```javascript
// Get all assets for a user across all subcollections
const userAssets = await firestore.collectionGroup('assets')
  .where('owner_id', '==', userId)
  .orderBy('created_at', 'desc')
  .get();
```

### Caching Strategy

```javascript
// Cache frequently accessed data in Redis
const cacheKey = `asset:${assetId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const asset = await firestore.collection('assets').doc(assetId).get();
await redis.setex(cacheKey, 3600, JSON.stringify(asset.data()));

return asset.data();
```