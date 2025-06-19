// Article modules exports
// Módulos de artículos deshabilitados temporalmente
// Se habilitarán cuando se implementen los componentes correspondientes
/*
export { default as ArticleBreadcrumb } from './ArticleBreadcrumb';
export { default as ArticleAuthor } from './ArticleAuthor';
export { default as ArticleTableOfContents } from './ArticleTableOfContents';
export { default as ArticleReadingProgress } from './ArticleReadingProgress';
export { default as ArticleLikeSystem } from './ArticleLikeSystem';
export { default as ArticleShare } from './ArticleShare';
export { default as ArticleRelated } from './ArticleRelated';
export { default as ArticleComments } from './ArticleComments';
*/

// Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface AuthorData {
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
  website?: string;
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}
