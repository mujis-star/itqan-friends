import os
import json
import uuid
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Firebase Admin
db = None

def init_firebase():
    global db
    try:
        firebase_cred = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
        
        if firebase_cred:
            try:
                cred_dict = json.loads(firebase_cred)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                db = firestore.client()
                print("Firebase initialized successfully")
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print("Make sure the FIREBASE_SERVICE_ACCOUNT env var contains valid JSON")
        else:
            print("FIREBASE_SERVICE_ACCOUNT environment variable not found")
            print("Firestore will be disabled, but the server will still run")
            
    except Exception as e:
        print(f"Firebase initialization error: {e}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def verify_token(token):
    if not db:
        return {'uid': 'test-user', 'name': 'Test User'}
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

@app.route('/')
def home():
    return jsonify({'status': 'ok', 'message': 'ITQAN Backend is running'})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_image():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        auth_header = request.headers.get('Authorization')
        user = None
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[1]
            user = verify_token(token)
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        caption = request.form.get('caption', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get the base URL from request
        base_url = request.host_url.rstrip('/')
        file_url = f"{base_url}/uploads/{filename}"
        
        # Save to Firestore if available
        doc_id = None
        if db:
            try:
                doc_ref = db.collection('gallery').add({
                    'imageUrl': file_url,
                    'caption': caption or 'Untitled',
                    'fileName': filename,
                    'uploadedBy': user.get('name', 'Unknown') if user else 'Unknown',
                    'createdAt': firestore.SERVER_TIMESTAMP
                })
                doc_id = doc_ref[1].id
            except Exception as e:
                print(f"Firestore save error: {e}")
        
        return jsonify({
            'success': True,
            'fileUrl': file_url,
            'docId': doc_id,
            'message': 'Upload successful'
        }), 200
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Initialize Firebase on startup
init_firebase()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
