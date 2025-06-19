# ⚙️ Guía del Backend

El backend de CV Maker es una API REST robusta construida con Node.js, Express y MongoDB. Esta guía cubre la arquitectura, endpoints, autenticación y mejores prácticas del backend.

## 🏗️ Arquitectura del Backend

### Stack Tecnológico

- **Node.js 20**: Runtime de JavaScript
- **Express**: Framework web minimalista
- **TypeScript**: Tipado estático
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación sin estado
- **Multer**: Manejo de archivos

### Estructura de Archivos

```
apps/backend/src/
├── 📁 config/                 # Configuración del servidor
│   ├── 📄 index.ts            # Configuración principal
│   ├── 📄 database.ts         # Configuración MongoDB
│   └── 📄 multer.ts           # Configuración upload archivos
├── 📁 controllers/            # Controladores de rutas
│   ├── 📄 authController.ts
│   ├── 📄 profileController.ts
│   ├── 📄 experiencesController.ts
│   ├── 📄 projectsController.ts
│   ├── 📄 educationController.ts
│   ├── 📄 skillsController.ts
│   ├── 📄 certificationsController.ts
│   ├── 📄 testimonialsController.ts
│   ├── 📄 contactController.ts
│   ├── 📄 mediaController.ts
│   └── 📄 healthController.ts
├── 📁 middleware/             # Middleware personalizado
│   └── 📄 auth.ts             # Middleware de autenticación
├── 📁 models/                 # Modelos de Mongoose
│   ├── 📄 User.ts
│   ├── 📄 Experience.ts
│   ├── 📄 Project.ts
│   ├── 📄 Education.ts
│   ├── 📄 Skill.ts
│   ├── 📄 Certification.ts
│   ├── 📄 Testimonial.ts
│   ├── 📄 Contact.ts
│   ├── 📄 ArticleView.ts
│   └── 📄 index.ts
├── 📁 routes/                 # Definición de rutas
│   ├── 📄 auth.ts
│   ├── 📄 profile.ts
│   ├── 📄 experiences.ts
│   ├── 📄 projects.ts
│   └── 📄 index.ts
├── 📁 services/               # Lógica de negocio
│   ├── 📄 authService.ts
│   ├── 📄 emailService.ts
│   └── 📄 fileService.ts
├── 📁 types/                  # Tipos TypeScript específicos
│   ├── 📄 request.ts
│   ├── 📄 response.ts
│   └── 📄 index.ts
└── 📁 utils/                  # Utilidades del backend
    ├── 📄 validators.ts
    ├── 📄 helpers.ts
    └── 📄 constants.ts
```

## 🗄️ Modelos de Base de Datos

### User Model
```typescript
// models/User.ts
import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  profile: {
    fullName: string
    title: string
    phone?: string
    location?: string
    website?: string
    linkedin?: string
    github?: string
    summary: string
    avatar?: string
  }
  preferences: {
    theme: 'light' | 'dark'
    language: string
    notifications: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    fullName: { type: String, required: true },
    title: { type: String, required: true },
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    github: String,
    summary: { type: String, required: true },
    avatar: String
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'es' },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
})

// Índices para optimizar consultas
userSchema.index({ email: 1 })
userSchema.index({ 'profile.fullName': 'text' })

export const User = model<IUser>('User', userSchema)
```

### Experience Model
```typescript
// models/Experience.ts
import { Schema, model, Document, Types } from 'mongoose'

export interface IExperience extends Document {
  userId: Types.ObjectId
  company: string
  position: string
  location?: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  description: string
  technologies: string[]
  achievements: string[]
  order: number
  isVisible: boolean
}

const experienceSchema = new Schema<IExperience>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  isCurrent: { type: Boolean, default: false },
  description: { type: String, required: true },
  technologies: [String],
  achievements: [String],
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
}, {
  timestamps: true
})

// Índices
experienceSchema.index({ userId: 1, order: 1 })
experienceSchema.index({ userId: 1, startDate: -1 })

export const Experience = model<IExperience>('Experience', experienceSchema)
```

### Project Model
```typescript
// models/Project.ts
export interface IProject extends Document {
  userId: Types.ObjectId
  title: string
  description: string
  technologies: string[]
  repositoryUrl?: string
  liveUrl?: string
  imageUrl?: string
  startDate: Date
  endDate?: Date
  status: 'completed' | 'in-progress' | 'planned'
  category: string
  highlights: string[]
  order: number
  isVisible: boolean
  isFeatured: boolean
}

const projectSchema = new Schema<IProject>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  repositoryUrl: String,
  liveUrl: String,
  imageUrl: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'planned'],
    default: 'completed'
  },
  category: { type: String, required: true },
  highlights: [String],
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, {
  timestamps: true
})

export const Project = model<IProject>('Project', projectSchema)
```

