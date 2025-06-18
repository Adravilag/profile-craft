import express from "express";
import { profileController } from "../controllers/profileController.js";
import { authController } from "../controllers/authController.js";

const router = express.Router();

// Endpoint especial para configuración inicial del wizard
// Este endpoint crea un usuario temporal y permite la configuración inicial
router.post("/initial-setup", async (req: any, res: any) => {
  try {
    console.log('🎯 Initial setup endpoint called');
    console.log('📝 Request body:', req.body);
    
    const {
      name,
      email,
      role_title,
      role_subtitle,
      about_me,
      phone,
      location,
      linkedin_url,
      github_url
    } = req.body;
    
    // Validar campos obligatorios
    if (!name || !email || !role_title || !about_me) {
      return res.status(400).json({ 
        error: 'Campos obligatorios: name, email, role_title, about_me' 
      });    }
    
    // Obtener o crear token de desarrollo automáticamente
    const { authController: auth } = await import('../controllers/authController.js');
    
    // Simular request para obtener dev token
    const tokenReq = { body: {} };
    const tokenRes = {
      json: (data: any) => data,
      status: (code: number) => ({ json: (data: any) => ({ status: code, data }) })
    };
    
    let tokenData: any;
    try {
      await new Promise((resolve, reject) => {
        const originalJson = tokenRes.json;
        tokenRes.json = (data: any) => {
          tokenData = data;
          resolve(data);
          return data;
        };
        
        auth.devToken(tokenReq, tokenRes);
      });
    } catch (error) {
      console.error('❌ Error getting dev token:', error);
      return res.status(500).json({ error: 'Error obteniendo autorización' });
    }
    
    if (!tokenData || !tokenData.token) {
      return res.status(500).json({ error: 'No se pudo obtener autorización' });
    }
    
    // Simular request autenticado para actualizar perfil
    const profileReq = {
      user: tokenData.user,
      body: {
        name,
        email,
        role_title,
        role_subtitle,
        about_me,
        phone,
        location,
        linkedin_url,
        github_url,
        status: 'Disponible para nuevos proyectos'
      }
    };
    
    const profileRes = {
      json: (data: any) => {
        console.log('✅ Profile updated successfully');
        res.json({
          success: true,
          message: 'Configuración inicial completada',
          profile: data,
          token: tokenData.token
        });
      },
      status: (code: number) => ({
        json: (data: any) => {
          console.error('❌ Profile update failed:', data);
          res.status(code).json(data);
        }
      })
    };
    
    // Actualizar perfil
    await profileController.updateProfile(profileReq, profileRes);
    
  } catch (error: any) {
    console.error('❌ Error in initial setup:', error);
    res.status(500).json({ error: 'Error en configuración inicial' });
  }
});

export default router;
