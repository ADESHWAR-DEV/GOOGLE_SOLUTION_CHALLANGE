# SportShield System Architecture

## Overview

SportShield uses a multi-layered architecture combining Google Cloud services, Firebase, Polygon blockchain, and Vertex AI for comprehensive digital sports media protection.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐ │
│  │  Athlete Portal │    │  Buyer Portal   │    │    Admin Portal         │ │
│  │  (Next.js)      │    │  (Next.js)      │    │    (Next.js)            │ │
│  └────────┬────────┘    └────────┬────────┘    └────────────┬────────────┘ │
└───────────┼──────────────────────┼──────────────────────────┼──────────────┘
            │                      │                          │
            ▼                      ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    Google Cloud Run (Express.js)                       ││
│  │  - Authentication (Firebase Auth)                                      ││
│  │  - Rate Limiting                                                       ││
│  │  - Request Validation                                                  ││
│  │  - Logging & Monitoring                                                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Asset Service│  │Auth Service  │  │Payment Service│ │Alert Service  │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬──────┘  └───────┬────────┘  │
└─────────┼─────────────────┼──────────────────┼─────────────────┼───────────┘
          │                 │                  │                 │
          ▼                 ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ Firebase Firestore│  │ Google Cloud     │  │   Polygon Blockchain     │  │
│  │ - Users           │  │ Storage          │  │   - NFT Contracts        │  │
│  │ - Assets          │  │ - Media Files    │  │   - Royalty Distribution │  │
│  │ - Transactions    │  │ - C2PA Certs     │  │   - Ownership Records    │  │
│  │ - Violations      │  │                  │  │                          │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI/ML LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    Google Vertex AI                                     ││
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ ││
│  │  │ Similarity      │  │ Deepfake        │  │ Content Analysis        │ ││
│  │  │ Detection       │  │ Detection       │  │ (C2PA Validation)       │ ││
│  │  │ (TensorFlow)    │  │ (Vertex AI)     │  │                         │ ││
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Details

### 1. Presentation Layer (Frontend)

**Technology**: Next.js 14, TypeScript, Tailwind CSS

**Components**:
- **Athlete Portal**: Upload content, view royalties, monitor violations
- **Buyer Portal**: Browse marketplace, purchase assets, verify authenticity
- **Admin Portal**: Fraud alerts, dispute management, analytics

**Communication**: REST API calls to backend, WebSocket for real-time updates

---

### 2. API Gateway Layer

**Technology**: Google Cloud Run, Express.js

**Features**:
- JWT authentication via Firebase Auth
- Rate limiting (100 requests/minute per user)
- Request validation with Zod
- Structured logging to Cloud Logging
- Error handling and response formatting

**Endpoints**:
```
POST   /api/v1/assets/register
POST   /api/v1/assets/verify
POST   /api/v1/assets/detect-fraud
POST   /api/v1/assets/purchase
GET    /api/v1/assets/:id
GET    /api/v1/assets/ownership/:id
GET    /api/v1/violations/:id
GET    /api/v1/transactions/:id
POST   /api/v1/users/register
GET    /api/v1/users/profile
```

---

### 3. Service Layer

**Technology**: Node.js services running on Cloud Run

**Services**:

| Service | Responsibility |
|---------|----------------|
| Asset Service | Media upload, metadata extraction, C2PA generation |
| Auth Service | Wallet connection, Firebase auth, role management |
| Payment Service | Smart contract interaction, royalty calculation |
| Alert Service | Violation detection, notification dispatch |
| AI Service | Content analysis, similarity matching, deepfake detection |

---

### 4. Data Layer

#### Firebase Firestore Schema

**Collections**:

```
users/
  {userId}/
    - wallet_address: string
    - role: "athlete" | "creator" | "buyer" | "admin"
    - verification_status: "pending" | "verified" | "suspended"
    - created_at: timestamp
    - updated_at: timestamp

assets/
  {assetId}/
    - media_url: string
    - owner_id: string (userId)
    - metadata_hash: string
    - blockchain_tx_id: string
    - c2pa_certificate_id: string
    - royalty_percentage: number
    - price: number
    - status: "active" | "sold" | "frozen"
    - created_at: timestamp

transactions/
  {transactionId}/
    - buyer: string (userId)
    - seller: string (userId)
    - asset_id: string
    - amount: number
    - royalty_split: { athlete: number, creator: number, platform: number }
    - transaction_hash: string
    - timestamp: timestamp

violations/
  {violationId}/
    - suspected_asset: string (assetId)
    - original_asset: string (assetId)
    - confidence_score: number (0-1)
    - detected_timestamp: timestamp
    - status: "pending" | "confirmed" | "resolved"
    - action_taken: string
```

#### Google Cloud Storage

**Buckets**:
- `sportshield-media`: Original media files
- `sportshield-processed`: Processed thumbnails
- `sportshield-c2pa`: C2PA certificates

#### Polygon Blockchain

**Smart Contracts**:
- `SportShieldNFT.sol`: ERC-721 NFT for asset ownership
- Royalty distribution logic embedded in contract

---

### 5. AI/ML Layer

**Technology**: Google Vertex AI, TensorFlow, OpenCV

**Models**:

| Model | Purpose | Architecture |
|-------|---------|--------------|
| Similarity Detector | Find duplicate content | CNN + Cosine Similarity |
| Deepfake Detector | Identify fake media | Vertex AI AutoML |
| Content Classifier | Categorize sports content | TensorFlow Keras |

**Pipeline**:
1. Media upload triggers Vertex AI analysis
2. Feature extraction (embeddings)
3. Similarity search against existing assets
4. Deepfake probability scoring
5. Result stored in Firestore

