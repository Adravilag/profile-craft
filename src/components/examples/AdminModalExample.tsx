// AdminModalExample.tsx - Ejemplo de uso del AdminModal mejorado

import React, { useState } from 'react';
import AdminModal, { TabConfig, ActionButton, BreadcrumbItem } from '../ui/AdminModal';

const AdminModalExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [searchValue, setSearchValue] = useState('');

  // Configuración de tabs mejorados
  const tabs: TabConfig[] = [
    {
      id: 'users',
      label: 'Usuarios',
      icon: 'fas fa-users',
      content: (
        <div style={{ padding: '20px' }}>
          <h3>Gestión de Usuarios</h3>
          <p>Aquí puedes gestionar todos los usuarios del sistema.</p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '16px',
            marginTop: '20px'
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '12px',
                background: '#f8f9fa'
              }}>
                <h4>Usuario {i}</h4>
                <p>email{i}@ejemplo.com</p>
                <span style={{
                  background: i % 2 === 0 ? '#28a745' : '#ffc107',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {i % 2 === 0 ? 'Activo' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
      badge: '4'
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: 'fas fa-project-diagram',
      content: (
        <div style={{ padding: '20px' }}>
          <h3>Gestión de Proyectos</h3>
          <p>Aquí puedes gestionar todos los proyectos.</p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            marginTop: '20px'
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '12px',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Proyecto {i}</h4>
                  <p style={{ margin: 0, color: '#666' }}>Descripción del proyecto {i}</p>
                </div>
                <span style={{
                  background: '#007bff',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px'
                }}>
                  En desarrollo
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
      badge: '3'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: 'fas fa-cog',
      content: (
        <div style={{ padding: '20px' }}>
          <h3>Configuración del Sistema</h3>
          <p>Configura las opciones globales del sistema.</p>
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Nombre del sistema
              </label>
              <input 
                type="text" 
                defaultValue="Mi Sistema"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Email de contacto
              </label>
              <input 
                type="email" 
                defaultValue="admin@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  // Botones flotantes (FAB) para reemplazar el toolbar
  const floatingActions: ActionButton[] = [
    {
      id: 'save',
      label: 'Guardar',
      icon: 'fas fa-save',
      onClick: () => alert('Guardando cambios...'),
      variant: 'primary',
      tooltip: 'Guardar todos los cambios'
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: 'fas fa-download',
      onClick: () => alert('Exportando datos...'),
      variant: 'secondary',
      tooltip: 'Exportar datos a CSV'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'fas fa-trash',
      onClick: () => alert('¿Confirmar eliminación?'),
      variant: 'danger',
      tooltip: 'Eliminar elementos seleccionados'
    }
  ];
  // Configuración de breadcrumb para navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-home',
      onClick: () => console.log('Navegando a Dashboard')
    },
    {
      id: 'admin',
      label: 'Administración',
      icon: 'fas fa-tools',
      onClick: () => console.log('Navegando a Administración')
    },
    {
      id: 'current',
      label: activeTab === 'users' ? 'Usuarios' : activeTab === 'projects' ? 'Proyectos' : 'Configuración',
      icon: activeTab === 'users' ? 'fas fa-users' : activeTab === 'projects' ? 'fas fa-project-diagram' : 'fas fa-cog',
      active: true
    }
  ];
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    console.log('Buscando:', value);
  };

  const handleRefresh = () => {
    console.log('Refrescando datos...');
    setSearchValue('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ejemplo AdminModal Mejorado</h1>
      <p>
        Este ejemplo muestra las nuevas funcionalidades del AdminModal: 
        tabs mejorados con animaciones, botones flotantes (FAB) en lugar del toolbar,
        y un diseño más moderno y limpio.
      </p>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          margin: '20px 0'
        }}
      >
        <i className="fas fa-external-link-alt" style={{ marginRight: '8px' }}></i>
        Abrir Modal Mejorado
      </button>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '16px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>        <h3>Nuevas características:</h3>
        <ul>
          <li>✅ <strong>Toolbar eliminado</strong> - Diseño más limpio</li>
          <li>✅ <strong>Botones Flotantes (FAB)</strong> - Acciones accesibles sin ocupar espacio</li>
          <li>✅ <strong>Tabs mejorados</strong> - Gradientes animados y transiciones suaves</li>
          <li>✅ <strong>Modo día/noche</strong> - Soporte completo para temas oscuros</li>
          <li>✅ <strong>Animaciones modernas</strong> - Efectos visuales atractivos</li>
          <li>✅ <strong>Breadcrumb navegación</strong> - Indicador de ubicación contextual</li>
          <li>✅ <strong>Posicionamiento flexible</strong> - FABs en diferentes posiciones</li>
          <li>✅ <strong>Tooltips informativos</strong> - Mejor experiencia de usuario</li>
          <li>✅ <strong>Responsive design</strong> - Adaptado para móviles</li>
        </ul>
      </div>      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Panel de Administración"
        subtitle="Gestión avanzada del sistema con botones flotantes"
        icon="fas fa-tools"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        // Nuevas props para FAB
        floatingActions={floatingActions}
        fabPosition="bottom-right"
        showFabOnHover={false}
        // Props de breadcrumb
        showBreadcrumb={true}
        breadcrumbItems={breadcrumbItems}
        // Props de funcionalidad existente
        onRefresh={handleRefresh}
        showRefresh={true}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar en el sistema..."
        size="large"
        // Notificaciones de ejemplo
        success={searchValue.length > 3 ? 'Búsqueda actualizada' : ''}
        error=""
      />
    </div>
  );
};

export default AdminModalExample;
