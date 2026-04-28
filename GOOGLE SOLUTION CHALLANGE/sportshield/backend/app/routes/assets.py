import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from app.config.firebase import assets_ref, transactions_ref, users_ref, ArrayUnion, safe_update
from app.routes.auth import get_current_user, require_role
from app.services.storage_service import storage_service
from app.services.blockchain_service import blockchain_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/assets", tags=["assets"])

class AssetCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    media_type: str
    sports_category: Optional[str] = "general"
    event: Optional[str] = ""
    royalty_percentage: Optional[int] = 10
    price: Optional[float] = 0.0

class PurchaseRequest(BaseModel):
    asset_id: str
    buyer_wallet: str

@router.post("/upload-asset")
async def upload_asset(
    title: str = Form(...),
    description: str = Form(""),
    media_type: str = Form(...),
    sports_category: str = Form("general"),
    event: str = Form(""),
    royalty_percentage: int = Form(10),
    price: float = Form(0.0),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload asset, store in Firebase, generate hash, mint NFT."""
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Upload to Firebase Storage
    content_type = file.content_type or "application/octet-stream"
    media_url = storage_service.upload_file(file_bytes, file.filename, content_type)

    # Generate hashes
    sha256_hash = storage_service.compute_sha256(file_bytes)
    phash = ai_service.compute_perceptual_hash(file_bytes) if media_type.startswith("image") else ""

    # Run fraud detection baseline
    fraud_result = ai_service.detect_fraud(file_bytes, media_type)

    # Get user info
    user_doc = users_ref.document(user["uid"]).get()
    user_data = user_doc.to_dict() or {}
    wallet_address = user_data.get("wallet_address", "")

    # Create asset ID
    asset_id = f"asset_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"

    # Mint on blockchain
    token_price_wei = int(price * 1e18)  # Convert MATIC to wei
    blockchain_result = blockchain_service.register_asset(
        owner_address=wallet_address or user["uid"],
        token_uri=media_url,
        metadata={
            "title": title,
            "description": description,
            "mediaType": media_type,
            "sportsCategory": sports_category,
            "eventName": event,
            "location": "",
            "recordedAt": int(datetime.utcnow().timestamp()),
            "metadataHash": sha256_hash,
            "c2paCertificateId": f"c2pa_{asset_id}",
        },
        royalty_percentage=royalty_percentage,
        price_wei=token_price_wei,
    )

    # C2PA-inspired metadata layer
    c2pa_manifest = {
        "claim": "AthletiChain Protected",
        "timestamp": datetime.utcnow().isoformat(),
        "algorithm": "SHA-256",
        "signature": "Simulated-C2PA-Signature",
        "signer": "AthletiChain CA",
        "creator": user["uid"],
        "content_hash": sha256_hash,
    }

    # Save to Firestore
    asset_doc = {
        "asset_id": asset_id,
        "title": title,
        "description": description,
        "media_type": media_type,
        "sports_category": sports_category,
        "event": event,
        "owner_id": user["uid"],
        "owner_wallet": wallet_address,
        "price": price,
        "royalty_percentage": royalty_percentage,
        "status": "active" if not fraud_result["fraud_detected"] else "flagged",
        "media_url": media_url,
        "content_hash": sha256_hash,
        "perceptual_hash": phash,
        "c2pa_manifest": c2pa_manifest,
        "blockchain": {
            "token_id": blockchain_result.get("tokenId", "0"),
            "contract_address": blockchain_result.get("contractAddress", ""),
            "transaction_hash": blockchain_result.get("txHash", ""),
            "network": "polygon_mumbai",
        },
        "ai_detection": {
            "baseline_fraud_detected": fraud_result["fraud_detected"],
            "baseline_confidence": fraud_result["confidence_score"],
            "deepfake_probability": fraud_result["deepfake_probability"],
            "analyzed_at": datetime.utcnow().isoformat(),
        },
        "ownership_history": [
            {
                "action": "minted",
                "from": "0x0000...0000",
                "to": wallet_address or user["uid"],
                "date": datetime.utcnow().isoformat(),
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    assets_ref.document(asset_id).set(asset_doc)

    # Update user stats
    current_count = user_data.get("stats", {}).get("assets_count", 0)
    users_ref.document(user["uid"]).update({"stats.assets_count": current_count + 1})

    return {
        "success": True,
        "asset_id": asset_id,
        "token_id": blockchain_result.get("tokenId", "0"),
        "blockchain_tx_id": blockchain_result.get("txHash", ""),
        "fraud_check": fraud_result,
    }

@router.post("/detect-fraud")
async def detect_fraud(
    file: UploadFile = File(...),
    media_type: str = Form("image"),
    user: dict = Depends(get_current_user),
):
    """Detect fraud for an uploaded file."""
    file_bytes = await file.read()
    result = ai_service.detect_fraud(file_bytes, media_type)
    return {"success": True, **result}

@router.post("/buy-asset")
async def buy_asset(req: PurchaseRequest, user: dict = Depends(get_current_user)):
    """Purchase an asset."""
    asset_doc = assets_ref.document(req.asset_id).get()
    if not asset_doc.exists:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset_data = asset_doc.to_dict()
    if asset_data.get("status") != "active":
        raise HTTPException(status_code=400, detail="Asset not available for purchase")

    seller_id = asset_data["owner_id"]
    price = float(asset_data.get("price", 0))
    royalty_pct = int(asset_data.get("royalty_percentage", 10))

    # Calculate royalty split
    royalty_amount = price * (royalty_pct / 100)
    platform_amount = royalty_amount * 0.1
    athlete_amount = royalty_amount - platform_amount
    creator_amount = price - royalty_amount

    # Update ownership in Firestore
    buyer_doc = users_ref.document(user["uid"]).get()
    buyer_data = buyer_doc.to_dict() or {}

    safe_update(assets_ref.document(req.asset_id), {
        "owner_id": user["uid"],
        "owner_wallet": req.buyer_wallet,
        "status": "sold",
        "updated_at": datetime.utcnow().isoformat(),
        "ownership_history": ArrayUnion([{
            "action": "sold",
            "from": asset_data.get("owner_wallet", seller_id),
            "to": req.buyer_wallet,
            "date": datetime.utcnow().isoformat(),
        }]),
    })

    # Record transaction
    tx_id = f"tx_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"
    transactions_ref.document(tx_id).set({
        "transaction_id": tx_id,
        "type": "purchase",
        "asset_id": req.asset_id,
        "buyer_id": user["uid"],
        "buyer_wallet": req.buyer_wallet,
        "seller_id": seller_id,
        "seller_wallet": asset_data.get("owner_wallet", ""),
        "amount": price,
        "royalty_split": {
            "athlete": round(athlete_amount, 2),
            "creator": round(creator_amount, 2),
            "platform": round(platform_amount, 2),
        },
        "status": "completed",
        "created_at": datetime.utcnow().isoformat(),
    })

    return {
        "success": True,
        "transaction_id": tx_id,
        "asset_id": req.asset_id,
        "new_owner": req.buyer_wallet,
        "royalty_distributed": {
            "athlete": f"{athlete_amount:.2f} MATIC",
            "creator": f"{creator_amount:.2f} MATIC",
            "platform": f"{platform_amount:.2f} MATIC",
        },
    }

@router.get("/")
async def list_assets(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "newest",
    page: int = 1,
    limit: int = 20,
):
    """List marketplace assets."""
    query = assets_ref.where("status", "in", ["active", "sold"])
    if category:
        query = query.where("sports_category", "==", category)

    docs = query.stream()
    assets = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        assets.append(data)

    # Price filtering (client-side for simplicity)
    if min_price is not None:
        assets = [a for a in assets if float(a.get("price", 0)) >= min_price]
    if max_price is not None:
        assets = [a for a in assets if float(a.get("price", 0)) <= max_price]

    # Sorting
    if sort_by == "price_asc":
        assets.sort(key=lambda x: float(x.get("price", 0)))
    elif sort_by == "price_desc":
        assets.sort(key=lambda x: float(x.get("price", 0)), reverse=True)
    else:  # newest
        assets.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    total = len(assets)
    start = (page - 1) * limit
    paginated = assets[start:start + limit]

    return {
        "success": True,
        "assets": paginated,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    }

@router.get("/{asset_id}")
async def get_asset(asset_id: str, user: dict = Depends(get_current_user)):
    """Get asset details."""
    doc = assets_ref.document(asset_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Asset not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return {"success": True, "asset": data}

@router.post("/freeze-asset")
async def freeze_asset(
    asset_id: str = Form(...),
    reason: str = Form(...),
    user: dict = Depends(get_current_user),
):
    """Admin: freeze a suspicious asset."""
    require_role(user, ["admin"])

    doc = assets_ref.document(asset_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Asset not found")

    data = doc.to_dict()
    token_id = int(data.get("blockchain", {}).get("token_id", 0))

    # Call blockchain freeze
    blockchain_service.freeze_asset(token_id, reason)

    assets_ref.document(asset_id).update({
        "status": "frozen",
        "freeze_reason": reason,
        "frozen_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    })

    return {"success": True, "message": "Asset frozen successfully"}

