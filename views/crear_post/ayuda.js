document.addEventListener("DOMContentLoaded", () => {
  const ayudaButton = document.getElementById("ayudaButton");
  const modal = document.querySelector(".modal");
  const modalClose = modal.querySelector(".modal-close");
  const modalBackground = modal.querySelector(".modal-background");

  // Contenido básico de ayuda
  const modalContent = modal.querySelector(".modal-content");
  modalContent.innerHTML = `
    <div class="box content">
      <h3 class="title is-4">Guía rápida para el editor</h3>
      <p><strong>Negrita:</strong> <code>**texto**</code> → <strong>texto</strong></p>
      <p><strong>Cursiva:</strong> <code>*texto*</code> → <em>texto</em></p>
      <p><strong>Enlace:</strong> <code>[texto](https://ejemplo.com)</code></p>
      <p><strong>Imagen:</strong> <code>![texto alternativo](https://url-de-la-imagen.com)</code></p>
      <p><strong>Títulos:</strong></p>
      <pre>
# Título 1
## Título 2
### Título 3
      </pre>
      <p><strong>Comentario oculto:</strong> <code>&lt;!-- Esto no se mostrará --&gt;</code></p>
      <hr>
      <p>Puedes usar todas las funciones del editor Toast UI con esta sintaxis básica. ¡Experimenta y personaliza tu post!</p>
    </div>
  `;

  // Función para abrir el modal
  ayudaButton.addEventListener("click", () => {
    modal.classList.add("is-active");
  });

  // Función para cerrar el modal
  const cerrarModal = () => {
    modal.classList.remove("is-active");
  };

  modalClose.addEventListener("click", cerrarModal);
  modalBackground.addEventListener("click", cerrarModal);
});
