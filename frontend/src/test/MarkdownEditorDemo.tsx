import React, { useState } from 'react';
import LexicalEditorNew from '../components/ui/LexicalEditorNew';

const MarkdownEditorDemo: React.FC = () => {
  const [content, setContent] = useState(`# ProfileCraft de Adravilag

## ¿Qué es ProfileCraft?

**ProfileCraft** es una *herramienta revolucionaria* para crear perfiles profesionales impactantes.

### Características principales:

- **Interfaz intuitiva** y fácil de usar
- *Plantillas personalizables* para diferentes industrias
- Exportación a múltiples formatos
- Integración con redes sociales profesionales

### Enlaces útiles:

- [Sitio web oficial](https://profilecraft.com)
- [Documentación](https://docs.profilecraft.com)
- [Soporte técnico](https://support.profilecraft.com)

## Código de ejemplo:

\`const profile = new ProfileCraft();\`

## Lista de tecnologías:

- React 19
- TypeScript
- CSS Modules
- Material Design 3

---

*Desarrollado con amor por el equipo de Adravilag.*`);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Contenido Markdown actualizado:', newContent);
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        color: '#6750a4'
      }}>
        Demo del Editor Markdown
      </h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e9ecef'
      }}>
        <h3>🔧 Instrucciones de uso:</h3>
        <ul>
          <li><strong>Modo Markdown:</strong> Haz clic en el botón "Markdown" para activar el modo Markdown</li>
          <li><strong>Conversión automática:</strong> El contenido se convierte automáticamente entre Markdown y HTML</li>
          <li><strong>Vista previa:</strong> Usa "Vista previa" o vista dividida para ver el resultado renderizado</li>
          <li><strong>Herramientas:</strong> Usa los botones de la barra de herramientas para formato rápido</li>
          <li><strong>Atajos:</strong> En modo Markdown, usa Ctrl+B (negrita), Ctrl+I (cursiva), Ctrl+K (enlace), Ctrl+1/2/3 (títulos)</li>
        </ul>
      </div>

      <LexicalEditorNew
        content={content}
        onChange={handleContentChange}
        placeholder="Escribe tu contenido en Markdown aquí..."
      />
      
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#e8f5e8', 
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <h3>✨ Funcionalidades implementadas:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <h4>🔄 Conversión bidireccional:</h4>
            <ul>
              <li>Markdown → HTML automático</li>
              <li>HTML → Markdown automático</li>
              <li>Detección inteligente de formato</li>
            </ul>
          </div>
          <div>
            <h4>🛠️ Herramientas Markdown:</h4>
            <ul>
              <li>Botones para títulos (H1)</li>
              <li>Negrita (**texto**)</li>
              <li>Cursiva (*texto*)</li>
              <li>Listas (- elemento)</li>
              <li>Enlaces ([texto](url))</li>
              <li>Vista previa HTML</li>
            </ul>
          </div>
          <div>
            <h4>⌨️ Atajos de teclado:</h4>
            <ul>
              <li>Ctrl+B: **Negrita**</li>
              <li>Ctrl+I: *Cursiva*</li>
              <li>Ctrl+K: [Enlace](url)</li>
              <li>Ctrl+1/2/3: # Títulos</li>
            </ul>
          </div>
          <div>
            <h4>📊 Barra de estado:</h4>
            <ul>
              <li>Contador de líneas</li>
              <li>Contador de palabras</li>
              <li>Contador de caracteres</li>
              <li>Contador de títulos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorDemo;