## 🛣️ Sistema de Rutas

### Route Structure
```typescript
// routes/index.ts
import { Router } from 'express'
import authRoutes from './auth'
import profileRoutes from './profile'
import experienceRoutes from './experiences'
import projectRoutes from './projects'
import educationRoutes from './education'
import skillsRoutes from './skills'
import mediaRoutes from './media'
import healthRoutes from './health'

const router = Router()

// API versioning
const API_VERSION = '/api/v1'

router.use(`${API_VERSION}/health`, healthRoutes)
router.use(`${API_VERSION}/auth`, authRoutes)
router.use(`${API_VERSION}/profile`, profileRoutes)
router.use(`${API_VERSION}/experiences`, experienceRoutes)
router.use(`${API_VERSION}/projects`, projectRoutes)
router.use(`${API_VERSION}/education`, educationRoutes)
router.use(`${API_VERSION}/skills`, skillsRoutes)
router.use(`${API_VERSION}/media`, mediaRoutes)

export default router
```

### Auth Routes
```typescript
// routes/auth.ts
import { Router } from 'express'
import { authController } from '../controllers/authController'
import { validateRequest } from '../middleware/validation'
import { loginSchema, registerSchema } from '../utils/validators'

const router = Router()

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', validateRequest(registerSchema), authController.register)

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), authController.login)

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token de acceso
 * @access  Public
 */
router.post('/refresh', authController.refreshToken)

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authController.logout)

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', authController.getCurrentUser)

export default router
```

### Protected Routes
```typescript
// routes/experiences.ts
import { Router } from 'express'
import { experienceController } from '../controllers/experienceController'
import { authenticateToken } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { experienceSchema } from '../utils/validators'

const router = Router()

// Aplicar autenticación a todas las rutas
router.use(authenticateToken)

/**
 * @route   GET /api/experiences
 * @desc    Obtener todas las experiencias del usuario
 * @access  Private
 */
router.get('/', experienceController.getExperiences)

/**
 * @route   GET /api/experiences/:id
 * @desc    Obtener experiencia específica
 * @access  Private
 */
router.get('/:id', experienceController.getExperience)

/**
 * @route   POST /api/experiences
 * @desc    Crear nueva experiencia
 * @access  Private
 */
router.post('/', validateRequest(experienceSchema), experienceController.createExperience)

/**
 * @route   PUT /api/experiences/:id
 * @desc    Actualizar experiencia
 * @access  Private
 */
router.put('/:id', validateRequest(experienceSchema), experienceController.updateExperience)

/**
 * @route   DELETE /api/experiences/:id
 * @desc    Eliminar experiencia
 * @access  Private
 */
router.delete('/:id', experienceController.deleteExperience)

/**
 * @route   PUT /api/experiences/reorder
 * @desc    Reordenar experiencias
 * @access  Private
 */
router.put('/reorder', experienceController.reorderExperiences)

export default router
```

## 🎮 Controladores

### Auth Controller
```typescript
// controllers/authController.ts
import { Request, Response } from 'express'
import { User } from '../models/User'
import { authService } from '../services/authService'
import { createResponse, createErrorResponse } from '../utils/response'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, title } = req.body
      
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json(
          createErrorResponse('El usuario ya existe', 'USER_EXISTS')
        )
      }
      
      // Crear nuevo usuario
      const user = await authService.createUser({
        email,
        password,
        profile: { fullName, title, summary: '' }
      })
      
      // Generar tokens
      const tokens = await authService.generateTokens(user._id)
      
      res.status(201).json(
        createResponse('Usuario registrado exitosamente', {
          user: authService.sanitizeUser(user),
          ...tokens
        })
      )
    } catch (error) {
      res.status(500).json(
        createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR')
      )
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      
      // Buscar usuario
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json(
          createErrorResponse('Credenciales inválidas', 'INVALID_CREDENTIALS')
        )
      }
      
      // Verificar contraseña
      const isValidPassword = await authService.comparePassword(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json(
          createErrorResponse('Credenciales inválidas', 'INVALID_CREDENTIALS')
        )
      }
      
      // Generar tokens
      const tokens = await authService.generateTokens(user._id)
      
      res.json(
        createResponse('Inicio de sesión exitoso', {
          user: authService.sanitizeUser(user),
          ...tokens
        })
      )
    } catch (error) {
      res.status(500).json(
        createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR')
      )
    }
  },

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const user = await User.findById(userId)
      
      if (!user) {
        return res.status(404).json(
          createErrorResponse('Usuario no encontrado', 'USER_NOT_FOUND')
        )
      }
      
      res.json(
        createResponse('Usuario obtenido exitosamente', {
          user: authService.sanitizeUser(user)
        })
      )
    } catch (error) {
      res.status(500).json(
        createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR')
      )
    }
  }
}
```

