// Test script para verificar datos de skills
console.log('=== TEST SKILLS DEBUG ===');

// Simular la carga de CSV
fetch('/profile-craft/data/skills-icons.csv')
  .then(res => res.text())
  .then(csv => {
    console.log('CSV Raw (primeras 500 chars):', csv.substring(0, 500));
    
    // Parsear manualmente para verificar
    const lines = csv.split('\n').map(line => line.trim()).filter(Boolean);
    console.log('Total lines:', lines.length);
    console.log('Headers:', lines[0]);
    console.log('Sample data lines:', lines.slice(1, 6));
    
    // Verificar parsing
    const headers = lines[0].split(',');
    const nameIdx = headers.indexOf('name');
    const svgIdx = headers.indexOf('svg_path');
    console.log('Name index:', nameIdx, 'SVG index:', svgIdx);
    
    // Parsear algunas líneas
    lines.slice(1, 6).forEach((line, i) => {
      const values = line.split(',');
      console.log(`Line ${i+1}:`, {
        name: values[nameIdx],
        svg_path: values[svgIdx]
      });
    });
  })
  .catch(err => console.error('Error:', err));
