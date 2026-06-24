#!/usr/bin/env python3
"""
Extract images from PDF by treating it as a ZIP archive
PDFs can contain embedded resources that can sometimes be extracted this way
"""
import os
import sys
from pathlib import Path
import zipfile

pdf_path = Path("Forest trees.pdf")
output_dir = Path("liveling_frontend/public/assets/nature/trees/extracted")
output_dir.mkdir(parents=True, exist_ok=True)

print(f"📄 Analyzing PDF: {pdf_path}")
print(f"File size: {pdf_path.stat().st_size / 1024 / 1024:.2f} MB")

# Try to read PDF as ZIP
try:
    with zipfile.ZipFile(str(pdf_path), 'r') as zip_ref:
        print("This PDF contains embedded files:")
        for name in zip_ref.namelist():
            print(f"  - {name}")
            info = zip_ref.getinfo(name)
            print(f"    Size: {info.file_size} bytes")
        
        # Extract all files
        extracted_count = 0
        for item in zip_ref.filelist:
            if item.filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                data = zip_ref.read(item.filename)
                output_file = output_dir / Path(item.filename).name
                with open(str(output_file), 'wb') as f:
                    f.write(data)
                print(f"Extracted: {output_file.name}")
                extracted_count += 1
        
        if extracted_count > 0:
            print(f"\n✅ Extracted {extracted_count} images")
        else:
            print("\n⚠️  No image files found in ZIP structure")
            
except zipfile.BadZipFile:
    print("PDF is not a ZIP archive (standard PDF format)")

# Try raw PDF parsing to extract image streams
print("\n🔍 Scanning PDF for embedded image data...")

try:
    with open(str(pdf_path), 'rb') as f:
        pdf_content = f.read()
    
    # Look for common image markers in PDF
    # Using raw binary search for JPEG (FFD8) and PNG (89504E47) markers
    
    def find_all(data, sub):
        """Find all occurrences of a subsequence in data"""
        results = []
        start = 0
        while True:
            pos = data.find(sub, start)
            if pos == -1:
                break
            results.append(pos)
            start = pos + 1
        return results
    
    # Find JPEG markers
    jpeg_start = b'\xFF\xD8\xFF'
    jpeg_end = b'\xFF\xD9'
    jpeg_positions = find_all(pdf_content, jpeg_start)
    print(f"Found {len(jpeg_positions)} potential JPEG images")
    
    # Find PNG markers
    png_start = b'\x89PNG\r\n\x1a\n'
    png_positions = find_all(pdf_content, png_start)
    print(f"Found {len(png_positions)} PNG markers")
    
    image_count = 0
    
    # Extract JPEGs
    for idx, pos in enumerate(jpeg_positions[:10]):  # Limit to first 10
        try:
            # Find the end marker
            end_pos = pdf_content.find(jpeg_end, pos)
            if end_pos != -1:
                end_pos += 2  # Include the end marker
                jpeg_data = pdf_content[pos:end_pos]
                
                output_file = output_dir / f"tree_image_{image_count}.jpg"
                with open(str(output_file), 'wb') as f:
                    f.write(jpeg_data)
                print(f"  ✓ Extracted JPEG: {output_file.name} ({len(jpeg_data)} bytes)")
                image_count += 1
        except Exception as e:
            print(f"  ✗ Failed to extract JPEG at position {pos}: {e}")
    
    # Extract PNGs
    for idx, pos in enumerate(png_positions[:10]):  # Limit to first 10
        try:
            # PNG files have specific chunk structure, look for IEND chunk
            iend_marker = b'IEND'
            iend_crc = b'\xAE\x42\x60\x82'
            end_pos = pdf_content.find(iend_crc, pos)
            if end_pos != -1:
                end_pos += 4
                png_data = pdf_content[pos:end_pos]
                
                output_file = output_dir / f"tree_image_{image_count}.png"
                with open(str(output_file), 'wb') as f:
                    f.write(png_data)
                print(f"  ✓ Extracted PNG: {output_file.name} ({len(png_data)} bytes)")
                image_count += 1
        except Exception as e:
            print(f"  ✗ Failed to extract PNG at position {pos}: {e}")
    
    if image_count > 0:
        print(f"\n✅ Extracted {image_count} images total")
    else:
        print("\n⚠️  Could not extract any images using binary parsing")

except Exception as e:
    print(f"Error reading PDF: {e}")

print(f"\n📁 Check folder: {output_dir}")
print("Files created:")
try:
    for file in sorted(output_dir.iterdir()):
        print(f"  - {file.name} ({file.stat().st_size} bytes)")
except Exception as e:
    print(f"  No files extracted: {e}")
