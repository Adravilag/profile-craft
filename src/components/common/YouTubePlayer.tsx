// src/components/common/YouTubePlayer.tsx

import React, { useState, useEffect, useRef } from "react";
import styles from "./YouTubePlayer.module.css";

interface YouTubePlayerProps {
  url: string;
  title: string;
  className?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ url, title, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extraer el ID del video de YouTube
  const extractVideoId = (url: string): string | null => {
    try {
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extrayendo ID de video:', error);
      return null;
    }
  };
  // Generar URL de embed mejorada para Edge
  const getEmbedUrl = (videoId: string): string => {
    const isEdgeBrowser = isEdge();
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      fs: '1',
      hl: 'es',
      autoplay: '0',
      controls: '1',
      disablekb: '0',
      enablejsapi: isEdgeBrowser ? '0' : '1', // Deshabilitar JS API en Edge
      iv_load_policy: '3',
      playsinline: '1',
      start: '0'
    });
    
    // No agregar origin en Edge para evitar problemas CORS
    if (!isEdgeBrowser) {
      params.set('origin', window.location.origin);
      params.set('widget_referrer', window.location.origin);
    }
    
    // Usar youtube-nocookie.com para Edge como primera opción
    const domain = isEdgeBrowser ? 'www.youtube-nocookie.com' : 'www.youtube.com';
    
    return `https://${domain}/embed/${videoId}?${params.toString()}`;
  };

  // Detectar navegador Edge
  const isEdge = (): boolean => {
    return /Edg/i.test(navigator.userAgent);
  };
  useEffect(() => {
    const id = extractVideoId(url);
    setVideoId(id);

    if (!id) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Timeout más agresivo para Edge
    const timeoutDuration = isEdge() ? 3000 : 5000;
    
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn(`Video tardando en cargar en ${isEdge() ? 'Edge' : 'este navegador'}, mostrando fallback`);
        setShowFallback(true);
        setIsLoading(false);
      }
    }, timeoutDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url, isLoading]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleIframeError = () => {
    console.error('Error cargando iframe de YouTube');
    setIsLoading(false);
    setHasError(true);
    setShowFallback(true);
  };

  const openVideoInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!videoId) {
    return (
      <div className={`${styles.videoError} ${className || ''}`}>
        <i className="fas fa-exclamation-triangle"></i>
        <p>URL de video no válida</p>
      </div>
    );
  }

  if (hasError || showFallback) {
    return (
      <div className={`${styles.videoFallback} ${className || ''}`} onClick={openVideoInNewTab}>
        <div className={styles.thumbnailContainer}>
          <img 
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={`Miniatura de ${title}`}
            className={styles.thumbnail}
            onError={(e) => {
              // Fallback a thumbnail de menor resolución
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
          <div className={styles.playOverlay}>
            <div className={styles.playButton}>
              <i className="fab fa-youtube"></i>
            </div>
          </div>
        </div>        <div className={styles.fallbackContent}>
          <h4>Ver en YouTube</h4>
          <p>Haz clic para ver el video en una nueva pestaña</p>
          <span className={styles.fallbackNote}>
            {isEdge() ? 
              '⚠️ Microsoft Edge detectado - usando modo compatible' : 
              '🔗 Modo compatible activado'
            }
          </span>
          {isEdge() && (
            <div className={styles.edgeHelp}>
              <small>💡 Para mejor experiencia: intenta desactivar extensiones o usar modo privado</small>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.videoContainer} ${className || ''}`}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Cargando video...</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={getEmbedUrl(videoId)}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
};

export default YouTubePlayer;
