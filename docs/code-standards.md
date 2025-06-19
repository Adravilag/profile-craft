# 🔧 Estándares de Código

Este documento establece las convenciones y mejores prácticas para mantener un código consistente, legible y mantenible en todo el proyecto CV Maker.

## 📋 Principios Generales

### 1. **Legibilidad sobre Brevedad**
- El código debe ser claro y autodocumentado
- Prefiere nombres descriptivos sobre nombres cortos
- Usa comentarios cuando sea necesario, no cuando sea obvio

### 2. **Consistencia**
- Sigue las convenciones establecidas en el proyecto
- Usa las herramientas de formateo automático (Prettier, ESLint)
- Mantén un estilo consistente en todo el codebase

### 3. **Simplicidad**
- Escribe código simple y directo
- Evita la sobre-ingeniería
- Una función debe hacer una cosa y hacerla bien

### 4. **Reutilización**
- Evita la duplicación de código (DRY - Don't Repeat Yourself)
- Crea componentes y utilidades reutilizables
- Usa los paquetes compartidos del monorepo

## 🏗️ Estructura de Archivos

### Nomenclatura de Archivos

```typescript
// ✅ Correcto - PascalCase para componentes
UserProfile.tsx
ExperienceCard.tsx
AdminDashboard.tsx

// ✅ Correcto - camelCase para utilities y services
userService.ts
formatDate.ts
apiHelpers.ts

// ✅ Correcto - kebab-case para páginas y features
user-profile.tsx
experience-management.tsx

// ✅ Correcto - UPPER_CASE para constantes
API_ENDPOINTS.ts
DEFAULT_VALUES.ts

// ❌ Incorrecto - Inconsistencia
userprofile.tsx
User_Profile.tsx
user-Service.ts
```

### Estructura de Directorios

```
src/
├── components/           # Componentes React
│   ├── common/          # Componentes reutilizables
│   ├── forms/           # Componentes de formularios
│   └── layout/          # Componentes de layout
├── hooks/               # Custom hooks
├── services/            # Servicios de API
├── utils/               # Utilidades generales
├── types/               # Tipos TypeScript
├── constants/           # Constantes
└── styles/              # Estilos globales
```

## 🎯 TypeScript

### Tipado Estricto

```typescript
// ✅ Correcto - Interfaces descriptivas
interface UserProfile {
  id: string
  fullName: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// ✅ Correcto - Props de componentes
interface UserCardProps {
  user: UserProfile
  onEdit?: (user: UserProfile) => void
  isEditable?: boolean
  className?: string
}

// ✅ Correcto - Tipos de respuesta API
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// ❌ Evitar - Uso de 'any'
const processData = (data: any) => {
  // ...
}

// ✅ Mejor - Tipos específicos
const processUserData = (data: UserProfile[]) => {
  // ...
}
```

### Generics y Tipos Avanzados

```typescript
// ✅ Correcto - Generic hooks
function useApi<T>(endpoint: string): {
  data: T | null
  loading: boolean
  error: string | null
} {
  // ...
}

// ✅ Correcto - Utility types
type PartialUser = Partial<UserProfile>
type RequiredUser = Required<UserProfile>
type UserEmail = Pick<UserProfile, 'email'>
type UserWithoutId = Omit<UserProfile, 'id'>

// ✅ Correcto - Conditional types
type ApiEndpoint<T> = T extends 'users' ? UserProfile[] : 
                     T extends 'projects' ? Project[] : 
                     unknown
```

### Enums vs Union Types

```typescript
// ✅ Prefiere union types para valores simples
type Theme = 'light' | 'dark' | 'auto'
type Status = 'pending' | 'approved' | 'rejected'

// ✅ Usa enums para conjuntos complejos con métodos
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

// ✅ Funciones helper para enums
const isAdmin = (role: UserRole): boolean => {
  return role === UserRole.ADMIN
}
```

## ⚛️ React y JSX

### Componentes Funcionales

```typescript
// ✅ Correcto - Componente funcional con TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  children,
  onClick
}) => {
  const handleClick = () => {
    if (disabled || loading) return
    onClick?.(
  }
  
  return (
    <button
      type="button"
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

### Hooks Pattern

```typescript
// ✅ Correcto - Custom hook bien estructurado
interface UseUserOptions {
  autoFetch?: boolean
  onError?: (error: string) => void
}

export const useUser = (userId: string, options: UseUserOptions = {}) => {
  const { autoFetch = true, onError } = options
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const userData = await userService.getUser(userId)
      setUser(userData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [userId, onError])
  
  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return
    
    try {
      const updatedUser = await userService.updateUser(user.id, updates)
      setUser(updatedUser)
      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar'
      setError(errorMessage)
      throw err
    }
  }, [user])
  
  useEffect(() => {
    if (autoFetch && userId) {
      fetchUser()
    }
  }, [autoFetch, userId, fetchUser])
  
  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    updateUser
  }
}
```

### Conditional Rendering

```typescript
// ✅ Correcto - Conditional rendering limpio
export const UserDashboard: React.FC = () => {
  const { user, loading, error } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (error) {
    return <ErrorMessage message={error} />
  }
  
  if (!user) {
    return <LoginPrompt />
  }
  
  return (
    <div className="dashboard">
      <DashboardHeader user={user} />
      <DashboardContent user={user} />
    </div>
  )
}

