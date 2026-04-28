import os
import hashlib
import io
from typing import Optional

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

from app.config.firebase import bucket


class StorageService:
    """Firebase Storage wrapper for file uploads."""

    def upload_file(self, file_bytes: bytes, filename: str, content_type: str) -> str:
        """Upload file to Firebase Storage and return public URL."""
        ext = os.path.splitext(filename)[1] or ".bin"
        blob_name = f"assets/{hashlib.md5(file_bytes).hexdigest()}{ext}"
        blob = bucket.blob(blob_name)
        blob.upload_from_string(file_bytes, content_type=content_type)
        try:
            blob.make_public()
            return blob.public_url
        except Exception:
            # Demo mode fallback
            return f"https://storage.googleapis.com/demo-bucket/{blob_name}"

    def compute_sha256(self, data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    def generate_thumbnail(self, image_bytes: bytes, size=(256, 256)) -> bytes:
        """Generate a thumbnail for preview."""
        if not HAS_PIL:
            return image_bytes
        image = Image.open(io.BytesIO(image_bytes))
        image.thumbnail(size)
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        return buffer.getvalue()


storage_service = StorageService()
