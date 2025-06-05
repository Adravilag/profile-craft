declare module 'react';
declare module 'react-dom/client';
declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export { jsx as jsxs };
}
declare module 'react/jsx-dev-runtime' {
  export const Fragment: any;
  export function jsxDEV(type: any, props: any, key?: any, isStaticChildren?: boolean, source?: any, self?: any): any;
}
declare module 'react-quill';
declare module 'html2canvas';
declare module 'jspdf';
declare module 'axios';
declare module '@vitejs/plugin-react';
declare module 'vite';
