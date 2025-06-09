// src/components/common/ArticleFloatingActions.tsx

import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import './ArticleFloatingActions.css';

interface ArticleFloatingActionsProps {
  articleId?: number;
  onEdit?: () => void;
  onManageAll?: () => void;
  showEditButton?: boolean;
}

const ArticleFloatingActions: React.FC<ArticleFloatingActionsProps> = ({
  articleId,
  onEdit,
  onManageAll,
  showEditButton = true
}) => {
  const { navigateToSection } = useNavigation();

  const handleEditArticle = () => {
    if (onEdit) {
      onEdit();
    } else if (articleId) {
      // Navegar a la edición del artículo específico
      navigateToSection('articles', `edit/${articleId}`);
    }
  };

  const handleManageAll = () => {
    if (onManageAll) {
      onManageAll();
    } else {
      // Navegar a la administración de artículos
      navigateToSection('articles', 'admin');
    }
  };

  return (
    <div className="article-floating-actions">
      {showEditButton && articleId && (
        <button
          className="floating-action-btn edit-btn"
          onClick={handleEditArticle}
          title="Editar este artículo"
          aria-label="Editar artículo"
        >
          <i className="fas fa-edit"></i>
        </button>
      )}
      
      <button
        className="floating-action-btn manage-btn"
        onClick={handleManageAll}
        title="Administrar todos los artículos"
        aria-label="Administrar artículos"
      >
        <i className="fas fa-cog"></i>
      </button>
    </div>
  );
};

export default ArticleFloatingActions;
