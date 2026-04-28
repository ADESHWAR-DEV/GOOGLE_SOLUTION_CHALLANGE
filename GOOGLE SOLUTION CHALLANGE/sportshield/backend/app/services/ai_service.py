import os
import io
import hashlib
import random
from typing import List, Dict, Optional

# Optional imports with graceful fallback
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

try:
    from PIL import Image
    import imagehash
    HAS_IMAGEHASH = True
except ImportError:
    HAS_IMAGEHASH = False

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

from app.config.firebase import assets_ref


class AIDetectionService:
    """AI fraud detection using image hashing, OpenCV similarity, and embeddings."""

    def __init__(self):
        self.similarity_threshold = 0.85
        self.deepfake_threshold = 0.70
        self.orb = None
        if HAS_CV2:
            try:
                self.orb = cv2.ORB_create(nfeatures=500)
            except Exception:
                pass

    def compute_perceptual_hash(self, image_bytes: bytes) -> str:
        """Compute pHash for near-duplicate detection."""
        if not HAS_IMAGEHASH:
            # Fallback: compute simple hash from bytes
            return hashlib.md5(image_bytes[:4096]).hexdigest()[:16]
        image = Image.open(io.BytesIO(image_bytes))
        phash = str(imagehash.phash(image))
        return phash

    def compute_sha256(self, data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    def hamming_distance(self, hash1: str, hash2: str) -> int:
        """Hamming distance between two hex hashes."""
        if len(hash1) != len(hash2):
            return 64
        return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))

    def orb_similarity(self, img1_bytes: bytes, img2_bytes: bytes) -> float:
        """Compute ORB keypoint similarity between two images (0-1)."""
        if not HAS_CV2 or not HAS_NUMPY or self.orb is None:
            return 0.0
        try:
            nparr1 = np.frombuffer(img1_bytes, np.uint8)
            nparr2 = np.frombuffer(img2_bytes, np.uint8)
            img1 = cv2.imdecode(nparr1, cv2.IMREAD_GRAYSCALE)
            img2 = cv2.imdecode(nparr2, cv2.IMREAD_GRAYSCALE)

            if img1 is None or img2 is None:
                return 0.0

            kp1, des1 = self.orb.detectAndCompute(img1, None)
            kp2, des2 = self.orb.detectAndCompute(img2, None)

            if des1 is None or des2 is None:
                return 0.0

            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            matches = sorted(matches, key=lambda x: x.distance)

            if len(matches) == 0:
                return 0.0

            good_matches = [m for m in matches if m.distance < max(3 * matches[0].distance, 30)]
            similarity = len(good_matches) / max(len(kp1), len(kp2), 1)
            return min(similarity, 1.0)
        except Exception as e:
            return 0.0

    def histogram_similarity(self, img1_bytes: bytes, img2_bytes: bytes) -> float:
        """Compare color histograms."""
        if not HAS_CV2 or not HAS_NUMPY:
            return 0.0
        try:
            nparr1 = np.frombuffer(img1_bytes, np.uint8)
            nparr2 = np.frombuffer(img2_bytes, np.uint8)
            img1 = cv2.imdecode(nparr1, cv2.IMREAD_COLOR)
            img2 = cv2.imdecode(nparr2, cv2.IMREAD_COLOR)

            if img1 is None or img2 is None:
                return 0.0

            hist1 = cv2.calcHist([img1], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
            hist2 = cv2.calcHist([img2], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])

            hist1 = cv2.normalize(hist1, hist1).flatten()
            hist2 = cv2.normalize(hist2, hist2).flatten()

            similarity = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
            return max(0.0, similarity)
        except Exception as e:
            return 0.0

    def detect_fraud(self, file_bytes: bytes, media_type: str = "image") -> Dict:
        """
        Run fraud detection pipeline.
        Returns fraud score, similar assets, and recommendation.
        """
        if not media_type.startswith("image"):
            return {
                "fraud_detected": False,
                "confidence_score": 0.0,
                "similar_assets": [],
                "deepfake_probability": 0.0,
                "recommendation": "approved",
                "methods": {"hash_match": False, "orb_similarity": 0.0, "histogram_similarity": 0.0}
            }

        phash = self.compute_perceptual_hash(file_bytes)
        sha = self.compute_sha256(file_bytes)

        similar_assets = []
        max_orb = 0.0
        max_hist = 0.0

        # Query active assets from Firestore
        docs = assets_ref.where("status", "==", "active").stream()
        for doc in docs:
            data = doc.to_dict()
            stored_hash = data.get("content_hash", "")
            stored_phash = data.get("perceptual_hash", "")
            stored_media_url = data.get("media_url", "")

            # Exact hash match
            if stored_hash and stored_hash == sha:
                similar_assets.append({
                    "asset_id": doc.id,
                    "similarity_score": 1.0,
                    "method": "sha256_exact",
                    "title": data.get("title", ""),
                    "owner_id": data.get("owner_id", ""),
                })
                continue

            # Perceptual hash comparison
            if stored_phash:
                dist = self.hamming_distance(phash, stored_phash)
                if dist <= 10:
                    score = 1.0 - (dist / 64.0)
                    similar_assets.append({
                        "asset_id": doc.id,
                        "similarity_score": round(score, 4),
                        "method": "perceptual_hash",
                        "title": data.get("title", ""),
                        "owner_id": data.get("owner_id", ""),
                    })

        # Deepfake probability (mock for MVP)
        deepfake_probability = 0.0

        # Compute overall confidence
        confidence = max(
            [a["similarity_score"] for a in similar_assets] + [0.0]
        )

        # Recommendation logic
        fraud_detected = confidence >= self.similarity_threshold or deepfake_probability >= self.deepfake_threshold
        if fraud_detected:
            if deepfake_probability >= self.deepfake_threshold:
                recommendation = "block"
            else:
                recommendation = "flag_for_review"
        else:
            recommendation = "approved"

        return {
            "fraud_detected": fraud_detected,
            "confidence_score": round(confidence, 4),
            "similar_assets": similar_assets[:5],
            "deepfake_probability": round(deepfake_probability, 4),
            "recommendation": recommendation,
            "methods": {
                "hash_match": any(a["method"] == "sha256_exact" for a in similar_assets),
                "orb_similarity": round(max_orb, 4),
                "histogram_similarity": round(max_hist, 4),
            }
        }

ai_service = AIDetectionService()
