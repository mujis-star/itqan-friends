import os
import json
import uuid
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
DATA_FILE = 'gallery_data.json'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

@app.route('/gallery', methods=['GET'])
def get_gallery():
    data = load_data()
    return jsonify(data), 200

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_image():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        caption = request.form.get('caption', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        base_url = request.host_url.rstrip('/')
        file_url = f"{base_url}/uploads/{filename}"
        
        data = load_data()
        new_item = {
            'id': str(uuid.uuid4()),
            'imageUrl': file_url,
            'caption': caption or 'Untitled',
            'fileName': filename,
            'createdAt': datetime.datetime.now().isoformat()
        }
        data.insert(0, new_item)
        save_data(data)
        
        return jsonify({
            'success': True,
            'fileUrl': file_url,
            'message': 'Upload successful'
        }), 200
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/delete/<item_id>', methods=['DELETE', 'OPTIONS'])
def delete_image(item_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = load_data()
        item = next((x for x in data if x['id'] == item_id), None)
        
        if item:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], item['fileName'])
            if os.path.exists(filepath):
                os.remove(filepath)
            data = [x for x in data if x['id'] != item_id]
            save_data(data)
        
        return jsonify({'success': True, 'message': 'Deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
