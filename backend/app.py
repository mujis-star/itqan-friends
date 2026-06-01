import os
import json
import uuid
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
GALLERY_FILE = 'gallery_data.json'
MAGAZINE_FILE = 'magazine_data.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # 25MB for PDFs

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_data(filename):
    if os.path.exists(filename):
        try:
            with open(filename, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_data(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

# ===== GALLERY ENDPOINTS =====
@app.route('/gallery', methods=['GET'])
def get_gallery():
    data = load_data(GALLERY_FILE)
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
        
        ext = file.filename.rsplit('.', 1)[1].lower()
        if ext not in ['png', 'jpg', 'jpeg', 'gif', 'webp']:
            return jsonify({'error': 'Only image files allowed for gallery'}), 400
        
        filename = f"{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        base_url = request.host_url.rstrip('/')
        file_url = f"{base_url}/uploads/{filename}"
        
        data = load_data(GALLERY_FILE)
        new_item = {
            'id': str(uuid.uuid4()),
            'imageUrl': file_url,
            'caption': caption or 'Untitled',
            'fileName': filename,
            'type': 'image',
            'createdAt': datetime.datetime.now().isoformat()
        }
        data.insert(0, new_item)
        save_data(data, GALLERY_FILE)
        
        return jsonify({'success': True, 'fileUrl': file_url, 'message': 'Upload successful'}), 200
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/delete/<item_id>', methods=['DELETE', 'OPTIONS'])
def delete_gallery_item(item_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = load_data(GALLERY_FILE)
        item = next((x for x in data if x['id'] == item_id), None)
        
        if item:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], item['fileName'])
            if os.path.exists(filepath):
                os.remove(filepath)
            data = [x for x in data if x['id'] != item_id]
            save_data(data, GALLERY_FILE)
        
        return jsonify({'success': True, 'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== MAGAZINE ENDPOINTS =====
@app.route('/magazines', methods=['GET'])
def get_magazines():
    data = load_data(MAGAZINE_FILE)
    return jsonify(data), 200

@app.route('/upload-magazine', methods=['POST', 'OPTIONS'])
def upload_magazine():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        title = request.form.get('title', '')
        mag_type = request.form.get('type', 'magazine')
        description = request.form.get('description', '')
        
        # Handle cover image
        cover_file = request.files.get('cover')
        pdf_file = request.files.get('pdf')
        
        if not cover_file:
            return jsonify({'error': 'Cover image required'}), 400
        
        # Save cover image
        cover_ext = cover_file.filename.rsplit('.', 1)[1].lower()
        cover_filename = f"cover_{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{cover_ext}"
        cover_path = os.path.join(app.config['UPLOAD_FOLDER'], cover_filename)
        cover_file.save(cover_path)
        
        base_url = request.host_url.rstrip('/')
        cover_url = f"{base_url}/uploads/{cover_filename}"
        
        # Save PDF if provided
        pdf_url = None
        pdf_filename = None
        if pdf_file and pdf_file.filename:
            pdf_ext = pdf_file.filename.rsplit('.', 1)[1].lower()
            pdf_filename = f"pdf_{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{pdf_ext}"
            pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename)
            pdf_file.save(pdf_path)
            pdf_url = f"{base_url}/uploads/{pdf_filename}"
        
        # Save to JSON
        data = load_data(MAGAZINE_FILE)
        new_item = {
            'id': str(uuid.uuid4()),
            'title': title,
            'type': mag_type,
            'description': description,
            'coverUrl': cover_url,
            'pdfUrl': pdf_url,
            'fileName': cover_filename,
            'pdfFileName': pdf_filename,
            'createdAt': datetime.datetime.now().isoformat()
        }
        data.insert(0, new_item)
        save_data(data, MAGAZINE_FILE)
        
        return jsonify({'success': True, 'message': 'Magazine added successfully'}), 200
        
    except Exception as e:
        print(f"Magazine upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/delete-magazine/<item_id>', methods=['DELETE', 'OPTIONS'])
def delete_magazine(item_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = load_data(MAGAZINE_FILE)
        item = next((x for x in data if x['id'] == item_id), None)
        
        if item:
            # Delete cover image
            cover_path = os.path.join(app.config['UPLOAD_FOLDER'], item['fileName'])
            if os.path.exists(cover_path):
                os.remove(cover_path)
            
            # Delete PDF if exists
            if item.get('pdfFileName'):
                pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], item['pdfFileName'])
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
            
            data = [x for x in data if x['id'] != item_id]
            save_data(data, MAGAZINE_FILE)
        
        return jsonify({'success': True, 'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
