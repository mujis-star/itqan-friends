import os
import json
import uuid
import datetime
import mimetypes
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Optional Google Drive support. The backend will use Drive when these env vars exist:
# GOOGLE_DRIVE_FOLDER_ID and either GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS
try:
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseUpload
except Exception:  # Keep local fallback working if Drive packages are not installed yet.
    service_account = None
    Credentials = None
    build = None
    MediaIoBaseUpload = None

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
DATA_DIR = os.environ.get('DATA_DIR', '.')
GALLERY_FILE = os.path.join(DATA_DIR, 'gallery_data.json')
MAGAZINE_FILE = os.path.join(DATA_DIR, 'magazine_data.json')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'mp4', 'webm', 'mov', 'mkv', 'avi'}
def normalize_drive_folder_id(value):
    value = (value or '').strip()
    if not value:
        return ''
    match = re.search(r'/folders/([a-zA-Z0-9_-]+)', value)
    if match:
        return match.group(1)
    # If someone pasted an id with query params, keep only the id part.
    return value.split('?')[0].split('&')[0].strip()


DRIVE_FOLDER_ID = normalize_drive_folder_id(os.environ.get('GOOGLE_DRIVE_FOLDER_ID', ''))
DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive']
_drive_service = None

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB for Videos & PDFs

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)


def get_service_account_json_env():
    # Prefer the Google Drive-specific variable, but also support the existing
    # FIREBASE_SERVICE_ACCOUNT variable many deployments already use.
    return os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON') or os.environ.get('FIREBASE_SERVICE_ACCOUNT')


def oauth_configured():
    return bool(
        os.environ.get('GOOGLE_CLIENT_ID') and
        os.environ.get('GOOGLE_CLIENT_SECRET') and
        os.environ.get('GOOGLE_REFRESH_TOKEN') and
        Credentials
    )


