import os
import sys
import logging
import threading

# Add backend dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from config import Config
from database.db import init_db, init_pool
from api.photographer import photographer_bp
from api.user import user_bp
from models.face_engine import get_engine

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Create Flask App ---
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='/static')

# 🛡️ SECURITY UPGRADE 1: Strict CORS
# Ab koi aur domain postman ya apne server se API nahi chura sakta
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH

# 🛡️ SECURITY UPGRADE 2: Anti-Hijack IFrame (Content Security Policy)
# Yeh ensure karega ki sirf aapki website hi isko Iframe bana sake!
@app.after_request
def add_security_headers(response):
    # DHYAN DEIN: Jab aap final web par deploy karein toh apni domain add kar lein
    # allowed_domains = "'self' http://localhost:5173 http://localhost:5174"
        # Yeh line paste karein
    allowed_domains = "'self' https://huggingface.co https://*.hf.space http://localhost:5173 http://localhost:5174 https://*.vercel.app https://landing-page-redesign-beta.vercel.app"

    response.headers['Content-Security-Policy'] = f"frame-ancestors {allowed_domains};"
    return response

# 🛡️ SECURITY UPGRADE 3: Global Error Guard
# Server crash hone se pehle user ko polite message dega
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Server Error: {e}")
    return jsonify({
        "error": "Server is processing too many requests. Please wait a moment and try again."
    }), 503

# --- Register Blueprints ---
app.register_blueprint(photographer_bp)
app.register_blueprint(user_bp)

# --- Serve Frontend Static Pages ---
@app.route('/')
def index():
    return send_from_directory(STATIC_DIR, 'index.html')

@app.route('/photographer')
@app.route('/photographer/')
def photographer_page():
    return send_from_directory(os.path.join(STATIC_DIR, 'photographer'), 'index.html')

@app.route('/user')
@app.route('/user/')
def user_page():
    return send_from_directory(os.path.join(STATIC_DIR, 'user'), 'index.html')

# --- Health Check ---
@app.route('/api/health')
def health():
    engine = get_engine()
    return {
        'status': 'healthy',
        'face_engine': 'ready' if engine.is_ready() else 'loading'
    }

# --- Initialization (Run on startup/import) ---
def startup_init():
    try:
        logger.info("Initializing connection pool...")
        init_pool()
        logger.info("Connection pool ready.")
    except Exception as e:
        logger.error(f"Connection pool init failed: {e}")

    try:
        logger.info("Initializing database tables...")
        init_db()
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

    logger.info("Starting face recognition engine in background thread...")
    def _load_engine_bg():
        try:
            get_engine(Config.INSIGHTFACE_DIR)
            logger.info("Face recognition engine is ready!")
        except Exception as e:
            logger.error(f"Face engine failed to load: {e}")

    bg_thread = threading.Thread(target=_load_engine_bg, daemon=True)
    bg_thread.start()

# Execute startup
startup_init()

if __name__ == '__main__':
    logger.info(f"Starting AI Photo Sharing on http://{Config.HOST}:{Config.PORT}")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG, use_reloader=False)


# import os
# import sys
# import logging
# import threading

# # Add backend dir to path
# sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# from flask import Flask, send_from_directory
# from flask_cors import CORS
# from dotenv import load_dotenv

# # Load environment variables from .env
# load_dotenv()

# from config import Config
# from database.db import init_db, init_pool
# from api.photographer import photographer_bp
# from api.user import user_bp
# from models.face_engine import get_engine

# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s [%(levelname)s] %(name)s - %(message)s'
# )
# logger = logging.getLogger(__name__)

# # --- Create Flask App ---
# STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')
# app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='/static')
# CORS(app)
# app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH

# # --- Register Blueprints ---
# app.register_blueprint(photographer_bp)
# app.register_blueprint(user_bp)

# # --- Serve Frontend Static Pages ---
# @app.route('/')
# def index():
#     return send_from_directory(STATIC_DIR, 'index.html')

# @app.route('/photographer')
# @app.route('/photographer/')
# def photographer_page():
#     return send_from_directory(os.path.join(STATIC_DIR, 'photographer'), 'index.html')

# @app.route('/user')
# @app.route('/user/')
# def user_page():
#     return send_from_directory(os.path.join(STATIC_DIR, 'user'), 'index.html')

# # --- Health Check ---
# @app.route('/api/health')
# def health():
#     engine = get_engine()
#     return {
#         'status': 'healthy',
#         'face_engine': 'ready' if engine.is_ready() else 'loading'
#     }

# # --- Initialization (Run on startup/import) ---
# def startup_init():
#     # Initialize connection pool first
#     try:
#         logger.info("Initializing connection pool...")
#         init_pool()
#         logger.info("Connection pool ready.")
#     except Exception as e:
#         logger.error(f"Connection pool init failed: {e}")

#     # Initialize database tables (Supabase/PostgreSQL)
#     try:
#         logger.info("Initializing database tables...")
#         init_db()
#     except Exception as e:
#         logger.error(f"Database initialization failed: {e}")

#     # Load face engine in background so server starts immediately
#     logger.info("Starting face recognition engine in background thread...")
#     def _load_engine_bg():
#         try:
#             get_engine(Config.INSIGHTFACE_DIR)
#             logger.info("Face recognition engine is ready!")
#         except Exception as e:
#             logger.error(f"Face engine failed to load: {e}")

#     bg_thread = threading.Thread(target=_load_engine_bg, daemon=True)
#     bg_thread.start()

# # Execute startup
# startup_init()

# # --- Main ---
# if __name__ == '__main__':
#     logger.info(f"Starting AI Photo Sharing on http://{Config.HOST}:{Config.PORT}")
#     app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG, use_reloader=False)
