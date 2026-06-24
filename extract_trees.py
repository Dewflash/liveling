#!/usr/bin/env python3
import os
import sys
from pathlib import Path

try:
    import pdfplumber
    from PIL import Image
    import io
    
    pdf_path = "Forest trees.pdf"
    output_dir = Path("liveling_frontend/public/assets/nature/trees/extracted")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Opening PDF: {pdf_path}")
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}\n")
        
        image_count = 0
        for page_idx, page in enumerate(pdf.pages):
            print(f"--- Page {page_idx + 1} ---")
            
            # Get XObjects which contain images
            resources = page.within_bbox((0, 0, page.width, page.height)).objects
            
            # Try to extract images from the page
            if hasattr(page, 'extract_images'):
                try:
                    images = page.extract_images()
                    print(f"  Found {len(images)} images")
                    for img_idx, img in enumerate(images):
                        print(f"    Image {img_idx}: size={img.get('width', '?')}x{img.get('height', '?')}, name={img.get('name', 'unknown')}")
                except Exception as e:
                    print(f"  Error extracting: {e}")
            
            # Also check for XObject images
            try:
                if "/XObject" in page["/Resources"]:
                    xobjects = page["/Resources"]["/XObject"].get_object()
                    print(f"  XObjects found: {len(xobjects) if xobjects else 0}")
            except:
                pass
        
        print("\n" + "="*50)
        print("Attempting ImageIO conversion...")
        
        # Try converting PDF to images page by page
        try:
            from pdf2image import convert_from_path
            
            images = convert_from_path(pdf_path)
            print(f"Successfully converted {len(images)} pages to images")
            
            for idx, img in enumerate(images):
                img_path = output_dir / f"forest_page_{idx+1}.png"
                img.save(str(img_path), 'PNG')
                print(f"Saved: {img_path.name} ({img.width}x{img.height})")
                image_count += 1
        except ImportError:
            print("pdf2image not installed, trying PIL alternative...")
        
        if image_count > 0:
            print(f"\nExtracted {image_count} images to {output_dir}")
        
except ImportError as e:
    print(f"Error: {e}")
    print("\nInstalling required packages...")
    os.system("pip install pdfplumber pdf2image pillow -q")
    print("Packages installed. Please run this script again.")
    sys.exit(1)
