const fs = require('fs');
const path = require('path');

function copyCSS() {
  const srcDir = path.join(__dirname, 'src');
  const distDir = path.join(__dirname, 'dist');

  console.log(`Copying CSS files from ${srcDir} to ${distDir}`);

  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  function copyFilesRecursive(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(srcDir, srcPath);
      const destPath = path.join(distDir, relativePath);
      
      if (entry.isDirectory()) {
        // Create directory if it doesn't exist
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyFilesRecursive(srcPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.css') {
        console.log(`Copying: ${relativePath}`);
        
        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  if (fs.existsSync(srcDir)) {
    copyFilesRecursive(srcDir);
    console.log('CSS copy completed');
  } else {
    console.log('No src directory found, skipping CSS copy');
  }
}

copyCSS();
