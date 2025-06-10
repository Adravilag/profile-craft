interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
  errors?: any[];
}

class ContactService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  async sendMessage(data: ContactFormData): Promise<ContactResponse> {
    try {
      const response = await fetch(`${this.baseURL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al enviar el mensaje');
      }

      return result;
    } catch (error) {
      console.error('Error en contactService:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error de conexión. Verifica tu conexión a internet.'
      );
    }
  }
}

export default new ContactService();
