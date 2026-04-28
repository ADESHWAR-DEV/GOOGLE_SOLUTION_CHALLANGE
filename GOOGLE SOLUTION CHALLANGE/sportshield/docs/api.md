# SportShield API Documentation

## Base URL

```
Production: https://api.sportshield.io/api/v1
Staging: https://staging-api.sportshield.io/api/v1
Local: http://localhost:3001/api/v1
```

---

## Authentication

### Methods

| Method | Description |
|--------|-------------|
| Firebase Auth JWT | Primary authentication for users |
| Wallet Signature | Blockchain wallet verification |
| API Key | Server-to-server communication |

### Headers

```
Authorization: Bearer <firebase_id_token>
X-Wallet-Address: 0x...
X-Request-Signature: signature
Content-Type: application/json
```

---

## Endpoints

### Assets

#### POST /register-asset

Register a new digital sports media asset

**Request:**

```json
{
  "title": "Championship Dunk Highlight",
  "description": "Official highlight from 2026 finals",
  "media_type": "video",
  "media_url": "https://storage.googleapis.com/...",
  "sports_category": "basketball",
  "event": "NBA Finals 2026",
  "royalty_percentage": 10,
  "price": "100"
}
```

**Response (201):**

```json
{
  "success": true,
  "asset_id": "asset_abc123",
  "blockchain_tx_id": "0xabcdef...",
  "token_id": "1234",
  "c2pa_certificate_id": "c2pa_cert_001",
  "message": "Asset registered successfully"
}
```

---

#### POST /verify-content

Verify content authenticity

**Request:**

```json
{
  "asset_id": "asset_abc123"
}
```

**Response (200):**

```json
{
  "success": true,
  "is_authentic": true,
  "verification_details": {
    "c2pa_valid": true,
    "blockchain_verified": true,
    "owner_verified": true,
    "metadata_integrity": "valid"
  },
  "owner": {
    "user_id": "user_xyz789",
    "wallet_address": "0x1234...",
    "verification_status": "verified"
  },
  "verified_at": "2026-04-28T10:30:00Z"
}
```

---

#### POST /detect-fraud

Detect potential fraud or unauthorized content

**Request:**

```json
{
  "media_url": "https://storage.googleapis.com/...",
  "media_type": "image"
}
```

**Response (200):**

```json
{
  "success": true,
  "fraud_detected": true,
  "confidence_score": 0.95,
  "similar_assets": [
    {
      "asset_id": "asset_original456",
      "similarity_score": 0.94,
      "owner_id": "user_original123",
      "title": "Original Championship Highlight"
    }
  ],
  "deepfake_probability": 0.02,
  "recommendation": "flag_for_review"
}
```

---

#### POST /buy-asset

Purchase a digital asset

**Request:**

```json
{
  "asset_id": "asset_abc123",
  "buyer_wallet": "0xbuyer...",
  "payment_token": "MATIC"
}
```

**Response (200):**

```json
{
  "success": true,
  "transaction_id": "tx_abc123",
  "transaction_hash": "0xabcdef...",
  "asset_id": "asset_abc123",
  "new_owner": "0xbuyer...",
  "royalty_distributed": {
    "athlete": "80 MATIC",
    "creator": "10 MATIC",
    "platform": "10 MATIC"
  },
  "purchased_at": "2026-04-28T10:30:00Z"
}
```

---

#### GET /ownership/:id

Get ownership information for an asset

**Response (200):**

```json
{
  "success": true,
  "asset_id": "asset_abc123",
  "ownership": {
    "original_creator": "user_xyz789",
    "current_owner": "user_xyz789",
    "previous_owners": [],
    "transfer_count": 0,
    "last_transferred": null
  },
  "blockchain": {
    "network": "polygon_mumbai",
    "token_id": "1234",
    "contract_address": "0xABCD...1234"
  }
}
```

---

### Violations

#### GET /violations/:id

Get violation details

**Response (200):**

```json
{
  "success": true,
  "violation_id": "violation_001",
  "type": "unauthorized_duplicate",
  "suspected_asset": {
    "asset_id": "asset_suspect123",
    "owner_id": "user_suspect789"
  },
  "original_asset": {
    "asset_id": "asset_original456",
    "owner_id": "user_original123"
  },
  "confidence_score": 0.95,
  "status": "pending",
  "detected_at": "2026-04-28T10:05:00Z"
}
```

