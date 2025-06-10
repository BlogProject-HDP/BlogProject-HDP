document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  let editor = null;

  // Función para crear o recrear el editor
  function createEditor(theme, content = '') {
    // Si ya existe un editor, lo destruimos
    if (editor) {
      editor.destroy();
      editor = null;
    }

    editor = new toastui.Editor({
      el: document.querySelector('#editor'),
      height: '70dvh',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      theme: theme,
      initialValue: content
    });
  }

  // Crear editor inicial con el tema actual
  const currentTheme = html.dataset.theme || 'light';
  createEditor(currentTheme);

  // Escuchar cambios de tema desde global.js
  window.addEventListener('themeChanged', (e) => {
    const newTheme = e.detail.theme;
    const currentContent = editor.getMarkdown(); // o getHTML() AQUI SE OBTIENE EL CONTENIDO DEL EDITOR ESTO SE VA USAR PARA LUEGO
    createEditor(newTheme, currentContent);
  });
});
