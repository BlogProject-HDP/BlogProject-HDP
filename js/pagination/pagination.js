import { crearIndexedDB } from "../IndexedDB/indexDB.js";

let bd,
  pagina = 1,
  total = 0;
const LIMITE = 10;

// --------------------------------------------------------------
// main
async function main() {
  await crearIndexedDB();
  iniciar();
}

// --------------------------------------------------------------
// iniciar
function iniciar() {
  const solicitud = indexedDB.open("dbBlog-Tech", 1);

  solicitud.onsuccess = (e) => {
    bd = e.target.result;
    const transaction = bd.transaction("posts", "readonly");
    const store = transaction.objectStore("posts");
    store.count().onsuccess = (countEvent) => {
      total = countEvent.target.result;
      cargarPosts();
    };
  };

  solicitud.onerror = (e) => {
    console.error("Error al abrir la base de datos:", e.target.error);
  };
}

// --------------------------------------------------------------
// Carga los posts para almacenarlos en la lista
function cargarPosts() {
  let lista = [];
  const desde = (pagina - 1) * LIMITE;
  let i = 0;

  const transaction = bd.transaction("posts", "readonly");
  const store = transaction.objectStore("posts");

  const cursorRequest = store.openCursor();

  cursorRequest.onsuccess = (e) => {
    const cursor = e.target.result;
    if (!cursor || lista.length >= LIMITE) {
      mostrarPosts(lista);
      return;
    }
    if (i++ >= desde) {
      lista.push(cursor.value);
    }
    cursor.continue();
  };

  cursorRequest.onerror = (e) => {
    console.error("Error al leer los posts:", e.target.error);
  };
}

// --------------------------------------------------------------
// Muestra los post creado
function mostrarPosts(posts) {
  const div = document.getElementById("post-container");
  div.innerHTML = "";

  if (posts.length === 0) {
    div.textContent = "No hay posts creados.";
    return;
  }

  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.style.border = "1px solid #ccc";
    postDiv.style.padding = "10px";
    postDiv.style.marginBottom = "10px";
    postDiv.style.display = "flex";
    postDiv.style.gap = "15px";
    postDiv.style.alignItems = "center";

    const img = document.createElement("img");
    img.src = post.imagen || "";
    img.alt = post.nombre;
    img.style.width = "120px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    postDiv.appendChild(img);

    const info = document.createElement("div");
    info.style.flex = "1";

    info.innerHTML = `
      <h3>${post.nombre}</h3>
      <p>${post.contenido}</p>
      <p><strong>Publicado:</strong> ${
        new Date(post.fechaDePublicacion).toLocaleDateString() || "Sin fecha"
      }</p>
      <p><strong>Categorías:</strong> ${(post.categorias || []).join(", ")}</p>
      <p><strong>Comentarios:</strong> ${
        post.comentarios ? post.comentarios.length : 0
      }</p>
      <p><strong>Likes:</strong> ${post.likes ? post.likes.length : 0}</p>
    `;

    postDiv.appendChild(info);

    // AGREGADO POR DAVID
    postDiv.addEventListener("click", () => abrirPost(post.id));

    div.appendChild(postDiv);
  });

  renderPagination();
}

// AGREGADO POR DAVID
function abrirPost(id) {
  localStorage.setItem("IdPostUser", id.toString());
  window.location.href = "../../views/post/post.html";
}

// --------------------------------------------------------------
// Crea la paginacion en base al numero de post
function renderPagination() {
  const pag = document.getElementById("pagination");
  pag.innerHTML = "";

  const totalPaginas = Math.ceil(total / LIMITE);
  if (totalPaginas === 0) return;

  function crearBoton(text, page, activo = false, deshabilitado = false) {
    const b = document.createElement("button");
    b.textContent = text;
    if (activo) b.classList.add("active");
    if (deshabilitado) b.disabled = true;
    if (!deshabilitado && page !== null) {
      b.onclick = () => {
        pagina = page;
        cargarPosts();
      };
    }
    return b;
  }

  pag.appendChild(crearBoton("<", pagina - 1, false, pagina === 1));
  pag.appendChild(crearBoton("1", 1, pagina === 1));

  if (pagina - 2 > 2) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "0 8px";
    pag.appendChild(dots);
  }

  for (let i = pagina - 1; i <= pagina + 1; i++) {
    if (i > 1 && i < totalPaginas) {
      pag.appendChild(crearBoton(i.toString(), i, i === pagina));
    }
  }

  if (pagina + 2 < totalPaginas - 1) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "0 8px";
    pag.appendChild(dots);
  }

  if (totalPaginas > 1) {
    pag.appendChild(
      crearBoton(totalPaginas.toString(), totalPaginas, pagina === totalPaginas)
    );
  }

  pag.appendChild(crearBoton(">", pagina + 1, false, pagina === totalPaginas));
}

main();
