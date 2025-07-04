import { Request, Response } from 'express';
import { Testimonial } from '../models/index.js';

export const testimonialsController = {  // Obtener testimonios de un usuario (solo aprobados para vista pública)
  getTestimonials: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.query;
      console.log('💬 Obteniendo testimonios aprobados para usuario:', userId);
      
      const testimonials = await Testimonial.find({ 
        user_id: userId,
        status: 'approved' // Solo testimonios aprobados para la vista pública
      })
        .sort({ order_index: 1 })
        .lean();
      console.log('✅ Testimonios aprobados encontrados:', testimonials.length, 'registros');
      res.json(testimonials);
    } catch (error: any) {
      console.error('❌ Error obteniendo testimonios:', error);
      res.status(500).json({ error: 'Error obteniendo testimonios' });
    }
  },

  // Crear nuevo testimonio (Admin)
  createTestimonial: async (req: Request, res: Response): Promise<void> => {
    try {      const {
        name,
        position,
        text,
        email,
        company,
        website,
        avatar,
        rating = 5,
        user_id,
        order_index = 0
      } = req.body;

      console.log('💬 Creando nuevo testimonio:', { name, position, user_id });

      if (!name || !position || !text) {
        res.status(400).json({ error: 'Nombre, posición y texto son requeridos' });
        return;
      }      const newTestimonial = new Testimonial({
        name,
        position,
        text,
        email,
        company,
        website,
        avatar,
        rating,
        user_id,
        order_index
      });

      await newTestimonial.save();
      console.log('✅ Testimonio creado exitosamente:', newTestimonial._id);
      res.status(201).json(newTestimonial);
    } catch (error: any) {
      console.error('❌ Error creando testimonio:', error);
      res.status(500).json({ error: 'Error creando testimonio' });
    }
  },

  // Actualizar testimonio existente (Admin)
  updateTestimonial: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;      const {
        name,
        position,
        text,
        email,
        company,
        website,
        avatar,
        rating,
        order_index
      } = req.body;console.log('💬 Actualizando testimonio:', id);

      const updatedTestimonial = await Testimonial.findByIdAndUpdate(
        id,        {
          name,
          position,
          text,
          email,
          company,
          website,
          avatar,
          rating,
          order_index
        },
        { new: true }
      );

      if (!updatedTestimonial) {
        res.status(404).json({ error: 'Testimonio no encontrado' });
        return;
      }

      console.log('✅ Testimonio actualizado exitosamente');
      res.json(updatedTestimonial);
    } catch (error: any) {
      console.error('❌ Error actualizando testimonio:', error);
      res.status(500).json({ error: 'Error actualizando testimonio' });
    }
  },
  // Eliminar testimonio (Admin)
  deleteTestimonial: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log('💬 Eliminando testimonio:', id);
      
      const result = await Testimonial.findByIdAndDelete(id);
      
      if (!result) {
        res.status(404).json({ error: 'Testimonio no encontrado' });
        return;
      }

      console.log('✅ Testimonio eliminado exitosamente');
      res.status(204).send();
    } catch (error: any) {
      console.error('❌ Error eliminando testimonio:', error);
      res.status(500).json({ error: 'Error eliminando testimonio' });
    }
  },

  // Obtener todos los testimonios para administración
  getAdminTestimonials: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, status } = req.query;
      console.log('💬 Obteniendo testimonios admin para usuario:', userId, 'status:', status);
      
      let query: any = { user_id: userId };
      
      // Filtrar por estado si se proporciona
      if (status && status !== 'all') {
        query.status = status;
      }
      
      const testimonials = await Testimonial.find(query)
        .sort({ created_at: -1 })
        .lean();
        
      console.log('✅ Testimonios admin encontrados:', testimonials.length, 'registros');
      res.json(testimonials);
    } catch (error: any) {
      console.error('❌ Error obteniendo testimonios admin:', error);
      res.status(500).json({ error: 'Error obteniendo testimonios admin' });
    }
  },

  // Aprobar testimonio
  approveTestimonial: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { order_index = 0 } = req.body;
      
      console.log('💬 Aprobando testimonio:', id);
      
      const testimonial = await Testimonial.findByIdAndUpdate(
        id,
        { 
          status: 'approved',
          order_index,
          approved_at: new Date()
        },
        { new: true }
      );
      
      if (!testimonial) {
        res.status(404).json({ error: 'Testimonio no encontrado' });
        return;
      }
      
      console.log('✅ Testimonio aprobado exitosamente');
      res.json(testimonial);
    } catch (error: any) {
      console.error('❌ Error aprobando testimonio:', error);
      res.status(500).json({ error: 'Error aprobando testimonio' });
    }
  },

  // Rechazar testimonio
  rejectTestimonial: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      console.log('💬 Rechazando testimonio:', id);
      
      const testimonial = await Testimonial.findByIdAndUpdate(
        id,
        { 
          status: 'rejected',
          rejected_at: new Date()
        },
        { new: true }
      );
      
      if (!testimonial) {
        res.status(404).json({ error: 'Testimonio no encontrado' });
        return;
      }
      
      console.log('✅ Testimonio rechazado exitosamente');
      res.json(testimonial);
    } catch (error: any) {
      console.error('❌ Error rechazando testimonio:', error);
      res.status(500).json({ error: 'Error rechazando testimonio' });
    }
  },
};
