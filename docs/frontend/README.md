# 🎨 Guía del Frontend

El frontend de CV Maker es una aplicación React moderna construida con TypeScript y Vite. Esta guía cubre la arquitectura, componentes, estado y mejores prácticas del frontend.

## 🏗️ Arquitectura del Frontend

### Stack Tecnológico

- **React 18**: Framework principal con Concurrent Features
- **TypeScript**: Tipado estático para mayor robustez
- **Vite**: Build tool ultra-rápido para desarrollo
- **React Router**: Navegación SPA
- **Material Design 3**: Sistema de diseño
- **Axios**: Cliente HTTP para API calls

### Estructura de Archivos

```
apps/frontend/src/
├── 📄 App.tsx                 # Componente raíz
├── 📄 main.tsx                # Punto de entrada
├── 📄 index.css               # Estilos globales
├── 📁 components/             # Componentes React
│   ├── 📁 admin/              # Panel de administración
│   ├── 📁 common/             # Componentes reutilizables
│   ├── 📁 cv/                 # Componentes específicos del CV
│   └── 📁 layout/             # Componentes de layout
├── 📁 config/                 # Configuración de la app
├── 📁 constants/              # Constantes del frontend
├── 📁 data/                   # Datos mock y fixtures
├── 📁 hooks/                  # Custom hooks
├── 📁 services/               # Servicios para API calls
├── 📁 styles/                 # Estilos específicos
├── 📁 types/                  # Tipos TypeScript específicos
└── 📁 utils/                  # Utilidades del frontend
```

## 🧩 Componentes Principales

### Componentes de Layout

#### **Header Component**
```typescript
// components/layout/Header.tsx
interface HeaderProps {
  title?: string
  showNavigation?: boolean
  actions?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({
  title = "CV Maker",
  showNavigation = true,
  actions
}) => {
  return (
    <header className="header">
      {title && <h1>{title}</h1>}
      {showNavigation && <Navigation />}
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  )
}
```

#### **Navigation Component**
```typescript
// components/layout/Navigation.tsx
export const Navigation: React.FC = () => {
  const { user, logout } = useAuth()
  
  return (
    <nav className="navigation">
      <NavLink to="/">Inicio</NavLink>
      <NavLink to="/cv">Mi CV</NavLink>
      {user ? (
        <>
          <NavLink to="/admin">Admin</NavLink>
          <button onClick={logout}>Salir</button>
        </>
      ) : (
        <NavLink to="/login">Iniciar Sesión</NavLink>
      )}
    </nav>
  )
}
```

### Componentes de CV

#### **CV Display Component**
```typescript
// components/cv/CVDisplay.tsx
interface CVDisplayProps {
  template?: 'modern' | 'classic' | 'creative'
  data: CVData
  isEditable?: boolean
}

export const CVDisplay: React.FC<CVDisplayProps> = ({
  template = 'modern',
  data,
  isEditable = false
}) => {
  return (
    <div className={`cv-display cv-template-${template}`}>
      <CVHeader data={data.profile} />
      <CVExperience experiences={data.experiences} />
      <CVProjects projects={data.projects} />
      <CVEducation education={data.education} />
      <CVSkills skills={data.skills} />
    </div>
  )
}
```

#### **CV Section Components**
```typescript
// components/cv/CVExperience.tsx
interface CVExperienceProps {
  experiences: Experience[]
  isEditable?: boolean
}

export const CVExperience: React.FC<CVExperienceProps> = ({
  experiences,
  isEditable = false
}) => {
  return (
    <section className="cv-experience">
      <h2>Experiencia Profesional</h2>
      {experiences.map(experience => (
        <ExperienceItem
          key={experience.id}
          experience={experience}
          isEditable={isEditable}
        />
      ))}
    </section>
  )
}
```

### Componentes de Administración

#### **Admin Dashboard**
```typescript
// components/admin/AdminDashboard.tsx
export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile')
  
  return (
    <div className="admin-dashboard">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <AdminContent section={activeSection} />
    </div>
  )
}
```