// ❌ Evitar - Conditional rendering complejo
export const UserDashboard: React.FC = () => {
  const { user, loading, error } = useAuth()
  
  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : !user ? (
        <LoginPrompt />
      ) : (
        <div className="dashboard">
          <DashboardHeader user={user} />
          <DashboardContent user={user} />
        </div>
      )}
    </div>
  )
}
```

## 🎨 CSS y Estilos

### Convenciones de Naming

```css
/* ✅ Correcto - BEM Methodology */
.user-card {
  /* Bloque */
}

.user-card__avatar {
  /* Elemento */
}

.user-card__name {
  /* Elemento */
}

.user-card--featured {
  /* Modificador */
}

.user-card__avatar--large {
  /* Elemento con modificador */
}

/* ✅ Correcto - CSS Modules */
.container {
  padding: var(--spacing-md);
}

.title {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
}

.description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}
```

### Variables CSS

```css
/* ✅ Correcto - Variables semánticas */
:root {
  /* Colores semánticos */
  --color-primary: #1976d2;
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  
  /* Espaciado consistente */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography scale */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  /* Sombras estandarizadas */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

## 🚀 Node.js y Backend

### Estructura de Controladores

```typescript
// ✅ Correcto - Controlador bien estructurado
export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search } = req.query
      
      const options = {
        page: Number(page),
        limit: Number(limit),
        search: search as string
      }
      
      const result = await userService.getUsers(options)
      
      res.status(200).json(
        createSuccessResponse('Usuarios obtenidos exitosamente', result)
      )
    } catch (error) {
      next(error) // Delegar al middleware de error
    }
  }
  
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body
      const user = await userService.createUser(userData)
      
      res.status(201).json(
        createSuccessResponse('Usuario creado exitosamente', user)
      )
    } catch (error) {
      next(error)
    }
  }
}
```

### Manejo de Errores

```typescript
// ✅ Correcto - Clases de error personalizadas
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 404)
  }
}

// ✅ Middleware de manejo de errores
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    })
  }
  
  // Error no esperado
  console.error('Error no manejado:', err)
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  })
}
```

### Validación con Joi

```typescript
// ✅ Correcto - Schemas de validación reutilizables
export const userSchemas = {
  create: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'El email debe ser válido',
        'any.required': 'El email es requerido'
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      }),
    
    fullName: Joi.string()
      .min(2)
      .max(100)
      .required(),
    
    title: Joi.string()
      .min(2)
      .max(100)
      .required()
  }),
  
  update: Joi.object({
    fullName: Joi.string().min(2).max(100),
    title: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/),
    location: Joi.string().max(100)
  }).min(1) // Al menos un campo debe estar presente
}
```

## 📝 Comentarios y Documentación

### JSDoc para Funciones

```typescript
/**
 * Calcula la experiencia total en años basada en las fechas de empleo
 * @param experiences - Array de experiencias laborales
 * @param includeOverlapping - Si incluir períodos superpuestos (default: false)
 * @returns Número total de años de experiencia
 * @example
 * ```typescript
 * const totalYears = calculateTotalExperience(userExperiences, false)
 * console.log(`Total: ${totalYears} años`)
 * ```
 */
export const calculateTotalExperience = (
  experiences: Experience[],
  includeOverlapping: boolean = false
): number => {
  // Implementation...
}

/**
 * Hook para manejar la autenticación del usuario
 * @returns Objeto con estado y métodos de autenticación
 */
export const useAuth = (): AuthState => {
  // Implementation...
}
```

### Comentarios en el Código

```typescript
// ✅ Correcto - Comentarios que explican el "por qué"
export const processUserData = (userData: RawUserData) => {
  // Normalizar el email para evitar duplicados por diferencias de case
  const normalizedEmail = userData.email.toLowerCase().trim()
  
  // Validar que la fecha de nacimiento no sea futura
  if (userData.birthDate > new Date()) {
    throw new ValidationError('La fecha de nacimiento no puede ser futura')
  }
  
  // Convertir el número de teléfono a formato internacional
  // si no lo está ya (necesario para notificaciones SMS)
  const phoneNumber = normalizePhoneNumber(userData.phone)
  
  return {
    ...userData,
    email: normalizedEmail,
    phone: phoneNumber
  }
}

// ❌ Evitar - Comentarios que repiten el código
export const calculateAge = (birthDate: Date) => {
  // Obtener la fecha actual
  const now = new Date()
  
  // Restar el año de nacimiento del año actual
  const age = now.getFullYear() - birthDate.getFullYear()
  
  // Retornar la edad
  return age
}
```

## 🧪 Testing

### Nomenclatura de Tests

```typescript
// ✅ Correcto - Nombres descriptivos
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Test implementation
    })
    
    it('should throw ValidationError when email is invalid', async () => {
      // Test implementation
    })
    
    it('should hash password before saving to database', async () => {
      // Test implementation
    })
  })
  
  describe('getUserById', () => {
    it('should return user when ID exists', async () => {
      // Test implementation
    })
    
    it('should throw NotFoundError when user does not exist', async () => {
      // Test implementation
    })
  })
})

// ✅ Correcto - Tests de componentes React
describe('UserCard Component', () => {
  it('should render user information correctly', () => {
    const mockUser = createMockUser()
    render(<UserCard user={mockUser} />)
    
    expect(screen.getByText(mockUser.fullName)).toBeInTheDocument()
    expect(screen.getByText(mockUser.title)).toBeInTheDocument()
  })
  
  it('should call onEdit when edit button is clicked', () => {
    const mockUser = createMockUser()
    const onEditMock = jest.fn()
    
    render(<UserCard user={mockUser} onEdit={onEditMock} />)
    
    fireEvent.click(screen.getByRole('button', { name: /editar/i }))
    
    expect(onEditMock).toHaveBeenCalledWith(mockUser)
  })
})
```

### Mocks y Fixtures

```typescript
// ✅ Correcto - Factories para datos de prueba
export const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  title: 'Software Developer',
  avatar: null,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides
})

export const createMockExperience = (overrides: Partial<Experience> = {}): Experience => ({
  id: 'exp-123',
  company: 'Test Company',
  position: 'Developer',
  startDate: new Date('2022-01-01'),
  endDate: new Date('2023-01-01'),
  description: 'Test description',
  technologies: ['JavaScript', 'React'],
  ...overrides
})
```

## 🔧 Herramientas de Desarrollo

### ESLint Configuration

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "eqeqeq": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 📦 Imports y Exports

### Organización de Imports

```typescript
// ✅ Correcto - Orden de imports
// 1. Node modules
import React, { useState, useEffect } from 'react'
import { Router } from 'express'
import axios from 'axios'

// 2. Internal packages (monorepo)
import { Button, Input } from '@cv-maker/ui'
import { formatDate, validateEmail } from '@cv-maker/shared'

// 3. Relative imports (mismo directorio hacia arriba)
import { UserService } from '../services/UserService'
import { validateUser } from '../utils/validation'
import { UserCard } from './UserCard'

// 4. Types (al final)
import type { User, Experience } from '../types'
```

### Exports

```typescript
// ✅ Correcto - Named exports para utilidades
export const formatDate = (date: Date) => { /* ... */ }
export const validateEmail = (email: string) => { /* ... */ }

// ✅ Correcto - Default export para componentes principales
const UserDashboard: React.FC = () => {
  // ...
}

export default UserDashboard

// ✅ Correcto - Barrel exports para módulos
// index.ts
export { UserService } from './UserService'
export { ExperienceService } from './ExperienceService'
export { ProjectService } from './ProjectService'
export type { ApiResponse, PaginatedResponse } from './types'
```

Siguiendo estos estándares de código, el proyecto mantendrá una base de código consistente, legible y fácil de mantener. Asegúrate de configurar las herramientas de desarrollo mencionadas y revisar regularmente el cumplimiento de estos estándares.
