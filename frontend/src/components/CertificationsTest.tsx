import React, { useState, useEffect } from 'react';
import { getCertifications } from '../services/api';

const CertificationsTest: React.FC = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🧪 Test: Iniciando carga de certificaciones...');
        setLoading(true);
        setError(null);
        
        // Test directo con fetch
        console.log('🧪 Test: Probando fetch directo...');
        const directResponse = await fetch('http://localhost:3000/api/certifications?userId=1');
        const directData = await directResponse.json();
        console.log('🧪 Test: Fetch directo exitoso:', directData);
        
        // Test con función de API
        console.log('🧪 Test: Probando función getCertifications...');
        const data = await getCertifications();
        console.log('🧪 Test: Datos recibidos via API function:', data);
        console.log('🧪 Test: Tipo de datos:', typeof data);
        console.log('🧪 Test: Es array?', Array.isArray(data));
        console.log('🧪 Test: Cantidad:', data?.length);
        
        setCertifications(data || []);
      } catch (err: any) {
        console.error('🧪 Test: Error:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', border: '2px solid blue', margin: '10px 0' }}>
      <h3>🧪 Test Certificaciones - Cargando...</h3>
    </div>;
  }

  if (error) {
    return <div style={{ padding: '20px', border: '2px solid red', margin: '10px 0' }}>
      <h3>🧪 Test Certificaciones - Error</h3>
      <p>Error: {error}</p>
    </div>;
  }

  return (
    <div style={{ padding: '20px', border: '2px solid green', margin: '10px 0' }}>
      <h3>🧪 Test Certificaciones - Éxito</h3>
      <p>Cantidad de certificaciones: {certifications.length}</p>
      <ul>
        {certifications.map((cert: any) => (
          <li key={cert.id}>
            {cert.title} - {cert.issuer} ({cert.date})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificationsTest;
