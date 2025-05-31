// Editor avanzado basado en un componente temporal compatible con React 19
import LexicalEditorNew from './LexicalEditorNew';

interface LexicalEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Este componente será reemplazado por una implementación completa de Lexical en el futuro
const LexicalEditor = (props: LexicalEditorProps) => {
  return <LexicalEditorNew {...props} />;
};

export default LexicalEditor;
