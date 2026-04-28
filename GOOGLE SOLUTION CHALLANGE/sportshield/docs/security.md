# SportShield Security Implementation

## Overview

Comprehensive security measures for protecting user data, blockchain transactions, and AI detection systems.

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SportShield Security Layers                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Edge Security                                │   │
│  │  - WAF (Cloud Armor)  - DDoS Protection  - Rate Limiting       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    API Security                                 │   │
│  │  - JWT Auth  - Input Validation  - Request Signing             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Data Security                                │   │
│  │  - Encryption at Rest  - Encryption in Transit  - Key Mgmt     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Blockchain Security                          │   │
│  │  - Smart Contract Audits  - Multi-sig  - Timelock              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Firebase Auth Integration

```typescript
// filepath: backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' }
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Get user role from Firestore
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: userData?.role || 'user'
    };

    next();
  } catch (error: any) {
    logger.error('Auth error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token expired' }
      });
    }

    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }

    next();
  };
};
```

### Wallet Authentication

```typescript
// filepath: backend/src/middleware/walletAuth.ts
import { Request, Response, NextFunction } from 'express';
import { crypto } from '../utils/crypto';

export const walletAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { wallet_address, signature, message } = req.body;

    if (!wallet_address || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing wallet credentials' }
      });
    }

    // Verify signature
    const isValid = await crypto.verifySignature(message, signature, wallet_address);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Wallet signature verification failed' }
      });
    }

    // Attach wallet to request
    (req as any).walletAddress = wallet_address;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'WALLET_AUTH_FAILED', message: 'Wallet authentication failed' }
    });
  }
};
```

---

## Input Validation

### Express Validator Setup

```typescript
// filepath: backend/src/middleware/validation.ts
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: errors.array()
      }
    });
  }
  next();
};

// Asset validation rules
export const assetValidation = {
  register: [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('media_type').isIn(['image', 'video', 'audio']),
    body('media_url').isURL(),
    body('sports_category').optional().trim(),
    body('price').optional().isNumeric(),
    body('royalty_percentage').optional().isInt({ min: 0, max: 100 }),
    validate
  ],
  purchase: [
    body('asset_id').notEmpty().matches(/^asset_/),
    body('buyer_wallet').matches(/^0x[a-fA-F0-9]{40}$/),
    validate
  ]
};

// User validation rules
export const userValidation = {
  register: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('display_name').trim().notEmpty().isLength({ max: 100 }),
    body('wallet_address').matches(/^0x[a-fA-F0-9]{40}$/),
    body('role').isIn(['athlete', 'creator', 'buyer', 'admin']),
    validate
  ]
};
```

---

## Data Encryption

### Encryption Service

```typescript
// filepath: backend/src/utils/encryption.ts
import crypto from 'crypto';
import { KMS } from '@google-cloud/kms';

// Initialize Google Cloud KMS
const kms = new KMS();
const KEY_RING_NAME = 'projects/sportshield/locations/global/keyRings/sportshield-keyring';
const KEY_NAME = `${KEY_RING_NAME}/cryptoKeys/sportshield-key`;

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private keyCache: Buffer | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Get encryption key from KMS
   */
  private async getKey(): Promise<Buffer> {
    if (this.keyCache) {
      return this.keyCache;
    }

    try {
      // Try to get from Google Cloud KMS
      const [key] = await kms.getCryptoKey(KEY_NAME);
      const keyBytes = key?.primary?.cryptoKeyBytes;
      
      if (keyBytes) {
        this.keyCache = Buffer.from(keyBytes, 'base64');
        return this.keyCache;
      }
    } catch (error) {
      console.warn('KMS unavailable, using local key');
    }

    // Fallback to environment key
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('No encryption key available');
    }

    this.keyCache = Buffer.from(key, 'hex');
    return this.keyCache;
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(plaintext: string): Promise<string> {
    const key = await this.getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return IV + AuthTag + Encrypted data
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData: string): Promise<string> {
    const key = await this.getKey();
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + process.env.HASH_SALT)
      .digest('hex');
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

export const encryption = EncryptionService.getInstance();
```

---

## Firestore Security Rules

```javascript
// filepath: firestore.rules
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
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      // Users can create their own profile
      allow create: if isAuthenticated() && isOwner(userId);
      // Users can update their own profile
      allow update: if isAuthenticated() && isOwner(userId);
    }
    
    // Assets collection
    match /assets/{assetId} {
      // Anyone can read active assets
      allow read: if resource.data.status == 'active' || isOwner(resource.data.owner_id) || isAdmin();
      // Users can create assets
      allow create: if isAuthenticated() 
        && request.resource.data.owner_id == request.auth.uid
        && request.resource.data.title.size() > 0
        && request.resource.data.title.size() <= 200;
      // Only owner can update
      allow update: if isAuthenticated() && isOwner(resource.data.owner_id);
      // Only admin can delete
      allow delete: if isAdmin();
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      // Users can read their own transactions
      allow read: if isAuthenticated() 
        && (request.auth.uid == resource.data.buyer_id 
            || request.auth.uid == resource.data.seller_id 
            || isAdmin());
      // System can create (via Cloud Functions)
      allow create: if false;
    }
    
    // Violations collection
    match /violations/{violationId} {
      // Only admins can read/write violations
      allow read, write: if isAdmin();
    }
    
    // C2PA Certificates
    match /c2pa_certificates/{certId} {
      // Read if authenticated
      allow read: if isAuthenticated();
      // Create via Cloud Functions only
      allow create: if false;
    }
  }
}
```

