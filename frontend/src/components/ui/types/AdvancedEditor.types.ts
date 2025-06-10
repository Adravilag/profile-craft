export type EditorType = 'visual' | 'html' | 'markdown';
export type ViewMode = 'edit' | 'preview' | 'split';

export interface AdvancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export interface EditorConfig {
  modules: any;
  formats: string[];
}
