import { Project, User } from '../models/index.js';
import ArticleViewService from '../services/articleViewService.js';
import mongoose from 'mongoose';

// Función auxiliar para obtener el ID del primer usuario admin
const getFirstAdminUserId = async (): Promise<string> => {
  try {
    const adminUser = await User.findOne({ role: 'admin' }).lean();
    if (adminUser && adminUser._id) {
      return adminUser._id.toString();
    }
    throw new Error('No admin user found');
  } catch (error) {
    console.error('❌ Error obteniendo usuario admin:', error);
    throw error;
  }
};

// Función auxiliar para resolver el user_id dinámico
const resolveUserId = async (inputUserId: string | number): Promise<string> => {
  if (inputUserId === 'dynamic-admin-id' || inputUserId === 1) {
    return await getFirstAdminUserId();
  }
  return inputUserId.toString();
};

export const projectsController = {  // Obtener proyectos
  getProjects: async (req: any, res: any): Promise<void> => {
    try {
      const inputUserId = req.query.userId || 1;

      // Resolver el userId dinámico
      const userId = await resolveUserId(inputUserId);
      console.log('📁 Usuario resuelto para proyectos:', userId);

      // MongoDB-only implementation
      const projects = await Project.find({ user_id: userId })
        .sort({ order_index: -1 })
        .lean();

      res.json(projects.map(p => ({
        ...p,
        id: p._id,
        technologies: p.technologies || []
      })));

    } catch (error: any) {
      console.error('Error obteniendo proyectos:', error);
      res.status(500).json({ error: 'Error al obtener proyectos' });
    }
  },  // Obtener artículos (públicos)
  getArticles: async (req: any, res: any): Promise<void> => {
    try {
      const inputUserId = req.query.userId || 1;
      const status = req.query.status;
      
      console.log('📰 Obteniendo artículos para usuario:', inputUserId);

      // Resolver el userId dinámico
      const userId = await resolveUserId(inputUserId);
      console.log('📰 Usuario resuelto:', userId);

      // MongoDB-only implementation
      const filter: any = { 
        user_id: userId, 
        article_content: { $ne: null, $exists: true }
      };
      
      if (status) {
        filter.status = status;
      }      const articles = await Project.find(filter)
        .sort({ order_index: -1 })
        .select('title description image_url article_url status order_index article_content technologies views created_at updated_at project_start_date project_end_date github_url live_url video_demo_url')
        .lean();

      const articlesWithSummary = articles.map(article => ({
        ...article,
        id: article._id,
        summary: article.article_content && article.article_content.length > 200 
          ? article.article_content.substring(0, 200) + '...'
          : article.article_content,
        technologies: article.technologies || []
      }));

      console.log('✅ Artículos encontrados:', articlesWithSummary.length, 'registros');
      res.json(articlesWithSummary);

    } catch (error: any) {
      console.error('❌ Error obteniendo artículos:', error);
      res.status(500).json({ error: 'Error al obtener artículos' });
    }
  },
  // Obtener artículo por ID
  getArticleById: async (req: any, res: any): Promise<void> => {
    try {
      // MongoDB-only implementation
      const article = await Project.findOne({
        _id: req.params.id,
        article_content: { $ne: null, $exists: true }
      }).lean();

      if (!article) {
        res.status(404).json({ error: "Artículo no encontrado" });
        return;
      }

      // Registrar vista de forma asíncrona (no bloquear la respuesta)
      ArticleViewService.recordView(article._id.toString(), req)
        .then((recorded) => {
          if (recorded) {
            console.log(`📊 Vista registrada para artículo ${article._id}`);
          }
        })
        .catch((error) => {
          console.error('Error registrando vista:', error);
        });

      res.json({
        ...article,
        id: article._id,
        technologies: article.technologies || []
      });

    } catch (error: any) {
      console.error('Error obteniendo artículo:', error);
      res.status(500).json({ error: 'Error al obtener artículo' });
    }
  },
  // ADMIN: Obtener todos los artículos
  getAdminArticles: async (req: any, res: any): Promise<void> => {
    try {
      const inputUserId = req.query.userId || 1;

      // Resolver el userId dinámico
      const userId = await resolveUserId(inputUserId);
      console.log('📰 Usuario resuelto para admin articles:', userId);

      // MongoDB-only implementation
      const articles = await Project.find({ user_id: userId })
        .sort({ order_index: -1 })
        .lean();

      res.json(articles.map(p => ({
        ...p,
        id: p._id,
        technologies: p.technologies || []
      })));

    } catch (error: any) {
      console.error('Error obteniendo artículos admin:', error);
      res.status(500).json({ error: 'Error al obtener artículos' });
    }
  },
  // ADMIN: Crear artículo
  createArticle: async (req: any, res: any): Promise<void> => {
    try {
      const { 
        user_id = 'dynamic-admin-id', 
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
        type = "proyecto",
        technologies = []
      } = req.body;

      // Resolver el user_id dinámico
      const resolvedUserId = await resolveUserId(user_id);
      console.log('🔄 User ID resuelto para proyecto:', resolvedUserId);

      // Validar que el ID sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(resolvedUserId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // MongoDB-only implementation
      const project = new Project({
        user_id: new mongoose.Types.ObjectId(resolvedUserId),
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
        type,
        technologies: Array.isArray(technologies) ? technologies : []
      });

      await project.save();
      console.log('✅ Proyecto/Artículo creado exitosamente:', project._id);

      res.status(201).json({
        ...project.toObject(),
        id: project._id
      });

    } catch (error: any) {
      console.error('Error creando artículo:', error);
      res.status(500).json({ error: 'Error al crear artículo' });
    }
  },

  // ADMIN: Actualizar artículo
  updateArticle: async (req: any, res: any): Promise<void> => {
    try {
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
        type = "proyecto",
        technologies = []
      } = req.body;

      // MongoDB-only implementation
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        {
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
          type,
          technologies: Array.isArray(technologies) ? technologies : [],
          updated_at: new Date()
        },
        { new: true, lean: true }
      );

      if (!project) {
        res.status(404).json({ error: 'Artículo no encontrado' });
        return;
      }

      console.log('✅ Proyecto/Artículo actualizado exitosamente:', project._id);
      res.json({
        ...project,
        id: project._id
      });

    } catch (error: any) {
      console.error('Error actualizando artículo:', error);
      res.status(500).json({ error: 'Error al actualizar artículo' });
    }
  },

  // ADMIN: Eliminar artículo
  deleteArticle: async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;
      
      console.log('🗑️ Intentando eliminar proyecto/artículo con ID:', id);

      // Validar que el ID no sea undefined o inválido
      if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
        console.error('❌ ID de proyecto/artículo inválido:', id);
        res.status(400).json({ error: 'ID de proyecto/artículo inválido' });
        return;
      }

      // MongoDB-only implementation
      const result = await Project.findByIdAndDelete(id);
      
      if (!result) {
        console.log('❌ Proyecto/Artículo no encontrado con ID:', id);
        res.status(404).json({ error: 'Artículo no encontrado' });
        return;
      }

      console.log('✅ Proyecto/Artículo eliminado exitosamente:', id);
      res.status(204).send();

    } catch (error: any) {
      console.error('❌ Error eliminando artículo:', error);
      res.status(500).json({ error: 'Error al eliminar artículo' });
    }
  },

  // Obtener estadísticas de vistas de un artículo
  getArticleStats: async (req: any, res: any): Promise<void> => {
    try {
      const articleId = req.params.id;
      
      // Verificar que el artículo existe
      const article = await Project.findById(articleId).lean();
      if (!article) {
        res.status(404).json({ error: "Artículo no encontrado" });
        return;
      }

      // Obtener estadísticas
      const stats = await ArticleViewService.getViewStats(articleId);
      
      res.json({
        articleId,
        title: article.title,
        ...stats
      });

    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },
};
