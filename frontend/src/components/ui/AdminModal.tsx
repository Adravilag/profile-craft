// src/components/ui/AdminModal.tsx

import React, { useEffect, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import ModalPortal from '../common/ModalPortal';
import styles from './AdminModal.module.css';

// Export CSS classes for use in other components
export { default as adminStyles } from './AdminModal.module.css';

export interface TabConfig {
  id: string;
  label: string;
  icon: string;
  content: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  tooltip?: string;
}

export interface ActionButton {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children?: ReactNode;
  showToolbar?: boolean;
  toolbarActions?: ReactNode;
  actionButtons?: ActionButton[];
  maxWidth?: string;
  height?: string;
  showTabs?: boolean;
  showNewButton?: boolean;
  onNewItem?: () => void;
  newButtonText?: string;
  newButtonIcon?: string;
  loading?: boolean;
  error?: string;
  success?: string;
  onRefresh?: () => void;
  showRefresh?: boolean;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  preventClose?: boolean;
  showProgress?: boolean;
  progress?: number;
  onKeyboardShortcut?: (key: string) => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  tabs = [],
  activeTab,
  onTabChange,
  children,
  showToolbar = true,
  toolbarActions,
  actionButtons = [],
  maxWidth,
  height,
  showTabs = true,
  showNewButton = false,
  onNewItem,
  newButtonText = "Nuevo",
  newButtonIcon = "fas fa-plus",
  loading = false,
  error,
  success,
  onRefresh,
  showRefresh = false,
  size = 'large',
  preventClose = false,
  showProgress = false,
  progress = 0,
  onKeyboardShortcut,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...'
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Configuración de tamaños predefinidos
  const sizeConfig = {
    small: { maxWidth: '600px', height: '60vh' },
    medium: { maxWidth: '900px', height: '75vh' },
    large: { maxWidth: '1300px', height: '88vh' },
    fullscreen: { maxWidth: '100vw', height: '100vh' }
  };

  const modalSize = {
    maxWidth: maxWidth || sizeConfig[size].maxWidth,
    height: height || sizeConfig[size].height
  };

  // Manejo de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC para cerrar (si no está prevenido)
      if (e.key === 'Escape' && !preventClose) {
        handleClose();
      }
      
      // Ctrl+N para nuevo item
      if (e.ctrlKey && e.key === 'n' && showNewButton && onNewItem) {
        e.preventDefault();
        onNewItem();
      }
      
      // Ctrl+R para refrescar
      if (e.ctrlKey && e.key === 'r' && onRefresh) {
        e.preventDefault();
        onRefresh();
      }

      // Navegación por tabs con Alt+1, Alt+2, etc.
      if (e.altKey && tabs.length > 0 && onTabChange) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= tabs.length) {
          e.preventDefault();
          const targetTab = tabs[num - 1];
          if (!targetTab.disabled) {
            onTabChange(targetTab.id);
          }
        }
      }

      // Llamar callback personalizado
      if (onKeyboardShortcut) {
        onKeyboardShortcut(e.key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, preventClose, onNewItem, onRefresh, tabs, onTabChange, onKeyboardShortcut, showNewButton]);

  const handleClose = useCallback(() => {
    if (preventClose) return;
    
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  }, [onClose, preventClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventClose) {
      handleClose();
    }
  };

  const renderTabContent = () => {
    if (!tabs.length || !activeTab) return children;
    
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    return activeTabConfig?.content || children;
  };

  const renderActionButton = (action: ActionButton) => {
    const buttonClass = `${styles.adminActionBtn} ${styles[`variant-${action.variant || 'secondary'}`]} ${
      action.disabled ? styles.disabled : ''
    } ${action.loading ? styles.loading : ''}`;

    return (
      <button
        key={action.id}
        className={buttonClass}
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        title={action.tooltip}
        aria-label={action.label}
      >
        {action.loading ? (
          <>
            <div className={styles.buttonSpinner}></div>
            {action.label}
          </>
        ) : (
          <>
            <i className={action.icon}></i>
            {action.label}
          </>
        )}
      </button>
    );
  };

  if (!isOpen) return null;  return (
    <ModalPortal>
      <div 
        className={`${styles.adminModalOverlay} ${isClosing ? styles.closing : ''}`} 
        onClick={handleOverlayClick}
      >
        <div 
          className={`${styles.adminModal} ${styles[`size-${size}`]} ${loading ? styles.loading : ''}`}
          style={modalSize}
        >
          {/* Progress Bar */}
          {showProgress && (
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}

          {/* Header */}
          <div className={styles.adminModalHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerMain}>
                <h2 className={styles.modalTitle}>
                  <i className={icon}></i>
                  <span>{title}</span>
                  {loading && <div className={styles.headerSpinner}></div>}
                </h2>
                {subtitle && (
                  <p className={styles.modalSubtitle}>{subtitle}</p>
                )}
              </div>
              
              {/* Header Actions */}
              <div className={styles.headerActions}>
                {showRefresh && onRefresh && (
                  <button 
                    className={styles.headerActionBtn}
                    onClick={onRefresh}
                    title="Refrescar (Ctrl+R)"
                    aria-label="Refrescar contenido"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                )}
                
                {/* Search */}
                {showSearch && (
                  <div className={`${styles.headerSearch} ${searchFocused ? styles.focused : ''}`}>
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className={styles.searchInput}
                    />
                    {searchValue && (
                      <button
                        onClick={() => onSearchChange?.('')}
                        className={styles.clearSearchBtn}
                        aria-label="Limpiar búsqueda"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                )}

                <button 
                  className={styles.adminModalCloseBtn} 
                  onClick={handleClose}
                  disabled={preventClose}
                  title={preventClose ? 'No se puede cerrar en este momento' : 'Cerrar (Esc)'}
                  aria-label="Cerrar modal"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Notifications */}
            {(error || success) && (
              <div className={styles.notifications}>
                {error && (
                  <div className={styles.errorNotification}>
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className={styles.successNotification}>
                    <i className="fas fa-check-circle"></i>
                    <span>{success}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          {showTabs && tabs.length > 0 && (
            <div className={styles.adminModalTabs}>
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`${styles.adminTabBtn} ${activeTab === tab.id ? styles.active : ''} ${
                    tab.disabled ? styles.disabled : ''
                  }`}
                  onClick={() => !tab.disabled && onTabChange?.(tab.id)}
                  disabled={tab.disabled}
                  title={tab.tooltip || `${tab.label} (Alt+${index + 1})`}
                  aria-label={`Tab ${tab.label}`}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={styles.tabBadge}>{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
          )}          {/* Toolbar */}
          {(showToolbar || actionButtons.length > 0) && (
            <div className={styles.adminModalToolbar}>
              <div className={styles.toolbarLeft}>
                {showNewButton && onNewItem && (
                  <button 
                    className={styles.adminNewBtn}
                    onClick={onNewItem}
                    title={`${newButtonText} (Ctrl+N)`}
                    aria-label={newButtonText}
                  >
                    <i className={newButtonIcon}></i>
                    {newButtonText}
                  </button>
                )}
                {toolbarActions}
              </div>
              
              {/* Action Buttons Section */}
              {actionButtons.length > 0 && (
                <div className={styles.toolbarActions}>
                  <div className={styles.actionButtonsGroup}>
                    {actionButtons.map(renderActionButton)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className={styles.adminModalContent}>
            {loading && !children ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <p>Cargando...</p>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AdminModal;
