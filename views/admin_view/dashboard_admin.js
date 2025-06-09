import {
  getBaneados,
  getNoBaneados,
  desbloquear,
  bannear,
} from "../../js/baneados/baneador.js";

import {
  buscarId,
  buscarUser,
  obtenerTodosLosUsers,
} from "../../js/IndexedDB/indexDB.js";

// Tabs principales
document.querySelectorAll(".tabs ul li").forEach((tab) => {
  tab.addEventListener("click", function () {
    document
      .querySelectorAll(".tabs ul li")
      .forEach((t) => t.classList.remove("is-active"));
    this.classList.add("is-active");
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.add("is-hidden"));
    document
      .getElementById(this.getAttribute("data-tab"))
      .classList.remove("is-hidden");
  });
});
// Subtabs de comentarios
document.querySelectorAll(".tabs.is-toggle ul li").forEach((subtab) => {
  subtab.addEventListener("click", function () {
    document
      .querySelectorAll(".tabs.is-toggle ul li")
      .forEach((t) => t.classList.remove("is-active"));
    this.classList.add("is-active");
    document
      .querySelectorAll(".subtab-content")
      .forEach((c) => c.classList.add("is-hidden"));
    document
      .getElementById(this.getAttribute("data-subtab"))
      .classList.remove("is-hidden");
  });
});

//obtenemos aquí el id del admin
const adminId = localStorage.getItem("adminId");
if (adminId === "L") {
  // Si no hay adminId en localStorage, redirige o muestra error
  console.error("No estás logueado como admin.");
  window.location.href = "../autenticacion/auth.html";
} else {
  console.log("Admin logueado con ID:", adminId);
}

// Al cargar la página o cuando se muestre la pestaña de admin-posts
document.addEventListener("DOMContentLoaded", () => {
  const adminPostsTab = document.getElementById("admin-posts");
  if (adminPostsTab) {
    cargarPostsAdmin();
    agregarEventosCrudPost();
  }
});

// 1. Leer y mostrar todos los posts (de tu store "posts")
function cargarPostsAdmin() {
  const lista = document.getElementById("admin-posts-lista");
  if (!lista) return;

  lista.innerHTML = "<p>Cargando posts...</p>";

  const tx = window.db.transaction("posts", "readonly");
  const store = tx.objectStore("posts");
  const request = store.getAll(); // Obtiene todos los posts

  request.onsuccess = () => {
    const posts = request.result || [];
    if (posts.length === 0) {
      lista.innerHTML = "<p>No hay posts creados.</p>";
      return;
    }

    // Generar una tabla simple con botones para editar y eliminar
    let html = `
            <table class="table is-fullwidth is-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categorías</th>
                        <th></th>
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
                <td>
                    <button class="button is-small is-warning" data-edit="${
                      post.id
                    }">Editar</button>
                    <button class="button is-small is-danger" data-delete="${
                      post.id
                    }">Eliminar</button>
                </td>
            </tr>`;
    });
    html += `</tbody></table>`;
    lista.innerHTML = html;
  };
  request.onerror = () => {
    lista.innerHTML = "<p>Error al cargar los posts.</p>";
  };
}

// 2. Agregar lógica para crear un nuevo post
function agregarEventosCrudPost() {
  // Asume que tienes un formulario con ID "form-crear-post" en tu HTML
  const formCrear = document.getElementById("form-crear-post");
  if (formCrear) {
    formCrear.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = document.getElementById("post-nombre").value.trim();
      const categorias = document
        .getElementById("post-categorias")
        .value.split(",")
        .map((x) => x.trim());
      const contenido = document.getElementById("post-contenido").value.trim();
      if (!nombre) return alert("El nombre del post es obligatorio");

      const tx = window.db.transaction("posts", "readwrite");
      const store = tx.objectStore("posts");
      store.add({
        nombre,
        categorias,
        contenido,
        fechaDePublicacion: new Date().toISOString(),
        likes: [],
        comentarios: [],
      });
      tx.oncomplete = () => {
        formCrear.reset();
        cargarPostsAdmin();
        alert("Post creado con éxito.");
      };
      tx.onerror = () => {
        alert('Error al crear el post (posible duplicado en "nombre").');
      };
    });
  }

  // 3. Escucha botones "Editar" y "Eliminar" en la tabla de posts
  document
    .getElementById("admin-posts-lista")
    .addEventListener("click", (e) => {
      if (e.target.dataset.edit) {
        editarPost(e.target.dataset.edit);
      } else if (e.target.dataset.delete) {
        eliminarPost(e.target.dataset.delete);
      }
    });
}

// 4. Editar un post
function editarPost(id) {
  const nuevoNombre = prompt("Nuevo nombre para el post:");
  if (!nuevoNombre) return;

  const tx = window.db.transaction("posts", "readwrite");
  const store = tx.objectStore("posts");
  const request = store.get(Number(id));

  request.onsuccess = () => {
    const post = request.result;
    if (!post) return alert("Post no encontrado");
    post.nombre = nuevoNombre;
    store.put(post);
  };
  tx.oncomplete = () => {
    cargarPostsAdmin();
    alert("Post editado con éxito.");
  };
  tx.onerror = () => {
    alert('Error al editar el post (posible duplicado en "nombre").');
  };
}

// 5. Eliminar un post
function eliminarPost(id) {
  if (!confirm("¿Seguro que deseas eliminar este post?")) return;

  const tx = window.db.transaction("posts", "readwrite");
  const store = tx.objectStore("posts");
  store.delete(Number(id));
  tx.oncomplete = () => {
    cargarPostsAdmin();
    alert("Post eliminado con éxito.");
  };
  tx.onerror = () => {
    alert("Error al eliminar el post.");
  };
}

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

  // // Botón centrado
  // const fieldBoton = document.createElement("div");
  // fieldBoton.className = "field is-grouped is-grouped-centered";
  // form.appendChild(fieldBoton);

  // const controlBoton = document.createElement("div");
  // controlBoton.className = "control";
  // fieldBoton.appendChild(controlBoton);

  // const buttonEnviar = document.createElement("button");
  // buttonEnviar.className = "button is-info";
  // buttonEnviar.type = "submit";
  // buttonEnviar.textContent = "Enviar";
  // buttonEnviar.onclick = () => busqueda(inputTexto, container); // es un nombre de usuario
  // controlBoton.appendChild(buttonEnviar);
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
            btnBan.onclick = () => bannear(element.usuario); // es un nombre de usuario
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
            btnBan.onclick = () => bannear(element.usuario); // es un nombre de usuario
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
