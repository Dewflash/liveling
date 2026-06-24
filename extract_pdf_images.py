#!/usr/bin/env python3
"""
Extract tree images from Forest trees.pdf to individual PNG files
"""
import os
import sys
from pathlib import Path

try:
    # Try using pdf2image if available
    try:
        from pdf2image import convert_from_path
        from PIL import Image
        
        pdf_path = Path("Forest trees.pdf")
        output_dir = Path("liveling_frontend/public/assets/nature/trees/extracted")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📄 Converting PDF: {pdf_path}")
        images = convert_from_path(str(pdf_path), dpi=150)
        print(f"✓ Converted {len(images)} page(s) to images")
        
        for idx, img in enumerate(images, 1):
            filename = f"forest_trees_page_{idx}.png"
            filepath = output_dir / filename
            img.save(str(filepath), 'PNG')
            print(f"  ✓ Saved: {filename} ({img.width}x{img.height}px)")
        
        print(f"\n✅ Tree images extracted to: {output_dir}")
        sys.exit(0)
        
    except ImportError:
        print("pdf2image not available, trying PIL/fitz combo...")
        pass
    
    # Try using PyMuPDF (fitz) if available
    try:
        import fitz  # this is pymupdf
        from PIL import Image
        import io
        
        pdf_path = Path("Forest trees.pdf")
        output_dir = Path("liveling_frontend/public/assets/nature/trees/extracted")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        doc = fitz.open(str(pdf_path))
        print(f"📄 Opened PDF with {len(doc)} page(s)")
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
            
            img_data = pix.tobytes("png")
            filename = f"forest_trees_page_{page_num + 1}.png"
            filepath = output_dir / filename
            
            with open(str(filepath), 'wb') as f:
                f.write(img_data)
            
            print(f"  ✓ Saved: {filename} ({pix.width}x{pix.height}px)")
        
        doc.close()
        print(f"\n✅ Tree images extracted to: {output_dir}")
        sys.exit(0)
        
    except ImportError:
        print("fitz/PyMuPDF not available")
        pass

except Exception as e:
    print(f"❌ Error: {e}")
    print("\nTrying to install required packages...")
    os.system("pip install pdf2image pillow pymupdf -q 2>/dev/null || pip3 install pdf2image pillow pymupdf -q")
    print("\nPlease run this script again.")
    sys.exit(1)

# Last resort: try using macOS system tools
print("\n⚠️  Using macOS system conversion...")
import subprocess

pdf_path = Path("Forest trees.pdf")
output_dir = Path("liveling_frontend/public/assets/nature/trees/extracted")
output_dir.mkdir(parents=True, exist_ok=True)

try:
    # Use macOS's built-in tools
    result = subprocess.run([
        "convert",
        "-density", "150",
        str(pdf_path),
        "-background", "white",
        "-flatten",
        str(output_dir / "forest_trees_page.png")
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ Extracted using ImageMagick convert")
    else:
        print(f"ImageMagick not available: {result.stderr}")
        raise Exception("No PDF extraction tool available")
        
except Exception as e:
    print(f"❌ Extraction failed: {e}")
    sys.exit(1)
