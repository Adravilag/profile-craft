import express from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

// Middleware de autenticación básica (cualquier usuario autenticado)
export const authenticate = (req: any, res: any, next: any): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded) {
      res.status(403).json({ error: 'Token inválido' });
      return;
    }
    req.user = decoded as jwt.JwtPayload & { role?: string };
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware de autenticación para administradores
export const authenticateAdmin = (req: any, res: any, next: any): void => {
  console.log('🔐 authenticateAdmin: Verificando token...');
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('📋 Headers de autorización:', {
    hasAuthHeader: !!authHeader,
    authHeaderValue: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
    hasToken: !!token
  });

  if (!token) {
    console.error('❌ No se encontró token en la petición');
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('🔍 Token decodificado:', {
      type: typeof decoded,
      hasRole: !!(decoded as any)?.role,
      role: (decoded as any)?.role,
      userId: (decoded as any)?.userId,
      hasUserId: !!(decoded as any)?.userId
    });

    if (typeof decoded === 'string' || !decoded || (decoded as any).role !== 'admin') {
      console.error('❌ Token inválido o sin permisos de admin');
      res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
      return;
    }
    
    req.user = decoded as jwt.JwtPayload & { role?: string };
    console.log('✅ Autenticación exitosa, pasando al siguiente middleware');
    next();
  } catch (error) {
    console.error('❌ Error verificando token admin:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
};
