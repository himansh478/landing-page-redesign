import requests
import base64
import os
import io
import sys
import uuid
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class UploadService:

    def upload_to_imgbb(self, file_bytes, filename: str) -> str:
        """Upload file bytes to ImgBB and return the direct image URL."""
        if not Config.IMGBB_API_KEY:
            logger.error("IMGBB_API_KEY is not set in environment.")
            raise ValueError("Cloud storage API key missing.")

        url = "https://api.imgbb.com/1/upload"
        payload = {
            "key": Config.IMGBB_API_KEY,
            "name": filename.rsplit('.', 1)[0] if '.' in filename else filename
        }
        
        # ImgBB expects image as binary file in Multipart form
        files = {
            "image": (filename, file_bytes)
        }

        try:
            response = requests.post(url, data=payload, files=files)
            response.raise_for_status()
            data = response.json()
            if data.get("success"):
                return data["data"]["url"]
            else:
                raise Exception(f"ImgBB error: {data.get('error', {}).get('message', 'Unknown error')}")
        except Exception as e:
            logger.error(f"Failed to upload to ImgBB: {e}")
            raise

    def save_photo(self, file_path: str, filename: str) -> str:
        """
        Upload a local file to ImgBB.
        Returns the cloud URL.
        """
        with open(file_path, 'rb') as f:
            file_bytes = f.read()
        return self.upload_to_imgbb(file_bytes, filename)

    def save_to_temp(self, file_storage) -> str:
        """Save file to local TEMP_DIR for processing. Returns absolute path."""
        os.makedirs(Config.TEMP_DIR, exist_ok=True)
        ext = self._get_ext(file_storage.filename)
        filename = f"proc_{uuid.uuid4().hex}.{ext}"
        dest = os.path.join(Config.TEMP_DIR, filename)
        file_storage.save(dest)
        return dest

    def cleanup_temp(self, path: str):
        """Delete a temporary file."""
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception as e:
            logger.error(f"Failed to cleanup temp file {path}: {e}")

    def save_temp_photo(self, file_storage) -> str:
        """
        Save user selfie to local TEMP_DIR for processing.
        """
        return self.save_to_temp(file_storage)

    def generate_thumbnail(self, local_path: str) -> str:
        """
        Create a thumbnail from a local file and upload to ImgBB.
        Returns the cloud URL.
        """
        try:
            img = Image.open(local_path).convert('RGB')
            img.thumbnail(Config.THUMBNAIL_SIZE if hasattr(Config, 'THUMBNAIL_SIZE') else (400,400), Image.LANCZOS)

            # Save thumb to memory
            thumb_io = io.BytesIO()
            img.save(thumb_io, format='JPEG', quality=85)
            thumb_io.seek(0)

            # Upload thumb to ImgBB
            thumb_url = self.upload_to_imgbb(thumb_io.read(), f"thumb_{os.path.basename(local_path)}")
            return thumb_url
        except Exception as e:
            logger.error(f"Thumbnail generation/upload failed: {e}")
            return ""

    def _get_ext(self, filename: str) -> str:
        if filename and '.' in filename:
            ext = filename.rsplit('.', 1)[1].lower()
            if ext in Config.ALLOWED_EXTENSIONS:
                return ext
        return 'jpg'
