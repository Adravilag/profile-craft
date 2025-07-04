import { Request, Response } from 'express';
import { Certification, User } from '../models/index.js';
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

export const certificationsController = {
  // Obtener certificaciones de un usuario
  getCertifications: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.query;      console.log('🏆 Obteniendo certificaciones para usuario:', userId);
      
      // Resolver el user_id dinámico
      let queryUserId = userId;
      if (userId === 'dynamic-admin-id') {
        queryUserId = await getFirstAdminUserId();
        console.log('🔄 User ID resuelto para certificaciones:', queryUserId);
      }
      
      // Validar que el userId sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(queryUserId as string)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }
      
      // MongoDB-only implementation
      const certifications = await Certification.find({ user_id: queryUserId })
        .sort({ order_index: 1, date: -1 })
        .lean();
      
      // Mapear _id a id para compatibilidad con frontend
      const mappedCertifications = certifications.map(cert => ({
        ...cert,
        id: cert._id.toString(),
        _id: cert._id.toString()
      }));
      
      console.log('✅ Certificaciones encontradas:', mappedCertifications.length, 'registros');
      res.json(mappedCertifications);

    } catch (error: any) {
      console.error('❌ Error obteniendo certificaciones:', error);
      res.status(500).json({ error: 'Error obteniendo certificaciones' });
    }
  },
  // Crear nueva certificación (Admin)
  createCertification: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        title,
        issuer,
        date,
        credential_id,
        image_url,
        verify_url,
        user_id,
        order_index = 0
      } = req.body;      console.log('🏆 Creando nueva certificación:', { title, issuer, user_id });

      if (!title || !issuer || !date) {
        res.status(400).json({ error: 'Título, emisor y fecha son requeridos' });
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
      const newCertification = new Certification({
        title,
        issuer,
        date,
        credential_id,
        image_url,
        verify_url,
        user_id: new mongoose.Types.ObjectId(resolvedUserId),
        order_index
      });      await newCertification.save();
      console.log('✅ Certificación creada exitosamente:', newCertification._id);
      
      // Mapear _id a id para compatibilidad con frontend
      const responseData = {
        ...newCertification.toObject(),
        id: (newCertification._id as mongoose.Types.ObjectId).toString(),
        _id: (newCertification._id as mongoose.Types.ObjectId).toString()
      };
      
      res.status(201).json(responseData);

    } catch (error: any) {
      console.error('❌ Error creando certificación:', error);
      res.status(500).json({ error: 'Error creando certificación' });
    }
  },

  // Actualizar certificación existente (Admin)
  updateCertification: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        title,
        issuer,
        date,
        credential_id,
        image_url,
        verify_url,
        order_index      } = req.body;

      const updatedCertification = await Certification.findByIdAndUpdate(
        id,
        {
          title,
          issuer,
          date,
          credential_id,
          image_url,
          verify_url,
          order_index
        },
        { new: true }
      );      if (!updatedCertification) {
        res.status(404).json({ error: 'Certificación no encontrada' });
        return;
      }

      // Mapear _id a id para compatibilidad con frontend
      const responseData = {
        ...updatedCertification.toObject(),
        id: (updatedCertification._id as mongoose.Types.ObjectId).toString(),
        _id: (updatedCertification._id as mongoose.Types.ObjectId).toString()
      };

      res.json(responseData);
    } catch (error: any) {
      console.error('Error actualizando certificación:', error);
      res.status(500).json({ error: 'Error actualizando certificación' });
    }
  },  // Eliminar certificación (Admin)
  deleteCertification: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      console.log('🗑️ Intentando eliminar certificación con ID:', id);

      // Validar que el ID no sea undefined o inválido
      if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
        console.error('❌ ID de certificación inválido:', id);
        res.status(400).json({ error: 'ID de certificación inválido' });
        return;
      }
      
      const result = await Certification.findByIdAndDelete(id);
      
      if (!result) {
        console.log('❌ Certificación no encontrada con ID:', id);
        res.status(404).json({ error: 'Certificación no encontrada' });
        return;
      }

      console.log('✅ Certificación eliminada exitosamente:', id);
      res.status(204).send();
    } catch (error: any) {
      console.error('❌ Error eliminando certificación:', error);
      res.status(500).json({ error: 'Error eliminando certificación' });
    }
  }
};
