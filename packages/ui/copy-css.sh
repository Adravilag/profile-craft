#!/bin/bash
# Bash script to copy CSS files from src to dist

SRC_DIR="$(pwd)/src"
DIST_DIR="$(pwd)/dist"

echo "Copying CSS files from $SRC_DIR to $DIST_DIR"

# Create dist directory if it doesn't exist
mkdir -p "$DIST_DIR"

# Find and copy all CSS files
find "$SRC_DIR" -name "*.css" -type f | while read -r css_file; do
    # Get relative path
    rel_path="${css_file#$SRC_DIR/}"
    dest_path="$DIST_DIR/$rel_path"
    dest_dir="$(dirname "$dest_path")"
    
    echo "Copying: $rel_path"
    
    # Create destination directory if it doesn't exist
    mkdir -p "$dest_dir"
    
    # Copy the file
    cp "$css_file" "$dest_path"
done

echo "CSS copy completed"
