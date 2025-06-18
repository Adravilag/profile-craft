import { Request, Response } from 'express';
import { Education, User } from '../models/index.js';
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
const resolveUserId = async (inputUserId: string): Promise<string> => {
  if (inputUserId === 'dynamic-admin-id') {
    return await getFirstAdminUserId();
  }
  return inputUserId;
};

export const educationController = {
  // Obtener educación de un usuario
  getEducation: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.query;
      console.log('🎓 Obteniendo educación para usuario:', userId);
      
      let queryUserId = userId;
      
      // Si el userId es 'dynamic-admin-id', buscar el primer usuario admin
      if (userId === 'dynamic-admin-id') {
        // Por ahora, crear algunos datos de ejemplo para desarrollo
        const mockEducation = [
          {
            _id: new mongoose.Types.ObjectId(),
            title: "Grado en Ingeniería Informática",
            institution: "Universidad Tecnológica",
            start_date: "2018",
            end_date: "2022",
            description: "Especialización en Desarrollo de Software y Sistemas Distribuidos.",
            grade: "Sobresaliente",
            user_id: userId,
            order_index: 1,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            _id: new mongoose.Types.ObjectId(),
            title: "Máster en Desarrollo Web Full Stack",
            institution: "Escuela de Programación Avanzada",
            start_date: "2022",
            end_date: "2023",
            description: "Especialización en tecnologías modernas de desarrollo web.",
            grade: "Excelente",
            user_id: userId,
            order_index: 2,
            created_at: new Date(),
            updated_at: new Date()
          }
        ];
        
        console.log('✅ Devolviendo datos de ejemplo de educación:', mockEducation.length, 'registros');
        res.json(mockEducation);
        return;
      }
      
      // Validar que el userId sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(queryUserId as string)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }
      
      // MongoDB-only implementation
      const education = await Education.find({ user_id: queryUserId })
        .sort({ order_index: 1, start_date: -1 })
        .lean();
      console.log('✅ Educación encontrada:', education.length, 'registros');
      res.json(education);

    } catch (error: any) {
      console.error('❌ Error obteniendo educación:', error);
      res.status(500).json({ error: 'Error obteniendo educación' });
    }
  },
  // Crear nueva educación (Admin)
  createEducation: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        title,
        institution,
        start_date,
        end_date,
        description,
        grade,
        user_id,
        order_index = 0
      } = req.body;

      console.log('🎓 Creando nueva educación:', { title, institution, user_id });

      if (!title || !institution || !start_date) {
        res.status(400).json({ error: 'Título, institución y fecha de inicio son requeridos' });
        return;
      }

      // Resolver el user_id dinámico
      const resolvedUserId = await resolveUserId(user_id);
      console.log('🔄 User ID resuelto:', resolvedUserId);

      // Validar que el ID sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(resolvedUserId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // MongoDB-only implementation
      const newEducation = new Education({
        title,
        institution,
        start_date,
        end_date,
        description,
        grade,
        user_id: new mongoose.Types.ObjectId(resolvedUserId),
        order_index
      });

      await newEducation.save();
      console.log('✅ Educación creada exitosamente:', newEducation._id);
      res.status(201).json(newEducation);

    } catch (error: any) {
      console.error('❌ Error creando educación:', error);
      res.status(500).json({ error: 'Error creando educación' });
    }
  },

  // Actualizar educación existente (Admin)
  updateEducation: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        title,
        institution,
        start_date,
        end_date,
        description,
        grade,
        order_index
      } = req.body;

      // MongoDB-only implementation
      const updatedEducation = await Education.findByIdAndUpdate(
        id,
        {
          title,
          institution,
          start_date,
          end_date,
          description,
          grade,
          order_index
        },
        { new: true }
      );

      if (!updatedEducation) {
        res.status(404).json({ error: 'Educación no encontrada' });
        return;
      }

      console.log('✅ Educación actualizada exitosamente:', updatedEducation._id);
      res.json(updatedEducation);

    } catch (error: any) {
      console.error('Error actualizando educación:', error);
      res.status(500).json({ error: 'Error actualizando educación' });
    }
  },
  // Eliminar educación (Admin)
  deleteEducation: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      console.log('🗑️ Intentando eliminar educación con ID:', id);

      // Validar que el ID no sea undefined o inválido
      if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
        console.error('❌ ID de educación inválido:', id);
        res.status(400).json({ error: 'ID de educación inválido' });
        return;
      }

      // MongoDB-only implementation
      const result = await Education.findByIdAndDelete(id);
      
      if (!result) {
        console.log('❌ Educación no encontrada con ID:', id);
        res.status(404).json({ error: 'Educación no encontrada' });
        return;
      }

      console.log('✅ Educación eliminada exitosamente:', id);
      res.status(204).send();

    } catch (error: any) {
      console.error('❌ Error eliminando educación:', error);
      res.status(500).json({ error: 'Error eliminando educación' });
    }
  }
};
