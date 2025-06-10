import React, { useState } from 'react';
import LexicalEditorNew from '../components/ui/LexicalEditorNew';

const HtmlEditorDemo: React.FC = () => {
  const [content, setContent] = useState(`<article>
  <header>
    <h1>Demostración del Editor HTML Mejorado</h1>
    <p>Creado el <time datetime="2024-06-10">10 de junio, 2024</time></p>
  </header>
  
  <main>
    <section>
      <h2>Características principales</h2>
      <p>Este editor HTML mejorado incluye las siguientes funcionalidades:</p>
      
      <ul>
        <li><strong>Modo HTML avanzado</strong> - Con resaltado visual y herramientas especializadas</li>
        <li><em>Auto-completado</em> de etiquetas HTML</li>
        <li>Plantillas HTML predefinidas (artículo, blog, tarjeta, tabla, formulario)</li>
        <li>Etiquetas semánticas HTML5</li>
        <li>Utilidades de conversión texto ↔ HTML</li>
      </ul>
    </section>

    <section>
      <h2>Atajos de teclado</h2>
      <table>
        <thead>
          <tr>
            <th>Atajo</th>
            <th>Función</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Ctrl+B</code></td>
            <td>Aplicar negrita (strong)</td>
          </tr>
          <tr>
            <td><code>Ctrl+I</code></td>
            <td>Aplicar cursiva (em)</td>
          </tr>
          <tr>
            <td><code>Ctrl+K</code></td>
            <td>Insertar enlace</td>
          </tr>
          <tr>
            <td><code>Ctrl+/</code></td>
            <td>Comentar/descomentar línea</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>Herramientas HTML avanzadas</h2>
      <p>Haz clic en el botón <strong>"HTML Tools"</strong> para acceder a:</p>
      
      <figure>
        <blockquote>
          <p>Plantillas predefinidas, etiquetas semánticas, utilidades de conversión y modos de editor especializados.</p>
        </blockquote>
        <figcaption>— Funcionalidades del panel de herramientas</figcaption>
      </figure>
    </section>
  </main>
  
  <footer>
    <p><small>Editor HTML mejorado para crear contenido de calidad.</small></p>
  </footer>
</article>`);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Contenido actualizado:', newContent);
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: 'var(--md-sys-color-surface)',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          color: 'var(--md-sys-color-primary)',
          fontSize: '2rem',
          marginBottom: '8px'
        }}>
          🔧 Demo del Editor HTML Mejorado
        </h1>
        <p style={{ 
          color: 'var(--md-sys-color-on-surface-variant)',
          fontSize: '1.1rem'
        }}>
          Prueba todas las nuevas funcionalidades del editor HTML avanzado.
        </p>
      </header>

      <div style={{
        border: '1px solid var(--md-sys-color-outline-variant)',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'var(--md-sys-color-surface-container)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <LexicalEditorNew
          content={content}
          onChange={handleContentChange}
          placeholder="Escribe tu contenido HTML aquí..."
        />
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '16px',
        backgroundColor: 'var(--md-sys-color-primary-container)',
        borderRadius: '8px',
        border: '1px solid var(--md-sys-color-outline-variant)'
      }}>
        <h3 style={{ 
          color: 'var(--md-sys-color-on-primary-container)',
          marginTop: 0,
          marginBottom: '12px'
        }}>
          📋 Instrucciones de uso:
        </h3>
        <ul style={{ 
          color: 'var(--md-sys-color-on-primary-container)',
          lineHeight: '1.6'
        }}>
          <li><strong>Modo HTML:</strong> Haz clic en el botón "HTML" para activar el modo HTML avanzado</li>
          <li><strong>Herramientas:</strong> Usa el botón "HTML Tools" para acceder a plantillas y utilidades</li>
          <li><strong>Vista dividida:</strong> Prueba los modos "Dividido H" y "Dividido V" para ver el resultado en tiempo real</li>
          <li><strong>Ventana externa:</strong> Abre una ventana separada para la vista previa</li>
          <li><strong>Atajos:</strong> En modo HTML, usa Ctrl+B, Ctrl+I, Ctrl+K, y Ctrl+/ para formateo rápido</li>
        </ul>
      </div>
    </div>
  );
};

export default HtmlEditorDemo;
