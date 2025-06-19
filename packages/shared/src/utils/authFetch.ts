/**
 * Utilidad para hacer peticiones de autenticación de manera silenciosa
 * Evita que los errores 401 esperados aparezcan como errores en la consola
 */

export interface AuthFetchResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
}

/**
 * Fetch silencioso para verificación de autenticación
 * No genera ruido en la consola para códigos de estado esperados (401, 403)
 */
export async function silentAuthFetch(url: string, options: RequestInit = {}): Promise<AuthFetchResponse> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Siempre incluir cookies para auth
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const result: AuthFetchResponse = {
      ok: response.ok,
      status: response.status
    };

    if (response.ok) {
      try {
        result.data = await response.json();
      } catch {
        // Si no hay JSON válido, no es un error crítico para auth
        result.data = null;
      }
    } else if (response.status === 401 || response.status === 403) {
      // Códigos de estado esperados en auth - no son errores reales
      try {
        const errorData = await response.json();
        result.error = errorData.error || errorData.message || 'No autorizado';
      } catch {
        result.error = response.status === 401 ? 'No autorizado' : 'Acceso denegado';
      }
    } else {
      // Otros errores HTTP
      try {
        const errorData = await response.json();
        result.error = errorData.error || errorData.message || `Error HTTP ${response.status}`;
      } catch {
        result.error = `Error HTTP ${response.status}`;
      }
    }

    return result;
  } catch (error) {
    // Solo errores de red reales
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Error de conexión'
    };
  }
}
