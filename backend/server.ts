// server.js
import fs from "fs";
import path from "path";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from 'dotenv';
import multer from 'multer';

// Extender la interfaz Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { role?: string };
    }
  }
}

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno ANTES de importar otros módulos
config({ path: path.join(__dirname, '.env') });

import { emailService } from "./src/services/emailService.js";

const app = express();
app.use(cors());
// Aumentar el límite de tamaño para artículos con contenido HTML extenso
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configurar directorio estático para archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: function (req, file, cb) {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

const db = new Database(path.join(process.cwd(), "data/profilecraft-database.db"), { verbose: console.log });

// JWT Secret (en producción debería estar en variable de entorno)
const JWT_SECRET = "profilecraft-secret-key-change-in-production";

// Middleware de autenticación
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string' || !decoded || (decoded as any).role !== 'admin') {
      res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
      return;
    }
    req.user = decoded as jwt.JwtPayload & { role?: string };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
};

// 1) Perfil de usuario
app.get("/api/profile/:id", (req, res) => {
  const row = db
    .prepare(
      `SELECT id,name,email,about_me,
              status,role_title,role_subtitle,
              phone,location,linkedin_url,github_url,profile_image
       FROM users
       WHERE id = ?`
    )
    .get(req.params.id);
  res.json(row || {});
});

// 2) Experiencias
app.get("/api/experiences", (req: express.Request, res: express.Response): void => {
  const userId = req.query.userId || 1;
  const exps = db
    .prepare(
      `SELECT * FROM experiences
       WHERE user_id = ?
       ORDER BY order_index`
    )
    .all(userId);
  // Añadimos tecnologías en cada experiencia
  const techStmt = db.prepare(
    `SELECT technology
       FROM experience_technologies
       WHERE experience_id = ?`
  );
  const withTech = exps.map((e: any) => ({
    ...e,
    technologies: techStmt.all(e.id).map((r: any) => r.technology),
  }));
  res.json(withTech);
});

// 3) Proyectos
app.get("/api/projects", (req: express.Request, res: express.Response): void => {
  const userId = req.query.userId || 1;
  const projs = db
    .prepare(
      `SELECT * FROM projects
       WHERE user_id = ?
       ORDER BY order_index`
    )
    .all(userId);
  const techStmt = db.prepare(
    `SELECT technology
       FROM project_technologies
       WHERE project_id = ?`
  );
  const withTech = projs.map((p: any) => ({
    ...p,
    technologies: techStmt.all(p.id).map((r: any) => r.technology),
  }));
  res.json(withTech);
});

