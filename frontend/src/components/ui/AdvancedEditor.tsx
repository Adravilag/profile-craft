// Editor avanzado de artículos estilo WordPress con Material Design 3
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdvancedEditor.css';
import MediaLibrary from './MediaLibrary';

// Tipos de editores disponibles
type EditorType = 'visual' | 'html' | 'markdown';
type ViewMode = 'edit' | 'preview' | 'split';

interface AdvancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

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

  // Convertir HTML a Markdown (aproximación simple)
  const htmlToMarkdown = (html: string): string => {
    // Versión simplificada: retornamos el HTML tal cual
    return html;
  };
  // Manejador para el botón de imagen en la barra de herramientas
  const handleImageButton = () => {
    setShowMediaLibrary(true);
  };

  // Efecto para reemplazar el manejador de imágenes estándar con nuestro manejador personalizado
  useEffect(() => {
    if (quillRef.current) {
      const toolbar = quillRef.current.getEditor().getModule('toolbar');
      toolbar.addHandler('image', handleImageButton);
    }
  }, [quillRef.current]);

  // Módulos y formatos para React-Quill
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        ['clean'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'font': [] }]
      ],
      handlers: {
        'image': handleImageButton  // Asignar nuestro manejador personalizado
      }
    },
    syntax: true,
    clipboard: {
      matchVisual: false // Mejora el pegado de contenido desde Word/Google Docs
    },
    imageResize: {
      displaySize: true // Muestra las dimensiones de la imagen
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet',
    'link', 'image', 'video',
    'color', 'background',
    'align'
  ];
  // Maneja la inserción de una imagen desde la biblioteca de medios
  const handleImageInsert = (imageUrl: string) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', imageUrl);
      editor.setSelection(range.index + 1, 0);
    } else if (editorType === 'html') {
      // Insertar imagen en el editor HTML
      const imageTag = `<img src="${imageUrl}" alt="Imagen" />`;
      setHtmlContent(prevContent => {
        // Insertar al final si no sabemos dónde está el cursor
        return prevContent + imageTag;
      });
      onChange(htmlContent + imageTag);
    } else if (editorType === 'markdown') {      // Insertar imagen en el editor Markdown (versión simplificada)
      const markdownImage = `![Imagen](${imageUrl})`;
      setHtmlContent(prevContent => {
        return prevContent + '\n' + markdownImage;
      });
      onChange(htmlContent + '\n' + markdownImage);
    }
    
    // Cerrar la biblioteca de medios después de seleccionar
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
            className="html-editor"
            value={htmlContent}
            onChange={handleHtmlEditorChange}
            placeholder="Edita el HTML directamente aquí..."
            spellCheck="false"
          />
        );
      case 'markdown':
        return (
          <textarea
            className="markdown-editor"
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
    <div className="content-preview">
      <div 
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
  return (
    <div className={`advanced-editor ${viewMode === 'split' ? 'split-mode' : ''}`}>
      {/* Biblioteca de medios como un modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={handleImageInsert}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}

      {/* Barra de herramientas superior */}
      <div className="editor-toolbar">
        {/* Selector de tipo de editor */}
        <div className="editor-type-selector">
          <button
            className={`editor-type-btn ${editorType === 'visual' ? 'active' : ''}`}
            onClick={() => setEditorType('visual')}
            title="Editor visual"
          >
            <i className="fas fa-eye"></i> Visual
          </button>
          <button
            className={`editor-type-btn ${editorType === 'html' ? 'active' : ''}`}
            onClick={() => setEditorType('html')}
            title="Editor HTML"
          >
            <i className="fas fa-code"></i> HTML
          </button>
          <button
            className={`editor-type-btn ${editorType === 'markdown' ? 'active' : ''}`}
            onClick={() => setEditorType('markdown')}
            title="Editor Markdown"
          >
            <i className="fas fa-markdown"></i> Markdown
          </button>
        </div>        {/* Selector de modo de vista */}
        <div className="view-mode-selector">
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
        
        {/* Botón para añadir imagen en modos HTML y Markdown */}
        {editorType !== 'visual' && (
          <div className="additional-actions">
            <button
              className="action-btn"
              onClick={() => setShowMediaLibrary(true)}
              title="Insertar imagen"
            >
              <i className="fas fa-image"></i>
            </button>
          </div>
        )}
      </div>

      {/* Contenido del editor */}
      <div className="editor-content">
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-container">
            {renderEditor()}
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

export default AdvancedEditor;
