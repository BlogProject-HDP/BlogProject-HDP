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
    // Crear el div principal con Bulma
    const postDiv = document.createElement("div");
    postDiv.className = "box is-clickable";

    // Construir categorías
    let categoriasHTML = "";
    if (Array.isArray(post.categorias)) {
      categoriasHTML = post.categorias
        .map(
          (categoria) =>
            `<span class="column is-narrow">
              <p class="categoria is-clickable" data-categoria="${encodeURIComponent(categoria)}">${categoria}</p>
            </span>`
        )
        .join("");
    }

    // Insertar el HTML completo
    postDiv.innerHTML = `
      <article class="media">
        <div class="media-left is-flex">
          <figure class="image is-64x64 is-flex">
            <img src="${post.imagen || ''}" alt="Avatar" class="is-rounded" style="object-fit: cover;" />
          </figure>
        </div>
        <div class="media-content">
          <div class="content is-clipped">
            <p>
              <strong>${post.nombre}</strong> 
              <small>${new Date(post.fechaDePublicacion).toLocaleDateString() || "Sin fecha"}</small>
            </p>
            <p class="is-size-5">${post.contenido}</p>
            <div class="columns is-mobile is-multiline">
              ${categoriasHTML}
            </div>  
          </div>
          <nav class="level is-mobile">
            <div class="level-left is-flex-direction-row" style="gap: 1.5rem;">
              <a class="level-item pt-2" aria-label="reply">
                <span class="icon is-small">
                  <i class="fa-regular fa-comment" aria-hidden="true"></i>
                </span>
              </a>
              <a class="level-item pt-2" aria-label="retweet">
                <span class="icon is-small">
                  <i class="fa-regular fa-bookmark" aria-hidden="true"></i>
                </span>
              </a>
              <a class="level-item pt-2" aria-label="like">
                <span class="icon is-small">
                  <i class="fa-solid fa-heart" style="color: red;"></i>
                </span>
              </a>
            </div>
          </nav>
        </div>
      </article>
    `;

    // Evento para categorías que redirige al filtro de búsqueda
    const categoriaElements = postDiv.querySelectorAll(".categoria");
    categoriaElements.forEach((el) => {
      el.addEventListener("click", (event) => {
        event.stopPropagation(); // evitar que se dispare el click general
        const categoria = el.dataset.categoria;
        window.location.href = `/views/busqueda/busquedas.html?q=${categoria}&filtro=categorias`;
      });
    });

    // Evento click para abrir post
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