// 3.1) Artículos - Endpoints públicos (resumen y detalle)
app.get("/api/articles", (req, res) => {
  const userId = req.query.userId || 1;
  const status = req.query.status;
  
  let query = `SELECT id, title, description, image_url, article_url, 
              status, order_index, 
              CASE 
                WHEN article_content IS NOT NULL AND length(article_content) > 200 
                THEN substr(article_content, 1, 200) || '...'
                ELSE article_content
              END as summary
       FROM projects 
       WHERE user_id = ? AND article_content IS NOT NULL`;
  
  const params = [userId];
  
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY order_index DESC`;
  
  const articles = db.prepare(query).all(...params);
  res.json(articles);
});

app.get("/api/articles/:id", (req: express.Request, res: express.Response): void => {
  const article = db
    .prepare(
      `SELECT * FROM projects 
       WHERE id = ? AND article_content IS NOT NULL`
    )
    .get(req.params.id);
  if (!article) {
    res.status(404).json({ error: "Artículo no encontrado" });
    return;
  }
  
  // Obtener tecnologías por separado (mismo método que admin)
  const techStmt = db.prepare(
    `SELECT technology FROM project_technologies WHERE project_id = ?`
  );
  const technologies = techStmt.all(req.params.id).map((r: any) => r.technology);
  
  res.json({
    ...article,
    technologies
  });
});

// 3.2) Artículos - Endpoints de administración
app.get("/api/admin/articles", (req: express.Request, res: express.Response): void => {
  const userId = req.query.userId || 1;
  const articles = db
    .prepare(
      `SELECT * FROM projects 
       WHERE user_id = ? 
       ORDER BY order_index DESC`
    )
    .all(userId);
  const techStmt = db.prepare(
    `SELECT technology FROM project_technologies WHERE project_id = ?`
  );
  const withTech = articles.map((p: any) => ({
    ...p,
    technologies: techStmt.all(p.id).map((r: any) => r.technology),
  }));
  res.json(withTech);
});

app.post("/api/admin/articles", (req, res) => {
  const { 
    user_id = 1, 
    title, 
    description, 
    image_url = null, 
    github_url = null, 
    live_url = null, 
    article_url = null,
    article_content = null,
    video_demo_url = null, 
    status = "Completado", 
    order_index = 0,
    type = "proyecto", // Nuevo campo type
    technologies = []
  } = req.body;

  try {
    // Insertar proyecto/artículo
    const stmt = db.prepare(
      `INSERT INTO projects (user_id, title, description, image_url, github_url, live_url, article_url, article_content, video_demo_url, status, order_index, type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    );
    const result = stmt.run(user_id, title, description, image_url, github_url, live_url, article_url, article_content, video_demo_url, status, order_index, type);
    
    // Insertar tecnologías
    if (technologies && technologies.length > 0) {
      const techStmt = db.prepare(
        `INSERT INTO project_technologies (project_id, technology) VALUES (?, ?)`
      );
      for (const tech of technologies) {
        techStmt.run(result.lastInsertRowid, tech);
      }
    }
    
    // Obtener el artículo completo
    const article = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(result.lastInsertRowid);
    const techList = db.prepare(`SELECT technology FROM project_technologies WHERE project_id = ?`).all(result.lastInsertRowid);
    
    res.status(201).json({
      ...article,
      technologies: techList.map((t: { technology: string }) => t.technology)
    });
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

app.put("/api/admin/articles/:id", (req, res) => {
  console.log('🔍 PUT /api/admin/articles/:id - Recibida petición de actualización');
  console.log('📝 ID del artículo:', req.params.id);
  console.log('📊 Datos recibidos:', JSON.stringify(req.body, null, 2));
  
  const { 
    title, 
    description, 
    image_url, 
    github_url, 
    live_url, 
    article_url,
    article_content,
    video_demo_url, 
    status, 
    order_index,
    type = "proyecto", // Nuevo campo type
    technologies = []
  } = req.body;

  try {
    console.log('⚙️ Ejecutando UPDATE en la base de datos...');
    
    // Actualizar proyecto/artículo
    const stmt = db.prepare(
      `UPDATE projects SET title = ?, description = ?, image_url = ?, github_url = ?, live_url = ?, article_url = ?, article_content = ?, video_demo_url = ?, status = ?, order_index = ?, type = ?, updated_at = datetime('now')
       WHERE id = ?`
    );
    const result = stmt.run(title, description, image_url, github_url, live_url, article_url, article_content, video_demo_url, status, order_index, type, req.params.id);
    console.log('✅ UPDATE ejecutado. Cambios:', result.changes);
    
    // Actualizar tecnologías
    console.log('🔧 Actualizando tecnologías...');
    db.prepare(`DELETE FROM project_technologies WHERE project_id = ?`).run(req.params.id);
    if (technologies && technologies.length > 0) {
      const techStmt = db.prepare(
        `INSERT INTO project_technologies (project_id, technology) VALUES (?, ?)`
      );
      for (const tech of technologies) {
        techStmt.run(req.params.id, tech);
      }
      console.log(`✅ ${technologies.length} tecnologías actualizadas`);
    } else {
      console.log('ℹ️ No hay tecnologías para actualizar');
    }
    
    // Obtener el artículo actualizado
    console.log('📖 Obteniendo artículo actualizado...');
    const article = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(req.params.id);
    const techList = db.prepare(`SELECT technology FROM project_technologies WHERE project_id = ?`).all(req.params.id);
    
    const response = {
      ...article,
      technologies: techList.map((t: { technology: string }) => t.technology)
    };
    
    console.log('📤 Enviando respuesta:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('❌ Error en UPDATE:', error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.delete("/api/admin/articles/:id", (req, res) => {
  try {
    // Eliminar tecnologías primero
    db.prepare(`DELETE FROM project_technologies WHERE project_id = ?`).run(req.params.id);
    // Eliminar proyecto/artículo
    db.prepare(`DELETE FROM projects WHERE id = ?`).run(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

// 5) Testimonios - Endpoints públicos (solo aprobados)
app.get("/api/testimonials", (req, res) => {
  const userId = req.query.userId || 1;
  const testimonials = db
    .prepare(
      `SELECT * FROM testimonials 
       WHERE user_id = ? AND status = 'approved' 
       ORDER BY order_index`
    )
    .all(userId);
  res.json(testimonials);
});

// Endpoint público para enviar testimonios (requiere moderación)
app.post("/api/testimonials", (req, res) => {
  const { 
    user_id = 1, 
    name, 
    position, 
    text,
    email = "",
    company = "",
    website = "",
    order_index = 0 
  } = req.body;
  
  const stmt = db.prepare(
    `INSERT INTO testimonials (user_id, name, position, text, email, company, website, order_index, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`
  );
  const result = stmt.run(user_id, name, position, text, email, company, website, order_index);
  const testimonial = db.prepare(`SELECT * FROM testimonials WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(testimonial);
});

// 5.1) Testimonios - Endpoints de administración
app.get("/api/admin/testimonials", (req, res) => {
  const userId = req.query.userId || 1;
  const status = req.query.status; // pending, approved, rejected, all
  
  let query = `SELECT * FROM testimonials WHERE user_id = ?`;
  let params = [userId];
  
  if (status && status !== 'all') {
    query += ` AND status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY created_at DESC`;
  
  const testimonials = db.prepare(query).all(...params);
  res.json(testimonials);
});

// Aprobar testimonios
app.patch("/api/admin/testimonials/:id/approve", (req, res) => {
  const { order_index } = req.body;
  const stmt = db.prepare(
    `UPDATE testimonials SET status = 'approved', order_index = ? WHERE id = ?`
  );
  stmt.run(order_index || 0, req.params.id);
  const testimonial = db.prepare(`SELECT * FROM testimonials WHERE id = ?`).get(req.params.id);
  res.json(testimonial);
});

// Rechazar testimonios
app.patch("/api/admin/testimonials/:id/reject", (req, res) => {
  const stmt = db.prepare(
    `UPDATE testimonials SET status = 'rejected' WHERE id = ?`
  );
  stmt.run(req.params.id);
  const testimonial = db.prepare(`SELECT * FROM testimonials WHERE id = ?`).get(req.params.id);
  res.json(testimonial);
});

// Editar testimonios (admin)
app.put("/api/admin/testimonials/:id", (req, res) => {
  const { 
    name, 
    position, 
    text, 
    email = "", 
    company = "", 
    website = "", 
    order_index = 0,
    status = 'pending'
  } = req.body;
  
  const stmt = db.prepare(
    `UPDATE testimonials SET name = ?, position = ?, text = ?, email = ?, company = ?, website = ?, order_index = ?, status = ? WHERE id = ?`
  );
  stmt.run(name, position, text, email, company, website, order_index, status, req.params.id);
  const testimonial = db.prepare(`SELECT * FROM testimonials WHERE id = ?`).get(req.params.id);
  res.json(testimonial);
});

app.delete("/api/testimonials/:id", (req, res) => {
  db.prepare(`DELETE FROM testimonials WHERE id = ?`).run(req.params.id);
  res.status(204).send();
});

// ===========================================
// DESARROLLO - Token temporal para testing
// ===========================================
app.get("/api/dev/token", (req: express.Request, res: express.Response): void => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Endpoint no disponible en producción' });
    return;
  }
  
  try {
    // Generar token temporal para desarrollo
    const tempUser = { id: 1, username: 'admin', role: 'admin' };
    const token = jwt.sign(tempUser, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      token,
      message: 'Token temporal para desarrollo generado',
      expires: '24 horas'
    });
  } catch (error) {
    console.error('Error generando token de desarrollo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===========================================
// ADMIN ROUTES - EXPERIENCES
// ===========================================

// Crear nueva experiencia (Admin)
app.post("/api/admin/experiences", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const { 
      user_id = 1, 
      title, 
      company, 
      start_date, 
      end_date = "", 
      description = "", 
      technologies = [], 
      order_index = 0 
    } = req.body;

    if (!title || !company || !start_date) {
      res.status(400).json({ error: 'Título, empresa y fecha de inicio son obligatorios' });
      return;
    }

    // Insertar la experiencia
    const stmt = db.prepare(
      `INSERT INTO experiences (user_id, title, company, start_date, end_date, description, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(user_id, title, company, start_date, end_date, description, order_index);
    const experienceId = result.lastInsertRowid;

    // Insertar tecnologías si existen
    if (technologies && technologies.length > 0) {
      const techStmt = db.prepare(
        `INSERT INTO experience_technologies (experience_id, technology) VALUES (?, ?)`
      );
      for (const tech of technologies) {
        techStmt.run(experienceId, tech);
      }
    }

    // Obtener la experiencia creada con tecnologías
    const experience = db.prepare(`SELECT * FROM experiences WHERE id = ?`).get(experienceId);
    const techList = db.prepare(
      `SELECT technology FROM experience_technologies WHERE experience_id = ?`
    ).all(experienceId).map((t: any) => t.technology);

    res.status(201).json({
      ...experience,
      technologies: techList
    });
  } catch (error: any) {
    console.error('Error creando experiencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar experiencia existente (Admin)
app.put("/api/admin/experiences/:id", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const experienceId = req.params.id;
    const { 
      title, 
      company, 
      start_date, 
      end_date = "", 
      description = "", 
      technologies = [], 
      order_index = 0 
    } = req.body;

    if (!title || !company || !start_date) {
      res.status(400).json({ error: 'Título, empresa y fecha de inicio son obligatorios' });
      return;
    }

    // Verificar que la experiencia existe
    const existingExperience = db.prepare(`SELECT * FROM experiences WHERE id = ?`).get(experienceId);
    if (!existingExperience) {
      res.status(404).json({ error: 'Experiencia no encontrada' });
      return;
    }

    // Actualizar la experiencia
    const stmt = db.prepare(
      `UPDATE experiences SET title = ?, company = ?, start_date = ?, end_date = ?, description = ?, order_index = ?
       WHERE id = ?`
    );
    stmt.run(title, company, start_date, end_date, description, order_index, experienceId);

    // Eliminar tecnologías existentes
    db.prepare(`DELETE FROM experience_technologies WHERE experience_id = ?`).run(experienceId);

    // Insertar nuevas tecnologías
    if (technologies && technologies.length > 0) {
      const techStmt = db.prepare(
        `INSERT INTO experience_technologies (experience_id, technology) VALUES (?, ?)`
      );
      for (const tech of technologies) {
        techStmt.run(experienceId, tech);
      }
    }

    // Obtener la experiencia actualizada con tecnologías
    const experience = db.prepare(`SELECT * FROM experiences WHERE id = ?`).get(experienceId);
    const techList = db.prepare(
      `SELECT technology FROM experience_technologies WHERE experience_id = ?`
    ).all(experienceId).map((t: any) => t.technology);

    res.json({
      ...experience,
      technologies: techList
    });
  } catch (error: any) {
    console.error('Error actualizando experiencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar experiencia (Admin)
app.delete("/api/admin/experiences/:id", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const experienceId = req.params.id;

    // Verificar que la experiencia existe
    const existingExperience = db.prepare(`SELECT * FROM experiences WHERE id = ?`).get(experienceId);
    if (!existingExperience) {
      res.status(404).json({ error: 'Experiencia no encontrada' });
      return;
    }

    // Eliminar tecnologías relacionadas primero
    db.prepare(`DELETE FROM experience_technologies WHERE experience_id = ?`).run(experienceId);

    // Eliminar la experiencia
    db.prepare(`DELETE FROM experiences WHERE id = ?`).run(experienceId);

    res.status(204).send();
  } catch (error: any) {
    console.error('Error eliminando experiencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===========================================
// ADMIN ROUTES - EDUCATION
// ===========================================

// Obtener educación
app.get("/api/education", (req, res) => {
  const userId = req.query.userId || 1;
  const education = db
    .prepare(
      `SELECT * FROM education
       WHERE user_id = ?
       ORDER BY order_index DESC`
    )
    .all(userId);
  res.json(education);
});

// Crear nueva educación (Admin)
app.post("/api/admin/education", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const { 
      user_id = 1, 
      title, 
      institution, 
      start_date, 
      end_date = "", 
      description = "", 
      grade = "",
      order_index = 0 
    } = req.body;
    if (!title || !institution || !start_date) {
      res.status(400).json({ error: 'Título, institución y fecha de inicio son obligatorios' });
      return;
    }
    const stmt = db.prepare(
      `INSERT INTO education (user_id, title, institution, start_date, end_date, description, grade, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(user_id, title, institution, start_date, end_date, description, grade, order_index);
    const education = db.prepare(`SELECT * FROM education WHERE id = ?`).get(result.lastInsertRowid);
    res.status(201).json(education);
  } catch (error: any) {
    console.error('Error creando educación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar educación existente (Admin)
app.put("/api/admin/education/:id", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const educationId = req.params.id;
    const { 
      title, 
      institution, 
      start_date, 
      end_date = "", 
      description = "", 
      grade = "",
      order_index = 0 
    } = req.body;
    if (!title || !institution || !start_date) {
      res.status(400).json({ error: 'Título, institución y fecha de inicio son obligatorios' });
      return;
    }
    const existingEducation = db.prepare(`SELECT * FROM education WHERE id = ?`).get(educationId);
    if (!existingEducation) {
      res.status(404).json({ error: 'Educación no encontrada' });
      return;
    }
    const stmt = db.prepare(
      `UPDATE education SET title = ?, institution = ?, start_date = ?, end_date = ?, description = ?, grade = ?, order_index = ?
       WHERE id = ?`
    );
    stmt.run(title, institution, start_date, end_date, description, grade, order_index, educationId);
    const education = db.prepare(`SELECT * FROM education WHERE id = ?`).get(educationId);
    res.json(education);
  } catch (error: any) {
    console.error('Error actualizando educación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar educación (Admin)
app.delete("/api/admin/education/:id", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const educationId = req.params.id;
    const existingEducation = db.prepare(`SELECT * FROM education WHERE id = ?`).get(educationId);
    if (!existingEducation) {
      res.status(404).json({ error: 'Educación no encontrada' });
      return;
    }
    db.prepare(`DELETE FROM education WHERE id = ?`).run(educationId);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error eliminando educación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 6) Certificaciones
app.get("/api/certifications", (req, res) => {
  const userId = req.query.userId || 1;
  const certs = db
    .prepare(
      `SELECT * FROM certifications 
       WHERE user_id = ? 
       ORDER BY date DESC`
    )
    .all(userId);
  res.json(certs);
});

// 6.1) Certificaciones - Endpoints de administración
app.post("/api/certifications", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const { 
      user_id = 1, 
      title, 
      issuer, 
      date, 
      credential_id = null, 
      image_url = null,
      order_index = 0 
    } = req.body;
    if (!title || !issuer || !date) {
      res.status(400).json({ error: 'Título, emisor y fecha son obligatorios' });
      return;
    }
    const stmt = db.prepare(
      `INSERT INTO certifications (user_id, title, issuer, date, credential_id, image_url, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(user_id, title, issuer, date, credential_id, image_url, order_index);
    const certification = db.prepare(`SELECT * FROM certifications WHERE id = ?`).get(result.lastInsertRowid);
    res.status(201).json(certification);
  } catch (error: any) {
    console.error('Error creando certificación:', error);
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/certifications/:id", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const { 
      title, 
      issuer, 
      date, 
      credential_id, 
      image_url,
      order_index 
    } = req.body;
    if (!title || !issuer || !date) {
      res.status(400).json({ error: 'Título, emisor y fecha son obligatorios' });
      return;
    }
    const stmt = db.prepare(
      `UPDATE certifications 
       SET title = ?, issuer = ?, date = ?, credential_id = ?, image_url = ?, order_index = ?
       WHERE id = ?`
    );
    const result = stmt.run(title, issuer, date, credential_id, image_url, order_index, req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Certificación no encontrada' });
      return;
    }
    const certification = db.prepare(`SELECT * FROM certifications WHERE id = ?`).get(req.params.id);
    res.json(certification);
  } catch (error: any) {
    console.error('Error actualizando certificación:', error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/certifications/:id", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const result = db.prepare(`DELETE FROM certifications WHERE id = ?`).run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Certificación no encontrada' });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Error eliminando certificación:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================
// ENDPOINTS DE AUTENTICACIÓN
// =============================

// Login endpoint
app.post("/api/auth/login", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    // Buscar usuario por email (o permitir login con "admin")
    const user = db
      .prepare(
        `SELECT id, name, email, password, role, last_login_at 
         FROM users 
         WHERE email = ? OR (? = 'admin' AND role = 'admin')`
      )
      .get(email, email);

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Actualizar último login
    db.prepare(
      `UPDATE users 
       SET last_login_at = datetime('now') 
       WHERE id = ?`
    ).run(user.id);

    // Generar JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLoginAt: user.last_login_at
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token endpoint
app.get("/api/auth/verify", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  res.json({
    success: true,
    user: {
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      role: req.user!.role
    }
  });
});

// Logout endpoint (opcional, el logout puede ser solo frontend)
app.post("/api/auth/logout", (req, res) => {
  // En un sistema más avanzado, aquí invalidaríamos el token
  res.json({ success: true, message: 'Logout exitoso' });
});

// TEMPORAL: Endpoint para desarrollo - generar token automáticamente
app.get("/api/auth/dev-token", (req: express.Request, res: express.Response): void => {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      res.status(404).json({ error: 'Endpoint no disponible en producción' });
      return;
    }

    // Obtener el usuario admin
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE role = ? LIMIT 1').get('admin');
    
    if (!user) {
      res.status(404).json({ error: 'Usuario admin no encontrado' });
      return;
    }

    // Generar JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      note: 'Token generado para desarrollo - remover en producción'
    });

  } catch (error) {
    console.error('Error generando token de desarrollo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener información del usuario autenticado
app.get("/api/auth/profile", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  const user = db
    .prepare(
      `SELECT id, name, email, role, last_login_at,
              about_me, status, role_title, role_subtitle,
              phone, location, linkedin_url, github_url, profile_image
       FROM users 
       WHERE id = ?`
    )
    .get(req.user!.id);

  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  // No enviar la contraseña
  const { password, ...userProfile } = user;
  res.json(userProfile);
});

// Endpoint para cambiar contraseña
app.post("/api/auth/change-password", authenticateAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    // Obtener la contraseña actual del usuario
    const user = db
      .prepare(`SELECT password FROM users WHERE id = ?`)
      .get(req.user!.id);

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar contraseña actual
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      res.status(401).json({ error: 'Contraseña actual incorrecta' });
      return;
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña en la base de datos
    const result = db
      .prepare(`UPDATE users SET password = ? WHERE id = ?`)
      .run(hashedNewPassword, req.user!.id);

    if (result.changes === 1) {
      res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } else {
      res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== ENDPOINTS DE SKILLS =====

// GET /api/skills - Obtener todas las habilidades
app.get("/api/skills", (req, res) => {
  try {
    const userId = req.query.userId || 1;
    const skills = db
      .prepare(
        `SELECT * FROM skills 
         WHERE user_id = ? 
         ORDER BY order_index, id`
      )
      .all(userId);
    res.json(skills);
  } catch (error) {
    console.error('Error al obtener skills:', error);
    res.status(500).json({ error: "Error al obtener las habilidades" });
  }
});

// POST /api/skills - Crear nueva habilidad
app.post("/api/skills", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const { user_id, name, category, icon_class, level, order_index } = req.body;
    if (!name || !category) {
      res.status(400).json({ error: "Nombre y categoría son requeridos" });
      return;
    }
    const stmt = db.prepare(
      `INSERT INTO skills (user_id, name, category, icon_class, level, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      user_id || 1,
      name,
      category,
      icon_class || null,
      level || 50,
      order_index || 1
    );
    const newSkill = db
      .prepare(`SELECT * FROM skills WHERE id = ?`)
      .get(result.lastInsertRowid);
    res.status(201).json(newSkill);
  } catch (error: any) {
    console.error('Error al crear skill:', error);
    res.status(500).json({ error: "Error al crear la habilidad" });
  }
});
// PUT /api/skills/:id - Actualizar habilidad
app.put("/api/skills/:id", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const { name, category, icon_class, level, order_index } = req.body;
    if (!name || !category) {
      res.status(400).json({ error: "Nombre y categoría son requeridos" });
      return;
    }
    const stmt = db.prepare(
      `UPDATE skills 
       SET name = ?, category = ?, icon_class = ?, level = ?, order_index = ?
       WHERE id = ?`
    );
    const result = stmt.run(
      name,
      category,
      icon_class || null,
      level || 50,
      order_index || 1,
      req.params.id
    );
    if (result.changes === 0) {
      res.status(404).json({ error: "Habilidad no encontrada" });
      return;
    }
    const updatedSkill = db
      .prepare(`SELECT * FROM skills WHERE id = ?`)
      .get(req.params.id);
    res.json(updatedSkill);
  } catch (error: any) {
    console.error('Error al actualizar skill:', error);
    res.status(500).json({ error: "Error al actualizar la habilidad" });
  }
});
// DELETE /api/skills/:id - Eliminar habilidad
app.delete("/api/skills/:id", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const stmt = db.prepare(`DELETE FROM skills WHERE id = ?`);
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: "Habilidad no encontrada" });
      return;
    }
    res.json({ message: "Habilidad eliminada correctamente" });
  } catch (error: any) {
    console.error('Error al eliminar skill:', error);
    res.status(500).json({ error: "Error al eliminar la habilidad" });
  }
});

// ===== FIN ENDPOINTS DE SKILLS =====

// Endpoint de contacto
app.post("/api/contact", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'El formato del email no es válido'
      });
      return;
    }
    if (name.length > 100 || subject.length > 200 || message.length > 1000) {
      res.status(400).json({
        success: false,
        message: 'Uno o más campos exceden la longitud máxima permitida'
      });
      return;
    }
    console.log('📧 Enviando email de contacto...');
    console.log('Datos:', { name, email, subject: subject.substring(0, 50) + '...' });
    await emailService.sendContactEmail(req.body);
    console.log('✅ Email principal enviado');
    emailService.sendAutoReply(email, name).catch((error: any) => {
      console.error('⚠️ Error en auto-respuesta:', error.message);
    });
    res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente. Te responderé pronto.'
    });
  } catch (error: any) {
    console.error('❌ Error en endpoint de contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.'
    });
  }
});

// ===== ENDPOINTS DE MEDIA LIBRARY =====

// POST /api/upload - Subir archivo de imagen
app.post("/api/upload", authenticateAdmin, upload.single('image'), (req: express.Request, res: express.Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se ha subido ningún archivo' });
      return;
    }

    // Construir URL completa del archivo
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    console.log('📁 Archivo subido exitosamente:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      url: fileUrl
    });

    res.json({
      success: true,
      message: 'Archivo subido exitosamente',
      file: {
        id: Date.now(),
        url: fileUrl,
        name: req.file.originalname,
        type: 'image',
        size: req.file.size,
        thumbnail: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ Error al subir archivo:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
});

// GET /api/media - Obtener lista de archivos subidos
app.get("/api/media", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      res.json([]);
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const mediaItems = files
      .filter(file => {
        // Filtrar solo archivos de imagen
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file}`;
        
        return {
          id: stats.mtimeMs,
          url: fileUrl,
          name: file,
          type: 'image' as const,
          size: stats.size,
          thumbnail: fileUrl,
          filename: file,
          created: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    res.json(mediaItems);
  } catch (error) {
    console.error('❌ Error al obtener archivos de media:', error);
    res.status(500).json({ error: 'Error al obtener archivos de media' });
  }
});

// DELETE /api/media/:filename - Eliminar archivo
app.delete("/api/media/:filename", authenticateAdmin, (req: express.Request, res: express.Response): void => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Archivo no encontrado' });
      return;
    }

    fs.unlinkSync(filePath);
    console.log('🗑️ Archivo eliminado:', filename);
    
    res.json({ success: true, message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
});

// Manejo de errores de multer
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB permitido.' });
      return;
    }
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    res.status(400).json({ error: error.message });
    return;
  }
  
  next(error);
});

app.listen(3000, () => {
  console.log("API corriendo en http://localhost:3000");
});
