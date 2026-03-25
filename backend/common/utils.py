"""
Common utility functions
"""

from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys
import uuid


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename using UUID
    """
    extension = original_filename.split('.')[-1] if '.' in original_filename else ''
    unique_name = f"{uuid.uuid4()}"
    return f"{unique_name}.{extension}" if extension else unique_name


def resize_image(image_file, max_width: int = 1200, max_height: int = 1200, quality: int = 85):
    """
    Resize image while maintaining aspect ratio
    """
    img = Image.open(image_file)
    
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    
    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    
    output = BytesIO()
    img.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    
    return InMemoryUploadedFile(
        output,
        'ImageField',
        f"{image_file.name.split('.')[0]}_resized.jpg",
        'image/jpeg',
        sys.getsizeof(output),
        None
    )


def create_thumbnail(image_file, size: tuple = (300, 300), quality: int = 80):
    """
    Create a thumbnail from an image
    """
    img = Image.open(image_file)
    
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    
    img.thumbnail(size, Image.Resampling.LANCZOS)
    
    output = BytesIO()
    img.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    
    return InMemoryUploadedFile(
        output,
        'ImageField',
        f"{image_file.name.split('.')[0]}_thumb.jpg",
        'image/jpeg',
        sys.getsizeof(output),
        None
    )


def generate_invite_code(length: int = 8) -> str:
    """
    Generate a random invite code
    """
    import random
    import string
    
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=length))
