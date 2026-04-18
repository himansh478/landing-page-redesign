from flask import Blueprint, request, jsonify, redirect
import os
import sys
import uuid
import logging
import requests

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config
from database.db import get_conn, release_conn
from models.face_engine import get_engine
from services.upload_service import UploadService
from services.matching_service import MatchingService
from psycopg2.extras import RealDictCursor

user_bp = Blueprint('user', __name__)
logger = logging.getLogger(__name__)
upload_service = UploadService()
matching_service = MatchingService()


@user_bp.route('/api/user/verify-code', methods=['POST'])
def verify_code():
    code = (request.json or {}).get('code', '').strip().upper()
    if not code:
        return jsonify({'valid': False, 'error': 'Code is required'}), 400

    conn = get_conn()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM photographers WHERE code=%s", (code,))
        p = cursor.fetchone()
        cursor.close()
    finally:
        release_conn(conn)

    if not p:
        return jsonify({'valid': False, 'error': 'Invalid event code'}), 400

    return jsonify({
        'valid': True,
        'event_name': p['event_name'],
        'photographer_name': p['name'],
        'photographer_id': p['id'],
        'total_photos': p['total_photos']
    })


@user_bp.route('/api/user/upload-selfie', methods=['POST'])
def upload_selfie():
    code = request.form.get('code', '').strip().upper()
    photo = request.files.get('photo')

    if not code or not photo:
        return jsonify({'error': 'code and photo are required'}), 400

    conn = get_conn()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM photographers WHERE code=%s", (code,))
        p = cursor.fetchone()
        cursor.close()
    finally:
        release_conn(conn)

    if not p:
        return jsonify({'error': 'Invalid event code'}), 401

    photographer_id = p['id']

    # 1. Save selfie to temp for processing
    temp_path = upload_service.save_temp_photo(photo)

    # 2. Extract face embedding
    engine = get_engine(Config.INSIGHTFACE_DIR)
    if not engine.is_ready():
        upload_service.cleanup_temp(temp_path)
        return jsonify({'error': 'Face recognition engine not ready.'}), 503

    user_embedding = engine.get_user_embedding(temp_path)
    if user_embedding is None:
        upload_service.cleanup_temp(temp_path)
        return jsonify({'error': 'No face detected in your photo.'}), 400

    # 3. Upload selfie to ImgBB for persistence
    try:
        cloud_selfie_url = upload_service.save_photo(temp_path, "selfie.jpg")
    except Exception:
        cloud_selfie_url = ""

    # 4. Find matching photos
    matches = matching_service.find_matches(user_embedding, photographer_id)

    # 5. Create session in Supabase
    session_id = str(uuid.uuid4())
    conn = get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO user_sessions (id, photographer_id, selfie_path, matched_count) VALUES (%s,%s,%s,%s)",
            (session_id, photographer_id, cloud_selfie_url, len(matches))
        )
        conn.commit()
        cursor.close()
    finally:
        release_conn(conn)

    # Cleanup temp
    upload_service.cleanup_temp(temp_path)

    # Attach session_id to each download URL
    for m in matches:
        m['download_url'] = f"{m['download_url']}?session_id={session_id}"

    return jsonify({
        'session_id': session_id,
        'matched_count': len(matches),
        'photos': matches
    })


@user_bp.route('/api/user/download/<photo_id>', methods=['GET'])
def download_photo(photo_id):
    session_id = request.args.get('session_id', '')

    conn = get_conn()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM photos WHERE id=%s", (photo_id,))
        photo = cursor.fetchone()
        cursor.close()
    finally:
        release_conn(conn)

    if not photo:
        return jsonify({'error': 'Photo not found'}), 404

    # Log download
    if session_id:
        conn = get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO download_logs (id, session_id, photo_id) VALUES (%s,%s,%s)",
                (str(uuid.uuid4()), session_id, photo_id)
            )
            conn.commit()
            cursor.close()
        except Exception:
            pass
        finally:
            release_conn(conn)

    # Redirect to cloud URL instead of serving file locally
    return redirect(photo['file_path'])