### Experience Controller
```typescript
// controllers/experienceController.ts
import { Request, Response } from 'express'
import { Experience } from '../models/Experience'
import { createResponse, createErrorResponse } from '../utils/response'

export const experienceController = {
  async getExperiences(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const experiences = await Experience.find({ userId })
        .sort({ order: 1, startDate: -1 })
      
      res.json(
        createResponse('Experiencias obtenidas exitosamente', { experiences })
      )
    } catch (error) {
      res.status(500).json(
        createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR')
      )
    }
  },

  async createExperience(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const experienceData = { ...req.body, userId }
      
      const experience = new Experience(experienceData)
      await experience.save()
      
      res.status(201).json(
        createResponse('Experiencia creada exitosamente', { experience })
      )
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json(
          createErrorResponse('Datos de experiencia inválidos', 'VALIDATION_ERROR')
        )
      }
      
      res.status(500).json(
        createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR')
      )
    }
  },

  async updateExperience(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      const experience = await Experience.findOneAndUpdate(
        { _id: id, userId },
        req.body,
        { new: true, runValidators: true }
      )
      
      if (!experience) {
        return res.status(404).json(
          createErrorResponse('Experiencia no encontrada', 'EXPERIENCE_NOT_FOUND')
        )
      }
      
      res.json(
        createResponse('Experiencia actualizada exitosamente', { experience })
      )
    } catch (error) {
      res.status(500).json(
        createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR')
      )
    }
  },

  async deleteExperience(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      const experience = await Experience.findOneAndDelete({ _id: id, userId })
      
      if (!experience) {
        return res.status(404).json(
          createErrorResponse('Experiencia no encontrada', 'EXPERIENCE_NOT_FOUND')
        )
      }
      
      res.json(
        createResponse('Experiencia eliminada exitosamente')
      )
    } catch (error) {
      res.status(500).json(
        createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR')
      )
    }
  }
}
```

## 🔐 Middleware de Autenticación

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { createErrorResponse } from '../utils/response'

interface JwtPayload {
  userId: string
  iat: number
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
      }
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json(
        createErrorResponse('Token de acceso requerido', 'TOKEN_REQUIRED')
      )
    }
    
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado')
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload
    
    // Verificar que el usuario todavía existe
    const user = await User.findById(decoded.userId).select('email')
    if (!user) {
      return res.status(401).json(
        createErrorResponse('Token inválido', 'INVALID_TOKEN')
      )
    }
    
    req.user = {
      id: decoded.userId,
      email: user.email
    }
    
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        createErrorResponse('Token inválido', 'INVALID_TOKEN')
      )
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        createErrorResponse('Token expirado', 'TOKEN_EXPIRED')
      )
    }
    
    res.status(500).json(
      createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR')
    )
  }
}

// Middleware opcional - no falla si no hay token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET!
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload
      
      const user = await User.findById(decoded.userId).select('email')
      if (user) {
        req.user = {
          id: decoded.userId,
          email: user.email
        }
      }
    } catch (error) {
      // No hacer nada, simplemente continuar sin usuario
    }
  }
  
  next()
}
```

## 🛡️ Validación de Datos

```typescript
// utils/validators.ts
import Joi from 'joi'

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email debe ser válido',
      'any.required': 'Email es requerido'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Contraseña debe tener al menos 6 caracteres',
      'any.required': 'Contraseña es requerida'
    }),
  
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nombre debe tener al menos 2 caracteres',
      'string.max': 'Nombre no puede exceder 100 caracteres',
      'any.required': 'Nombre completo es requerido'
    }),
  
  title: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Título debe tener al menos 2 caracteres',
      'string.max': 'Título no puede exceder 100 caracteres',
      'any.required': 'Título profesional es requerido'
    })
})

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  
  password: Joi.string()
    .required()
})

export const experienceSchema = Joi.object({
  company: Joi.string()
    .min(1)
    .max(100)
    .required(),
  
  position: Joi.string()
    .min(1)
    .max(100)
    .required(),
  
  location: Joi.string()
    .max(100)
    .optional(),
  
  startDate: Joi.date()
    .required(),
  
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .optional(),
  
  isCurrent: Joi.boolean()
    .default(false),
  
  description: Joi.string()
    .min(10)
    .max(2000)
    .required(),
  
  technologies: Joi.array()
    .items(Joi.string().max(50))
    .max(20)
    .default([]),
  
  achievements: Joi.array()
    .items(Joi.string().max(200))
    .max(10)
    .default([])
})

