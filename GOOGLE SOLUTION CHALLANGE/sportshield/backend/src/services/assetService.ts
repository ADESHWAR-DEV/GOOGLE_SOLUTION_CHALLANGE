// filepath: backend/src/services/assetService.ts
/**
 * Asset Service - Business Logic
 */

import { firestore, storage } from '../config/firebase';
import { blockchainService } from './blockchainService';
import { aiDetectionService } from './aiDetectionService';
import { c2paService } from './c2paService';
import { logger } from '../utils/logger';

const assetsCollection = firestore.collection('assets');
const usersCollection = firestore.collection('users');

interface AssetData {
  title: string;
  description?: string;
  media_type: string;
  media_url: string;
  sports_category?: string;
  event?: string;
  royalty_percentage?: number;
  price?: string;
}

interface RegisterAssetResult {
  assetId: string;
  blockchainTxId: string;
  tokenId: string;
  c2paCertificateId: string;
}

interface VerifyAssetResult {
  isAuthentic: boolean;
  verificationDetails: {
    c2pa_valid: boolean;
    blockchain_verified: boolean;
    owner_verified: boolean;
    metadata_integrity: string;
  };
  owner: any;
  verifiedAt: string;
}

interface DetectFraudResult {
  fraudDetected: boolean;
  confidenceScore: number;
  similarAssets: any[];
  deepfakeProbability: number;
  recommendation: string;
}

interface PurchaseAssetResult {
  transactionId: string;
  transactionHash: string;
  assetId: string;
  newOwner: string;
  royaltyDistributed: {
    athlete: string;
    creator: string;
    platform: string;
  };
  purchasedAt: string;
}

export class AssetService {
  /**
   * Register a new digital asset
   */
  async registerAsset(userId: string, data: AssetData): Promise<RegisterAssetResult> {
    logger.info(`Registering asset for user: ${userId}`);

    // 1. Get user info
    const userDoc = await usersCollection.doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      throw new Error('User not found');
    }

    // 2. Generate unique asset ID
    const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 3. Upload media to Cloud Storage if needed
    let finalMediaUrl = data.media_url;
    if (data.media_url.startsWith('data:')) {
      finalMediaUrl = await this._uploadMedia(data.media_url, assetId);
    }

    // 4. Generate C2PA certificate
    const c2paCertificateId = await c2paService.createCertificate({
      asset_id: assetId,
      owner_id: userId,
      owner_wallet: userData.wallet_address,
      title: data.title,
      media_url: finalMediaUrl,
      media_type: data.media_type,
      timestamp: new Date().toISOString()
    });

    // 5. Register on blockchain
    const blockchainResult = await blockchainService.registerAsset({
      assetId,
      owner: userData.wallet_address,
      uri: finalMediaUrl,
      royaltyPercentage: data.royalty_percentage || 10
    });

    // 6. Run AI detection for baseline
    const detectionResult = await aiDetectionService.detectFraud(finalMediaUrl, data.media_type);

