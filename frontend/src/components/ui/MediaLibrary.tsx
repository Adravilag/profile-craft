// Componente para la gestión de imágenes del artículo
import React, { useState, useRef } from 'react';
import ModalPortal from '../common/ModalPortal';
import './MediaLibrary.css';

export interface MediaItem {
  id?: number;
  url: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size?: number;
  thumbnail?: string;
}

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Datos de ejemplo para la biblioteca multimedia
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: 1,
      url: '/assets/images/foto-perfil.jpg',
      name: 'Foto de perfil',
      type: 'image',
      thumbnail: '/assets/images/foto-perfil.jpg',
    },
    {
      id: 2,
      url: '/assets/images/pixihama.png',
      name: 'Pixihama',
      type: 'image',
      thumbnail: '/assets/images/pixihama.png',
    },
    {
      id: 3,
      url: '/assets/images/airpixel_logo.png',
      name: 'AirPixel Logo',
      type: 'image',
      thumbnail: '/assets/images/airpixel_logo.png',
    },
  ]);
  
  // Filtra los elementos según la búsqueda
  const filteredItems = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        uploadFile(file);
      }
    });
  };

  const uploadFile = (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simular progreso de carga
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Simular adición del archivo a la biblioteca
          const newItem: MediaItem = {
            id: Date.now(),
            url: URL.createObjectURL(file),
            name: file.name,
            type: 'image',
            thumbnail: URL.createObjectURL(file),
          };
          setMediaItems(prev => [...prev, newItem]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  return (
    <ModalPortal>
      <div className="media-library-overlay">
        <div className="media-library-modal">
          <div className="media-library-header">
            <h2>Biblioteca de Medios</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="media-library-tabs">
            <button 
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <i className="fas fa-upload"></i> Subir nuevo
            </button>
            <button 
              className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              <i className="fas fa-photo-video"></i> Biblioteca
            </button>
          </div>
          
          <div className="media-library-content">
            {activeTab === 'upload' && (
              <div className="upload-section">
                <div 
                  className={`dropzone ${dragActive ? 'active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="dropzone-content">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Arrastra y suelta archivos aquí o</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                    />
                    <button 
                      className="select-files-btn"
                      onClick={triggerFileInput}
                    >
                      Seleccionar archivos
                    </button>
                    <p className="supported-formats">
                      JPG, PNG, GIF, SVG, WEBP • Max 10MB
                    </p>
                  </div>
                </div>
                
                {uploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{uploadProgress}% Completado</span>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'library' && (
              <div className="library-section">
                <div className="search-bar">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text"
                    placeholder="Buscar medios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="media-grid">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="media-item"
                        onClick={() => onSelect(item.url)}
                      >
                        <div className="media-thumbnail">
                          <img src={item.thumbnail} alt={item.name} />
                        </div>
                        <div className="media-info">
                          <span className="media-name">{item.name}</span>
                          <span className="media-type">
                            {item.type === 'image' && <i className="fas fa-image"></i>}
                            {item.type === 'video' && <i className="fas fa-video"></i>}
                            {item.type === 'document' && <i className="fas fa-file"></i>}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <i className="fas fa-search"></i>
                      <p>No se encontraron resultados</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default MediaLibrary;
