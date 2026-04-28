"""
Firebase Admin initialization with graceful fallback to demo mode.
If no credentials are found, the app starts with in-memory stores for local MVP testing.
"""

import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DEMO_MODE = False
db = None
bucket = None
auth_client = None
users_ref = None
assets_ref = None
transactions_ref = None
violations_ref = None


class _DemoDocSnap:
    def __init__(self, data, exists=True, doc_id=None):
        self._data = data
        self.exists = exists
        self.id = doc_id or str(uuid.uuid4())

    def to_dict(self):
        return self._data


class _DemoDocRef:
    def __init__(self, store, doc_id):
        self._store = store
        self.id = doc_id

    def get(self):
        data = self._store.get(self.id)
        return _DemoDocSnap(data, exists=data is not None, doc_id=self.id)

    def set(self, data, merge=False):
        if merge and self.id in self._store:
            self._store[self.id].update(data)
        else:
            self._store[self.id] = data

    def update(self, data):
        if self.id in self._store:
            self._store[self.id].update(data)


class _DemoQuery:
    def __init__(self, store, filters=None):
        self._store = store
        self._filters = filters or []
        self._limit = None

    def where(self, field, op, value):
        new_filters = self._filters + [(field, op, value)]
        return _DemoQuery(self._store, new_filters)

    def limit(self, n):
        self._limit = n
        return self

    def stream(self):
        results = []
        for doc_id, data in self._store.items():
            if data is None:
                continue
            match = True
            for field, op, value in self._filters:
                parts = field.split(".")
                v = data
                for p in parts:
                    v = v.get(p) if isinstance(v, dict) else None
                if op == "==" and v != value:
                    match = False
                elif op == "in" and v not in value:
                    match = False
            if match:
                results.append(_DemoDocSnap(data, doc_id=doc_id))
        if self._limit:
            results = results[:self._limit]
        return results

    def get(self):
        return list(self.stream())


class _DemoCollRef:
    def __init__(self, store):
        self._store = store

    def document(self, doc_id):
        return _DemoDocRef(self._store, doc_id)

    def add(self, data):
        doc_id = str(uuid.uuid4())
        self._store[doc_id] = data
        return doc_id

    def where(self, field, op, value):
        return _DemoQuery(self._store).where(field, op, value)

    def stream(self):
        return _DemoQuery(self._store).stream()


class _DemoBucket:
    def blob(self, name):
        return _DemoBlob(name)


class _DemoBlob:
    def __init__(self, name):
        self.name = name
        self._content = None

    def upload_from_string(self, data, content_type=None):
        self._content = data

    def make_public(self):
        pass

    @property
    def public_url(self):
        return f"https://storage.googleapis.com/demo-bucket/{self.name}"


class _DemoAuth:
    class UserNotFoundError(Exception):
        pass

    def create_user(self, email, password, display_name=None):
        uid = f"demo_{uuid.uuid4().hex[:8]}"
        _demo_users[uid] = {
            "uid": uid,
            "email": email,
            "display_name": display_name or email,
            "role": "buyer",
        }
        return type("User", (), {"uid": uid, "email": email, "display_name": display_name})()

    def get_user_by_email(self, email):
        for u in _demo_users.values():
            if u.get("email") == email:
                return type("User", (), {"uid": u["uid"], "email": u["email"], "display_name": u.get("display_name")})()
        raise self.UserNotFoundError("User not found")

    def verify_id_token(self, token):
        # In demo mode, accept any token that starts with "demo_"
        if token.startswith("demo_"):
            return {"uid": token}
        raise ValueError("Invalid token")


# In-memory demo stores
_demo_users = {}
_demo_assets = {}
_demo_transactions = {}
_demo_violations = {}


def _init_demo_mode():
    global DEMO_MODE, db, bucket, auth_client
    global users_ref, assets_ref, transactions_ref, violations_ref
    DEMO_MODE = True

    class DemoDB:
        def collection(self, name):
            if name == "users":
                return _DemoCollRef(_demo_users)
            if name == "assets":
                return _DemoCollRef(_demo_assets)
            if name == "transactions":
                return _DemoCollRef(_demo_transactions)
            if name == "violations":
                return _DemoCollRef(_demo_violations)
            return _DemoCollRef({})

    db = DemoDB()
    bucket = _DemoBucket()
    auth_client = _DemoAuth()
    users_ref = db.collection("users")
    assets_ref = db.collection("assets")
    transactions_ref = db.collection("transactions")
    violations_ref = db.collection("violations")
    print("[DEMO MODE] Firebase credentials not found. Running with in-memory stores.")
    print("[DEMO MODE] Use token 'demo_<uid>' in Authorization header for testing.")
    print("[DEMO MODE] Pre-seeded demo user: athlete@demo.com / buyer@demo.com / admin@demo.com")

    # Pre-seed demo data
    _seed_demo_data()


