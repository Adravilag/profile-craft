// Editor básico temporal para reemplazar React-Quill
import React, { useState } from 'react';
import './AdvancedEditor.css';

interface TempEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Tipos de vista disponibles
type ViewMode = 'edit' | 'preview' | 'split';

// Editor temporal simplificado
const TempEditor = ({ content, onChange, placeholder = 'Escribe el contenido de tu artículo aquí...' }: TempEditorProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [htmlContent, setHtmlContent] = useState<string>(content || '');

  // Manejador para cambios en el editor
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setHtmlContent(newContent);
    onChange(newContent);
  };

  // Renderizar la vista previa
  const renderPreview = () => (
    <div className="content-preview">
      <div 
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );

  return (
    <div className={`advanced-editor ${viewMode === 'split' ? 'split-mode' : ''}`}>
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
      </div>

      {/* Aviso de editor simplificado */}
      <div className="editor-notice" style={{backgroundColor: '#fff3cd', padding: '10px', marginBottom: '10px', borderRadius: '4px', color: '#856404', fontSize: '14px'}}>
        Editor simplificado temporal. Estamos trabajando en mejorar la compatibilidad con React 19.
      </div>

      {/* Contenido del editor */}
      <div className="editor-content">
        {/* Área de edición */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-container">
            <div className="simple-toolbar">
              <span>Editor HTML básico</span>
            </div>
            <textarea
              className="simple-editor"
              value={htmlContent}
              onChange={handleTextAreaChange}
              placeholder={placeholder}
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        )}
        
        {/* Vista previa */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-container">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TempEditor;