    // 7. Save to Firestore
    await assetsCollection.doc(assetId).set({
      asset_id: assetId,
      title: data.title,
      description: data.description || '',
      media_type: data.media_type,
      media_url: finalMediaUrl,
      sports_category: data.sports_category || 'general',
      event: data.event || '',
      owner_id: userId,
      owner_wallet: userData.wallet_address,
      price: data.price || '0',
      royalty_percentage: data.royalty_percentage || 10,
      status: 'active',
      c2pa_certificate_id: c2paCertificateId,
      blockchain: {
        token_id: blockchainResult.tokenId,
        contract_address: blockchainResult.contractAddress,
        transaction_hash: blockchainResult.transactionHash
      },
      ai_detection: {
        baseline_similarity: detectionResult.similarityScore,
        deepfake_probability: detectionResult.deepfakeProbability,
        analyzed_at: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 8. Update user stats
    await usersCollection.doc(userId).update({
      'stats.assets_count': (userData.stats?.assets_count || 0) + 1
    });

    return {
      assetId,
      blockchainTxId: blockchainResult.transactionHash,
      tokenId: blockchainResult.tokenId,
      cpaCertificateId: c2paCertificateId
    };
  }

  /**
   * Verify asset authenticity
   */
  async verifyAsset(assetId: string): Promise<VerifyAssetResult> {
    logger.info(`Verifying asset: ${assetId}`);

    // 1. Get asset from Firestore
    const assetDoc = await assetsCollection.doc(assetId).get();
    const assetData = assetDoc.data();

    if (!assetData) {
      throw new Error('Asset not found');
    }

    // 2. Verify C2PA certificate
    const c2paValid = await c2paService.verifyCertificate(assetData.c2pa_certificate_id);

    // 3. Verify blockchain ownership
    const blockchainVerified = await blockchainService.verifyOwnership(
      assetData.blockchain.token_id,
      assetData.owner_wallet
    );

    // 4. Get owner info
    const ownerDoc = await usersCollection.doc(assetData.owner_id).get();
    const ownerData = ownerDoc.data();

    // 5. Determine authenticity
    const isAuthentic = c2paValid && blockchainVerified;

    return {
      isAuthentic,
      verification_details: {
        c2pa_valid: c2paValid,
        blockchain_verified: blockchainVerified,
        owner_verified: !!ownerData,
        metadata_integrity: c2paValid ? 'valid' : 'invalid'
      },
      owner: {
        user_id: assetData.owner_id,
        wallet_address: assetData.owner_wallet,
        verification_status: ownerData?.verification_status || 'unverified'
      },
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Detect potential fraud
   */
  async detectFraud(mediaUrl: string, mediaType: string): Promise<DetectFraudResult> {
    logger.info(`Running fraud detection for: ${mediaUrl}`);

    // Run AI detection
    const detectionResult = await aiDetectionService.detectFraud(mediaUrl, mediaType);

    // Determine recommendation
    let recommendation = 'approved';
    if (detectionResult.deepfakeProbability > 0.7) {
      recommendation = 'block';
    } else if (detectionResult.similarityScore > 0.85) {
      recommendation = 'flag_for_review';
    }

    return {
      fraudDetected: detectionResult.similarityScore > 0.85 || detectionResult.deepfakeProbability > 0.7,
      confidenceScore: Math.max(detectionResult.similarityScore, detectionResult.deepfakeProbability),
      similarAssets: detectionResult.similarAssets,
      deepfakeProbability: detectionResult.deepfakeProbability,
      recommendation
    };
  }

  /**
   * Purchase an asset
   */
  async purchaseAsset(assetId: string, buyerId: string, buyerWallet: string): Promise<PurchaseAssetResult> {
    logger.info(`Purchasing asset ${assetId} for buyer ${buyerId}`);

    // 1. Get asset
    const assetDoc = await assetsCollection.doc(assetId).get();
    const assetData = assetDoc.data();

    if (!assetData) {
      throw new Error('Asset not found');
    }

    if (assetData.status !== 'active') {
      throw new Error('Asset is not available for purchase');
    }

    // 2. Get buyer info
    const buyerDoc = await usersCollection.doc(buyerId).get();
    const buyerData = buyerDoc.data();

    // 3. Process blockchain transaction
    const txResult = await blockchainService.purchaseAsset({
      tokenId: assetData.blockchain.token_id,
      buyer: buyerWallet,
      price: assetData.price,
      royaltyPercentage: assetData.royalty_percentage
    });

    // 4. Calculate royalty split
    const priceNum = parseFloat(assetData.price);
    const royaltyAmount = priceNum * (assetData.royalty_percentage / 100);
    const creatorAmount = priceNum - royaltyAmount;
    const platformAmount = royaltyAmount * 0.1; // 10% to platform
    const athleteAmount = royaltyAmount - platformAmount;

    // 5. Update asset ownership
    await assetsCollection.doc(assetId).update({
      owner_id: buyerId,
      owner_wallet: buyerWallet,
      'blockchain.transaction_hash': txResult.transactionHash,
      updated_at: new Date().toISOString()
    });

    // 6. Create transaction record
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await firestore.collection('transactions').doc(transactionId).set({
      transaction_id: transactionId,
      type: 'purchase',
      asset_id: assetId,
      buyer_id: buyerId,
      buyer_wallet: buyerWallet,
      seller_id: assetData.owner_id,
      seller_wallet: assetData.owner_wallet,
      amount: assetData.price,
      royalty_split: {
        athlete: athleteAmount.toString(),
        creator: creatorAmount.toString(),
        platform: platformAmount.toString()
      },
      status: 'completed',
      blockchain_tx_hash: txResult.transactionHash,
      created_at: new Date().toISOString()
    });

    // 7. Update seller stats
    await usersCollection.doc(assetData.owner_id).update({
      'stats.total_earnings': (sellerData?.stats?.total_earnings || 0) + parseFloat(creatorAmount.toString())
    });

    return {
      transactionId,
      transactionHash: txResult.transactionHash,
      assetId,
      newOwner: buyerWallet,
      royalty_distributed: {
        athlete: `${athleteAmount.toFixed(2)} MATIC`,
        creator: `${creatorAmount.toFixed(2)} MATIC`,
        platform: `${platformAmount.toFixed(2)} MATIC`
      },
      purchasedAt: new Date().toISOString()
    };
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId: string) {
    const assetDoc = await assetsCollection.doc(assetId).get();
    return assetDoc.data();
  }

  /**
   * Get ownership information
   */
  async getOwnership(assetId: string) {
    const assetDoc = await assetsCollection.doc(assetId).get();
    const assetData = assetDoc.data();

    if (!assetData) {
      throw new Error('Asset not found');
    }

    // Get previous owners
    const transactions = await firestore.collection('transactions')
      .where('asset_id', '==', assetId)
      .orderBy('created_at', 'desc')
      .get();

    const previousOwners = transactions.docs.map(doc => doc.data());

    return {
      original_creator: assetData.original_creator || assetData.owner_id,
      current_owner: assetData.owner_id,
      previous_owners: previousOwners.map(t => t.buyer_id || t.seller_id),
      transfer_count: previousOwners.length,
      last_transferred: previousOwners[0]?.created_at || null,
      blockchain: {
        network: 'polygon_mumbai',
        token_id: assetData.blockchain?.token_id,
        contract_address: assetData.blockchain?.contract_address
      }
    };
  }

  /**
   * List assets (marketplace)
   */
  async listAssets(filters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page: number;
    limit: number;
  }) {
    let query = assetsCollection.where('status', '==', 'active');

    if (filters.category) {
      query = query.where('sports_category', '==', filters.category);
    }

    const snapshot = await query.get();
    let assets = snapshot.docs.map(doc => doc.data());

    // Filter by price
    if (filters.minPrice) {
      assets = assets.filter(a => parseFloat(a.price) >= parseFloat(filters.minPrice!));
    }
    if (filters.maxPrice) {
      assets = assets.filter(a => parseFloat(a.price) <= parseFloat(filters.maxPrice!));
    }

    // Sort
    if (filters.sortBy === 'price_asc') {
      assets.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (filters.sortBy === 'price_desc') {
      assets.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (filters.sortBy === 'newest') {
      assets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Paginate
    const start = (filters.page - 1) * filters.limit;
    const paginatedAssets = assets.slice(start, start + filters.limit);

    return {
      assets: paginatedAssets,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: assets.length,
        pages: Math.ceil(assets.length / filters.limit)
      }
    };
  }

  /**
   * Upload media to Cloud Storage
   */
  private async _uploadMedia(base64Data: string, assetId: string): Promise<string> {
    const bucket = storage.bucket();
    const filename = `assets/${assetId}/media`;
    const file = bucket.file(filename);

    const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg'
      }
    });

    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
  }
}

export const assetService = new AssetService();