def service_account_configured():
    return bool(service_account and (get_service_account_json_env() or os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')))


def drive_enabled():
    return bool(DRIVE_FOLDER_ID and build and MediaIoBaseUpload and (oauth_configured() or service_account_configured()))


def get_drive_service():
    global _drive_service
    if _drive_service:
        return _drive_service
    if not drive_enabled():
        raise RuntimeError('Google Drive is not configured on the backend')

    if oauth_configured():
        # OAuth uploads use the real Google account's Drive quota. This is needed for
        # personal Google Drive accounts because service accounts have no My Drive quota.
        creds = Credentials(
            token=None,
            refresh_token=os.environ['GOOGLE_REFRESH_TOKEN'],
            token_uri='https://oauth2.googleapis.com/token',
            client_id=os.environ['GOOGLE_CLIENT_ID'],
            client_secret=os.environ['GOOGLE_CLIENT_SECRET'],
            scopes=DRIVE_SCOPES,
        )
    else:
        service_account_json = get_service_account_json_env()
        if service_account_json:
            info = json.loads(service_account_json)
            creds = service_account.Credentials.from_service_account_info(info, scopes=DRIVE_SCOPES)
        else:
            creds = service_account.Credentials.from_service_account_file(
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'], scopes=DRIVE_SCOPES
            )

    _drive_service = build('drive', 'v3', credentials=creds, cache_discovery=False)
    return _drive_service


def make_drive_public(service, file_id):
    try:
        service.permissions().create(
            fileId=file_id,
            body={'type': 'anyone', 'role': 'reader'},
            fields='id'
        ).execute()
    except Exception as e:
        print(f'Could not make Drive file public: {e}')


def drive_image_url(file_id):
    # Works better in <img> than the normal Drive preview page.
    return f'https://drive.google.com/thumbnail?id={file_id}&sz=w1600'


def drive_view_url(file_id):
    return f'https://drive.google.com/file/d/{file_id}/view?usp=drivesdk'


def drive_download_url(file_id):
    return f'https://drive.google.com/uc?export=download&id={file_id}'


def upload_to_drive(file_storage, filename, mime_type, app_properties):
    service = get_drive_service()
    metadata = {
        'name': filename,
        'parents': [DRIVE_FOLDER_ID],
        'appProperties': {k: str(v) for k, v in (app_properties or {}).items() if v is not None}
    }
    media = MediaIoBaseUpload(file_storage.stream, mimetype=mime_type, resumable=False)
    created = service.files().create(
        body=metadata,
        media_body=media,
        fields='id,name,mimeType,createdTime,appProperties'
    ).execute()
    make_drive_public(service, created['id'])
    return created


def list_drive_items(kind):
    service = get_drive_service()
    query = (
        f"'{DRIVE_FOLDER_ID}' in parents and trashed = false and "
        f"appProperties has {{ key='kind' and value='{kind}' }}"
    )
    result = service.files().list(
        q=query,
        fields='files(id,name,mimeType,createdTime,appProperties)',
        orderBy='createdTime desc',
        pageSize=1000
    ).execute()
    return result.get('files', [])


def load_data(filename):
    if os.path.exists(filename):
        try:
            with open(filename, 'r') as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_data(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Server is running',
        'version': 'oauth-drive-v2',
        'driveEnabled': drive_enabled(),
        'storage': 'google-drive' if drive_enabled() else 'local-filesystem',
        'driveConfig': {
            'hasFolderId': bool(DRIVE_FOLDER_ID),
            'folderId': DRIVE_FOLDER_ID,
            'hasServiceAccountJson': bool(get_service_account_json_env()),
            'hasOAuthClientId': bool(os.environ.get('GOOGLE_CLIENT_ID')),
            'hasOAuthClientSecret': bool(os.environ.get('GOOGLE_CLIENT_SECRET')),
            'hasOAuthRefreshToken': bool(os.environ.get('GOOGLE_REFRESH_TOKEN')),
            'usingOAuth': oauth_configured(),
            'hasGoogleLibraries': bool(build and MediaIoBaseUpload)
        }
    }), 200


# ===== GALLERY ENDPOINTS =====
@app.route('/gallery', methods=['GET'])
def get_gallery():
    if drive_enabled():
        try:
            files = list_drive_items('gallery')
            data = []
            for f in files:
                props = f.get('appProperties') or {}
                mime = f.get('mimeType', '')
                is_video = mime.startswith('video/')
                data.append({
                    'id': f['id'],
                    'imageUrl': drive_view_url(f['id']) if is_video else drive_image_url(f['id']),
                    'thumbnail': drive_image_url(f['id']),
                    'caption': props.get('caption') or 'Untitled',
                    'type': 'video' if is_video else 'image',
                    'fileUrl': drive_view_url(f['id']) if is_video else drive_image_url(f['id']),
                    'createdAt': f.get('createdTime'),
                    'storage': 'google-drive'
                })
            return jsonify(data), 200
        except Exception as e:
            print(f'Drive gallery list error: {e}')
            # Fall back to local JSON if Drive errors.

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

        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if ext not in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'mov', 'mkv', 'avi']:
            return jsonify({'error': 'Only images and video files allowed'}), 400

        if drive_enabled():
            filename = f"media_{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{ext}"
            mime_type = file.mimetype or mimetypes.guess_type(filename)[0] or ('video/mp4' if ext in ['mp4', 'webm', 'mov', 'mkv', 'avi'] else 'image/jpeg')
            created = upload_to_drive(file, filename, mime_type, {
                'kind': 'gallery' if ext not in ['mp4', 'webm', 'mov', 'mkv', 'avi'] else 'videos',
                'caption': caption or 'Untitled'
            })
            is_video = ext in ['mp4', 'webm', 'mov', 'mkv', 'avi']
            file_url = drive_view_url(created['id']) if is_video else drive_image_url(created['id'])
            return jsonify({
                'success': True,
                'fileUrl': file_url,
                'id': created['id'],
                'storage': 'google-drive',
                'isVideo': is_video,
                'message': 'Upload successful'
            }), 200

        # Local fallback. This is not permanent on Render unless a persistent disk is attached.
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
            'createdAt': datetime.datetime.now().isoformat(),
            'storage': 'local-filesystem'
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
        if drive_enabled():
            get_drive_service().files().delete(fileId=item_id).execute()
            return jsonify({'success': True, 'message': 'Deleted'}), 200

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
    if drive_enabled():
        try:
            files = list_drive_items('magazine_cover')
            data = []
            for f in files:
                props = f.get('appProperties') or {}
                data.append({
                    'id': f['id'],
                    'title': props.get('title') or 'Untitled',
                    'type': props.get('type') or 'magazine',
                    'description': props.get('description') or '',
                    'coverUrl': drive_image_url(f['id']),
                    'pdfUrl': props.get('pdfUrl') or None,
                    'pdfFileId': props.get('pdfFileId') or None,
                    'createdAt': f.get('createdTime'),
                    'storage': 'google-drive'
                })
            return jsonify(data), 200
        except Exception as e:
            print(f'Drive magazine list error: {e}')

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

        cover_file = request.files.get('cover')
        pdf_file = request.files.get('pdf')

        if not cover_file:
            return jsonify({'error': 'Cover image required'}), 400

        cover_ext = cover_file.filename.rsplit('.', 1)[1].lower()
        if cover_ext not in ['png', 'jpg', 'jpeg', 'gif', 'webp']:
            return jsonify({'error': 'Cover must be an image'}), 400

        if drive_enabled():
            item_id = str(uuid.uuid4())
            pdf_url = None
            pdf_file_id = None

            if pdf_file and pdf_file.filename:
                pdf_ext = pdf_file.filename.rsplit('.', 1)[1].lower()
                if pdf_ext != 'pdf':
                    return jsonify({'error': 'Publication file must be a PDF'}), 400
                pdf_filename = f"pdf_{item_id}_{int(datetime.datetime.now().timestamp())}.pdf"
                pdf_created = upload_to_drive(pdf_file, pdf_filename, pdf_file.mimetype or 'application/pdf', {
                    'kind': 'magazine_pdf',
                    'itemId': item_id,
                    'title': title
                })
                pdf_file_id = pdf_created['id']
                pdf_url = drive_view_url(pdf_file_id)

            cover_filename = f"cover_{item_id}_{int(datetime.datetime.now().timestamp())}.{cover_ext}"
            cover_created = upload_to_drive(cover_file, cover_filename, cover_file.mimetype or 'image/jpeg', {
                'kind': 'magazine_cover',
                'itemId': item_id,
                'title': title,
                'type': mag_type,
                'description': description,
                'pdfUrl': pdf_url or '',
                'pdfFileId': pdf_file_id or ''
            })

            return jsonify({
                'success': True,
                'message': 'Magazine added successfully',
                'id': cover_created['id'],
                'coverUrl': drive_image_url(cover_created['id']),
                'pdfUrl': pdf_url,
                'storage': 'google-drive'
            }), 200

        # Local fallback. This is not permanent on Render unless a persistent disk is attached.
        cover_filename = f"cover_{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{cover_ext}"
        cover_path = os.path.join(app.config['UPLOAD_FOLDER'], cover_filename)
        cover_file.save(cover_path)

        base_url = request.host_url.rstrip('/')
        cover_url = f"{base_url}/uploads/{cover_filename}"

        pdf_url = None
        pdf_filename = None
        if pdf_file and pdf_file.filename:
            pdf_ext = pdf_file.filename.rsplit('.', 1)[1].lower()
            pdf_filename = f"pdf_{uuid.uuid4().hex}_{int(datetime.datetime.now().timestamp())}.{pdf_ext}"
            pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename)
            pdf_file.save(pdf_path)
            pdf_url = f"{base_url}/uploads/{pdf_filename}"

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
            'createdAt': datetime.datetime.now().isoformat(),
            'storage': 'local-filesystem'
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
        if drive_enabled():
            service = get_drive_service()
            try:
                file_info = service.files().get(fileId=item_id, fields='id,appProperties').execute()
                props = file_info.get('appProperties') or {}
                pdf_file_id = props.get('pdfFileId')
                if pdf_file_id:
                    try:
                        service.files().delete(fileId=pdf_file_id).execute()
                    except Exception as e:
                        print(f'Could not delete linked PDF: {e}')
            except Exception:
                pass
            
            try:
                service.files().delete(fileId=item_id).execute()
            except Exception as e:
                print(f'Could not delete main file: {e}')
                
            # We don't return here! We proceed to delete from data.json
            
        data = load_data(MAGAZINE_FILE)
        item = next((x for x in data if x['id'] == item_id), None)

        if item:
            cover_path = os.path.join(app.config['UPLOAD_FOLDER'], item['fileName'])
            if os.path.exists(cover_path):
                os.remove(cover_path)

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

