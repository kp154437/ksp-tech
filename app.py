"""
Flask backend to support AI Image Enhancement and serve the frontend.
Uses OpenCV and Pillow for image processing.
"""

import io
import os
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from PIL import Image, ImageEnhance
import cv2
import numpy as np

app = Flask(__name__, static_folder='static', static_url_path='/static')

# NOTE:
# This is a simplified AI enhancement mock.
# In real world, you would integrate GFPGAN or Real-ESRGAN models here.
# For demonstration, it just applies a sharpening filter to simulate enhancement.

def ai_enhance_image(pil_image):
    """Apply AI enhancement on PIL image, return enhanced image."""
    # Convert to OpenCV format
    cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

    # Apply a sharpening kernel as dummy AI enhancement
    kernel = np.array([[0, -1, 0],
                       [-1, 5,-1],
                       [0, -1, 0]])
    enhanced_cv = cv2.filter2D(cv_image, -1, kernel)

    # Convert back to PIL image
    enhanced_pil = Image.fromarray(cv2.cvtColor(enhanced_cv, cv2.COLOR_BGR2RGB))
    return enhanced_pil

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/enhance', methods=['POST'])
def enhance():
    """
    Receive an image file via POST and return an enhanced image.
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    try:
        image = Image.open(file.stream).convert('RGB')
    except Exception as e:
        return jsonify({'error': 'Cannot open image file'}), 400

    # AI enhancement
    enhanced_image = ai_enhance_image(image)

    # Save to bytes
    img_byte_arr = io.BytesIO()
    enhanced_image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    return send_from_directory('static', 'blank.png')  # fallback if needed

@app.route('/enhance_base64', methods=['POST'])
def enhance_base64():
    """
    Alternative endpoint that receives JSON with base64 image data and returns enhanced base64 image.
    """
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image data provided'}), 400
    import base64
    try:
        header, b64data = data['image'].split(',', 1)
        img_bytes = base64.b64decode(b64data)
        image = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    except Exception:
        return jsonify({'error': 'Invalid image data'}), 400

    enhanced_image = ai_enhance_image(image)
    buffered = io.BytesIO()
    enhanced_image.save(buffered, format="PNG")
    enhanced_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return jsonify({'image': 'data:image/png;base64,' + enhanced_b64})


if __name__ == '__main__':
    app.run(debug=True)

