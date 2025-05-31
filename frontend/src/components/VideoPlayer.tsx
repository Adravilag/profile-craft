import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { getOptimalPreloadStrategy } from '../utils/videoConfig';
import './styles/video-player.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  title?: string;
  autoPlayOnView?: boolean;
  muted?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  poster, 
  className = '',
  title = 'Demo del proyecto',
  autoPlayOnView = false,
  muted = false
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(muted ? 0 : 0.7);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showError } = useNotificationContext();

  // Maneja el progreso de la reproducción
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((current / duration) * 100);
  }, []);

  // Maneja el comportamiento de play/pause
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().catch(e => {
        console.error("Error al reproducir el video:", e);
        showError('Error de reproducción', 'No se ha podido reproducir el video');
      });
    } else {
      videoRef.current.pause();
    }
  }, [showError]);

  // Listeners para eventos del video
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const onLoadedData = () => {
      setIsLoading(false);
      setDuration(videoElement.duration);
      console.log("Video cargado correctamente");
    };

    const onError = (e: Event) => {
      console.error("Error al cargar el video:", e);
      setError(true);
      setIsLoading(false);
      showError('Error de video', 'No se ha podido cargar el video de demostración');
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onVolumeChange = () => setVolume(videoElement.volume);
    const onDurationChange = () => setDuration(videoElement.duration);

    videoElement.addEventListener('loadeddata', onLoadedData);
    videoElement.addEventListener('error', onError);
    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('ended', onEnded);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('volumechange', onVolumeChange);
    videoElement.addEventListener('durationchange', onDurationChange);
    
    // Configuración inicial
    videoElement.preload = getOptimalPreloadStrategy() as '' | 'none' | 'metadata' | 'auto';
    videoElement.volume = volume;
    videoElement.muted = muted;

    return () => {
      videoElement.removeEventListener('loadeddata', onLoadedData);
      videoElement.removeEventListener('error', onError);
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
      videoElement.removeEventListener('ended', onEnded);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('volumechange', onVolumeChange);
      videoElement.removeEventListener('durationchange', onDurationChange);
    };
  }, [showError, handleTimeUpdate, volume, muted]);

  // Reproducción automática cuando el video es visible
  useEffect(() => {
    if (!autoPlayOnView || !videoRef.current || !containerRef.current) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7, // 70% del video debe ser visible
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && videoRef.current?.paused) {
          videoRef.current.muted = true; // Mutear para permitir autoplay
          videoRef.current.play().catch(e => {
            console.error("Error en autoplay:", e);
          });
        } else if (!entry.isIntersecting && !videoRef.current?.paused) {
          videoRef.current?.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [autoPlayOnView]);

  // Lazy loading para optimizar rendimiento
  useEffect(() => {
    if ('IntersectionObserver' in window && videoRef.current && containerRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.setAttribute('preload', getOptimalPreloadStrategy());
            observer.unobserve(containerRef.current!);
          }
        });
      }, {
        rootMargin: '200px 0px',
        threshold: 0.01
      });
      
      observer.observe(containerRef.current);
      
      return () => observer.disconnect();
    }
  }, []);

  // Formatear tiempo para la UI
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Gestionar clics en la barra de progreso
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  // Gestionar cambios de volumen
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    videoRef.current.muted = newVolume === 0;
    setVolume(newVolume);
  };

  return (
    <div 
      ref={containerRef}
      className={`video-player-container ${className} optimize-performance`}
      aria-label={`Reproductor de video: ${title}`}
    >
      {isLoading && !error && (
        <div className="video-loading-overlay" aria-live="polite">
          <div className="spinner" role="status" aria-label="Cargando video"></div>
          <span>Cargando video...</span>
        </div>
      )}
      
      {error && (
        <div className="video-error-overlay" aria-live="assertive">
          <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
          <p>No se pudo cargar el video</p>
          <button 
            onClick={() => {
              if (videoRef.current) {
                setError(false);
                setIsLoading(true);
                videoRef.current.load();
              }
            }}
            className="retry-button"
            aria-label="Reintentar cargar el video"
          >
            Reintentar
          </button>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="optimized-video"
        poster={poster}
        playsInline
        onDoubleClick={handlePlayPause}
        preload="none"
        aria-label={title}
        title={title}
      >
        <source src={src} type="video/mp4" />
        <track kind="captions" src="" label="Español" />
        Tu navegador no soporta videos HTML5.
      </video>
      
      <div 
        className={`video-controls ${isPlaying ? 'playing' : ''}`} 
        aria-label="Controles de video"
      >
        <button 
          className="play-pause-button"
          onClick={handlePlayPause}
          disabled={isLoading || error}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} aria-hidden="true"></i>
        </button>
        
        <div className="video-time-display" aria-live="polite">
          {videoRef.current && (
            <span>
              {formatTime(videoRef.current.currentTime)} / {formatTime(duration)}
            </span>
          )}
        </div>
        
        <div 
          className="progress-bar-container" 
          onClick={handleProgressClick}
          role="slider"
          aria-label="Progreso del video"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="progress-bar-background">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="volume-control">
          <button 
            className="volume-button" 
            onClick={() => {
              if (!videoRef.current) return;
              const newMuted = !videoRef.current.muted;
              videoRef.current.muted = newMuted;
              if (newMuted) {
                videoRef.current.volume = 0;
              } else if (volume === 0) {
                videoRef.current.volume = 0.7;
              }
            }}
            aria-label={volume === 0 ? "Activar sonido" : "Silenciar"}
          >
            <i 
              className={`fas ${
                volume === 0 ? 'fa-volume-mute' : 
                volume < 0.3 ? 'fa-volume-off' : 
                volume < 0.7 ? 'fa-volume-down' : 'fa-volume-up'
              }`}
              aria-hidden="true"
            ></i>
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={volume} 
            onChange={handleVolumeChange}
            className="volume-slider"
            aria-label="Control de volumen"
          />
        </div>
        
        {/* Opción de pantalla completa */}
        <button 
          className="fullscreen-button"
          onClick={() => {
            if (!videoRef.current) return;
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              videoRef.current.requestFullscreen();
            }
          }}
          aria-label="Pantalla completa"
        >
          <i className="fas fa-expand" aria-hidden="true"></i>
        </button>
        
        <div className="video-badge" role="status">
          <i className="fas fa-video" aria-hidden="true"></i> Demo en video
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;