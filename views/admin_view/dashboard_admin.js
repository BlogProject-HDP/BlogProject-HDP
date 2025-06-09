import {
  getBaneados,
  getNoBaneados,
  desbloquear,
  bannear,
} from "../../js/baneados/baneador.js";

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
// Mostrar baneados y no baneados con opciones para
// desbloquear y bannear respectivamente y un input
// de busqueda
document.getElementById("ban").addEventListener("click", banner);
function banner() {
  buscar(); // Buscar usuario por id o nombre para bloquear o desbloquear
  mostrarBaneados(); // Baneados
  mostrarNoBaneados(); // NO Baneados
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

  // <input type="email" class="input is-primary" id="loginEmail" placeholder="tu@email.com" required>

  const input = document.createElement("input");
  // input
}

// ----------------------------------------------------------------
// Mostrar tabla de baneado
async function mostrarBaneados() {
  // Donde se muestran
  const divBan = document.getElementById("shadowban");

  // Titulo
  const titulo = document.createElement("h2");
  titulo.className = "subtitle";
  titulo.textContent = "Usuarios baneados";
  divBan.appendChild(titulo);

  // Table
  const table = document.createElement("table");
  table.className = "table is-fullwidth is-striped";
  divBan.appendChild(table);

  // Table head
  const tableHead = document.createElement("thead");
  table.appendChild(tableHead);

  const tr1 = document.createElement("tr");
  tr1.className = "has-background-primary has-text-white";
  tableHead.appendChild(tr1);

  const th1 = document.createElement("th");
  th1.textContent = "Usuario";
  tr1.appendChild(th1);

  const th2 = document.createElement("th");
  th2.className = "has-text-right";
  th2.textContent = "Desbloquear";
  tr1.appendChild(th2);

  // Table body
  const tableBody = document.createElement("tbody"); // CORREGIDO
  table.appendChild(tableBody);

  // Obtener usuarios baneados
  const baneados = await getBaneados();
  console.log(baneados);

  baneados.forEach((element) => {
    // Nueva fila
    const tr = document.createElement("tr");

    // Columna usuario
    const tdUsuario = document.createElement("td");
    tdUsuario.textContent = element;
    tr.appendChild(tdUsuario);

    // Columna botón
    const tdBoton = document.createElement("td");
    tdBoton.className = "has-text-right";

    // Boton
    const button = document.createElement("button");
    button.className = "button is-danger";
    button.textContent = "Desbloquear";
    button.onclick = () => desblo(element); // es un nombre de usuario

    tdBoton.appendChild(button);
    tr.appendChild(tdBoton);

    tableBody.appendChild(tr);
  });
}

async function desblo(nombre) {
  await desbloquear(nombre);
  limpiar();
  buscar();
  mostrarBaneados();
  mostrarNoBaneados();
}

function limpiar() {
  // Donde se muestran
  const divBan = document.getElementById("shadowban");
  divBan.innerHTML = "";
}

async function ban(nombre) {
  await bannear(nombre);
  limpiar();
  buscar();
  mostrarBaneados();
  mostrarNoBaneados();
}

// ----------------------------------------------------------------
// Mostrar tabla de NO baneado
async function mostrarNoBaneados() {
  // Donde se muestran
  const divBan = document.getElementById("shadowban");

  // Titulo
  const titulo = document.createElement("h2");
  titulo.className = "subtitle";
  titulo.textContent = "Usuarios NO baneados";
  divBan.appendChild(titulo);

  // Table
  const table = document.createElement("table");
  table.className = "table is-fullwidth is-striped";
  divBan.appendChild(table);

  // Table head
  const tableHead = document.createElement("thead");
  table.appendChild(tableHead);

  const tr1 = document.createElement("tr");
  tr1.className = "has-background-primary has-text-white";
  tableHead.appendChild(tr1);

  const th1 = document.createElement("th");
  th1.textContent = "Usuario";
  tr1.appendChild(th1);

  const th2 = document.createElement("th");
  th2.className = "has-text-right"; // alinear texto a la derecha
  th2.textContent = "Bloquear";
  tr1.appendChild(th2);

  // Table body (corregido aquí)
  const tableBody = document.createElement("tbody");
  table.appendChild(tableBody);

  // Obtener usuarios NO baneados
  const noBaneados = await getNoBaneados();
  console.log(noBaneados);

  noBaneados.forEach((element) => {
    // Nueva fila
    const tr = document.createElement("tr");

    const tdUsuario = document.createElement("td");
    tdUsuario.textContent = element;
    tr.appendChild(tdUsuario);

    const tdBoton = document.createElement("td");
    tdBoton.className = "has-text-right"; // alinear botón a la derecha

    // Boton
    const button = document.createElement("button");
    button.className = "button is-danger";
    button.textContent = "Bloquear";
    button.onclick = () => ban(element); // es un nombre de usuario

    tdBoton.appendChild(button);
    tr.appendChild(tdBoton);

    tableBody.appendChild(tr);
  });
}