---

## API Security

### Rate Limiting

```typescript
// filepath: backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

// Redis client for distributed rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: options.windowMs,
    max: options.max,
    keyPrefix: options.keyPrefix || 'rl',
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(options.windowMs / 1000)
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different limiters for different endpoints
export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 attempts per 15 minutes
});

export const purchaseLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5 // 5 purchases per minute
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 uploads per minute
});
```

### Request Signing

```typescript
// filepath: backend/src/middleware/requestSigning.ts
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const SIGNATURE_HEADER = 'x-signature';
const TIMESTAMP_HEADER = 'x-timestamp';
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const requestSigningMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip for GET requests and health checks
  if (req.method === 'GET' || req.path === '/health') {
    return next();
  }

  const signature = req.headers[SIGNATURE_HEADER] as string;
  const timestamp = req.headers[TIMESTAMP_HEADER] as string;

  // Check if signature exists
  if (!signature || !timestamp) {
    return res.status(401).json({
      success: false,
      error: { code: 'MISSING_SIGNATURE', message: 'Request signature required' }
    });
  }

  // Check timestamp freshness
  const requestTime = parseInt(timestamp);
  const now = Date.now();

  if (Math.abs(now - requestTime) > TIMEOUT_MS) {
    return res.status(401).json({
      success: false,
      error: { code: 'REQUEST_EXPIRED', message: 'Request timestamp expired' }
    });
  }

  // Verify signature
  const payload = JSON.stringify(req.body) + timestamp;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.API_SECRET || '')
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_SIGNATURE', message: 'Request signature invalid' }
    });
  }

  next();
};
```

---

## Blockchain Security

### Smart Contract Security

```solidity
// filepath: contracts/contracts/SportShieldNFT.sol
// ... (from previous implementation)

// Security features implemented:
// 1. ReentrancyGuard - prevents reentrancy attacks
// 2. Ownable - access control
// 3. Pausable - emergency stop
// 4. SafeMath - arithmetic overflow protection

// Additional security measures:
contract SportShieldNFT is ERC721, ReentrancyGuard, Ownable, Pausable {
    
    // Maximum royalty percentage (50%)
    uint256 public constant MAX_ROYALTY = 5000; // 50%
    
    // Maximum price per asset
    uint256 public constant MAX_PRICE = 1000000 ether;
    
    // Circuit breaker
    bool public emergencyStopped = false;
    
    modifier stopInEmergency() {
        require(!emergencyStopped, "Contract paused");
        _;
    }
    
    // Withdraw funds with timelock
    mapping(address => uint256) public pendingWithdrawals;
    uint256 public withdrawalDelay = 48 hours;
    mapping(address => uint256) public withdrawalRequestTime;
    
    function requestWithdrawal() external onlyOwner {
        withdrawalRequestTime[msg.sender] = block.timestamp + withdrawalDelay;
    }
    
    function executeWithdrawal() external onlyOwner {
        require(withdrawalRequestTime[msg.sender] <= block.timestamp, "Timelock active");
        uint256 amount = pendingWithdrawals[msg.sender];
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
```

---

## Google Cloud Armor

```yaml
# filepath: cloud-armor-policy.yaml
name: sportshield-armor-policy
type: COMPUTE_CLOUD_ARMOR_SECURITY_POLICY

rules:
  # Allow Google health checks
  - action: allow
    description: Allow health checks
    match:
      expr:
        evaluatePreExpr: |
          request.headers['user-agent'].contains('GoogleHC')
    priority: 1000

  # Block known bad IPs
  - action: deny(403)
    description: Block malicious IPs
    match:
      ipRanges:
        - "192.0.2.0/24"  # Example bad IP range
    priority: 100

  # Rate limiting
  - action: throttle
    description: Rate limit
    match:
      expr:
        evaluatePreExpr: |
          request.headers['host'] == 'api.sportshield.io'
    priority: 500
    rateLimit:
      count: 100
      intervalSec: 60

  # SQL injection protection
  - action: deny(403)
    description: Block SQL injection
    match:
      expr:
        evaluatePreExpr: |
          request.path.contains("'") || 
          request.path.contains(";") ||
          request.path.contains("--")
    priority: 200

  # Default deny
  - action: deny(403)
    description: Default deny
    priority: 2147483647
```

---

## Security Checklist

### Pre-Deployment

- [ ] All environment variables properly set
- [ ] Firebase security rules deployed
- [ ] API rate limiting enabled
- [ ] Request signing implemented
- [ ] Encryption at rest enabled
- [ ] SSL/TLS configured
- [ ] WAF rules applied
- [ ] Smart contract audited
- [ ] Penetration testing completed

### Monitoring

- [ ] Cloud Logging configured
- [ ] Alerting set up for:
  - Failed authentication attempts
  - Unusual API traffic
  - Smart contract events
  - Large transactions
- [ ] Dashboard for security metrics

### Incident Response

- [ ] Emergency contact list
- [ ] Circuit breaker procedures
- [ ] Backup and recovery plan
- [ ] Communication plan