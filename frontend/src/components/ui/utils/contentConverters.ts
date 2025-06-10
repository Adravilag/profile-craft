export const htmlToMarkdown = (html: string): string => {
  // Versión simplificada: retornamos el HTML tal cual
  return html;
};

export const insertImageInContent = (
  content: string,
  imageUrl: string,
  editorType: 'html' | 'markdown'
): string => {
  if (editorType === 'html') {
    const imageTag = `<img src="${imageUrl}" alt="Imagen" />`;
    return content + imageTag;
  } else if (editorType === 'markdown') {
    const markdownImage = `![Imagen](${imageUrl})`;
    return content + '\n' + markdownImage;
  }
  return content;
};
