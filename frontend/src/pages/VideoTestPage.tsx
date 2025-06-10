// src/pages/VideoTestPage.tsx

import React, { useState, useRef, useEffect } from "react";
import YouTubePlayer from "../components/common/YouTubePlayer";
import styles from "./VideoTestPage.module.css";

const VideoTestPage: React.FC = () => {
  const [testUrl, setTestUrl] = useState("https://www.youtube.com/watch?v=zzTkOM-wJpo");
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [browserInfo, setBrowserInfo] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const testVideos = [
    {
      id: "zzTkOM-wJpo",
      url: "https://www.youtube.com/watch?v=zzTkOM-wJpo",
      title: "Video del usuario"
    },
    {
      id: "dQw4w9WgXcQ",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Rick Roll (video popular)"
    },
    {
      id: "ScMzIvxBSi4",
      url: "https://youtu.be/ScMzIvxBSi4",
      title: "Video corto"
    }
  ];

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      vendor: navigator.vendor,
      isEdge: /Edg/i.test(navigator.userAgent),
      isChrome: /Chrome/i.test(navigator.userAgent),
      isFirefox: /Firefox/i.test(navigator.userAgent),
      isSafari: /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)
    };
    setBrowserInfo(JSON.stringify(info, null, 2));
  }, []);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getBasicEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getAdvancedEmbedUrl = (videoId: string): string => {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      fs: '1',
      autoplay: '0',
      controls: '1',
      origin: window.location.origin
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
    console.log("Iframe cargado correctamente");
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
    console.error("Error al cargar el iframe");
  };

  const testDirectAccess = () => {
    window.open(testUrl, '_blank', 'noopener,noreferrer');
  };

  const videoId = extractVideoId(testUrl);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎥 Diagnóstico de Video YouTube</h1>
        <p>Página de prueba para diagnosticar problemas de reproducción de videos</p>
      </header>

      <div className={styles.content}>
        {/* Selector de videos de prueba */}
        <section className={styles.section}>
          <h2>Seleccionar Video de Prueba</h2>
          <div className={styles.videoSelector}>
            {testVideos.map((video) => (
              <button
                key={video.id}
                className={`${styles.videoButton} ${testUrl === video.url ? styles.active : ''}`}
                onClick={() => setTestUrl(video.url)}
              >
                {video.title}
              </button>
            ))}
          </div>
          
          <div className={styles.urlInput}>
            <label htmlFor="customUrl">URL personalizada:</label>
            <input
              id="customUrl"
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </section>

        {/* Información del navegador */}
        <section className={styles.section}>
          <h2>Información del Navegador</h2>
          <pre className={styles.browserInfo}>{browserInfo}</pre>
        </section>

        {/* Información del video */}
        {videoId && (
          <section className={styles.section}>
            <h2>Información del Video</h2>
            <div className={styles.videoInfo}>
              <p><strong>URL original:</strong> {testUrl}</p>
              <p><strong>Video ID:</strong> {videoId}</p>
              <p><strong>Thumbnail:</strong> <a href={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} target="_blank" rel="noopener noreferrer">Ver thumbnail</a></p>
              <p><strong>URL embed básica:</strong> {getBasicEmbedUrl(videoId)}</p>
              <p><strong>URL embed avanzada:</strong> {getAdvancedEmbedUrl(videoId)}</p>
            </div>
          </section>
        )}

        {/* Prueba con iframe básico */}
        <section className={styles.section}>
          <h2>Prueba: Iframe Básico</h2>
          <div className={styles.testContainer}>
            <div className={styles.status}>
              Status: {iframeLoaded ? '✅ Cargado' : iframeError ? '❌ Error' : '⏳ Cargando...'}
            </div>
            {videoId ? (
              <iframe
                ref={iframeRef}
                src={getBasicEmbedUrl(videoId)}
                title="Prueba iframe básico"
                width="560"
                height="315"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                className={styles.testIframe}
              />
            ) : (
              <div className={styles.error}>URL de video no válida</div>
            )}
          </div>
        </section>

        {/* Prueba con componente inteligente */}
        <section className={styles.section}>
          <h2>Prueba: Componente YouTubePlayer Inteligente</h2>
          <div className={styles.testContainer}>
            <YouTubePlayer 
              url={testUrl} 
              title="Prueba con componente inteligente"
              className={styles.smartPlayer}
            />
          </div>
        </section>

        {/* Acciones de prueba */}
        <section className={styles.section}>
          <h2>Acciones de Prueba</h2>
          <div className={styles.actions}>
            <button onClick={testDirectAccess} className={styles.actionButton}>
              🔗 Abrir video en nueva pestaña
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className={styles.actionButton}
            >
              🔄 Recargar página
            </button>
            <button 
              onClick={() => {
                setIframeError(false);
                setIframeLoaded(false);
                if (iframeRef.current) {
                  iframeRef.current.src = iframeRef.current.src;
                }
              }} 
              className={styles.actionButton}
            >
              🎯 Recargar iframe
            </button>
          </div>
        </section>

        {/* Notas de diagnóstico */}
        <section className={styles.section}>
          <h2>Notas de Diagnóstico</h2>
          <div className={styles.notes}>
            <h3>Problemas comunes:</h3>
            <ul>
              <li><strong>Microsoft Edge:</strong> Puede tener problemas con iframes de YouTube embebidos</li>
              <li><strong>Políticas de cookies:</strong> Algunos navegadores bloquean cookies de terceros</li>
              <li><strong>CORS:</strong> Políticas de seguridad pueden interferir</li>
              <li><strong>Adblockers:</strong> Extensiones pueden bloquear contenido de YouTube</li>
            </ul>
            
            <h3>Soluciones implementadas:</h3>
            <ul>
              <li>Detección automática de navegador</li>
              <li>Fallback a thumbnail + enlace directo</li>
              <li>Timeout para detectar problemas de carga</li>
              <li>Parámetros de URL optimizados</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VideoTestPage;