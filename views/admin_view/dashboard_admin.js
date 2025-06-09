import { addPost, cargarPosts, deletePost } from "../../js/IndexedDB/indexDB.js";

// Manejo de las pestañas principales
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tabs ul li");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remover la clase "is-active" de todas las pestañas
      tabs.forEach((t) => t.classList.remove("is-active"));

      // Agregar la clase "is-active" a la pestaña seleccionada
      tab.classList.add("is-active");

      // Ocultar todo el contenido de las pestañas
      tabContents.forEach((content) => content.classList.add("is-hidden"));

      // Mostrar el contenido de la pestaña seleccionada
      const tabId = tab.getAttribute("data-tab");
      const activeContent = document.getElementById(tabId);
      if (activeContent) {
        activeContent.classList.remove("is-hidden");
      }
    });
  });

  // Inicializar la funcionalidad de los posts
  cargarPostsAdmin();
  agregarEventosCrearPost();
});

// Función para cargar y mostrar todos los posts
async function cargarPostsAdmin() {
  const lista = document.getElementById("admin-posts-lista");
  if (!lista) return;

  lista.innerHTML = "<p>Cargando posts...</p>";

  try {
    const posts = await cargarPosts();
    if (posts.length === 0) {
      lista.innerHTML = "<p>No hay posts creados.</p>";
      return;
    }

    // Generar una tabla con los posts
    let html = `
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categorías</th>
            <th>Contenido</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;
    posts.forEach((post) => {
      html += `
        <tr>
          <td>${post.id}</td>
          <td>${post.nombre}</td>
          <td>${(post.categorias || []).join(", ")}</td>
          <td>${post.contenido}</td>
          <td>
            ${
              post.imagen
                ? `<img src="${post.imagen}" alt="Imagen del post" style="width: 50px; height: 50px;">`
                : "Sin imagen"
            }
          </td>
          <td>
            <button class="button is-danger is-small" onclick="eliminarPost(${post.id})">Eliminar</button>
            <button class="button is-warning is-small" onclick="editarPost(${post.id})">Editar</button>
          </td>
        </tr>`;
    });
    html += "</tbody></table>";
    lista.innerHTML = html;
  } catch (error) {
    lista.innerHTML = "<p>Error al cargar los posts.</p>";
    console.error(error);
  }
}

// Función para agregar un nuevo post
function agregarEventosCrearPost() {
  const formCrear = document.getElementById("form-crear-post");
  if (formCrear) {
    formCrear.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("post-nombre").value.trim();
      const categorias = document
        .getElementById("post-categorias")
        .value.split(",")
        .map((x) => x.trim());
      const contenido = document.getElementById("post-contenido").value.trim();
      const imagenInput = document.getElementById("post-imagen");
      let imagenBase64 = null;

      // Convertir la imagen a base64 si se seleccionó
      if (imagenInput.files.length > 0) {
        const file = imagenInput.files[0];
        imagenBase64 = await convertirImagenABase64(file);
      }

      if (!nombre || !categorias.length || !contenido) {
        alert("Todos los campos son obligatorios");
        return;
      }

      const post = {
        nombre,
        categorias,
        contenido,
        imagen: imagenBase64,
        fechaDePublicacion: new Date().toISOString(),
        likes: [],
        comentarios: [],
      };

      try {
        await addPost(post);
        formCrear.reset();
        cargarPostsAdmin();
        alert("Post creado con éxito.");
      } catch (error) {
        alert('Error al crear el post (posible duplicado en "nombre").');
        console.error(error);
      }
    });
  }
}

// Función para convertir una imagen a base64
function convertirImagenABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Función para eliminar un post
async function eliminarPost(postID) {
  if (confirm("¿Estás seguro de que deseas eliminar este post?")) {
    try {
      await deletePost(postID);
      alert("Post eliminado con éxito.");
      cargarPostsAdmin(); // Recargar la lista de posts
    } catch (error) {
      alert("Error al eliminar el post.");
      console.error(error);
    }
  }
}

// Función para editar un post
function editarPost(postID) {
  alert(`Función para editar el post con ID: ${postID} aún no implementada.`);
  // Aquí puedes implementar la lógica para editar un post
}