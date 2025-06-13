import {
  addPost,
  cargarPosts,
  deletePost,
  editPost,
  obtenerTodosLosUsers,
  buscarId,
} from "../../js/IndexedDB/indexDB.js";

import {
  getBaneados,
  getNoBaneados,
  desbloquear,
  bannear,
} from "../../js/baneados/baneador.js";
import {
  buscarPostComentario,
  tablasComentarios,
} from "../../js/comentarios/comentarios_admi.js";

let currentEditingPost = null;
// Manejo de las pestañas principales
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tabs ul li");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
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
            <button class="button is-danger is-small" onclick="eliminarPost(${
              post.id
            })">Eliminar</button>
            <button class="button is-warning is-small" onclick="editarPost(${
              post.id
            })">Editar</button>
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
window.eliminarPost = eliminarPost;
window.editarPost = editarPost;

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

      if (imagenInput.files.length > 0) {
        const file = imagenInput.files[0];
        imagenBase64 = await convertirImagenABase64(file);
      } else if (currentEditingPost && currentEditingPost.imagen) {
        imagenBase64 = currentEditingPost.imagen;
      }

      if (!nombre || !categorias.length || !contenido) {
        alert("Todos los campos son obligatorios");
        return;
      }

      let nombreDelAutor = "Autor Desconocido"; // Valor por defecto
      const adminIdString = localStorage.getItem("adminId");
      let fotoPerfilDelAutor = null;
      if (adminIdString) {
        try {
          const adminUser = await buscarId(parseInt(adminIdString, 10));
          if (adminUser) {
            if (adminUser.usuario) {
              nombreDelAutor = adminUser.usuario;
            }
            if (adminUser.fotoPerfil) {
              fotoPerfilDelAutor = adminUser.fotoPerfil;
            } else {
              console.warn(
                "El usuario administrador no tiene foto de perfil configurada."
              );
            }
          } else {
            console.warn(
              "No se encontró el usuario administrador con ID:",
              adminIdString
            );
          }
        } catch (error) {
          console.error(
            "Error al buscar los detalles del administrador:",
            error
          );
        }
      } else {
        console.warn("No se encontró 'adminId' en localStorage.");
      }

      const postData = {
        autor: nombreDelAutor, // Usar el nombre del autor obtenido
        fotoPerfilAutor: fotoPerfilDelAutor,
        nombre,
        categorias,
        contenido,
        imagen: imagenBase64,
        fechaDePublicacion: currentEditingPost
          ? currentEditingPost.fechaDePublicacion
          : new Date().toISOString(),
        likes: currentEditingPost ? currentEditingPost.likes : [],
        comentarios: currentEditingPost ? currentEditingPost.comentarios : [],
      };

      try {
        if (currentEditingPost) {
          // Estamos editando
          const postActualizado = { ...currentEditingPost, ...postData };
          await editPost(postActualizado);
          alert("Post actualizado con éxito.");
          currentEditingPost = null; // Resetear estado de edición
          const submitButton = formCrear.querySelector("button[type='submit']");
          if (submitButton) {
            submitButton.textContent = "Crear Post";
            submitButton.classList.remove("is-link");
            submitButton.classList.add("is-primary");
          }
        } else {
          // Estamos creando
          await addPost(postData);
          alert("Post creado con éxito.");
        }
        formCrear.reset();
        cargarPostsAdmin();
      } catch (error) {
        alert(
          `Error al ${currentEditingPost ? "actualizar" : "crear"} el post.`
        );
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

// Función para preparar la edición de un post
async function editarPost(postID) {
  try {
    const posts = await cargarPosts();
    const postToEdit = posts.find((p) => p.id === postID);

    if (!postToEdit) {
      alert("Post no encontrado para editar.");
      return;
    }

    currentEditingPost = postToEdit; // Guarda el post actual para edición

    // Llenar el formulario con los datos del post
    document.getElementById("post-nombre").value = postToEdit.nombre;
    document.getElementById("post-categorias").value = (
      postToEdit.categorias || []
    ).join(", ");
    document.getElementById("post-contenido").value = postToEdit.contenido;
    document.getElementById("post-imagen").value = ""; // Limpiar por si había algo seleccionado

    // Cambiar el texto y estilo del botón del formulario
    const formCrear = document.getElementById("form-crear-post");
    const submitButton = formCrear.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.textContent = "Guardar Cambios";
      submitButton.classList.remove("is-primary");
      submitButton.classList.add("is-link");
    }

    //  hacer scroll hasta el formulario para que sea visible
    formCrear.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    alert("Error al cargar los datos del post para editar.");
    console.error(error);
    currentEditingPost = null; // Limpiar estado en caso de error
  }
}

