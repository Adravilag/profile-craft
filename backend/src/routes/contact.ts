import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { emailService } from '../services/emailService.js';
import type { ContactFormData, ContactResponse } from '../types/contact.js';

const router = Router();

// Validaciones
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El asunto debe tener entre 5 y 200 caracteres'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('El mensaje debe tener entre 10 y 1000 caracteres'),
];

// POST /api/contact
router.post('/', contactValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array(),
      });
      return;
    }

    const formData: ContactFormData = req.body;

    // Enviar email principal
    await emailService.sendContactEmail(formData);

    // Enviar auto-respuesta (opcional, no bloquea si falla)
    emailService.sendAutoReply(formData.email, formData.name).catch(console.error);

    const response: ContactResponse = {
      success: true,
      message: 'Mensaje enviado correctamente. Te responderé pronto.',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error en endpoint de contacto:', error);
    
    const response: ContactResponse = {
      success: false,
      message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
    };

    res.status(500).json(response);
  }
});

export default router;
