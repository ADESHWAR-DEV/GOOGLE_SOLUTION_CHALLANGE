"""
Seed script to populate Firestore with demo data for AthletiChain AI.
Run: python seed.py
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.config.firebase import db, auth_client

load_dotenv()

assets_ref = db.collection("assets")
users_ref = db.collection("users")
violations_ref = db.collection("violations")


def create_demo_users():
    """Create demo users if they don't exist."""
    demo_users = [
        {
            "uid": "athlete_demo_001",
            "email": "athlete@demo.com",
            "display_name": "Marcus Thompson",
            "role": "athlete",
            "wallet_address": "0xA1B2C3D4E5F6789012345678901234567890ABCD",
            "stats": {"assets_count": 3, "total_earnings": 1250.0},
        },
        {
            "uid": "buyer_demo_001",
            "email": "buyer@demo.com",
            "display_name": "Alex Fan",
            "role": "buyer",
            "wallet_address": "0xB2C3D4E5F6789012345678901234567890ABCDE1",
            "stats": {"assets_count": 0, "total_earnings": 0},
        },
        {
            "uid": "admin_demo_001",
            "email": "admin@demo.com",
            "display_name": "Admin User",
            "role": "admin",
            "wallet_address": "0xC3D4E5F6789012345678901234567890ABCDE12",
            "stats": {"assets_count": 0, "total_earnings": 0},
        },
    ]

    for user in demo_users:
        users_ref.document(user["uid"]).set(user)
        print(f"Created user: {user['email']} ({user['role']})")


def create_demo_assets():
    """Create demo assets."""
    demo_assets = [
        {
            "asset_id": "asset_demo_001",
            "title": "Championship Goal Celebration",
            "description": "The winning goal from the 2024 Championship final. Exclusive footage.",
            "media_type": "image",
            "sports_category": "Soccer",
            "event": "2024 Championship Final",
            "owner_id": "athlete_demo_001",
            "owner_wallet": "0xA1B2C3D4E5F6789012345678901234567890ABCD",
            "price": 99.0,
            "royalty_percentage": 10,
            "status": "active",
            "media_url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&fit=crop",
            "content_hash": "a7b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
            "perceptual_hash": "aabbccdd11223344",
            "c2pa_manifest": {
                "claim": "AthletiChain Protected",
                "timestamp": "2024-01-15T14:32:00Z",
                "algorithm": "SHA-256",
                "signature": "Valid",
                "signer": "AthletiChain CA",
            },
            "blockchain": {
                "token_id": "42",
                "contract_address": "0x1234567890abcdef1234567890abcdef12345678",
                "transaction_hash": "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
                "network": "polygon_mumbai",
            },
            "ai_detection": {
                "baseline_fraud_detected": False,
                "baseline_confidence": 0.0,
                "deepfake_probability": 0.02,
                "analyzed_at": "2024-01-15T14:32:00Z",
            },
            "ownership_history": [
                {"action": "minted", "from": "0x0000...0000", "to": "0xA1B2...3C4D", "date": "2024-01-15"}
            ],
            "created_at": "2024-01-15T14:32:00Z",
            "updated_at": "2024-01-15T14:32:00Z",
        },
        {
            "asset_id": "asset_demo_002",
            "title": "Dunk Contest Highlights",
            "description": "Incredible dunks from the 2024 All-Star weekend.",
            "media_type": "image",
            "sports_category": "Basketball",
            "event": "2024 All-Star Weekend",
            "owner_id": "athlete_demo_001",
            "owner_wallet": "0xA1B2C3D4E5F6789012345678901234567890ABCD",
            "price": 149.0,
            "royalty_percentage": 12,
            "status": "active",
            "media_url": "https://images.unsplash.com/photo-1519861531473-92002639313c?w=800&fit=crop",
            "content_hash": "b8c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5",
            "perceptual_hash": "bbccddee22334455",
            "c2pa_manifest": {
                "claim": "AthletiChain Protected",
                "timestamp": "2024-01-16T10:00:00Z",
                "algorithm": "SHA-256",
                "signature": "Valid",
                "signer": "AthletiChain CA",
            },
            "blockchain": {
                "token_id": "43",
                "contract_address": "0x1234567890abcdef1234567890abcdef12345678",
                "transaction_hash": "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9",
                "network": "polygon_mumbai",
            },
            "ai_detection": {
                "baseline_fraud_detected": False,
                "baseline_confidence": 0.0,
                "deepfake_probability": 0.05,
                "analyzed_at": "2024-01-16T10:00:00Z",
            },
            "ownership_history": [
                {"action": "minted", "from": "0x0000...0000", "to": "0xA1B2...3C4D", "date": "2024-01-16"}
            ],
            "created_at": "2024-01-16T10:00:00Z",
            "updated_at": "2024-01-16T10:00:00Z",
        },
        {
            "asset_id": "asset_demo_003",
            "title": "Marathon Finish Line",
            "description": "Breaking the tape at the 2024 City Marathon.",
            "media_type": "image",
            "sports_category": "Running",
            "event": "2024 City Marathon",
            "owner_id": "athlete_demo_001",
            "owner_wallet": "0xA1B2C3D4E5F6789012345678901234567890ABCD",
            "price": 79.0,
            "royalty_percentage": 8,
            "status": "active",
            "media_url": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&fit=crop",
            "content_hash": "c9d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6",
            "perceptual_hash": "ccddeeff33445566",
            "c2pa_manifest": {
                "claim": "AthletiChain Protected",
                "timestamp": "2024-01-17T08:15:00Z",
                "algorithm": "SHA-256",
                "signature": "Valid",
                "signer": "AthletiChain CA",
            },
            "blockchain": {
                "token_id": "44",
                "contract_address": "0x1234567890abcdef1234567890abcdef12345678",
                "transaction_hash": "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
                "network": "polygon_mumbai",
            },
            "ai_detection": {
                "baseline_fraud_detected": False,
                "baseline_confidence": 0.0,
                "deepfake_probability": 0.01,
                "analyzed_at": "2024-01-17T08:15:00Z",
            },
            "ownership_history": [
                {"action": "minted", "from": "0x0000...0000", "to": "0xA1B2...3C4D", "date": "2024-01-17"}
            ],
            "created_at": "2024-01-17T08:15:00Z",
            "updated_at": "2024-01-17T08:15:00Z",
        },
    ]

    for asset in demo_assets:
        assets_ref.document(asset["asset_id"]).set(asset)
        print(f"Created asset: {asset['title']}")


def create_demo_violations():
    """Create demo fraud violations."""
    demo_violations = [
        {
            "type": "unauthorized_duplicate",
            "status": "pending",
            "confidence_score": 0.94,
            "suspected_asset": {
                "asset_id": "asset_suspicious_001",
                "title": "Championship Goal Copy",
                "media_url": "https://example.com/fake.jpg",
            },
            "original_asset": {
                "asset_id": "asset_demo_001",
                "owner_id": "athlete_demo_001",
                "title": "Championship Goal Celebration",
            },
            "detection": {
                "confidence_score": 0.94,
                "similarity_percentage": 94.0,
                "method": "ai_similarity",
            },
            "detected_at": "2024-01-20T10:00:00Z",
        },
    ]

    for v in demo_violations:
        violations_ref.add(v)
        print(f"Created violation: {v['type']}")


if __name__ == "__main__":
    print("Seeding AthletiChain AI demo data...")
    create_demo_users()
    create_demo_assets()
    create_demo_violations()
    print("Done!")
