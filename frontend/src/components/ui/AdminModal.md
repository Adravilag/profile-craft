# AdminModal - Componente Modal Común

## Descripción

`AdminModal` es un componente reutilizable para crear modales de administración con un diseño moderno y consistente. Incluye soporte para tabs, toolbar personalizable, estados de carga y estilos responsivos.

## Características

- ✅ **Diseño moderno**: Efectos de glassmorphism, gradientes y animaciones 3D
- ✅ **Sistema de tabs**: Navegación entre diferentes secciones
- ✅ **Toolbar personalizable**: Área para botones y acciones con soporte para action buttons
- ✅ **Action Buttons**: Botones de acción organizados en el toolbar para mejor UX
- ✅ **Estados de carga**: Indicadores visuales durante operaciones asíncronas
- ✅ **Responsive**: Adaptable a diferentes tamaños de pantalla
- ✅ **Portal integration**: Usa ModalPortal para renderizado fuera del DOM tree
- ✅ **TypeScript**: Completamente tipado
- ✅ **Atajos de teclado**: Navegación por teclado y shortcuts personalizables

## Props

### AdminModalProps

```typescript
interface AdminModalProps {
  isOpen: boolean;              // Controla si el modal está visible
  onClose: () => void;          // Función para cerrar el modal
  title: string;                // Título del modal
  subtitle?: string;            // Subtítulo opcional
  icon: string;                 // Clase de icono (ej: "fas fa-cogs")
  tabs?: TabConfig[];           // Array de configuración de tabs
  activeTab?: string;           // ID del tab activo
  onTabChange?: (tabId: string) => void; // Función para cambiar de tab
  children?: ReactNode;         // Contenido cuando no se usan tabs
  showToolbar?: boolean;        // Mostrar/ocultar toolbar (default: true)
  toolbarActions?: ReactNode;   // Contenido del toolbar
  actionButtons?: ActionButton[]; // Botones de acción en el toolbar
  maxWidth?: string;            // Ancho máximo (default: "1300px")
  height?: string;              // Altura (default: "88vh")
  showTabs?: boolean;           // Mostrar/ocultar tabs (default: true)
  showNewButton?: boolean;      // Mostrar botón "Nuevo"
  onNewItem?: () => void;       // Función para crear nuevo item
  newButtonText?: string;       // Texto del botón nuevo (default: "Nuevo")
  newButtonIcon?: string;       // Icono del botón nuevo (default: "fas fa-plus")
  loading?: boolean;            // Estado de carga
  error?: string;               // Mensaje de error
  success?: string;             // Mensaje de éxito
  onRefresh?: () => void;       // Función para refrescar
  showRefresh?: boolean;        // Mostrar botón de refrescar
  size?: 'small' | 'medium' | 'large' | 'fullscreen'; // Tamaño predefinido
}
```

### TabConfig

```typescript
interface TabConfig {
  id: string;                   // Identificador único del tab
  label: string;                // Texto del tab
  icon: string;                 // Clase de icono
  content: ReactNode;           // Contenido del tab
  badge?: string | number;      // Badge con contador/información
  disabled?: boolean;           // Tab deshabilitado
  tooltip?: string;             // Tooltip personalizado
}
```

### ActionButton

```typescript
interface ActionButton {
  id: string;                   // Identificador único
  label: string;                // Texto del botón
  icon: string;                 // Clase de icono
  onClick: () => void;          // Función al hacer click
  variant?: 'primary' | 'secondary' | 'danger' | 'success'; // Variante de estilo
  disabled?: boolean;           // Botón deshabilitado
  loading?: boolean;            // Estado de carga
  tooltip?: string;             // Tooltip personalizado
}
```

## Uso Básico

### Modal Simple (sin tabs)

```tsx
import React, { useState } from 'react';
import AdminModal from '../ui/AdminModal';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </button>
      
      <AdminModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Mi Modal de Administración"
        icon="fas fa-cog"
        toolbarActions={
          <button className="admin-btn-primary">
            <i className="fas fa-plus"></i>
            Nueva Acción
          </button>
        }
      >
        <div>
          <h3>Contenido del modal</h3>
          <p>Aquí va el contenido principal...</p>
        </div>
      </AdminModal>
    </>
  );
};
```

### Modal con Tabs

```tsx
import React, { useState } from 'react';
import AdminModal, { type TabConfig } from '../ui/AdminModal';

const MyAdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');

  const tabs: TabConfig[] = [
    {
      id: 'tab1',
      label: 'Primera Sección',
      icon: 'fas fa-folder',
      content: (
        <div>
          <h3>Contenido del primer tab</h3>
          <p>Información de la primera sección...</p>
        </div>
      )
    },
    {
      id: 'tab2',
      label: 'Segunda Sección',
      icon: 'fas fa-users',
      content: (
        <div>
          <h3>Contenido del segundo tab</h3>
          <p>Información de la segunda sección...</p>
        </div>
      )
    }
  ];

  const toolbarActions = (
    <>
      <button className="admin-btn-primary">
        <i className="fas fa-plus"></i>
        Nuevo Elemento
      </button>
      <button className="admin-btn-secondary">
        <i className="fas fa-sync"></i>
        Actualizar
      </button>
    </>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Panel de Administración"
      icon="fas fa-cogs"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      toolbarActions={toolbarActions}
    />
  );
};
```

