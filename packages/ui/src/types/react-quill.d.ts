declare module 'react-quill' {
  import React from 'react';

  export interface ReactQuillProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    theme?: string;
    modules?: any;
    formats?: string[];
    ref?: React.Ref<ReactQuill>;
    bounds?: string | HTMLElement;
    scrollingContainer?: string | HTMLElement;
    readOnly?: boolean;
    className?: string;
    style?: React.CSSProperties;
    tabIndex?: number;
    onFocus?: (range: any, source: string, editor: any) => void;
    onBlur?: (previousRange: any, source: string, editor: any) => void;
    onKeyPress?: (event: React.KeyboardEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
    onSelection?: (range: any, source: string, editor: any) => void;
    preserveWhitespace?: boolean;
  }

  const ReactQuill: React.ComponentType<ReactQuillProps>;
  export default ReactQuill;
}
