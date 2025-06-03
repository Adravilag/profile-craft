// src/components/ui/AdminModal.tsx

import React from 'react';
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
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children?: ReactNode;
  showToolbar?: boolean;
  toolbarActions?: ReactNode;
  maxWidth?: string;
  height?: string;
  showTabs?: boolean;
  showNewButton?: boolean;
  onNewItem?: () => void;
  newButtonText?: string;
  newButtonIcon?: string;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  tabs = [],
  activeTab,
  onTabChange,
  children,
  showToolbar = true,
  toolbarActions,
  maxWidth = "1300px",
  height = "88vh",
  showTabs = true,
  showNewButton = false,
  onNewItem,
  newButtonText = "Nuevo",
  newButtonIcon = "fas fa-plus"
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderTabContent = () => {
    if (!tabs.length || !activeTab) return children;
    
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    return activeTabConfig?.content || children;
  };
  return (
    <ModalPortal>
      <div className={styles.adminModalOverlay} onClick={handleOverlayClick}>
        <div 
          className={styles.adminModal} 
          style={{ 
            maxWidth,
            height 
          }}
        >
          {/* Header */}
          <div className={styles.adminModalHeader}>
            <h2>
              <i className={icon}></i>
              {title}
            </h2>
            <button className={styles.adminModalCloseBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Tabs */}
          {showTabs && tabs.length > 0 && (
            <div className={styles.adminModalTabs}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.adminTabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                  onClick={() => onTabChange?.(tab.id)}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Toolbar */}
          {showToolbar && (
            <div className={styles.adminModalToolbar}>
              {showNewButton && (
                <button 
                  className={styles.adminNewBtn}
                  onClick={onNewItem}
                >
                  <i className={newButtonIcon}></i>
                  {newButtonText}
                </button>
              )}
              {toolbarActions}
            </div>
          )}

          {/* Content */}
          <div className={styles.adminModalContent}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AdminModal;
