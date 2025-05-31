// src/components/sections/certifications/CertificationsCRUDDemo.tsx
import React, { useState } from 'react';
import { 
  getCertifications, 
  createCertification, 
  updateCertification, 
  deleteCertification 
} from '../../../services/api';
import './CertificationsCRUDDemo.css';

interface CertificationsCRUDDemoProps {
  onClose: () => void;
}

const CertificationsCRUDDemo: React.FC<CertificationsCRUDDemoProps> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [demoComplete, setDemoComplete] = useState(false);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setLog(prev => [...prev, logEntry]);
  };

  const runCRUDDemo = async () => {
    setIsRunning(true);
    setLog([]);
    setDemoComplete(false);

    try {
      // 1. READ - Obtener certificaciones existentes
      addLog('🔍 INICIANDO DEMO CRUD DE CERTIFICACIONES');
      addLog('📖 PASO 1: Leyendo certificaciones existentes...');
      
      const initialCerts = await getCertifications();
      addLog(`✅ Encontradas ${initialCerts.length} certificaciones existentes`, 'success');

      // 2. CREATE - Crear nueva certificación de demo
      addLog('➕ PASO 2: Creando nueva certificación de demo...');
      
      const newCertData = {
        title: "DEMO - Kubernetes Certified Administrator",
        issuer: "Cloud Native Computing Foundation",
        date: "2024",
        credential_id: "CKA-DEMO-2024-001",
        image_url: "https://images.credly.com/size/340x340/images/8b8ed108-e77d-4396-ac59-2504583b9d54/cka_from_cncfsite__281_29.png",
        order_index: 999,
        user_id: 1
      };

      const createdCert = await createCertification(newCertData);
      addLog(`✅ Certificación creada con ID: ${createdCert.id}`, 'success');

      // Esperar un momento para visualizar
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. UPDATE - Actualizar la certificación
      addLog('✏️ PASO 3: Actualizando certificación demo...');
      
      const updateData = {
        ...newCertData,
        title: "DEMO - Kubernetes Certified Administrator (ACTUALIZADO)",
        credential_id: "CKA-DEMO-2024-001-UPDATED",
        date: "Diciembre 2024"
      };

      const updatedCert = await updateCertification(createdCert.id, updateData);
      addLog(`✅ Certificación actualizada: "${updatedCert.title}"`, 'success');

      // Esperar un momento para visualizar
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 4. READ - Verificar cambios
      addLog('📖 PASO 4: Verificando cambios...');
      
      const updatedCerts = await getCertifications();
      const demoRCert = updatedCerts.find(c => c.id === createdCert.id);
      
      if (demoRCert) {
        addLog(`✅ Certificación encontrada con título: "${demoRCert.title}"`, 'success');
      } else {
        addLog('❌ Error: No se encontró la certificación actualizada', 'error');
      }

      // Esperar un momento para visualizar
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 5. DELETE - Eliminar certificación de demo
      addLog('🗑️ PASO 5: Eliminando certificación demo...');
      
      await deleteCertification(createdCert.id);
      addLog(`✅ Certificación eliminada exitosamente`, 'success');

      // 6. Verificación final
      addLog('🔍 PASO 6: Verificación final...');
      
      const finalCerts = await getCertifications();
      const certStillExists = finalCerts.find(c => c.id === createdCert.id);
      
      if (!certStillExists) {
        addLog(`✅ Verificado: Certificación eliminada correctamente`, 'success');
        addLog(`📊 Total de certificaciones: ${finalCerts.length}`, 'info');
      } else {
        addLog('❌ Error: La certificación aún existe después de la eliminación', 'error');
      }

      addLog('🎉 DEMO CRUD COMPLETADO EXITOSAMENTE!', 'success');
      addLog('✨ Todas las operaciones CRUD funcionan correctamente', 'success');
      
      setDemoComplete(true);

    } catch (error) {
      addLog(`❌ Error durante el demo: ${error}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };
  return (
    <div className="crud-demo-overlay">
      <div className="crud-demo-modal">
        <div className="crud-demo-header">
          <h3 className="crud-demo-title">
            <i className="fas fa-play-circle"></i>
            Demo CRUD Certificaciones
          </h3>
          <button className="crud-demo-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="crud-demo-content">
          <div className="crud-demo-description">
            <p>
              Esta demostración ejecutará automáticamente todas las operaciones CRUD:
            </p>
            <ul>
              <li><strong>📖 READ</strong> - Leer certificaciones existentes</li>
              <li><strong>➕ CREATE</strong> - Crear nueva certificación de demo</li>
              <li><strong>✏️ UPDATE</strong> - Actualizar la certificación</li>
              <li><strong>🗑️ DELETE</strong> - Eliminar la certificación</li>
            </ul>
          </div>

          <div className="crud-demo-controls">
            <button 
              className={`crud-demo-button ${isRunning ? 'loading' : ''}`}
              onClick={runCRUDDemo}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Ejecutando Demo...
                </>
              ) : (
                <>
                  <i className="fas fa-play"></i>
                  Ejecutar Demo CRUD
                </>
              )}
            </button>
          </div>

          {log.length > 0 && (
            <div className="crud-demo-status">
              <h4>
                <i className="fas fa-terminal"></i>
                Log de Ejecución
              </h4>
              <div className="crud-demo-log">
                {log.map((entry, index) => (
                  <div 
                    key={index} 
                    className={`log-entry ${
                      entry.includes('SUCCESS') ? 'success' : 
                      entry.includes('ERROR') ? 'error' : 'info'
                    }`}
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          )}

          {demoComplete && (
            <div className="crud-demo-results">
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h4>¡Demo Completado Exitosamente!</h4>
              <p>Todas las operaciones CRUD están funcionando correctamente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationsCRUDDemo;
