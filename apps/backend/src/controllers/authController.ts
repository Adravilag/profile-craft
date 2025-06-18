import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { config } from '../config/index.js';

export const authController = {
  // Verificar si existe al menos un usuario registrado
  hasUser: async (req: any, res: any): Promise<void> => {
    try {
      const count = await User.countDocuments();
      res.json({ exists: count > 0 });
    } catch (error: any) {
      console.error('Error verificando usuarios:', error);
      res.status(500).json({ error: 'Error verificando usuarios' });
    }
  },

  // Obtener el primer usuario admin
  firstAdminUser: async (req: any, res: any): Promise<void> => {
    try {
      const adminUser = await User.findOne({ role: 'admin' })
        .select('_id name email role')
        .lean();

      if (!adminUser) {
        res.status(404).json({ 
          success: false, 
          error: 'No se encontró usuario admin' 
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: adminUser._id.toString(),
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    } catch (error: any) {
      console.error('🔥 Error obteniendo primer usuario admin:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error obteniendo usuario admin' 
      });
    }
  },

  // Registro de usuario
  register: async (req: any, res: any): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: 'El usuario ya existe' });
        return;
      }

      const userCount = await User.countDocuments();
      const isFirstUser = userCount === 0;

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: isFirstUser ? 'admin' : 'user'
      });

      await newUser.save();
      
      // Eliminar token de la respuesta, solo devolver datos del usuario
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error: any) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  // Inicio de sesión
  login: async (req: any, res: any): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const token = jwt.sign(
        { 
          userId: user._id.toString(), 
          email: user.email, 
          role: user.role 
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Enviar token en cookie httpOnly
      res.cookie('portfolio_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      res.json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },

  // Verificar token
  verify: async (req: any, res: any): Promise<void> => {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({
        valid: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Error verificando token:', error);
      res.status(500).json({ error: 'Error al verificar token' });
    }
  },

  // Cerrar sesión
  logout: async (req: any, res: any): Promise<void> => {
    // Limpiar la cookie httpOnly
    res.clearCookie('portfolio_auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: 'Sesión cerrada exitosamente' });
  },

  // Token de desarrollo
  devToken: async (req: any, res: any): Promise<void> => {
    try {
      if (config.isDevelopment) {
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
          res.status(404).json({ error: 'No se encontró usuario admin' });
          return;
        }

        const token = jwt.sign(
          { 
            userId: adminUser._id.toString(), 
            email: adminUser.email, 
            role: adminUser.role 
          },
          config.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          token,
          user: {
            id: adminUser._id.toString(),
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          }
        });
      } else {
        res.status(403).json({ error: 'Solo disponible en desarrollo' });
      }
    } catch (error: any) {
      console.error('Error generando token de desarrollo:', error);
      res.status(500).json({ error: 'Error generando token' });
    }
  },

  // Cambiar contraseña
  changePassword: async (req: any, res: any): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({ error: 'Contraseña actual incorrecta' });
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  }
};
