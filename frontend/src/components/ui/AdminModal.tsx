// src/components/ui/AdminModal.tsx

import React from 'react';
import type { ReactNode } from 'react';
import ModalPortal from '../common/ModalPortal';
import './AdminModal.css';

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
      <div className="admin-modal-overlay" onClick={handleOverlayClick}>
        <div 
          className="admin-modal" 
          style={{ 
            maxWidth,
            height 
          }}
        >
          {/* Header */}
          <div className="admin-modal-header">
            <h2>
              <i className={icon}></i>
              {title}
            </h2>
            <button className="admin-modal-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Tabs */}
          {showTabs && tabs.length > 0 && (
            <div className="admin-modal-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => onTabChange?.(tab.id)}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          )}          {/* Toolbar */}
          {showToolbar && (
            <div className="admin-modal-toolbar">
              {showNewButton && (
                <button 
                  className="admin-new-btn"
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
          <div className="admin-modal-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AdminModal;