def _seed_demo_data():
    _demo_users["athlete_demo_001"] = {
        "uid": "athlete_demo_001",
        "email": "athlete@demo.com",
        "display_name": "Marcus Thompson",
        "role": "athlete",
        "wallet_address": "0xA1B2C3D4E5F6789012345678901234567890ABCD",
        "stats": {"assets_count": 3, "total_earnings": 1250.0},
    }
    _demo_users["buyer_demo_001"] = {
        "uid": "buyer_demo_001",
        "email": "buyer@demo.com",
        "display_name": "Alex Fan",
        "role": "buyer",
        "wallet_address": "0xB2C3D4E5F6789012345678901234567890ABCDE1",
        "stats": {"assets_count": 0, "total_earnings": 0},
    }
    _demo_users["admin_demo_001"] = {
        "uid": "admin_demo_001",
        "email": "admin@demo.com",
        "display_name": "Admin User",
        "role": "admin",
        "wallet_address": "0xC3D4E5F6789012345678901234567890ABCDE12",
        "stats": {"assets_count": 0, "total_earnings": 0},
    }

    for asset in [
        {
            "asset_id": "asset_demo_001",
            "title": "Championship Goal Celebration",
            "description": "The winning goal from the 2024 Championship final.",
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
            "ownership_history": [
                {"action": "minted", "from": "0x0000...0000", "to": "0xA1B2...3C4D", "date": "2024-01-17"}
            ],
            "created_at": "2024-01-17T08:15:00Z",
            "updated_at": "2024-01-17T08:15:00Z",
        },
    ]:
        _demo_assets[asset["asset_id"]] = asset

    _demo_violations["vio_001"] = {
        "type": "unauthorized_duplicate",
        "status": "pending",
        "confidence_score": 0.94,
        "suspected_asset": {
            "asset_id": "asset_suspicious_001",
            "title": "Championship Goal Copy",
        },
        "original_asset": {
            "asset_id": "asset_demo_001",
            "owner_id": "athlete_demo_001",
            "title": "Championship Goal Celebration",
        },
        "detected_at": "2024-01-20T10:00:00Z",
    }


def _init_firebase():
    global DEMO_MODE, db, bucket, auth_client
    global users_ref, assets_ref, transactions_ref, violations_ref

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, storage, auth as firebase_auth
    except ImportError:
        _init_demo_mode()
        return

    try:
        firebase_admin.get_app()
    except ValueError:
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        cred = None
        if service_account_json:
            try:
                cred_info = json.loads(service_account_json)
                cred = credentials.Certificate(cred_info)
            except Exception:
                pass
        else:
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-service-account.json")
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)

        if cred is None:
            _init_demo_mode()
            return

        firebase_admin.initialize_app(cred, {
            "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET", ""),
        })

    db = firestore.client()
    bucket = storage.bucket()
    auth_client = firebase_auth
    users_ref = db.collection("users")
    assets_ref = db.collection("assets")
    transactions_ref = db.collection("transactions")
    violations_ref = db.collection("violations")


_init_firebase()


# ArrayUnion helper that works in both real and demo modes
class ArrayUnion:
    """Cross-mode ArrayUnion for Firestore updates."""
    def __init__(self, items):
        self.items = items


def safe_update(doc_ref, updates):
    """Perform an update supporting ArrayUnion in both real and demo mode."""
    if DEMO_MODE:
        snap = doc_ref.get()
        data = snap.to_dict() or {}
        for key, value in updates.items():
            if isinstance(value, ArrayUnion):
                existing = data.get(key, [])
                if not isinstance(existing, list):
                    existing = []
                data[key] = existing + value.items
            else:
                data[key] = value
        doc_ref.set(data)
    else:
        from google.cloud import firestore
        real_updates = {}
        for key, value in updates.items():
            if isinstance(value, ArrayUnion):
                real_updates[key] = firestore.ArrayUnion(value.items)
            else:
                real_updates[key] = value
        doc_ref.update(real_updates)


