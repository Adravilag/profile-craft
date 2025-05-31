import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotificationContext } from '../contexts/NotificationContext';
import VideoPlayer from './VideoPlayer';
import './styles/article.css';

interface ArticleData {
  id: string;
  title: string;
  introduction: string;
  content: string;
  tags: string[];
  technologies: string[];
  status: string;
  hasVideo: boolean;
  videoUrl?: string;
  authors?: string[];
  date?: string;
  image?: string;
}

const articles: Record<string, ArticleData> = {
  'airpixel': {
    id: 'airpixel',
    title: 'AirPixel – Drones Autónomos',
    introduction: 'AirPixel es un sistema avanzado que utiliza drones autónomos equipados con algoritmos de inteligencia artificial para la captura precisa de imágenes aéreas y generación de mapas 3D. Optimiza rutas de vuelo automáticamente, mejorando la calidad de las imágenes obtenidas mediante técnicas avanzadas de visión artificial y aprendizaje profundo.',
    content: `
      <h1>AirPixel: Aplicación Web para Monitorización de la Calidad del Aire mediante Procesamiento de Mapas de Color</h1>
      <p class="authors">Adrián Dávila Guerra¹, Guadalupe Ortiz Bellot¹, Juan Boubeta-Puig¹</p>
      <p class="affiliation">¹ Departamento de Ingeniería Informática, Escuela Superior de Ingeniería, Universidad de Cádiz, Cádiz, España</p>
      
      <h2>Resumen</h2>
      <p>La monitorización precisa y accesible de la calidad del aire es esencial para la gestión ambiental y la salud pública. En este artículo presentamos AirPixel, una aplicación web desarrollada para obtener información cuantitativa sobre la calidad del aire a partir del análisis automatizado de mapas generados por el sistema CALIOPE (Barcelona Supercomputing Center). Mediante técnicas de procesamiento digital de imágenes y una interfaz basada en React, AirPixel ofrece visualizaciones interactivas para diversos contaminantes (O₃, NOₓ, CO, SO₂, PM₁₀, PM₂.₅ y benceno). Este enfoque demuestra ser económico, fiable y replicable, especialmente útil en contextos con recursos limitados.</p>
      
      <p class="keywords"><strong>Palabras clave:</strong> Calidad del aire, CALIOPE, procesamiento digital de imágenes, visualización de datos, React.</p>
      
      <h2>1. Introducción</h2>
      <p>La contaminación atmosférica afecta gravemente la salud pública y el medio ambiente. Herramientas como CALIOPE, desarrolladas por el Barcelona Supercomputing Center, ofrecen predicciones detalladas mediante modelos complejos, pero su acceso directo resulta limitado para la mayoría de usuarios. El presente trabajo explora una alternativa efectiva mediante AirPixel, que aprovecha mapas publicados libremente en CALIOPE, realizando análisis automático de paletas de colores para obtener datos cuantitativos de concentración.</p>
      
      <h2>2. Materiales y Métodos</h2>
      <h3>2.1 Fuente de datos</h3>
      <p>Se emplearon mapas diarios publicados por la plataforma CALIOPE, que representan concentraciones de contaminantes mediante una escala cromática oficial. Dichos mapas cubren todo el territorio español con una resolución adecuada para análisis a escala provincial.</p>
      
      <h3>2.2 Procesamiento de imágenes</h3>
      <p>La metodología implementada incluye:</p>
      <ul>
        <li><strong>Captura automatizada:</strong> Desarrollada en Node.js, descarga periódicamente mapas en formato PNG desde la plataforma CALIOPE.</li>
        <li><strong>Análisis de píxeles:</strong> Uso de JavaScript y Canvas API para extraer información RGB de cada píxel y convertir dichos valores en concentraciones reales mediante una paleta oficial previamente calibrada.</li>
        <li><strong>Almacenamiento y gestión:</strong> SQLite registra la información generada, permitiendo consultas históricas y estadísticas.</li>
      </ul>
      
      <h3>2.3 Interfaz Web</h3>
      <p>El frontend fue desarrollado utilizando React y CanvasJS, proporcionando visualizaciones en dos formatos principales:</p>
      <ul>
        <li><strong>Mapas interactivos:</strong> Provincias coloreadas según niveles de concentración de contaminantes.</li>
        <li><strong>Gráficas dinámicas:</strong> Visualización temporal de contaminantes específicos por provincias seleccionadas.</li>
      </ul>
      
      <h2>3. Resultados</h2>
      <h3>3.1 Fiabilidad de los datos extraídos</h3>
      <p>Se validó el sistema comparando datos extraídos con datos oficiales medidos por estaciones fijas (disponibles públicamente). Para 50 puntos geográficos distribuidos en diversas provincias españolas, la precisión alcanzada mediante análisis de imágenes superó el 90 %, mostrando desviaciones promedio por debajo del umbral recomendado para estudios preliminares.</p>
      
      <h3>3.2 Evaluación técnica y rendimiento</h3>
      <p>AirPixel presenta tiempos de procesamiento menores a 1 segundo por mapa descargado y analizado, permitiendo actualizaciones constantes sin sobrecarga computacional significativa. La plataforma ofrece una experiencia fluida y tiempos de respuesta inferiores a 200 ms para consultas del usuario promedio.</p>
      
      <h2>4. Discusión</h2>
      <p>Los resultados muestran que el análisis automatizado de mapas cromáticos publicados por plataformas científicas oficiales es una solución viable y económica para obtener datos precisos sobre calidad del aire. Este enfoque no sustituye la precisión de los sensores físicos, pero representa una alternativa práctica en regiones o contextos sin infraestructura de medición directa suficiente.</p>
      <p>Entre las limitaciones destacan la dependencia del sistema CALIOPE y la sensibilidad ante posibles cambios en sus mapas o escalas cromáticas. Como mejoras futuras se recomienda:</p>
      <ul>
        <li>Integrar métodos avanzados de inteligencia artificial para adaptación automática a cambios en los mapas originales.</li>
        <li>Expandir análisis a nivel internacional utilizando fuentes similares a CALIOPE en otros países.</li>
      </ul>
      
      <h2>5. Conclusiones</h2>
      <p>AirPixel demuestra la utilidad del procesamiento digital de mapas cromáticos para monitorear la calidad del aire con una precisión aceptable y costes reducidos. Esta metodología puede implementarse en diversos contextos geográficos y tecnológicos, facilitando un acceso más amplio y democrático a información medioambiental crítica.</p>
      
      <h2>Agradecimientos</h2>
      <p>Este proyecto fue desarrollado como Trabajo Fin de Grado en Ingeniería Informática en la Universidad de Cádiz, bajo la dirección académica de la Dra. Guadalupe Ortiz Bellot y el Dr. Juan Boubeta-Puig.</p>
      
      <h2>Referencias</h2>
      <ol>
        <li>CALIOPE – Barcelona Supercomputing Center. Sistema de predicción de calidad del aire. [Disponible en línea]: http://www.bsc.es/caliope</li>
        <li>Ortiz-Bellot, G., & Boubeta-Puig, J. (2019). Tecnologías emergentes para aplicaciones ambientales. Revista Iberoamericana de Tecnologías Ambientales, 7(2), 54-62.</li>
        <li>CanvasJS Charts. JavaScript Charting Library. [Disponible en línea]: https://canvasjs.com/</li>
        <li>González-Nieto, A. (2018). Técnicas de procesamiento digital de imágenes para aplicaciones web. Universidad de Sevilla, Departamento de Ingeniería de Sistemas y Automática.</li>
      </ol>
      
      <p class="note"><em>Nota: Este artículo está diseñado específicamente para divulgar en un portfolio personal o profesional, y aunque adopta un formato académico y rigor metodológico, debe adaptarse formalmente antes de someterlo a revisión en revistas científicas oficiales.</em></p>
    `,
    tags: ['Drones Autónomos', 'IA', 'Visión Artificial', 'Mapeo 3D', 'Fotografía aérea'],
    technologies: ['Python', 'React', 'OpenCV', 'TensorFlow', 'Computer Vision'],
    status: 'Completado',
    hasVideo: true,
    videoUrl: "/assets/videos/airpixel_demo.mp4",
    authors: ['Adrián Dávila Guerra', 'Guadalupe Ortiz Bellot', 'Juan Boubeta-Puig'],
    date: '15 de mayo de 2025',
  }
};

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showError } = useNotificationContext();

  useEffect(() => {
    if (id && articles[id]) {
      setArticle(articles[id]);
      setLoading(false);
    } else {
      showError('Artículo no encontrado', 'El artículo solicitado no existe');
      setLoading(false);
    }
  }, [id, showError]);

  if (loading) {
    return (
      <div className="article-loading">
        <div className="spinner"></div>
        <p>Cargando artículo...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-not-found">
        <h2>Artículo no encontrado</h2>
        <p>Lo sentimos, el artículo solicitado no existe o ha sido eliminado.</p>
        <Link to="/" className="action-button">
          <i className="fas fa-arrow-left"></i> Volver al portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="article-page-container">
      <div className="article-header">
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i> Volver al portfolio
        </Link>
        <div className="article-meta">
          {article.date && <span className="article-date"><i className="far fa-calendar-alt"></i> {article.date}</span>}
        </div>
      </div>

      <div className="article-preview">
        <h1 className="article-title">{article.title}</h1>
        <p className="article-intro">{article.introduction}</p>
        
        {/* Añadido reproductor de video para artículos con video */}
        {article.hasVideo && article.videoUrl && (
          <div className="article-video-container">
            <h3 className="video-section-title">
              <i className="fas fa-film"></i> Demostración del Proyecto
            </h3>
            <VideoPlayer 
              src={article.videoUrl} 
              title={`Demostración de ${article.title}`}
              className="article-video-player"
              poster={article.image}
            />
          </div>
        )}
        
        <div className="article-tags">
          <h3>Etiquetas sugeridas:</h3>
          <div className="tags-container">
            {article.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="article-technologies">
          <h3>Tecnologías clave:</h3>
          <div className="tech-container">
            {article.technologies.map((tech, index) => (
              <span key={index} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>
        
        <div className="article-status">
          <h3>Estado del Proyecto:</h3>
          <p>
            <span className="status-badge completed">✅ {article.status}</span>
            {article.hasVideo && <span className="status-badge video">📹 Con Video Demostrativo</span>}
          </p>
        </div>
      </div>

      <div className="article-content">
        <div className="article-full-content" dangerouslySetInnerHTML={{ __html: article.content }}></div>
      </div>
    </div>
  );
};

export default ArticlePage;