### Modal con Action Buttons

```tsx
import React, { useState } from 'react';
import AdminModal, { type ActionButton } from '../ui/AdminModal';

const MyAdminComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const actionButtons: ActionButton[] = [
    {
      id: 'save',
      label: 'Guardar',
      icon: 'fas fa-save',
      variant: 'primary',
      onClick: () => {
        setLoading(true);
        // Lógica de guardado...
        setTimeout(() => setLoading(false), 2000);
      },
      loading: loading
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: 'fas fa-download',
      variant: 'secondary',
      onClick: () => {
        console.log('Exportando...');
      }
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'fas fa-trash',
      variant: 'danger',
      onClick: () => {
        if (confirm('¿Estás seguro?')) {
          console.log('Eliminando...');
        }
      },
      tooltip: 'Eliminar elemento seleccionado'
    }
  ];

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Abrir Modal con Action Buttons
      </button>
      
      <AdminModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Gestión de Datos"
        subtitle="Administra y configura los elementos"
        icon="fas fa-database"
        actionButtons={actionButtons}
        showNewButton={true}
        onNewItem={() => console.log('Crear nuevo')}
        newButtonText="Nuevo Elemento"
        showRefresh={true}
        onRefresh={() => console.log('Refrescando...')}
      >
        <div>
          <h3>Contenido del modal</h3>
          <p>Los action buttons aparecen en el toolbar debajo de las pestañas...</p>
        </div>
      </AdminModal>
    </>
  );
};
```

## Estados Especiales

### Estado de Loading

```tsx
const MyLoadingModal = () => {
  const [loading, setLoading] = useState(true);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando datos...</p>
        </div>
      );
    }
    
    return <div>Contenido cargado</div>;
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={() => {}}
      title="Cargando..."
      icon="fas fa-spinner fa-spin"
    >
      {renderContent()}
    </AdminModal>
  );
};
```

### Estado Vacío

```tsx
const EmptyState = () => (
  <div className="admin-empty">
    <i className="fas fa-inbox"></i>
    <h3>No hay elementos</h3>
    <p>No se encontraron elementos. Añade uno nuevo usando el botón de arriba.</p>
  </div>
);
```

## Clases CSS Disponibles

### Botones

- `admin-btn-primary`: Botón principal (azul/gradiente)
- `admin-btn-secondary`: Botón secundario (gris)
- `admin-btn-danger`: Botón de peligro (rojo)

### Estados

- `admin-loading`: Contenedor para estado de carga
- `admin-empty`: Contenedor para estado vacío

### Ejemplos de uso de botones

```tsx
const Toolbar = () => (
  <div style={{ display: 'flex', gap: '12px' }}>
    <button className="admin-btn-primary">
      <i className="fas fa-plus"></i>
      Crear
    </button>
    <button className="admin-btn-secondary">
      <i className="fas fa-edit"></i>
      Editar
    </button>
    <button className="admin-btn-danger">
      <i className="fas fa-trash"></i>
      Eliminar
    </button>
  </div>
);
```

## Migración desde ExperienceAdmin

Para migrar un modal existente como `ExperienceAdmin` al nuevo `AdminModal`:

1. **Importar el componente**:
```tsx
import AdminModal, { type TabConfig } from '../../ui/AdminModal';
```

2. **Definir los tabs**:
```tsx
const tabs: TabConfig[] = [
  {
    id: 'experience',
    label: 'Experiencia Laboral',
    icon: 'fas fa-briefcase',
    content: renderExperiencesList()
  },
  {
    id: 'education',
    label: 'Formación Académica',
    icon: 'fas fa-graduation-cap',
    content: renderEducationList()
  }
];
```

3. **Reemplazar el JSX**:
```tsx
return (
  <AdminModal
    isOpen={true}
    onClose={onClose}
    title="Administración de Trayectoria"
    icon="fas fa-route"
    tabs={tabs}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    toolbarActions={toolbarActions}
  />
);
```

## Personalización

### Tamaños personalizados

```tsx
<AdminModal
  maxWidth="800px"
  height="70vh"
  // ... otros props
/>
```

### Sin toolbar

```tsx
<AdminModal
  showToolbar={false}
  // ... otros props
/>
```

### Sin tabs

```tsx
<AdminModal
  showTabs={false}
  // ... otros props
>
  <div>Contenido directo sin tabs</div>
</AdminModal>
```

## Notas Técnicas

- El componente usa `ModalPortal` para renderizarse fuera del DOM tree principal
- Los estilos usan variables CSS de Material Design 3
- Las animaciones están optimizadas con `cubic-bezier` para transiciones naturales
- Es responsive por defecto con breakpoints en 768px y 480px
- Compatible con TypeScript strict mode

## Ejemplos Completos

Ver `AdminModalExample.tsx` para un ejemplo completo funcional que demuestra todas las características del componente.