---

#### GET /violations

List violations (admin only)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (pending, confirmed, resolved) |
| owner_id | string | Filter by asset owner |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Response (200):**

```json
{
  "success": true,
  "violations": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

### Users

#### POST /users/register

Register a new user

**Request:**

```json
{
  "email": "athlete@example.com",
  "display_name": "John Doe",
  "role": "athlete",
  "wallet_address": "0x1234...abcd",
  "sport": "basketball",
  "league": "NBA"
}
```

**Response (201):**

```json
{
  "success": true,
  "user_id": "user_abc123",
  "message": "User registered successfully"
}
```

---

#### GET /users/profile

Get user profile

**Response (200):**

```json
{
  "success": true,
  "user": {
    "user_id": "user_abc123",
    "email": "athlete@example.com",
    "display_name": "John Doe",
    "role": "athlete",
    "verification_status": "verified",
    "wallet_address": "0x1234...abcd",
    "total_earnings": "5000.00",
    "assets_count": 10,
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

#### PUT /users/profile

Update user profile

**Request:**

```json
{
  "display_name": "John Updated",
  "bio": "Professional athlete",
  "social_links": {
    "instagram": "https://instagram.com/john",
    "twitter": "https://twitter.com/john"
  }
}
```

---

### Transactions

#### GET /transactions/:id

Get transaction details

**Response (200):**

```json
{
  "success": true,
  "transaction": {
    "transaction_id": "tx_abc123",
    "type": "purchase",
    "buyer": {
      "user_id": "user_buyer123",
      "wallet_address": "0xbuyer..."
    },
    "seller": {
      "user_id": "user_seller456",
      "wallet_address": "0xseller..."
    },
    "asset": {
      "asset_id": "asset_abc123",
      "title": "Championship Dunk Highlight"
    },
    "amount": "100 MATIC",
    "royalty_split": {
      "athlete": "80 MATIC",
      "creator": "10 MATIC",
      "platform": "10 MATIC"
    },
    "status": "completed",
    "created_at": "2026-04-20T14:20:00Z"
  }
}
```

---

#### GET /transactions

List user transactions

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by type (purchase, transfer) |
| role | string | Filter by role (buyer, seller) |
| page | number | Page number |
| limit | number | Items per page |

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [...]
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "retry_after": 60
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Rate Limiting

| Tier | Requests/minute | Burst |
|------|-----------------|-------|
| Free | 60 | 10 |
| Pro | 300 | 50 |
| Enterprise | 1000 | 200 |

**Rate Limit Headers:**

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

---

## Webhooks

### Webhook Events

| Event | Description |
|-------|-------------|
| asset.registered | New asset registered |
| asset.purchased | Asset purchased |
| violation.detected | Potential violation detected |
| user.verified | User verification completed |

### Webhook Payload

```json
{
  "event": "asset.registered",
  "timestamp": "2026-04-28T10:30:00Z",
  "data": {
    "asset_id": "asset_abc123",
    "owner_id": "user_xyz789",
    "blockchain_tx_id": "0xabcdef..."
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { SportShieldClient } from '@sportshield/sdk';

const client = new SportShieldClient({
  apiKey: process.env.SPORT_SHIELD_API_KEY,
  network: 'polygon_mumbai'
});

// Register asset
const asset = await client.assets.register({
  title: 'My Highlight',
  mediaUrl: 'https://...',
  price: '100'
});

// Verify content
const verification = await client.assets.verify('asset_abc123');

// Purchase asset
const purchase = await client.assets.purchase({
  assetId: 'asset_abc123',
  walletAddress: '0x...'
});
```

### Python

```python
from sportshield import SportShieldClient

client = SportShieldClient(
    api_key=os.environ['SPORT_SHIELD_API_KEY'],
    network='polygon_mumbai'
)

# Register asset
asset = client.assets.register(
    title='My Highlight',
    media_url='https://...',
    price='100'
)

# Verify content
verification = client.assets.verify('asset_abc123')
```