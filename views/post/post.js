import { buscarPostPoId } from "../../js/IndexedDB/indexDB.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get("id")); // IndexedDB guarda el id como number

  try {
    const post = await buscarPostPoId(postId);

    if (!post) {
      document.getElementById("postCardContainer").innerHTML = `
        <div class="notification is-danger">
          No se encontró el post solicitado.
        </div>
      `;
      return;
    }

    // Rellenar avatar del autor
    const avatarImg = document.getElementById("avatarImg");
    if (avatarImg) avatarImg.src = post.fotoPerfilAutor || "../perfil_usuario/imagenPrueba.jpeg";

    // Rellenar autor
    const authorInfoP = document.querySelector("#postCardContainer .column p");
    if (authorInfoP) {
      authorInfoP.innerHTML = `
        <strong>${post.autor}</strong>
      `;
    }

    // Rellenar título
    const titleP = document.querySelector("#postCardContainer .is-size-5");
    if (titleP) {
      titleP.textContent = post.nombre;
    }

    // Rellenar imagen de portada
    const portadaImg = document.getElementById("portadaImg");
    if (portadaImg) {
      portadaImg.src = post.imagen;
    }

    // Rellenar categorías
    const categoriesContainer = document.querySelector("#postCardContainer .columns.is-multiline");
    categoriesContainer.innerHTML = "";

    if (post.categorias && Array.isArray(post.categorias)) {
      post.categorias.forEach(cat => {
        const span = document.createElement("span");
        span.className = "column is-narrow";
        span.innerHTML = `
          <p class="categoria is-clickable" data-categoria="${encodeURIComponent(cat)}">${cat}</p>
        `;
        categoriesContainer.appendChild(span);

        span.querySelector(".categoria").addEventListener("click", () => {
          window.location.href = `../busqueda/busquedas.html?q=${encodeURIComponent(cat)}&filtro=categorias`;
        });
      });
    }

    // Rellenar contenido
    const contenidoDiv = document.getElementById("Contenido");
    if (contenidoDiv) {
      contenidoDiv.innerHTML = post.contenido;
    }

  } catch (error) {
    console.error("Error cargando el post", error);
    document.getElementById("postCardContainer").innerHTML = `
      <div class="notification is-danger">
        Error cargando el post.
      </div>
    `;
  }
});
