import { User } from '../models/index.js';
import mongoose from 'mongoose';

export const profileController = {
  // Obtener perfil por ID
  getProfile: async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.params.id;
      
      // Validar que el ID sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // MongoDB-only implementation
      const user = await User.findById(userId)
        .select('name email about_me status role_title role_subtitle phone location linkedin_url github_url profile_image')
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({
        ...user,
        id: user._id
      });

    } catch (error: any) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },  // Obtener perfil del usuario autenticado
  getAuthProfile: async (req: any, res: any): Promise<void> => {
    try {
      console.log('🔍 getAuthProfile: Iniciando...');
      console.log('👤 Usuario del token:', req.user);
      console.log('🆔 UserID:', req.user?.userId);
      
      if (!req.user?.userId) {
        console.error('❌ No hay userId en el token');
        res.status(401).json({ error: 'Token inválido - no userId' });
        return;
      }

      // MongoDB-only implementation
      const user = await User.findById(req.user!.userId)
        .select('name email role last_login_at about_me status role_title role_subtitle phone location linkedin_url github_url profile_image')
        .lean();

      console.log('📊 Usuario encontrado:', {
        found: !!user,
        name: user?.name,
        email: user?.email,
        role_title: user?.role_title,
        hasAllFields: !!(user?.name && user?.email)
      });

      if (!user) {
        console.error('❌ Usuario no encontrado en la base de datos');
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const responseData = {
        ...user,
        id: user._id
      };

      console.log('✅ Enviando datos del perfil:', {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
        role_title: responseData.role_title,
        about_me: responseData.about_me?.substring(0, 50) + '...',
        hasProfileImage: !!responseData.profile_image
      });

      res.json(responseData);

    } catch (error: any) {
      console.error('❌ Error al obtener perfil autenticado:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  // Actualizar perfil del usuario autenticado
  updateProfile: async (req: any, res: any): Promise<void> => {
    try {
      console.log('🔄 updateProfile called');
      console.log('👤 User from token:', req.user);
      console.log('📝 Request body:', req.body);
      
      const {
        name,
        about_me,
        status,
        role_title,
        role_subtitle,
        phone,
        location,
        linkedin_url,
        github_url,
        profile_image
      } = req.body;

      console.log('🍃 Using MongoDB-only implementation');
        // MongoDB-only implementation
      const user = await User.findByIdAndUpdate(
        req.user!.userId,
        {
          name,
          about_me,
          status,
          role_title,
          role_subtitle,
          phone,
          location,
          linkedin_url,
          github_url,
          profile_image,
          updated_at: new Date()
        },
        { new: true, lean: true }
      ).select('name email role about_me status role_title role_subtitle phone location linkedin_url github_url profile_image');

      if (!user) {
        console.log('❌ User not found in MongoDB');
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      console.log('✅ MongoDB update successful');
      res.json({
        ...user,
        id: user._id
      });

    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error);
      console.error('📋 Error stack:', error.stack);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  }
};
