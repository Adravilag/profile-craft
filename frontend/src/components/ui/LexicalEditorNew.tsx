// Editor HTML mejorado compatible con React 19
// Versión mejorada del editor temporal
import React, { useState, useRef } from 'react';
import './AdvancedEditor.module.css';
import styles from './LexicalEditorNew.module.css';
import MediaLibrary from './MediaLibrary';

interface SimpleLexicalEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Tipos de vista disponibles
type ViewMode = 'edit' | 'preview' | 'split';

// Editor temporal que funciona con React 19 mientras se implementa la versión completa
const LexicalEditorNew: React.FC<SimpleLexicalEditorProps> = ({
  content,
  onChange,
  placeholder = 'Escribe el contenido de tu artículo aquí...'
}) => {  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [htmlContent, setHtmlContent] = useState<string>(content || '');
  const [showMediaLibrary, setShowMediaLibrary] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Manejador para cambios en el editor
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setHtmlContent(newContent);
    onChange(newContent);
  };  // Renderizar la vista previa
  const renderPreview = () => {
    // Validar si hay contenido para mostrar
    const hasContent = htmlContent && htmlContent.trim() !== '';
    
    return (
      <div className={styles.contentPreview}>
        {!hasContent ? (
          <div className={styles.previewPlaceholder}>
            <i className="fas fa-eye" style={{fontSize: '24px', opacity: 0.5, marginBottom: '10px'}}></i>
            <span>La vista previa del contenido aparecerá aquí</span>
          </div>
        ) : (
          <div 
            className={`${styles.previewContent} article-content`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    );
  };// Insertar contenido desde la biblioteca de medios
  const handleMediaSelection = (url: string) => {
    if (textAreaRef.current) {
      const startPos = textAreaRef.current.selectionStart;
      const endPos = textAreaRef.current.selectionEnd;
      
      // Determinar el tipo de archivo basado en la extensión
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
      const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
      
      let mediaHtml = '';
      
      if (isImage) {
        const altText = prompt('Texto alternativo para la imagen:', 'Imagen') || 'Imagen';
        mediaHtml = `<img src="${url}" alt="${altText}" class="article-image" style="max-width: 100%; height: auto; display: block; margin: 20px 0;" />`;
      } else if (isVideo) {
        mediaHtml = `
<video controls style="max-width: 100%; height: auto; display: block; margin: 20px 0;">
  <source src="${url}" type="video/${url.split('.').pop()}" />
  Tu navegador no soporta la etiqueta de video.
</video>`;
      } else {
        // Otro tipo de archivo - mostrar como enlace
        mediaHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="article-link" style="color: var(--md-sys-color-primary);">${url.split('/').pop()}</a>`;
      }
      
      const newContent = 
        htmlContent.substring(0, startPos) + 
        mediaHtml + 
        htmlContent.substring(endPos);
      
      setHtmlContent(newContent);
      onChange(newContent);
      setShowMediaLibrary(false);
      
      // Enfoque nuevamente en el textarea después de insertar
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          // Mover el cursor después del contenido insertado
          const newCursorPos = startPos + mediaHtml.length;
          textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 50);
    }
  };
  return (
    <div className={`advanced-editor ${viewMode === 'split' ? styles.splitMode : ''}`}>
      {/* Biblioteca de medios */}
      {showMediaLibrary && (
        <MediaLibrary 
          onSelect={handleMediaSelection}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}
      
      {/* Selector de modo de vista */}
      <div className="editor-toolbar view-mode-selector">
        <button
          className={`view-mode-btn ${viewMode === 'edit' ? 'active' : ''}`}
          onClick={() => setViewMode('edit')}
          title="Solo edición"
        >
          <i className="fas fa-edit"></i> Editar
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
          onClick={() => setViewMode('preview')}
          title="Solo vista previa"
        >
          <i className="fas fa-eye"></i> Vista previa
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
          onClick={() => setViewMode('split')}
          title="Vista dividida"
        >
          <i className="fas fa-columns"></i> Dividido
        </button>
      </div>      {/* Aviso y funciones de editor */}
      <div className="editor-notice" style={{backgroundColor: '#e7f3ff', padding: '10px', marginBottom: '10px', borderRadius: '4px', color: '#0c5460', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <div>
          <strong>Editor HTML mejorado</strong> - Utiliza los botones de formato o ingresa código HTML directamente. 
          <button 
            onClick={() => {
              const ayuda = `
              <p>Etiquetas HTML básicas:</p>
              <ul>
                <li><code>&lt;p&gt;Párrafo&lt;/p&gt;</code> - Crear un párrafo</li>
                <li><code>&lt;strong&gt;Texto en negrita&lt;/strong&gt;</code> - Texto en negrita</li>
                <li><code>&lt;em&gt;Texto en cursiva&lt;/em&gt;</code> - Texto en cursiva</li>
                <li><code>&lt;h2&gt;Encabezado&lt;/h2&gt;</code> - Encabezado nivel 2</li>
                <li><code>&lt;ul&gt;&lt;li&gt;Elemento de lista&lt;/li&gt;&lt;/ul&gt;</code> - Lista</li>
                <li><code>&lt;a href="url"&gt;Enlace&lt;/a&gt;</code> - Enlace</li>
                <li><code>&lt;img src="url" alt="texto" /&gt;</code> - Imagen</li>
              </ul>
              `;
              alert(ayuda);
            }}
            style={{
              marginLeft: '10px',
              background: 'none',
              border: 'none',
              color: '#0c5460',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Ver ayuda de formato HTML
          </button>
        </div>
        <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
          <button 
            onClick={() => {
              // Formatear HTML (indentación simple)
              if (htmlContent.trim()) {
                try {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = htmlContent;
                  const formatted = tempDiv.innerHTML
                    .replace(/></g, '>\n<')
                    .replace(/(<\/[^>]+>)/g, '$1\n')
                    .replace(/(<[^\/][^>]*[^\/]>)\s*/g, '$1\n');
                  
                  setHtmlContent(formatted);
                  onChange(formatted);
                } catch (error) {
                  console.error('Error al formatear HTML:', error);
                }
              }
            }}
            style={{
              background: '#e3f2fd',
              border: '1px solid #90caf9',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Formatear HTML
          </button>
          <button 
            onClick={() => {
              // Validar y sanear HTML
              if (htmlContent.trim()) {
                try {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(htmlContent, 'text/html');
                  const sanitized = doc.body.innerHTML;
                  setHtmlContent(sanitized);
                  onChange(sanitized);
                } catch (error) {
                  console.error('Error al sanear HTML:', error);
                }
              }
            }}
            style={{
              background: '#e3f2fd',
              border: '1px solid #90caf9',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Sanear HTML
          </button>
        </div>
      </div>      {/* Contenido del editor */}
      <div className={styles.editorContent}>        {/* Área de edición */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={styles.editorContainer}>
            <div className={styles.simpleToolbar}>              <button 
                className={styles.toolbarButton} 
                title="Texto en negrita"
                onClick={() => {
                  if (textAreaRef.current) {
                    const start = textAreaRef.current.selectionStart;
                    const end = textAreaRef.current.selectionEnd;
                    const selectedText = htmlContent.substring(start, end) || "texto en negrita";
                    const newContent = 
                      htmlContent.substring(0, start) + 
                      `<strong>${selectedText}</strong>` + 
                      htmlContent.substring(end);
                    setHtmlContent(newContent);
                    onChange(newContent);
                  }
                }}
              >
                <i className="fas fa-bold"></i>
              </button>              <button 
                className={styles.toolbarButton} 
                title="Texto en cursiva"
                onClick={() => {
                  if (textAreaRef.current) {
                    const start = textAreaRef.current.selectionStart;
                    const end = textAreaRef.current.selectionEnd;
                    const selectedText = htmlContent.substring(start, end) || "texto en cursiva";
                    const newContent = 
                      htmlContent.substring(0, start) + 
                      `<em>${selectedText}</em>` + 
                      htmlContent.substring(end);
                    setHtmlContent(newContent);
                    onChange(newContent);
                  }
                }}
              >
                <i className="fas fa-italic"></i>
              </button>              <button 
                className={styles.toolbarButton} 
                title="Insertar encabezado H2"
                onClick={() => {
                  if (textAreaRef.current) {
                    const start = textAreaRef.current.selectionStart;
                    const end = textAreaRef.current.selectionEnd;
                    const selectedText = htmlContent.substring(start, end) || "Encabezado";
                    const newContent = 
                      htmlContent.substring(0, start) + 
                      `<h2>${selectedText}</h2>` + 
                      htmlContent.substring(end);
                    setHtmlContent(newContent);
                    onChange(newContent);
                  }
                }}
              >
                H2
              </button>              <button 
                className={styles.toolbarButton} 
                title="Insertar enlace"
                onClick={() => {
                  const url = prompt('Introduce la URL del enlace:');
                  if (url && textAreaRef.current) {
                    const start = textAreaRef.current.selectionStart;
                    const end = textAreaRef.current.selectionEnd;
                    const selectedText = htmlContent.substring(start, end) || "enlace";
                    const newContent = 
                      htmlContent.substring(0, start) + 
                      `<a href="${url}" target="_blank" rel="noopener noreferrer">${selectedText}</a>` + 
                      htmlContent.substring(end);
                    setHtmlContent(newContent);
                    onChange(newContent);
                  }
                }}
              >
                <i className="fas fa-link"></i>
              </button>              <button 
                className={styles.toolbarButton} 
                title="Insertar imagen de biblioteca"
                onClick={() => setShowMediaLibrary(true)}
              >
                <i className="fas fa-image"></i>
              </button>              <button 
                className={styles.toolbarButton} 
                title="Insertar lista"
                onClick={() => {
                  if (textAreaRef.current) {
                    const start = textAreaRef.current.selectionStart;
                    const newContent = 
                      htmlContent.substring(0, start) + 
                      '<ul>\n  <li>Elemento 1</li>\n  <li>Elemento 2</li>\n</ul>\n' + 
                      htmlContent.substring(start);
                    setHtmlContent(newContent);
                    onChange(newContent);
                  }
                }}
              >
                <i className="fas fa-list-ul"></i>
              </button>              <button 
                className={styles.toolbarButton} 
                title="Insertar párrafo"
                onClick={() => {
                  if (textAreaRef.current) {
                    const start = textAreaRef.current.selectionStart;
                    const end = textAreaRef.current.selectionEnd;
                    const selectedText = htmlContent.substring(start, end) || "Párrafo";
                    const newContent = 
                      htmlContent.substring(0, start) + 
                      `<p>${selectedText}</p>` + 
                      htmlContent.substring(end);
                    setHtmlContent(newContent);
                    onChange(newContent);
                  }
                }}
              >
                <i className="fas fa-paragraph"></i>
              </button>              <button 
                className={styles.toolbarButton} 
                title="Limpiar formato HTML"
                onClick={() => {
                  if (textAreaRef.current) {
                    const start = textAreaRef.current.selectionStart;
                    const end = textAreaRef.current.selectionEnd;
                    if (start !== end) {
                      // Eliminar etiquetas HTML de la selección
                      const selectedText = htmlContent.substring(start, end);
                      const cleanText = selectedText.replace(/<[^>]*>/g, '');
                      const newContent = 
                        htmlContent.substring(0, start) + 
                        cleanText + 
                        htmlContent.substring(end);
                      setHtmlContent(newContent);
                      onChange(newContent);
                    }
                  }
                }}
              >
                <i className="fas fa-remove-format"></i>
              </button>
              <span style={{marginLeft: 'auto', fontStyle: 'italic', fontSize: '12px'}}>
                Editor HTML
              </span>
            </div>            <textarea
              ref={textAreaRef}
              className={styles.simpleEditor}
              value={htmlContent}
              onChange={handleTextAreaChange}
              onKeyDown={(e) => {
                // Auto-indentación al presionar Enter
                if (e.key === 'Enter') {
                  const cursorPos = e.currentTarget.selectionStart;
                  const textBeforeCursor = htmlContent.substring(0, cursorPos);
                  
                  // Encuentra la indentación de la línea actual
                  const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
                  const currentLine = textBeforeCursor.substring(lastNewlineIndex + 1);
                  const match = currentLine.match(/^(\s+)/);
                  const indentation = match ? match[1] : '';
                  
                  // Si estamos dentro de una etiqueta, añadir indentación extra
                  let extraIndent = '';
                  if (textBeforeCursor.endsWith('<')) {
                    extraIndent = '  ';
                  }
                  
                  // Si la línea termina con una etiqueta de apertura, agregar indentación
                  if (textBeforeCursor.trim().endsWith('>') && !textBeforeCursor.trim().endsWith('/>') && 
                      !textBeforeCursor.trim().match(/<\/[^>]+>$/)) {
                    extraIndent = '  ';
                  }
                  
                  if (indentation || extraIndent) {
                    e.preventDefault();
                    const newContent = 
                      textBeforeCursor + '\n' + indentation + extraIndent + 
                      htmlContent.substring(cursorPos);
                    
                    setHtmlContent(newContent);
                    onChange(newContent);
                    
                    // Mueve el cursor a la posición correcta después de insertar el texto
                    setTimeout(() => {
                      if (textAreaRef.current) {
                        const newCursorPos = cursorPos + 1 + indentation.length + extraIndent.length;
                        textAreaRef.current.selectionStart = newCursorPos;
                        textAreaRef.current.selectionEnd = newCursorPos;
                      }
                    }, 0);
                  }
                }
                
                // Auto-cerrar paréntesis, corchetes, llaves y comillas
                if (e.key === '(' || e.key === '[' || e.key === '{' || e.key === '"' || e.key === "'") {
                  const pairs: Record<string, string> = {
                    '(': ')',
                    '[': ']',
                    '{': '}',
                    '"': '"',
                    "'": "'"
                  };
                  
                  e.preventDefault();
                  
                  const cursorPos = e.currentTarget.selectionStart;
                  const selectionEnd = e.currentTarget.selectionEnd;
                  
                  const newContent = 
                    htmlContent.substring(0, cursorPos) +
                    e.key +
                    (cursorPos === selectionEnd ? pairs[e.key] : '') +
                    htmlContent.substring(selectionEnd);
                  
                  setHtmlContent(newContent);
                  onChange(newContent);
                  
                  // Mover el cursor entre los caracteres insertados
                  setTimeout(() => {
                    if (textAreaRef.current && cursorPos === selectionEnd) {
                      const newPos = cursorPos + 1;
                      textAreaRef.current.selectionStart = newPos;
                      textAreaRef.current.selectionEnd = newPos;
                    }
                  }, 0);
                }
                
                // Auto-cerrar etiquetas HTML
                if (e.key === '>' && textAreaRef.current) {
                  const cursorPos = e.currentTarget.selectionStart;
                  const textBeforeCursor = htmlContent.substring(0, cursorPos);
                  
                  // Verificar si estamos cerrando una etiqueta de apertura
                  const openTagMatch = textBeforeCursor.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*$/);
                    if (openTagMatch && 
                      !textBeforeCursor.endsWith('/>') && 
                      !['br', 'img', 'input', 'hr', 'meta', 'link'].includes(openTagMatch[1])) {
                    
                    e.preventDefault();
                    
                    const newContent = 
                      textBeforeCursor + '>' + 
                      htmlContent.substring(cursorPos);
                    
                    setHtmlContent(newContent);
                    onChange(newContent);
                    
                    // Actualizar la posición del cursor
                    setTimeout(() => {
                      if (textAreaRef.current) {
                        const newPos = cursorPos + 1;
                        textAreaRef.current.selectionStart = newPos;
                        textAreaRef.current.selectionEnd = newPos;
                      }
                    }, 0);
                  }
                }
              }}
              placeholder={placeholder}
              spellCheck={false}
              autoComplete="off"
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '10px',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                lineHeight: '1.5',
                tabSize: 2
              }}
            />
          </div>
        )}
          {/* Vista previa */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={styles.previewContainer}>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default LexicalEditorNew;
