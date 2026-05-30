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
        
        # Save file
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get the base URL from request
        base_url = request.host_url.rstrip('/')
        file_url = f"{base_url}/uploads/{filename}"
        
        # Save to Firestore
        if db:
            doc_ref = db.collection('gallery').add({
                'imageUrl': file_url,
                'caption': caption or 'Untitled',
                'fileName': filename,
                'uploadedBy': user.get('name', 'Unknown') if user else 'Unknown',
                'createdAt': firestore.SERVER_TIMESTAMP
            })
            print(f"Saved to Firestore with URL: {file_url}")  # Debug log
        
        return jsonify({
            'success': True,
            'fileUrl': file_url,
            'message': 'Upload successful'
        }), 200
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500
