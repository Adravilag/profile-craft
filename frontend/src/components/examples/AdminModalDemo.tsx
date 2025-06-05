// src/components/examples/AdminModalDemo.tsx
import React, { useState } from 'react';
import AdminModal, { TabConfig, ActionButton } from '../ui/AdminModal';

const AdminModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalSize, setModalSize] = useState<'small' | 'medium' | 'large' | 'fullscreen'>('large');

  // Configuración de tabs con badges y tooltips
  const tabs: TabConfig[] = [
    {
      id: 'users',
      label: 'Usuarios',
      icon: 'fas fa-users',
      badge: 42,
      tooltip: 'Gestionar usuarios del sistema',
      content: (
        <div style={{ padding: '20px' }}>
          <h3>Gestión de Usuarios</h3>
          <p>Aquí puedes gestionar todos los usuarios del sistema.</p>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
            <strong>Funcionalidades:</strong>
            <ul>
              <li>Crear nuevos usuarios</li>
              <li>Editar información existente</li>
              <li>Gestionar permisos</li>
              <li>Ver estadísticas de actividad</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: 'fas fa-folder-open',
      badge: 18,
      tooltip: 'Administrar proyectos',
      content: (
        <div style={{ padding: '20px' }}>
          <h3>Gestión de Proyectos</h3>
          <p>Panel para administrar todos los proyectos.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
              <h4>Proyectos Activos</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>12</p>
            </div>
            <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px' }}>
              <h4>En Desarrollo</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2' }}>6</p>
            </div>
            <div style={{ background: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
              <h4>Completados</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>24</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: 'fas fa-cog',
      tooltip: 'Configuración del sistema',
      content: (
        <div style={{ padding: '20px' }}>
          <h3>Configuración del Sistema</h3>
          <p>Ajustes y configuraciones generales.</p>
          <div style={{ marginTop: '20px' }}>
            <h4>Tamaño del Modal:</h4>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {(['small', 'medium', 'large', 'fullscreen'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setModalSize(size)}
                  style={{
                    padding: '8px 16px',
                    border: modalSize === size ? '2px solid #1976d2' : '1px solid #ccc',
                    borderRadius: '6px',
                    background: modalSize === size ? '#e3f2fd' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: 'fas fa-chart-bar',
      badge: 'Nuevo',
      tooltip: 'Generar reportes y estadísticas',
      content: (
        <div style={{ padding: '20px' }}>
          <h3>Reportes y Estadísticas</h3>
          <p>Genera reportes detallados del sistema.</p>
          <button
            onClick={() => {
              setShowProgress(true);
              setProgress(0);
              const interval = setInterval(() => {
                setProgress(prev => {
                  if (prev >= 100) {
                    clearInterval(interval);
                    setShowProgress(false);
                    setSuccess('Reporte generado exitosamente');
                    setTimeout(() => setSuccess(''), 3000);
                    return 100;
                  }
                  return prev + 10;
                });
              }, 200);
            }}
            style={{
              padding: '10px 20px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            <i className="fas fa-download" style={{ marginRight: '8px' }}></i>
            Generar Reporte
          </button>
        </div>
      )
    }
  ];

  // Botones de acción personalizables
  const actionButtons: ActionButton[] = [
    {
      id: 'save',
      label: 'Guardar',
      icon: 'fas fa-save',
      variant: 'primary',
      onClick: () => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setSuccess('Cambios guardados correctamente');
          setTimeout(() => setSuccess(''), 3000);
        }, 2000);
      },
      tooltip: 'Guardar todos los cambios'
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: 'fas fa-download',
      variant: 'secondary',
      onClick: () => {
        setSuccess('Exportación iniciada...');
        setTimeout(() => setSuccess(''), 2000);
      },
      tooltip: 'Exportar datos'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'fas fa-trash',
      variant: 'danger',
      onClick: () => {
        if (confirm('¿Estás seguro de que quieres eliminar?')) {
          setError('Funcionalidad de eliminación no disponible en demo');
          setTimeout(() => setError(''), 3000);
        }
      },
      tooltip: 'Eliminar elementos seleccionados'
    }
  ];

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setTimeout(() => {
      setLoading(false);
      setSuccess('Datos actualizados');
      setTimeout(() => setSuccess(''), 2000);
    }, 1500);
  };

  const handleNewItem = () => {
    setSuccess(`Creando nuevo elemento en ${activeTab}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleKeyboardShortcut = (key: string) => {
    console.log(`Shortcut pressed: ${key}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Demo del AdminModal Mejorado</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Funcionalidades Implementadas:</h2>
        <ul>
          <li>✅ <strong>Navegación por tabs</strong> con badges y tooltips</li>
          <li>✅ <strong>Búsqueda</strong> en header con botón de limpiar</li>
          <li>✅ <strong>Notificaciones</strong> de error y éxito</li>
          <li>✅ <strong>Estados de carga</strong> con spinners</li>
          <li>✅ <strong>Barra de progreso</strong> con animaciones</li>
          <li>✅ <strong>Botones de acción</strong> personalizables (primary, secondary, danger, success)</li>
          <li>✅ <strong>Tamaños predefinidos</strong> (small, medium, large, fullscreen)</li>
          <li>✅ <strong>Shortcuts de teclado</strong> (Esc, Ctrl+N, Ctrl+R, Alt+1-9)</li>
          <li>✅ <strong>Accesibilidad</strong> mejorada con ARIA labels</li>
          <li>✅ <strong>Diseño responsive</strong> con Material Design 3</li>
          <li>✅ <strong>Prevención de cierre</strong> y manejo avanzado de eventos</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Controles de Demo:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setError('Este es un ejemplo de error')}
            style={{ padding: '8px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Mostrar Error
          </button>
          <button
            onClick={() => setSuccess('Operación exitosa')}
            style={{ padding: '8px 16px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Mostrar Éxito
          </button>
          <button
            onClick={() => setError('')}
            style={{ padding: '8px 16px', background: '#757575', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Limpiar Notificaciones
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '12px 24px',
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <i className="fas fa-cog"></i>
        Abrir AdminModal Demo
      </button>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Panel de Administración"
        subtitle="Demo completo de todas las funcionalidades"
        icon="fas fa-tools"
        size={modalSize}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showNewButton={true}
        onNewItem={handleNewItem}
        newButtonText="Nuevo Elemento"
        newButtonIcon="fas fa-plus"
        loading={loading}
        error={error}
        success={success}
        onRefresh={handleRefresh}
        showRefresh={true}
        showProgress={showProgress}
        progress={progress}
        onKeyboardShortcut={handleKeyboardShortcut}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar en el panel..."
        actionButtons={actionButtons}
        toolbarActions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-filter"></i>
              Filtros
            </button>
            <button
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-sort"></i>
              Ordenar
            </button>
          </div>
        }
      />

      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Shortcuts de Teclado:</h3>
        <ul>
          <li><kbd>Esc</kbd> - Cerrar modal</li>
          <li><kbd>Ctrl + N</kbd> - Nuevo elemento</li>
          <li><kbd>Ctrl + R</kbd> - Refrescar</li>
          <li><kbd>Alt + 1-9</kbd> - Cambiar entre tabs</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminModalDemo;
