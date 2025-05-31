import React, { useState } from 'react';
import AdminModal, { type TabConfig } from './AdminModal';

interface ExampleItem {
  id: number;
  title: string;
  description: string;
  category: string;
}

interface AdminModalExampleProps {
  onClose?: () => void;
}

const AdminModalExample: React.FC<AdminModalExampleProps> = ({ onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('tab1');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ExampleItem[]>([
    { id: 1, title: 'Ejemplo 1', description: 'Descripción del ejemplo 1', category: 'Categoría A' },
    { id: 2, title: 'Ejemplo 2', description: 'Descripción del ejemplo 2', category: 'Categoría B' },
    { id: 3, title: 'Ejemplo 3', description: 'Descripción del ejemplo 3', category: 'Categoría A' },
  ]);

  const handleNewItem = () => {
    const newItem: ExampleItem = {
      id: Date.now(),
      title: `Nuevo Elemento ${items.length + 1}`,
      description: `Descripción del elemento ${items.length + 1}`,
      category: 'Nueva Categoría'
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este elemento?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleLoadData = async () => {
    setLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const renderItemsList = (categoryFilter?: string) => {
    const filteredItems = categoryFilter 
      ? items.filter(item => item.category.includes(categoryFilter))
      : items;

    if (filteredItems.length === 0) {
      return (
        <div className="admin-empty">
          <i className="fas fa-inbox"></i>
          <h3>No hay elementos</h3>
          <p>No se encontraron elementos en esta categoría. Añade uno nuevo usando el botón de arriba.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            style={{
              background: 'linear-gradient(135deg, var(--md-sys-color-surface-container-low) 0%, var(--md-sys-color-surface-container) 100%)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              borderRadius: '20px',
              padding: '20px',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--md-sys-color-on-surface)' }}>
                {item.title}
              </h3>
              <p style={{ margin: '0 0 8px 0', color: 'var(--md-sys-color-primary)', fontWeight: '500' }}>
                {item.category}
              </p>
              <p style={{ margin: '0', color: 'var(--md-sys-color-on-surface-variant)' }}>
                {item.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="admin-btn-secondary">
                <i className="fas fa-edit"></i>
                Editar
              </button>
              <button 
                className="admin-btn-danger"
                onClick={() => handleDeleteItem(item.id)}
              >
                <i className="fas fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs: TabConfig[] = [
    {
      id: 'tab1',
      label: 'Categoría A',
      icon: 'fas fa-folder',
      content: renderItemsList('Categoría A')
    },
    {
      id: 'tab2',
      label: 'Categoría B',
      icon: 'fas fa-folder-open',
      content: renderItemsList('Categoría B')
    },
    {
      id: 'tab3',
      label: 'Todos',
      icon: 'fas fa-list',
      content: renderItemsList()
    }
  ];

  const toolbarActions = (
    <>
      <button className="admin-btn-primary" onClick={handleNewItem}>
        <i className="fas fa-plus"></i>
        Nuevo Elemento
      </button>
      <button className="admin-btn-secondary" onClick={handleLoadData}>
        <i className="fas fa-sync-alt"></i>
        Recargar Datos
      </button>
    </>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ejemplo de AdminModal</h1>
      <p>Este es un ejemplo de uso del componente AdminModal común.</p>
      
      <button 
        className="admin-btn-primary"
        onClick={() => setIsModalOpen(true)}
        style={{ marginTop: '20px' }}
      >
        <i className="fas fa-cog"></i>
        Abrir Panel de Administración
      </button>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          onClose?.();
        }}
        title="Panel de Administración de Ejemplos"
        icon="fas fa-cogs"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toolbarActions={toolbarActions}
        maxWidth="1200px"
        height="85vh"
      />

      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div className="admin-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando datos...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModalExample;
