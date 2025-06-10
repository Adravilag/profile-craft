import React, { useState } from 'react';
import LexicalEditorNew from './LexicalEditorNew';
import './EditorDemo.css';

const EditorDemo: React.FC = () => {  const [content, setContent] = useState(`<h1>🚀 Editor HTML Revolucionario - Material Design 3</h1>

<p>¡Bienvenido al editor HTML más avanzado y hermoso que hayas visto! Este editor combina la potencia de WordPress con la elegancia de Material Design 3.</p>

<h2>✨ Nuevas Características - Vista Dividida y Ventana Externa</h2>

<div class="wp-columns" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 20px 0;">
  <div class="wp-column" style="padding: 16px; background: var(--md-sys-color-surface-container); border-radius: 12px;">
    <h3>📐 Vista Dividida Horizontal</h3>
    <p>Editor arriba, vista previa abajo. Ideal para pantallas anchas y flujo de trabajo vertical.</p>
  </div>
  <div class="wp-column" style="padding: 16px; background: var(--md-sys-color-surface-container); border-radius: 12px;">
    <h3>📏 Vista Dividida Vertical</h3>
    <p>Editor a la izquierda, vista previa a la derecha. Perfecto para comparar código y resultado.</p>
  </div>
</div>

<div class="wp-callout" style="padding: 16px; margin: 20px 0; border-left: 4px solid var(--md-sys-color-primary); background: var(--md-sys-color-primary-container); border-radius: 0 8px 8px 0; color: var(--md-sys-color-on-primary-container);">
  <p style="margin: 0; font-weight: 500;"><i class="fas fa-external-link-alt" style="margin-right: 8px;"></i>🖥️ <strong>Ventana Externa:</strong> Abre la vista previa en una ventana separada, perfecta para configuraciones de doble monitor.</p>
</div>

<h3>🛠️ Herramientas avanzadas disponibles:</h3>

<ul>
  <li><strong>Vista Dividida:</strong> Horizontal y vertical para diferentes flujos de trabajo</li>
  <li><strong>Ventana Externa:</strong> Vista previa independiente con actualización en tiempo real</li>
  <li><strong>Formato de texto:</strong> <strong>negrita</strong>, <em>cursiva</em>, <u>subrayado</u>, <del>tachado</del></li>
  <li><strong>Validación HTML:</strong> Verificación en tiempo real de sintaxis</li>
  <li><strong>Formateo inteligente:</strong> Auto-indentación y limpieza de código</li>
  <li><strong>Minificación:</strong> Reduce el tamaño del HTML para producción</li>
  <li><strong>Auto-completado:</strong> Cierre automático de etiquetas y caracteres</li>
  <li><strong>Biblioteca de medios:</strong> Inserción fácil de imágenes y videos</li>
</ul>

<h3>📱 Diseño Responsivo</h3>
<p>El editor se adapta automáticamente a diferentes tamaños de pantalla:</p>
<ul>
  <li><strong>Escritorio:</strong> Vista dividida completa con todas las opciones</li>
  <li><strong>Tablet:</strong> Vista dividida adaptada para pantallas medianas</li>
  <li><strong>Móvil:</strong> Vista apilada vertical para facilitar la edición</li>
</ul>

<h3>📊 Tabla de nuevas características</h3>

<table class="wp-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <thead>
    <tr>
      <th style="border: 1px solid #ddd; padding: 12px; background: #f5f5f5;">Característica</th>
      <th style="border: 1px solid #ddd; padding: 12px; background: #f5f5f5;">Estado</th>
      <th style="border: 1px solid #ddd; padding: 12px; background: #f5f5f5;">Descripción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px;">Vista Horizontal</td>
      <td style="border: 1px solid #ddd; padding: 12px; color: #28a745;">✅ Activo</td>
      <td style="border: 1px solid #ddd; padding: 12px;">Editor arriba, vista previa abajo</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px;">Vista Vertical</td>
      <td style="border: 1px solid #ddd; padding: 12px; color: #28a745;">✅ Activo</td>
      <td style="border: 1px solid #ddd; padding: 12px;">Editor izquierda, vista previa derecha</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px;">Ventana Externa</td>
      <td style="border: 1px solid #ddd; padding: 12px; color: #28a745;">✅ Activo</td>
      <td style="border: 1px solid #ddd; padding: 12px;">Vista previa independiente</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px;">Responsivo</td>
      <td style="border: 1px solid #ddd; padding: 12px;">✅ Funcionando</td>
      <td style="border: 1px solid #ddd; padding: 12px;">Tooltips informativos en todos los botones</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px;">Números de línea</td>
      <td style="border: 1px solid #ddd; padding: 12px;">✅ Sincronizados</td>
      <td style="border: 1px solid #ddd; padding: 12px;">Números alineados perfectamente con el texto</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px;">Vista dividida</td>
      <td style="border: 1px solid #ddd; padding: 12px;">✅ Mejorada</td>
      <td style="border: 1px solid #ddd; padding: 12px;">Toolbar arriba, mejor distribución</td>
    </tr>
  </tbody>
</table>

<h3>🎯 Cómo probar el editor</h3>

<ol>
  <li><strong>Cambia a vista dividida</strong> haciendo clic en el icono de columnas</li>
  <li><strong>Prueba los atajos de teclado:</strong>
    <ul>
      <li><code>Ctrl+B</code> - Negrita</li>
      <li><code>Ctrl+I</code> - Cursiva</li>
      <li><code>Ctrl+K</code> - Insertar enlace</li>
      <li><code>Ctrl+T</code> - Insertar tabla</li>
      <li><code>Esc</code> - Cerrar menús</li>
    </ul>
  </li>
  <li><strong>Explora los menús:</strong> Colores, tablas, bloques especiales</li>
  <li><strong>Observa las estadísticas</strong> en tiempo real arriba del editor</li>
</ol>

<blockquote style="background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); padding: 16px; margin: 20px 0; border-left: 4px solid var(--md-sys-color-tertiary); border-radius: 0 8px 8px 0; font-style: italic;">
  "Este editor representa la evolución del contenido web moderno, combinando funcionalidad avanzada con una experiencia de usuario excepcional."
</blockquote>

<hr style="border: none; height: 2px; background: linear-gradient(90deg, var(--md-sys-color-primary), transparent); margin: 24px 0;" />

<p>🌟 <strong>¡Comienza a crear contenido increíble ahora mismo!</strong> Selecciona texto, usa los botones de formato o prueba los atajos de teclado para experimentar la magia de este editor.</p>`);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Contenido actualizado:', newContent);
  };

  return (
    <div className="editor-demo">      <div className="demo-header">
        <h1>🚀 Editor HTML Revolucionario - Material Design 3</h1>
        <p>Editor avanzado con funcionalidades tipo WordPress y diseño Material Design 3</p>
        <div className="demo-badges">
          <span className="badge">✅ Tooltips Funcionales</span>
          <span className="badge">✅ Números Sincronizados</span>
          <span className="badge">✅ Vista Dividida Mejorada</span>
          <span className="badge">✅ Estadísticas Externas</span>
          <span className="badge">✅ Panel de Atajos</span>
        </div>
      </div>
        <div className="demo-container">        <LexicalEditorNew
          content={content}
          onChange={handleContentChange}
          placeholder="Escribe algo increíble aquí..."
        />
      </div>
      
      <div className="demo-info">
        <h3>🎯 Funcionalidades destacadas:</h3>
        <ul>
          <li>✨ <strong>Vista dividida</strong> - Ve el código y la vista previa al mismo tiempo</li>
          <li>🎨 <strong>Paleta de colores</strong> - Material Design 3 integrada</li>
          <li>📝 <strong>Bloques personalizados</strong> - Callouts, columnas, botones y más</li>
          <li>📊 <strong>Tablas responsivas</strong> - Constructor visual de tablas</li>
          <li>⌨️ <strong>Atajos de teclado</strong> - Productividad máxima</li>
          <li>📱 <strong>Responsive</strong> - Funciona perfectamente en móviles</li>
          <li>🎭 <strong>Material Design 3</strong> - Interfaz moderna y elegante</li>
        </ul>
      </div>
    </div>
  );
};

export default EditorDemo;
