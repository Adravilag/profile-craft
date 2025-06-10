// TestVideoPlayer.tsx - Componente de prueba para videos de YouTube

import React, { useState } from "react";
import YouTubePlayer from "./YouTubePlayer";
import styles from "./TestVideoPlayer.module.css";

const TestVideoPlayer: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState("https://www.youtube.com/watch?v=zzTkOM-wJpo");
  const [showIframe, setShowIframe] = useState(false);

  const testVideos = [
    {
      id: "zzTkOM-wJpo",
      url: "https://www.youtube.com/watch?v=zzTkOM-wJpo",
      title: "Video de Prueba Principal"
    },
    {
      id: "dQw4w9WgXcQ", 
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Video de Prueba Clásico"
    },
    {
      id: "ScMzIvxBSi4",
      url: "https://youtu.be/ScMzIvxBSi4", 
      title: "Video Formato Corto"
    }
  ];

  const getDirectEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1&hl=es`;
  };

  return (
    <div className={styles.testContainer}>
      <h2>🧪 Prueba de Reproductor de YouTube</h2>
      
      <div className={styles.controls}>
        <div className={styles.videoSelector}>
          <h3>Seleccionar Video:</h3>
          {testVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => setCurrentVideo(video.url)}
              className={currentVideo === video.url ? styles.activeButton : styles.button}
            >
              {video.title} ({video.id})
            </button>
          ))}
        </div>
        
        <div className={styles.modeSelector}>
          <h3>Modo de Reproducción:</h3>
          <button
            onClick={() => setShowIframe(false)}
            className={!showIframe ? styles.activeButton : styles.button}
          >
            YouTubePlayer (Inteligente)
          </button>
          <button
            onClick={() => setShowIframe(true)}
            className={showIframe ? styles.activeButton : styles.button}
          >
            Iframe Directo
          </button>
        </div>
      </div>

      <div className={styles.playerContainer}>
        <h3>Video Actual: {currentVideo}</h3>
        
        {showIframe ? (
          <div className={styles.iframeContainer}>
            <h4>🎬 Iframe Directo (Método Tradicional)</h4>
            <iframe
              src={getDirectEmbedUrl(currentVideo.split('/').pop()?.split('?')[0]?.split('=')[1] || '')}
              title="Test YouTube Video"
              width="560"
              height="315"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                maxWidth: '100%',
                border: '1px solid #d0d7de',
                borderRadius: '8px'
              }}
            />
            <p className={styles.note}>
              ⚠️ Si ves una pantalla negra, es el problema que solucionamos con YouTubePlayer
            </p>
          </div>
        ) : (
          <div className={styles.smartContainer}>
            <h4>🚀 YouTubePlayer Inteligente (Con Fallbacks)</h4>
            <YouTubePlayer
              url={currentVideo}
              title="Video de Prueba"
              className={styles.smartPlayer}
            />
            <p className={styles.note}>
              ✅ Incluye detección de Edge, fallbacks automáticos y thumbnails
            </p>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3>🔍 Información del Video Actual</h3>
        <div className={styles.infoGrid}>
          <div>
            <strong>URL:</strong> {currentVideo}
          </div>
          <div>
            <strong>Video ID:</strong> {currentVideo.split('/').pop()?.split('?')[0]?.split('=')[1] || 'No detectado'}
          </div>
          <div>
            <strong>Navegador:</strong> {navigator.userAgent.includes('Edg') ? 'Microsoft Edge' : 'Otro'}
          </div>
          <div>
            <strong>Thumbnail:</strong> 
            <img 
              src={`https://img.youtube.com/vi/${currentVideo.split('/').pop()?.split('?')[0]?.split('=')[1]}/default.jpg`}
              alt="Thumbnail"
              style={{ width: '60px', height: '45px', marginLeft: '8px', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestVideoPlayer;
