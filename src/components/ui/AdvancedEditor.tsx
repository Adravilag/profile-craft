// Editor avanzado de artículos estilo WordPress con Material Design 3
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './AdvancedEditor.module.css';
import MediaLibrary from './MediaLibrary';
import type { AdvancedEditorProps, EditorType, ViewMode } from './types/AdvancedEditor.types';
import { createEditorConfig } from './utils/editorConfig';
import { htmlToMarkdown, insertImageInContent } from './utils/contentConverters';

const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
  content,
  onChange,
  placeholder = 'Escribe el contenido de tu artículo aquí...'
}) => {
  const [editorType, setEditorType] = useState<EditorType>('visual');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [htmlContent, setHtmlContent] = useState(content);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  // Configuración para resaltado de sintaxis (versión simplificada)
  useEffect(() => {
    // Aplicamos clases de sintaxis mediante CSS
    if (viewMode === 'preview' || viewMode === 'split') {
      // Aquí iría el código para el resaltado de sintaxis
    }
  }, [viewMode, htmlContent]);

  // Sincronizar contenido entre diferentes tipos de editor
  useEffect(() => {
    setHtmlContent(content);
  }, [content]);

  // Manejar cambios en el editor visual
  const handleVisualEditorChange = (value: string) => {
    setHtmlContent(value);
    onChange(value);
  };

  // Manejar cambios en el editor HTML
  const handleHtmlEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
    onChange(e.target.value);
  };
  // Manejar cambios en el editor Markdown (versión simplificada)
  const handleMarkdownEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Versión simplificada: usamos el contenido tal cual
    const markdownContent = e.target.value;
    setHtmlContent(markdownContent);
    onChange(markdownContent);
  };

  // Manejador para el botón de imagen en la barra de herramientas
  const handleImageButton = () => {
    setShowMediaLibrary(true);
  };

  // Configuración del editor usando el módulo
  const { modules, formats } = createEditorConfig(handleImageButton);

  // Maneja la inserción de una imagen desde la biblioteca de medios
  const handleImageInsert = (imageUrl: string) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', imageUrl);
      editor.setSelection(range.index + 1, 0);
    } else if (editorType === 'html' || editorType === 'markdown') {
      const updatedContent = insertImageInContent(htmlContent, imageUrl, editorType);
      setHtmlContent(updatedContent);
      onChange(updatedContent);
    }
    
    setShowMediaLibrary(false);
  };

  // Renderizar el editor según el tipo seleccionado
  const renderEditor = () => {
    switch (editorType) {
      case 'visual':
        return (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={htmlContent}
            onChange={handleVisualEditorChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        );
      case 'html':
        return (
          <textarea
            className={styles.htmlEditor}
            value={htmlContent}
            onChange={handleHtmlEditorChange}
            placeholder="Edita el HTML directamente aquí..."
            spellCheck="false"
          />
        );
      case 'markdown':
        return (
          <textarea
            className={styles.markdownEditor}
            value={htmlToMarkdown(htmlContent)}
            onChange={handleMarkdownEditorChange}
            placeholder="Escribe en formato Markdown aquí..."
            spellCheck="false"
          />
        );
      default:
        return null;
    }
  };

  // Renderizar la vista previa
  const renderPreview = () => (
    <div className={styles.contentPreview}>
      <div 
        className={styles.previewContent}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
  return (
    <div className={`${styles.advancedEditor} ${viewMode === 'split' ? styles.splitMode : ''}`}>
      {/* Biblioteca de medios como un modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={handleImageInsert}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}

      {/* Barra de herramientas superior */}
      <div className={styles.editorToolbar}>
        {/* Selector de tipo de editor */}
        <div className={styles.editorTypeSelector}>
          <button
            className={`${styles.editorTypeBtn} ${editorType === 'visual' ? styles.active : ''}`}
            onClick={() => setEditorType('visual')}
            title="Editor visual"
          >
            <i className="fas fa-eye"></i> Visual
          </button>
          <button
            className={`${styles.editorTypeBtn} ${editorType === 'html' ? styles.active : ''}`}
            onClick={() => setEditorType('html')}
            title="Editor HTML"
          >
            <i className="fas fa-code"></i> HTML
          </button>
          <button
            className={`${styles.editorTypeBtn} ${editorType === 'markdown' ? styles.active : ''}`}
            onClick={() => setEditorType('markdown')}
            title="Editor Markdown"
          >
            <i className="fas fa-markdown"></i> Markdown
          </button>
        </div>        {/* Selector de modo de vista */}
        <div className={styles.viewModeSelector}>
          <button
            className={`${styles.viewModeBtn} ${viewMode === 'edit' ? styles.active : ''}`}
            onClick={() => setViewMode('edit')}
            title="Solo edición"
          >
            <i className="fas fa-edit"></i> Editar
          </button>
          <button
            className={`${styles.viewModeBtn} ${viewMode === 'preview' ? styles.active : ''}`}
            onClick={() => setViewMode('preview')}
            title="Solo vista previa"
          >
            <i className="fas fa-eye"></i> Vista previa
          </button>
          <button
            className={`${styles.viewModeBtn} ${viewMode === 'split' ? styles.active : ''}`}
            onClick={() => setViewMode('split')}
            title="Vista dividida"
          >
            <i className="fas fa-columns"></i> Dividido
          </button>
        </div>
        
        {/* Botón para añadir imagen en modos HTML y Markdown */}
        {editorType !== 'visual' && (
          <div className={styles.additionalActions}>
            <button
              className={styles.actionBtn}
              onClick={() => setShowMediaLibrary(true)}
              title="Insertar imagen"
            >
              <i className="fas fa-image"></i>
            </button>
          </div>
        )}
      </div>

      {/* Contenido del editor */}
      <div className={styles.editorContent}>
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={styles.editorContainer}>
            {renderEditor()}
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

export default AdvancedEditor;