---

## Service Communication Flow

### Flow 1: Asset Registration

```
1. Athlete uploads media file
   │
   ▼
2. Frontend → POST /api/v1/assets/register
   │
   ▼
3. Backend validates file type & size
   │
   ▼
4. Upload to Google Cloud Storage
   │
   ▼
5. Extract metadata & generate C2PA certificate
   │
   ▼
6. Send to Vertex AI for initial analysis
   │
   ▼
7. Store metadata in Firestore
   │
   ▼
8. Mint NFT on Polygon (store tx ID)
   │
   ▼
9. Return success with asset ID & certificate
```

### Flow 2: Fraud Detection

```
1. User uploads suspected content
   │
   ▼
2. Frontend → POST /api/v1/assets/detect-fraud
   │
   ▼
3. Backend extracts features using Vertex AI
   │
   ▼
4. Query Firestore for similar assets
   │
   ▼
5. Calculate similarity scores
   │
   ▼
6. If confidence > 0.8:
   - Create violation record
   - Alert original asset owner
   - Flag suspicious asset
   │
   ▼
7. Return detection results
```

### Flow 3: Asset Purchase

```
1. Buyer selects asset to purchase
   │
   ▼
2. Frontend → POST /api/v1/assets/purchase
   │
   ▼
3. Backend verifies ownership & availability
   │
   ▼
4. Calculate royalty split (e.g., 80/10/10)
   │
   ▼
5. Execute Polygon smart contract
   │
   ▼
6. Transfer NFT to buyer
   │
   ▼
7. Record transaction in Firestore
   │
   ▼
8. Update asset status to "sold"
   │
   ▼
9. Send confirmation & receipt
```

---

## Authentication Design

### Multi-Factor Authentication

```
┌─────────────────────────────────────────┐
│         Authentication Flow             │
├─────────────────────────────────────────┤
│ 1. Email/Password (Firebase Auth)       │
│    ↓                                    │
│ 2. Wallet Connection (MetaMask)         │
│    ↓                                    │
│ 3. Optional: 2FA via SMS/Authenticator  │
└─────────────────────────────────────────┘
```

**Role-Based Access Control (RBAC)**:

| Role | Permissions |
|------|-------------|
| athlete | upload, register, view_royalties, view_own_assets |
| creator | upload, register, view_royalties, view_own_assets |
| buyer | purchase, view_marketplace, verify |
| admin | all_permissions, manage_violations, manage_users |

---

## Deployment Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  GitHub Push ──▶ GitHub Actions ──▶ Build & Test ──▶ Deploy       │
│       │               │                │              │            │
│       │               │                │              ▼            │
│       │               │                │    ┌─────────────────┐    │
│       │               │                │    │  Google Cloud   │    │
│       │               │                │    │  Run (Backend)  │    │
│       │               │                │    └────────┬────────┘    │
│       │               │                │             │             │
│       │               │                │    ┌────────▼────────┐    │
│       │               │                │    │    Vercel       │    │
│       │               │                │    │  (Frontend)     │    │
│       │               │                │    └─────────────────┘    │
│       │               │                │                          │
│       ▼               ▼                ▼                          │
│  ┌─────────┐    ┌──────────┐    ┌────────────┐                    │
│  │ Lint &  │    │ Unit     │    │ Deploy to  │                    │
│  │ Format  │    │ Tests    │    │ Testnet    │                    │
│  └─────────┘    └──────────┘    └────────────┘                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Deployment Targets**:

| Component | Platform | Environment |
|-----------|----------|-------------|
| Frontend | Vercel | Production |
| Backend API | Google Cloud Run | Production |
| Database | Firebase | Production (US-Central) |
| Blockchain | Polygon | Mumbai Testnet |
| Storage | Google Cloud Storage | Production |
| AI Models | Vertex AI | Production |

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────┐
│           Network Security              │
│  - Cloud Armor WAF                      │
│  - DDoS Protection                      │
│  - VPC Firewall Rules                   │
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│           Application Security          │
│  - JWT Validation                       │
│  - Rate Limiting                        │
│  - Input Validation (Zod)               │
│  - CSRF Protection                      │
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│           Data Security                 │
│  - Encryption at Rest (AES-256)         │
│  - TLS 1.3 in Transit                   │
│  - Firebase Security Rules              │
│  - C2PA Integrity                       │
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│           Wallet Security               │
│  - Private Key Management (Secret Manager)│
│  - Multi-sig for Platform Operations    │
│  - Transaction Signing Validation       │
└─────────────────────────────────────────┘
```

---

## Scalability Design

### Horizontal Scaling

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │ (Cloud Run)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ Instance│         │ Instance│         │ Instance│
   │   #1    │         │   #2    │         │   #3    │
   └─────────┘         └─────────┘         └─────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Cloud SQL      │
                    │  (PostgreSQL)   │
                    └─────────────────┘
```

### AI Inference Optimization

- **Vertex AI Endpoints**: Pre-built containers for TensorFlow models
- **Batch Prediction**: For bulk similarity checks
- **Caching**: Redis cache for frequent queries
- **CDN**: Cloud CDN for media delivery

---

## Monitoring & Observability

### Stack

| Tool | Purpose |
|------|---------|
| Cloud Logging | Centralized logging |
| Cloud Monitoring | Metrics & alerts |
| Error Reporting | Automatic error tracking |
| Cloud Trace | Distributed tracing |

### Key Metrics

- API latency (p50, p95, p99)
- Error rate by endpoint
- Active users
- Assets registered per day
- Fraud detection accuracy
- Smart contract gas usage