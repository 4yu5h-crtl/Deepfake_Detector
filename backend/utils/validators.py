from config import Config

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def validate_upload(filename):
    """
    Validates the uploaded file by name.
    """
    if not filename:
        return False, "No filename"
        
    if not allowed_file(filename):
        return False, f"File type not allowed. Supported: {Config.ALLOWED_EXTENSIONS}"
        
    return True, None