// Middleware de validación
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    
    if (error) {
      const errorMessage = error.details[0].message
      return res.status(400).json(
        createErrorResponse(errorMessage, 'VALIDATION_ERROR')
      )
    }
    
    next()
  }
}
```

## 📁 Manejo de Archivos

```typescript
// config/multer.ts
import multer from 'multer'
import path from 'path'
import { Request } from 'express'

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// Filtro de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos de archivo permitidos
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de archivo no permitido'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// Controller para manejo de archivos
export const mediaController = {
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json(
          createErrorResponse('No se ha subido ningún archivo', 'NO_FILE')
        )
      }
      
      const fileUrl = `/uploads/${req.file.filename}`
      
      res.json(
        createResponse('Archivo subido exitosamente', {
          url: fileUrl,
          originalName: req.file.originalname,
          size: req.file.size
        })
      )
    } catch (error) {
      res.status(500).json(
        createErrorResponse('Error al subir archivo', 'UPLOAD_ERROR')
      )
    }
  }
}
```

## 🔧 Utilidades y Helpers

```typescript
// utils/response.ts
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  code?: string
  timestamp: string
}

export const createResponse = <T>(
  message: string,
  data?: T
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
})

export const createErrorResponse = (
  message: string,
  code?: string,
  error?: string
): ApiResponse => ({
  success: false,
  message,
  error,
  code,
  timestamp: new Date().toISOString()
})

// utils/helpers.ts
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const sanitizeHtml = (html: string): string => {
  // Implementar sanitización de HTML si es necesario
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
```

## 🧪 Testing Backend

```typescript
// __tests__/auth.test.ts
import request from 'supertest'
import { app } from '../server'
import { User } from '../models/User'

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    // Limpiar base de datos de prueba
    await User.deleteMany({})
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        title: 'Developer'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.accessToken).toBeDefined()
    })

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        fullName: 'Test User',
        title: 'Developer'
      }

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario para pruebas
      const user = new User({
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        profile: {
          fullName: 'Test User',
          title: 'Developer',
          summary: 'Test summary'
        }
      })
      await user.save()
    })

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.accessToken).toBeDefined()
    })

    it('should not login with invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401)
    })
  })
})
```

## 🚀 Optimización y Performance

### Database Optimization
```typescript
// Índices compuestos para queries complejas
experienceSchema.index({ userId: 1, startDate: -1 })
projectSchema.index({ userId: 1, isFeatured: 1, order: 1 })

// Agregación para statistics
export const getExperienceStats = async (userId: string) => {
  return Experience.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalExperience: { $sum: 1 },
        technologies: { $push: '$technologies' },
        companies: { $addToSet: '$company' }
      }
    },
    {
      $project: {
        totalExperience: 1,
        uniqueTechnologies: {
          $size: {
            $setUnion: {
              $reduce: {
                input: '$technologies',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }
            }
          }
        },
        totalCompanies: { $size: '$companies' }
      }
    }
  ])
}
```

### Caching Strategy
```typescript
// utils/cache.ts
import Redis from 'redis'

class CacheService {
  private client: Redis.RedisClientType
  
  constructor() {
    this.client = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }
}

export const cacheService = new CacheService()

// Middleware de cache
export const cacheMiddleware = (ttl: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`
    
    const cached = await cacheService.get(key)
    if (cached) {
      return res.json(cached)
    }
    
    // Override res.json to cache the response
    const originalJson = res.json
    res.json = function(data) {
      cacheService.set(key, data, ttl)
      return originalJson.call(this, data)
    }
    
    next()
  }
}
```

## 🛡️ Seguridad

```typescript
// middleware/security.ts
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'

// Rate limiting
export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Demasiadas peticiones, intenta de nuevo más tarde',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
}

// Security middleware setup
export const setupSecurity = (app: Express) => {
  // Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  }))
  
  // Sanitización de MongoDB
  app.use(mongoSanitize())
  
  // Rate limiting general
  app.use(createRateLimit(15 * 60 * 1000, 100)) // 100 requests per 15 minutes
  
  // Rate limiting específico para auth
  app.use('/api/auth', createRateLimit(15 * 60 * 1000, 5)) // 5 requests per 15 minutes
}
```

Esta guía del backend proporciona una base sólida para el desarrollo de la API. Para implementaciones específicas, consulta los archivos individuales en el código fuente y las pruebas unitarias correspondientes.