#### **Form Components**
```typescript
// components/admin/forms/ExperienceForm.tsx
interface ExperienceFormProps {
  experience?: Experience
  onSave: (experience: Experience) => void
  onCancel: () => void
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  onSave,
  onCancel
}) => {
  const { formData, handleChange, handleSubmit, errors } = useForm({
    initialData: experience,
    validationSchema: experienceSchema,
    onSubmit: onSave
  })
  
  return (
    <form onSubmit={handleSubmit} className="experience-form">
      <Input
        name="company"
        label="Empresa"
        value={formData.company}
        onChange={handleChange}
        error={errors.company}
      />
      <Input
        name="position"
        label="Posición"
        value={formData.position}
        onChange={handleChange}
        error={errors.position}
      />
      {/* más campos... */}
      <FormActions>
        <Button type="submit" variant="primary">Guardar</Button>
        <Button type="button" onClick={onCancel}>Cancelar</Button>
      </FormActions>
    </form>
  )
}
```

## 🎣 Custom Hooks

### useAuth Hook
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const login = async (credentials: LoginCredentials) => {
    const { user, token } = await authService.login(credentials)
    setUser(user)
    localStorage.setItem('token', token)
    return user
  }
  
  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }
  
  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const user = await authService.verifyToken(token)
        setUser(user)
      } catch (error) {
        logout()
      }
    }
    setIsLoading(false)
  }
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }
}
```

### useCV Hook
```typescript
// hooks/useCV.ts
export const useCV = () => {
  const [cvData, setCVData] = useState<CVData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchCV = async () => {
    setIsLoading(true)
    try {
      const data = await cvService.getCV()
      setCVData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateSection = async (section: string, data: any) => {
    try {
      await cvService.updateSection(section, data)
      await fetchCV() // Refrescar datos
    } catch (err) {
      setError(err.message)
    }
  }
  
  useEffect(() => {
    fetchCV()
  }, [])
  
  return {
    cvData,
    isLoading,
    error,
    refetch: fetchCV,
    updateSection
  }
}
```

### useForm Hook
```typescript
// hooks/useForm.ts
interface UseFormOptions<T> {
  initialData?: T
  validationSchema?: any
  onSubmit: (data: T) => void
}

export const useForm = <T extends Record<string, any>>({
  initialData,
  validationSchema,
  onSubmit
}: UseFormOptions<T>) => {
  const [formData, setFormData] = useState<T>(initialData || {} as T)
  const [errors, setErrors] = useState<Partial<T>>({})
  
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }
  
  const validate = () => {
    if (!validationSchema) return true
    
    const result = validationSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<T> = {}
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0] as keyof T] = err.message
      })
      setErrors(fieldErrors)
      return false
    }
    
    setErrors({})
    return true
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }
  
  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    setFormData,
    setErrors
  }
}
```

## 🌐 Servicios API

### Base API Service
```typescript
// services/api.ts
class ApiService {
  private baseURL: string
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
  }
  
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }
  
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options
    }
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }
  
  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
  
  put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
  
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE'
    })
  }
}

export const apiService = new ApiService()
```

### Specific Services
```typescript
// services/cvService.ts
class CVService {
  async getCV(): Promise<CVData> {
    return apiService.get<CVData>('/profile/full')
  }
  
  async updateProfile(profile: Profile): Promise<Profile> {
    return apiService.put<Profile>('/profile', profile)
  }
  
  async getExperiences(): Promise<Experience[]> {
    return apiService.get<Experience[]>('/experiences')
  }
  
  async createExperience(experience: CreateExperienceDto): Promise<Experience> {
    return apiService.post<Experience>('/experiences', experience)
  }
  
  async updateExperience(id: string, experience: UpdateExperienceDto): Promise<Experience> {
    return apiService.put<Experience>(`/experiences/${id}`, experience)
  }
  
  async deleteExperience(id: string): Promise<void> {
    return apiService.delete(`/experiences/${id}`)
  }
  
  async exportToPDF(): Promise<Blob> {
    const response = await fetch(`${apiService.baseURL}/export/pdf`, {
      headers: apiService.getHeaders()
    })
    return response.blob()
  }
}

export const cvService = new CVService()
```

## 🎨 Sistema de Estilos

### CSS Variables
```css
/* styles/variables.css */
:root {
  /* Colores principales */
  --color-primary: #1976d2;
  --color-primary-light: #42a5f5;
  --color-primary-dark: #1565c0;
  
  /* Colores secundarios */
  --color-secondary: #dc004e;
  --color-accent: #ffc107;
  
  /* Grises */
  --color-background: #fafafa;
  --color-surface: #ffffff;
  --color-text-primary: #212121;
  --color-text-secondary: #757575;
  
  /* Espaciado */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.15);
  
  /* Bordes */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  /* Transiciones */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}