// PARTE DE DAVID PARA BAN Y UNBAN
// ----------------------------------------------------------------
// Buscar usuario por id o nombre para bloquear o desbloquear
async function buscar() {
  // Donde se muestran
  const divBan = document.getElementById("shadowban");

  // Titulo
  const titulo = document.createElement("h2");
  titulo.className = "subtitle";
  titulo.textContent = "Buscar usuario";
  divBan.appendChild(titulo);

  // Container
  const container = document.createElement("div");
  container.className = "container box pb-4";
  container.style.maxWidth = "700px";
  divBan.appendChild(container);

  // Form
  const form = document.createElement("form");
  container.appendChild(form);

  // Campo de texto
  const fieldTexto = document.createElement("div");
  fieldTexto.className = "field";
  form.appendChild(fieldTexto);

  const labelTexto = document.createElement("label");
  labelTexto.className = "label";
  labelTexto.textContent = "Busca un usuario por ID o nombre:";
  fieldTexto.appendChild(labelTexto);

  const controlTexto = document.createElement("div");
  controlTexto.className = "control";
  fieldTexto.appendChild(controlTexto);

  const inputTexto = document.createElement("input");
  inputTexto.className = "input";
  inputTexto.type = "text";
  inputTexto.placeholder = "nombre o ID";
  controlTexto.appendChild(inputTexto);

  // Aqui se mostraran los resultados de la busqueda
  const divPadre = document.createElement("div");
  container.appendChild(divPadre);
  inputTexto.addEventListener("input", () => busqueda(inputTexto, divPadre));
}
// Busqueda
async function busqueda(inputTexto, divPadre) {
  const input = inputTexto.value.trim().toLowerCase();
  divPadre.innerHTML = "";

  const usuarios = await obtenerTodosLosUsers();

  const adminId = localStorage.getItem("adminId");

  if (input !== "") {
    usuarios.forEach((element) => {
      if (adminId !== element.id.toString()) {
        //  BUSQUEDA POR NOMBRE DE USUARIO
        if (element.usuario.toLowerCase().includes(input)) {
          // Crear UL
          const ul = document.createElement("ul");
          ul.className = "mb-5";
          divPadre.appendChild(ul);

          // Crear LI
          const li = document.createElement("li");
          li.className =
            "box is-flex is-justify-content-space-between is-align-items-center mb-1 mt-1";
          ul.appendChild(li);

          // Texto del item
          const span = document.createElement("span");
          span.textContent = element.usuario;
          li.appendChild(span);

          // Contenedor de botones
          const divButtons = document.createElement("div");
          divButtons.className = "buttons";
          li.appendChild(divButtons);

          if (element.banned) {
            // Boton bannear
            const btnUnBan = document.createElement("button");
            btnUnBan.className = "button is-danger";
            btnUnBan.textContent = "Unban";
            btnUnBan.onclick = () => unBan(element.usuario); // es un nombre de usuario
            divButtons.appendChild(btnUnBan);
          } else {
            // Boton bannear
            const btnBan = document.createElement("button");
            btnBan.className = "button is-danger";
            btnBan.textContent = "Banear";
            btnBan.onclick = () => bannea(element.usuario); // es un nombre de usuario
            divButtons.appendChild(btnBan);
          }
        } // BUSQUEDA POR ID
        else if (element.id.toString().includes(input)) {
          // Crear UL
          const ul = document.createElement("ul");
          ul.className = "mb-5";
          divPadre.appendChild(ul);

          // Crear LI
          const li = document.createElement("li");
          li.className =
            "box is-flex is-justify-content-space-between is-align-items-center mb-1 mt-1";
          ul.appendChild(li);

          // Texto del item
          const span = document.createElement("span");
          span.textContent = element.usuario;
          li.appendChild(span);

          // Contenedor de botones
          const divButtons = document.createElement("div");
          divButtons.className = "buttons";
          li.appendChild(divButtons);

          if (element.banned) {
            // Boton bannear
            const btnUnBan = document.createElement("button");
            btnUnBan.className = "button is-danger";
            btnUnBan.textContent = "Unban";
            btnUnBan.onclick = () => unBan(element.usuario); // es un nombre de usuario
            divButtons.appendChild(btnUnBan);
          } else {
            // Boton bannear
            const btnBan = document.createElement("button");
            btnBan.className = "button is-danger";
            btnBan.textContent = "Banear";
            btnBan.onclick = () => bannea(element.usuario); // es un nombre de usuario
            divButtons.appendChild(btnBan);
          }
        }
      }
    });
  }
}

// ----------------------------------------------------------------
// Mostrar baneados y no baneados con opciones para
// desbloquear y bannear respectivamente y un input
// de busqueda
document.getElementById("ban").addEventListener("click", crearTablaDoble);

