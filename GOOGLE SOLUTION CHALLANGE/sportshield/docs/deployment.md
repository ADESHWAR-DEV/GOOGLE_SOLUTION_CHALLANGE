# SportShield Deployment Guide

## Overview

Complete deployment instructions for all SportShield components to production and test environments.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SportShield Deployment                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐              │
│  │   Vercel    │     │  Cloud Run  │     │  Polygon    │              │
│  │  (Frontend) │     │  (Backend)  │     │  (Mumbai)   │              │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘              │
│         │                   │                   │                      │
│         └───────────────────┼───────────────────┘                      │
│                             ▼                                           │
│                    ┌──────────────┐                                     │
│                    │   Firebase   │                                     │
│                    │   (Auth +    │                                     │
│                    │   Firestore) │                                     │
│                    └──────────────┘                                     │
│                                                                         │
│                    ┌──────────────┐                                     │
│                    │ Cloud Storage│                                     │
│                    └──────────────┘                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Accounts & Tools

| Service | Account | CLI/Tool |
|---------|---------|----------|
| Google Cloud | cloud.google.com | gcloud CLI |
| Firebase | console.firebase.google.com | firebase CLI |
| Vercel | vercel.com | vercel CLI |
| Polygon | polygon.technology | - |
| GitHub | github.com | git |

### Install CLI Tools

```bash
# Google Cloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Firebase CLI
npm install -g firebase-tools

# Vercel CLI
npm install -g vercel

# Polygon Mumbai Faucet (for testnet MATIC)
# Visit: https://faucet.polygon.technology/
```

---

## Environment Setup

### 1. Google Cloud Project

```bash
# Create project
gcloud projects create sportshield --name="SportShield"

# Set project
gcloud config set project sportshield

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  container.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  kms.googleapis.com
```

### 2. Firebase Setup

```bash
# Login to Firebase
firebase login

# Create Firebase project in console
# Then:
firebase projects:list

# Initialize Firebase in project
cd sportshield
firebase init
```

Select:
- Firestore
- Storage
- Authentication (Google + Email/Password)

### 3. Environment Variables

Create `.env.production` files:

```bash
# backend/.env.production
NODE_ENV=production
PORT=8080

# Firebase
FIREBASE_PROJECT_ID=sportshield
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# Polygon Mumbai
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_CHAIN_ID=80001
CONTRACT_ADDRESS=0x...

# Google Cloud
GCP_PROJECT_ID=sportshield
GCP_REGION=us-central1

# Encryption
ENCRYPTION_KEY=your-256-bit-hex-key

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars

# API
API_SECRET=your-api-signing-secret
FRONTEND_URL=https://sportshield.vercel.app
```

---

## Smart Contract Deployment

### 1. Configure Polygon Mumbai

```javascript
// filepath: contracts/hardhat.config.js
require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: '0.8.19',
  networks: {
    mumbai: {
      url: process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
};
```

### 2. Deploy Contract

```bash
cd sportshield/contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai

# Output will show:
# SportShieldNFT deployed to: 0x...
```

### 3. Verify on PolygonScan

```bash
# Verify contract source code
npx hardhat verify --network mumbai 0xYOUR_CONTRACT_ADDRESS
```

---

## Backend Deployment

### 1. Build Docker Image

```dockerfile
# filepath: backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
```

### 2. Deploy to Cloud Run

```bash
# Build and push container
gcloud builds submit --tag gcr.io/sportshield/backend

# Deploy to Cloud Run
gcloud run deploy sportshield-backend \
  --image gcr.io/sportshield/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars FIREBASE_PROJECT_ID=sportshield
```

### 3. Configure Cloud Run

```bash
# Set environment variables
gcloud run deploy sportshield-backend \
  --update-env-vars POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com \
  --update-env-vars CONTRACT_ADDRESS=0x...

# Set memory and CPU
gcloud run deploy sportshield-backend \
  --memory 1Gi \
  --cpu 2
```

---

## Frontend Deployment

### 1. Configure Next.js

```javascript
// filepath: frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_POLYGON_CHAIN_ID: '80001',
  },
  images: {
    domains: ['storage.googleapis.com', 'ipfs.io'],
  },
};

module.exports = nextConfig;
```

### 2. Deploy to Vercel

```bash
cd sportshield/frontend

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod
```

### 3. Environment Variables in Vercel

In Vercel dashboard, add:
- `NEXT_PUBLIC_API_URL` = https://sportshield-backend-xxx.a.run.app
- `NEXT_PUBLIC_CONTRACT_ADDRESS` = 0x...
- `NEXT_PUBLIC_POLYGON_CHAIN_ID` = 80001

---

## Database Setup

### 1. Firestore Indexes

```json
// filepath: firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "assets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASC" },
        { "fieldPath": "created_at", "order": "DESC" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "buyer_id", "order": "ASC" },
        { "fieldPath": "created_at", "order": "DESC" }
      ]
    }
  ]
}
```

Deploy:
```bash
firebase deploy --only firestore:indexes
```

### 2. Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Storage Rules

```javascript
// filepath: storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /assets/{assetId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.resource.size < 100 * 1024 * 1024  // 100MB max
        && request.resource.contentType.matches('image/.*|video/.*');
    }
  }
}
```

Deploy:
```bash
firebase deploy --only storage
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# filepath: .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
          
      - name: Run tests
        run: |
          cd frontend && npm test
          cd ../backend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
          
      - name: Build and Deploy Backend
        run: |
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT }}/backend
          gcloud run deploy sportshield-backend \
            --image gcr.io/${{ secrets.GCP_PROJECT }}/backend \
            --platform managed \
            --region us-central1

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Domain & SSL

### 1. Custom Domain (Vercel)

```bash
# Add custom domain
vercel domains add sportshield.io

# Configure DNS records in your registrar
# Type: CNAME
# Name: sportshield.io
# Value: cname.vercel-dns.com
```

### 2. SSL Certificate

Vercel automatically provides SSL via Let's Encrypt.

For custom domain:
```bash
# Add domain with SSL
vercel domains add sportshield.io --ssl
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Backend health
curl https://sportshield-backend-xxx.a.run.app/health

# Frontend
curl -I https://sportshield.vercel.app
```

### Test Checklist

- [ ] User registration works
- [ ] Asset upload works
- [ ] AI detection runs
- [ ] NFT minting works
- [ ] Purchase flow works
- [ ] C2PA verification works
- [ ] Wallet connection works

---

## Rollback Procedures

### Backend Rollback

```bash
# List revisions
gcloud run revisions list --service sportshield-backend

# Rollback to previous revision
gcloud run deploy sportshield-backend \
  --revision sportshield-backend-0000xx
```

### Frontend Rollback

```bash
# From Vercel dashboard
# Go to Deployments → Find previous deployment → Click "Promote to Production"
```

---

## Monitoring

### Cloud Logging

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Filter by severity
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit 50
```

### Set Up Alerts

1. Go to Cloud Monitoring
2. Create alert policy for:
   - Error rate > 5%
   - Latency > 2s
   - 5xx errors > 0