/* Dark theme */
[data-theme="dark"] {
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-text-primary: #ffffff;
  --color-text-secondary: #aaaaaa;
}
```

### Component Styles
```css
/* components/cv/CVDisplay.module.css */
.cvDisplay {
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.cvTemplateModern {
  font-family: var(--font-family);
  line-height: 1.6;
}

.cvTemplateClassic {
  font-family: 'Times New Roman', serif;
  line-height: 1.8;
}

.cvSection {
  margin-bottom: var(--spacing-xl);
}

.cvSectionTitle {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: var(--spacing-sm);
}
```

## 📱 Responsive Design

### Breakpoints
```css
/* styles/breakpoints.css */
:root {
  --breakpoint-xs: 0px;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-xxl: 1400px;
}
```

### Media Queries Helper
```typescript
// utils/responsive.ts
export const breakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
}

export const mediaQuery = (breakpoint: keyof typeof breakpoints) => 
  `@media (min-width: ${breakpoints[breakpoint]})`

// Uso en componentes
const StyledComponent = styled.div`
  padding: 8px;
  
  ${mediaQuery('md')} {
    padding: 16px;
  }
  
  ${mediaQuery('lg')} {
    padding: 24px;
  }
`
```

## ⚡ Optimización de Performance

### Code Splitting
```typescript
// App.tsx
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@cv-maker/ui'

// Lazy loading de páginas
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'))
const CVEditor = lazy(() => import('./components/cv/CVEditor'))

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/editor" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CVEditor />
            </Suspense>
          } 
        />
      </Routes>
    </Router>
  )
}
```

### Memoization
```typescript
// Memoización de componentes costosos
export const CVDisplay = React.memo<CVDisplayProps>(({
  template,
  data,
  isEditable
}) => {
  // Memoizar cálculos costosos
  const processedData = useMemo(() => {
    return processComplexData(data)
  }, [data])
  
  // Memoizar callbacks
  const handleEdit = useCallback((section: string, value: any) => {
    onEdit?.(section, value)
  }, [onEdit])
  
  return (
    <div className={`cv-display cv-template-${template}`}>
      {/* render content */}
    </div>
  )
})
```

## 🧪 Testing Frontend

### Component Testing
```typescript
// components/__tests__/CVDisplay.test.tsx
import { render, screen } from '@testing-library/react'
import { CVDisplay } from '../CVDisplay'
import { mockCVData } from '../../__mocks__/cvData'

describe('CVDisplay', () => {
  it('renders CV data correctly', () => {
    render(<CVDisplay data={mockCVData} />)
    
    expect(screen.getByText(mockCVData.profile.fullName)).toBeInTheDocument()
    expect(screen.getByText(mockCVData.profile.title)).toBeInTheDocument()
  })
  
  it('applies template styles correctly', () => {
    const { container } = render(
      <CVDisplay data={mockCVData} template="modern" />
    )
    
    expect(container.firstChild).toHaveClass('cv-template-modern')
  })
})
```

### Hook Testing
```typescript
// hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password'
      })
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeTruthy()
  })
})
```

## 🚀 Mejores Prácticas

### 1. Estructura de Componentes
- Un componente por archivo
- Nombrado descriptivo en PascalCase
- Props interfaces claramente definidas
- Separar lógica de presentación

### 2. Estado y Efectos
- Usar `useState` para estado local
- `useEffect` con dependencias correctas
- Custom hooks para lógica reutilizable
- Context solo para estado global

### 3. Performance
- Lazy loading para rutas
- Memoización cuando sea necesario
- Optimizar re-renders
- Bundle analysis regular

### 4. Accessibilidad
- Atributos ARIA apropiados
- Navegación por teclado
- Contraste de colores
- Textos alternativos

### 5. TypeScript
- Tipado estricto habilitado
- Interfaces para props
- Generics cuando sea apropiado
- Evitar `any` tipo

Esta guía proporciona una base sólida para el desarrollo del frontend. Para más detalles específicos, consulta las secciones individuales de componentes, testing y deployment.