async function crearTablaDoble() {
  // Donde se va a colocar (puedes cambiar el id)
  const divBan = document.getElementById("shadowban");
  divBan.innerHTML = ""; // Limpiar contenido anterior

  // Titulo buscar
  await buscar();

  // Titulo
  const titulo = document.createElement("h2");
  titulo.className = "subtitle";
  titulo.textContent = "Silenciar Usuarios (ShadowBan)";
  divBan.appendChild(titulo);

  // Tabla principal
  const table = document.createElement("table");
  table.className = "table is-bordered";
  table.style.width = "100%";
  divBan.appendChild(table);

  // Thead principal
  const tableHead = document.createElement("thead");
  tableHead.className = "has-background-primary";
  table.appendChild(tableHead);

  const trHead = document.createElement("tr");
  tableHead.appendChild(trHead);

  const thBaneados = document.createElement("th");
  thBaneados.textContent = "Usuarios baneados";
  trHead.appendChild(thBaneados);

  const thNoBaneados = document.createElement("th");
  thNoBaneados.textContent = "Usuarios No baneados";
  trHead.appendChild(thNoBaneados);

  // Tbody principal
  const tableBody = document.createElement("tbody");
  table.appendChild(tableBody);

  const trBody = document.createElement("tr");
  tableBody.appendChild(trBody);

  // --------------------------
  // Celda: tabla usuarios baneados
  const tdBaneados = document.createElement("td");
  trBody.appendChild(tdBaneados);

  const tableBaneados = document.createElement("table");
  tableBaneados.className = "table is-bordered is-fullwidth";
  tdBaneados.appendChild(tableBaneados);

  const theadBaneados = document.createElement("thead");
  // theadBaneados.className = "has-background-danger";
  tableBaneados.appendChild(theadBaneados);

  const trBaneadosHead = document.createElement("tr");
  theadBaneados.appendChild(trBaneadosHead);

  const thNombreBaneados = document.createElement("th");
  thNombreBaneados.textContent = "Nombre de usuario";
  trBaneadosHead.appendChild(thNombreBaneados);

  const thAccionBaneados = document.createElement("th");
  thAccionBaneados.textContent = "Accion";
  trBaneadosHead.appendChild(thAccionBaneados);

  const tbodyBaneados = document.createElement("tbody");
  tableBaneados.appendChild(tbodyBaneados);

  // Obtener usuarios baneados
  const baneados = await getBaneados();
  console.log(baneados);

  baneados.forEach((element) => {
    const trBaneado = document.createElement("tr");
    tbodyBaneados.appendChild(trBaneado);

    const tdNombreBaneado = document.createElement("td");
    tdNombreBaneado.textContent = element;
    trBaneado.appendChild(tdNombreBaneado);

    const tdAccionBaneado = document.createElement("td");
    const spanUnban = document.createElement("span");
    spanUnban.className = "button is-danger";
    spanUnban.textContent = "Unban";
    spanUnban.onclick = () => unBan(element); // es un nombre de usuario
    tdAccionBaneado.appendChild(spanUnban);
    trBaneado.appendChild(tdAccionBaneado);
  });

  // --------------------------
  // Celda: tabla usuarios NO baneados
  const tdNoBaneados = document.createElement("td");
  trBody.appendChild(tdNoBaneados);

  const tableNoBaneados = document.createElement("table");
  tableNoBaneados.className = "table is-bordered is-fullwidth is-striped";
  tdNoBaneados.appendChild(tableNoBaneados);

  const theadNoBaneados = document.createElement("thead");
  // theadNoBaneados.className = "has-background-danger";
  tableNoBaneados.appendChild(theadNoBaneados);

  const trNoBaneadosHead = document.createElement("tr");
  theadNoBaneados.appendChild(trNoBaneadosHead);

  const thNombreNoBaneados = document.createElement("th");
  thNombreNoBaneados.textContent = "Nombre de usuario";
  trNoBaneadosHead.appendChild(thNombreNoBaneados);

  const thAccionNoBaneados = document.createElement("th");
  thAccionNoBaneados.textContent = "Accion";
  trNoBaneadosHead.appendChild(thAccionNoBaneados);

  const tbodyNoBaneados = document.createElement("tbody");
  tableNoBaneados.appendChild(tbodyNoBaneados);

  const noBaneados = await getNoBaneados();
  console.log(baneados);

  // Obtener usuarios no baneados
  noBaneados.forEach((element) => {
    const trNoBaneado = document.createElement("tr");
    tbodyNoBaneados.appendChild(trNoBaneado);

    const tdNombreNoBaneado = document.createElement("td");
    tdNombreNoBaneado.textContent = element;
    trNoBaneado.appendChild(tdNombreNoBaneado);

    const tdAccionNoBaneado = document.createElement("td");
    const spanBanear = document.createElement("span");
    spanBanear.className = "button is-danger";
    spanBanear.textContent = "Banear";
    spanBanear.onclick = () => bannea(element); // es un nombre de usuario
    tdAccionNoBaneado.appendChild(spanBanear);
    trNoBaneado.appendChild(tdAccionNoBaneado);
  });
}

// Banear
async function bannea(nombre) {
  await bannear(nombre);
  await crearTablaDoble();
}

// UnBan
async function unBan(nombre) {
  await desbloquear(nombre);
  await crearTablaDoble();
}
// FIN PARTE DE DAVID BAN Y UNBAN

//
//
// Parte para administrar comentarios en post
//
//
//
const contenedorComentarios = document.getElementById("comentarios");
await tablasComentarios(contenedorComentarios);
