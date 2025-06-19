export const createEditorConfig = (handleImageButton: () => void) => {
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        ['clean'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'font': [] }]
      ],
      handlers: {
        'image': handleImageButton
      }
    },
    syntax: true,
    clipboard: {
      matchVisual: false
    },
    imageResize: {
      displaySize: true
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet',
    'link', 'image', 'video',
    'color', 'background',
    'align'
  ];

  return { modules, formats };
};
