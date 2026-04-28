// filepath: backend/src/routes/assets.ts
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { assetService } from '../services/assetService';
import { logger } from '../utils/logger';

const router = Router();

// Validation rules
const registerAssetValidation = [
  body('title').notEmpty().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('media_type').isIn(['image', 'video', 'audio']),
  body('media_url').isURL(),
  body('sports_category').optional().trim(),
  body('event').optional().trim(),
  body('royalty_percentage').optional().isInt({ min: 0, max: 100 }),
  body('price').optional().isNumeric()
];

const verifyContentValidation = [
  body('asset_id').notEmpty()
];

const detectFraudValidation = [
  body('media_url').isURL(),
  body('media_type').isIn(['image', 'video'])
];

const purchaseAssetValidation = [
  body('asset_id').notEmpty(),
  body('buyer_wallet').matches(/^0x[a-fA-F0-9]{40}$/)
];

/**
 * POST /api/v1/assets/register
 * Register a new digital asset
 */
router.post('/register', 
  authMiddleware,
  registerAssetValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'VALIDATION_ERROR', details: errors.array() }
        });
      }

      const userId = req.user?.uid;
      const assetData = req.body;

      const result = await assetService.registerAsset(userId!, assetData);

      res.status(201).json({
        success: true,
        asset_id: result.assetId,
        blockchain_tx_id: result.blockchainTxId,
        token_id: result.tokenId,
        c2pa_certificate_id: result.c2paCertificateId,
        message: 'Asset registered successfully'
      });
    } catch (error: any) {
      logger.error('Asset registration error:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'REGISTRATION_FAILED', message: error.message }
      });
    }
  }
);

/**
 * POST /api/v1/assets/verify
 * Verify content authenticity
 */
router.post('/verify', 
  authMiddleware,
  verifyContentValidation,
  async (req: Request, res: Response) => {
    try {
      const { asset_id } = req.body;

      const result = await assetService.verifyAsset(asset_id);

      res.json({
        success: true,
        is_authentic: result.isAuthentic,
        verification_details: result.verificationDetails,
        owner: result.owner,
        verified_at: result.verifiedAt
      });
    } catch (error: any) {
      logger.error('Asset verification error:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'VERIFICATION_FAILED', message: error.message }
      });
    }
  }
);

/**
 * POST /api/v1/assets/detect-fraud
 * Detect potential fraud or unauthorized content
 */
router.post('/detect-fraud', 
  authMiddleware,
  detectFraudValidation,
  async (req: Request, res: Response) => {
    try {
      const { media_url, media_type } = req.body;

      const result = await assetService.detectFraud(media_url, media_type);

      res.json({
        success: true,
        fraud_detected: result.fraudDetected,
        confidence_score: result.confidenceScore,
        similar_assets: result.similarAssets,
        deepfake_probability: result.deepfakeProbability,
        recommendation: result.recommendation
      });
    } catch (error: any) {
      logger.error('Fraud detection error:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'DETECTION_FAILED', message: error.message }
      });
    }
  }
);

/**
 * POST /api/v1/assets/purchase
 * Purchase a digital asset
 */
router.post('/purchase', 
  authMiddleware,
  purchaseAssetValidation,
  async (req: Request, res: Response) => {
    try {
      const { asset_id, buyer_wallet } = req.body;
      const buyerId = req.user?.uid;

      const result = await assetService.purchaseAsset(asset_id, buyerId!, buyer_wallet);

      res.json({
        success: true,
        transaction_id: result.transactionId,
        transaction_hash: result.transactionHash,
        asset_id: result.assetId,
        new_owner: result.newOwner,
        royalty_distributed: result.royaltyDistributed,
        purchased_at: result.purchasedAt
      });
    } catch (error: any) {
      logger.error('Asset purchase error:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'PURCHASE_FAILED', message: error.message }
      });
    }
  }
);

/**
 * GET /api/v1/assets/:id
 * Get asset details
 */
router.get('/:id', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const asset = await assetService.getAsset(id);

      if (!asset) {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Asset not found' }
        });
      }

      res.json({
        success: true,
        asset
      });
    } catch (error: any) {
      logger.error('Get asset error:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'GET_FAILED', message: error.message }
      });
    }
  }
);

/**
 * GET /api/v1/assets/ownership/:id
 * Get ownership information
 */
router.get('/ownership/:id', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const ownership = await assetService.getOwnership(id);

      res.json({
        success: true,
        asset_id: id,
        ownership,
        blockchain: ownership.blockchain
      });
    } catch (error: any) {
      logger.error('Get ownership error:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'GET_FAILED', message: error.message }
      });
    }
  }
);

/**
 * GET /api/v1/assets
 * List assets (marketplace)
 */
router.get('/', 
  async (req: Request, res: Response) => {
    try {
      const { 
        category, 
        min_price, 
        max_price, 
        sort_by, 
        page = '1', 
        limit = '20' 
      } = req.query;

      const result = await assetService.listAssets({
        category: category as string,
        minPrice: min_price as string,
        maxPrice: max_price as string,
        sortBy: sort_by as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        assets: result.assets,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('List assets error:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'LIST_FAILED', message: error.message }
      });
    }
  }
);

export default router;