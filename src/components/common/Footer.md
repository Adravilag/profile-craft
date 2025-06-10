# Footer Component

Un componente Footer completo y accesible construido con Material Design 3 para el proyecto ProfileCraft.

## Características

- ✅ **Material Design 3**: Sigue completamente el sistema de diseño MD3
- ✅ **Responsive**: Se adapta a todos los tamaños de pantalla
- ✅ **Accesible**: Cumple con estándares WCAG 2.1
- ✅ **Temas**: Soporte completo para modo claro y oscuro
- ✅ **Animaciones**: Transiciones suaves y microinteracciones
- ✅ **Modular**: CSS Modules para estilos encapsulados
- ✅ **TypeScript**: Tipado completo con interfaces

## Uso Básico

```tsx
import Footer from '../components/common/Footer';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  return (
    <div>
      {/* Tu contenido aquí */}
      <Footer darkMode={darkMode} />
    </div>
  );
}
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `darkMode` | `boolean` | `false` | Activa el tema oscuro |
| `className` | `string` | `''` | Clases CSS adicionales |

## Secciones Incluidas

### 1. Información de Marca
- Logo/icono personalizable
- Nombre de la marca
- Tagline descriptivo
- Descripción del desarrollador

### 2. Redes Sociales
- Enlaces a LinkedIn, GitHub, Twitter
- Iconos de Font Awesome
- Efectos hover personalizados
- Colores específicos por plataforma

### 3. Navegación Rápida
- Enlaces a secciones principales
- Scroll suave automático
- Iconos de navegación
- Estados hover interactivos

### 4. Información de Contacto
- Email, teléfono, ubicación
- Iconos descriptivos
- Enlaces funcionales
- Estado de disponibilidad con indicador animado

### 5. Newsletter
- Formulario de suscripción
- Validación de email
- Botón de envío animado
- Diseño responsivo

### 6. Pie Legal
- Copyright dinámico
- Enlaces legales (Privacidad, Términos, Cookies)
- Stack tecnológico con iconos
- Información de desarrollo

## Características Especiales

### Patrón Decorativo
El footer incluye un patrón animado en la parte superior que usa los colores del sistema MD3:

```css
background: linear-gradient(90deg, 
  var(--md-sys-color-primary) 0%, 
  var(--md-sys-color-secondary) 50%, 
  var(--md-sys-color-tertiary) 100%);
```

### Botón Scroll to Top
Botón flotante que aparece automáticamente para volver al inicio de la página:

- Posición fija en la esquina inferior derecha
- Animación de entrada con retraso
- Efectos hover y active
- Scroll suave implementado

### Estado de Disponibilidad
Indicador visual del estado laboral:

```tsx
<div className={styles.availabilityStatus}>
  <div className={styles.statusIndicator}>
    <div className={styles.statusDot}></div>
    <span className={styles.statusText}>Disponible para nuevos proyectos</span>
  </div>
</div>
```

## Accesibilidad

El componente incluye múltiples características de accesibilidad:

### ARIA Labels
- `role="contentinfo"` en el footer principal
- `aria-label` en todos los enlaces
- `role="list"` y `role="listitem"` en navegación
- `aria-hidden="true"` en iconos decorativos

### Navegación por Teclado
- Focus visible mejorado
- Orden de tabulación lógico
- Shortcuts de teclado estándar

### Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px
- Grid responsivo con fallbacks

### Compatibilidad
- `prefers-reduced-motion` respetado
- `prefers-contrast` soportado
- Optimización para impresión

## Personalización

### Colores
El componente usa tokens del sistema MD3. Para personalizar colores:

```css
:root {
  --md-sys-color-primary: #your-color;
  --md-sys-color-secondary: #your-color;
  --md-sys-color-tertiary: #your-color;
}
```

### Enlaces Sociales
Modifica el array `socialLinks` en el componente:

```tsx
const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/tu-perfil',
    icon: 'fa-brands fa-linkedin',
    color: '#0077b5',
    ariaLabel: 'Visitar perfil de LinkedIn'
  },
  // Agregar más redes...
];
```

### Enlaces de Navegación
Personaliza el array `quickLinks`:

```tsx
const quickLinks = [
  { name: 'Inicio', href: '#home' },
  { name: 'Proyectos', href: '#projects' },
  // Agregar más enlaces...
];
```

## Integración con el Tema

El footer detecta automáticamente el tema usando el atributo `data-theme`:

```tsx
<footer 
  className={styles.footer}
  data-theme={darkMode ? 'dark' : 'light'}
>
```

## Performance

### Optimizaciones Incluidas
- `will-change` en elementos animados
- Transiciones optimizadas
- CSS Modules para scope aislado
- Lazy loading de imágenes

### Bundle Size
- CSS Modules: ~8KB gzipped
- TypeScript: ~3KB gzipped
- Total: ~11KB gzipped

## Dependencias

### Required
- React 18+
- CSS Modules soporte
- Font Awesome 6.x

### Variables CSS Requeridas
El footer depende de las variables MD3 definidas en:
- `src/components/styles/variables.css`

## Ejemplos de Uso

### Con Context Theme
```tsx
import { useTheme } from '../contexts/ThemeContext';
import Footer from '../components/common/Footer';

function Layout() {
  const { darkMode } = useTheme();
  
  return (
    <div>
      <main>{/* contenido */}</main>
      <Footer darkMode={darkMode} />
    </div>
  );
}
```

### Con Clases Personalizadas
```tsx
<Footer 
  darkMode={isDark} 
  className="custom-footer-spacing" 
/>
```

### Standalone
```tsx
import Footer from './components/common/Footer';

export default function App() {
  return (
    <div className="app">
      <Footer />
    </div>
  );
}
```

## Testing

Para testear el componente:

```tsx
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

test('renders footer with social links', () => {
  render(<Footer />);
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
});
```

## Estructura de Archivos

```
components/common/
├── Footer.tsx              # Componente principal
├── Footer.module.css       # Estilos CSS Modules
└── Footer.md              # Esta documentación
```

## Compatibilidad

- ✅ React 18+
- ✅ TypeScript 4.5+
- ✅ Modern browsers (Chrome 88+, Firefox 78+, Safari 14+)
- ✅ Mobile browsers
- ✅ Screen readers
- ✅ High contrast mode
- ✅ Reduced motion preferences

## Changelog

### v1.0.0
- Implementación inicial
- Soporte completo MD3
- Responsive design
- Accesibilidad WCAG 2.1
- Temas claro/oscuro
- CSS Modules
- TypeScript interfaces
