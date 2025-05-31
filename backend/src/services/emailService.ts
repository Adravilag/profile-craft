import nodemailer from 'nodemailer';
import { ContactFormData } from '../types/contact';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verificar la configuración del transporter
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('Conexión SMTP verificada correctamente');
    } catch (error) {
      console.error('Error al verificar la conexión SMTP:', error);
    }
  }
  async sendContactEmail(data: ContactFormData): Promise<void> {
    const { name, email, subject, message } = data;

    // Validar que todos los campos requeridos estén presentes
    if (!name || !email || !subject || !message) {
      throw new Error('Todos los campos son requeridos');
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('El formato del email no es válido');
    }

    // Sanitizar el contenido para prevenir inyecciones
    const sanitizedName = name.replace(/[<>]/g, '');
    const sanitizedSubject = subject.replace(/[<>]/g, '');
    const sanitizedMessage = message.replace(/[<>]/g, '');

    const mailOptions = {
      from: `"${sanitizedName}" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `Contacto CV: ${sanitizedSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6750a4; border-bottom: 2px solid #6750a4; padding-bottom: 10px;">
            Nuevo mensaje de contacto
          </h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Información del contacto:</h3>
            <p><strong>Nombre:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${sanitizedSubject}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Mensaje:</h3>
            <div style="background: white; padding: 20px; border-left: 4px solid #6750a4; border-radius: 4px;">
              ${sanitizedMessage.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>Este mensaje fue enviado desde tu CV web el ${new Date().toLocaleString('es-ES')}.</p>
          </div>
        </div>
      `,
      text: `
        Nuevo mensaje de contacto
        
        Nombre: ${sanitizedName}
        Email: ${email}
        Asunto: ${sanitizedSubject}
        
        Mensaje:
        ${sanitizedMessage}
        
        Enviado el ${new Date().toLocaleString('es-ES')}
      `,
      replyTo: email,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado correctamente:', info.messageId);
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error('Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.');
    }
  }
  async sendAutoReply(email: string, name: string): Promise<void> {
    // Validar entrada
    if (!email || !name) {
      console.warn('Email o nombre no proporcionados para auto-respuesta');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('Formato de email inválido para auto-respuesta:', email);
      return;
    }

    const sanitizedName = name.replace(/[<>]/g, '');

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Gracias por tu mensaje',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6750a4;">¡Hola ${sanitizedName}!</h2>
          
          <p>Gracias por ponerte en contacto conmigo. He recibido tu mensaje y te responderé lo antes posible.</p>
          
          <p>Normalmente respondo en un plazo de 24-48 horas.</p>
          
          <p>¡Que tengas un excelente día!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
            <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
          </div>
        </div>
      `,
      text: `
        ¡Hola ${sanitizedName}!
        
        Gracias por ponerte en contacto conmigo. He recibido tu mensaje y te responderé lo antes posible.
        
        Normalmente respondo en un plazo de 24-48 horas.
        
        ¡Que tengas un excelente día!
        
        Este es un mensaje automático, por favor no respondas a este correo.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Auto-respuesta enviada correctamente:', info.messageId);
    } catch (error) {
      console.error('Error al enviar auto-respuesta:', error);
      // No lanzamos error aquí para no afectar el flujo principal
    }
  }

  /**
   * Verifica si el servicio de email está configurado correctamente
   */
  public isConfigured(): boolean {
    return !!(
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_HOST
    );
  }

  /**
   * Obtiene la configuración actual (sin credenciales sensibles)
   */
  public getConfiguration(): Partial<EmailConfig> {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
    };
  }
}

export default new EmailService();
