document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  let filtro = params.get("filtro") || "posts";

  const paramLabel = document.getElementById("paramLabel");
  const tabs = document.querySelectorAll(".panel-tabs a");

  // Mapeo para normalizar nombres de filtro vs tabs
  const tabMap = {
    posts: "posts",
    categoria: "categorias",
    categorias: "categorias"
  };

  // Lógica para el evento de la barra de búsqueda
  const inputBusqueda = document.getElementById("barra-busqueda");
  inputBusqueda.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = inputBusqueda.value.trim();
      if (query !== "") {
        const encodedQuery = encodeURIComponent(query);
        window.location.href = `/views/busqueda/busquedas.html?q=${encodedQuery}&filtro=posts`;
        inputBusqueda.value = "";
      }
    }
  });

  // Función para activar visualmente el tab correcto
  function activarTabActual(filtroActivo) {
    tabs.forEach(tab => {
      const tabFiltro = tab.textContent.trim().toLowerCase();
      if (tabFiltro === tabMap[filtroActivo]) {
        tab.classList.add("is-active");
      } else {
        tab.classList.remove("is-active");
      }
    });
  }

  // Renderizado centralizado
  function actualizarVista(filtroNuevo) {
    paramLabel.textContent = `Resultados para "${query}" en ${filtroNuevo}`;
    activarTabActual(filtroNuevo);
    renderizarResultados(query, filtroNuevo);
  }

  // Primer renderizado
  actualizarVista(filtro);

  // Eventos de click en tabs
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const nuevoFiltro = tab.textContent.trim().toLowerCase();
      if (nuevoFiltro === tabMap[filtro]) return; // Evita redibujar si no cambió

      filtro = nuevoFiltro;

      // Actualiza URL y estado en el historial
      const nuevaURL = `${window.location.pathname}?q=${encodeURIComponent(query)}&filtro=${filtro}`;
      window.history.pushState({ filtro }, "", nuevaURL);

      actualizarVista(filtro);
    });
  });

  // Manejar el botón "atrás" / "adelante"
  window.onpopstate = () => {
    const params = new URLSearchParams(window.location.search);
    const filtroHistorial = params.get("filtro") || "posts";
    filtro = filtroHistorial;
    actualizarVista(filtro);
  };
});

function crearPostHTML(post) {
  const postDiv = document.createElement("div");
  postDiv.className = "box is-clickable";

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

  postDiv.innerHTML = `
    <article class="media">
      <div class="media-left is-flex">
        <figure class="image is-64x64 is-flex">
          <img src="${post.avatar}" alt="Avatar" class="is-rounded" style="object-fit: cover;" />
        </figure>
      </div>
      <div class="media-content">
        <div class="content is-clipped">
          <p>
            <strong>${post.autor}</strong> <small>${post.usuario}</small>
            <small>${post.tiempo}</small>
          </p>
          <p class="is-size-5">${post.titulo}</p>
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

  const categoriaElements = postDiv.querySelectorAll(".categoria");
  categoriaElements.forEach((el) => {
    el.addEventListener("click", (event) => {
      const categoria = el.dataset.categoria;
      window.location.href = `/views/busqueda/busquedas.html?q=${categoria}&filtro=categorias`;
    });
  });

  return postDiv;
}

// Simulación de renderizado
function renderizarResultados(query, filtro) {
  const container = document.getElementById("post-container");

  // Elimina los resultados anteriores
  container.innerHTML = "";

  // Simulación de posts (esto lo reemplazarás luego por los resultados de la búsqueda real)
  const allPosts = [
    {
      autor: "John Smith",
      usuario: "@jo",
      tiempo: "31m",
      titulo: `Post sobre ${query}`,
      avatar: "../perfil_usuario/imagenPrueba.jpeg",
      categorias: ["Tecnología", "Programación", "AI"],
    },
    {
      autor: "Maria López",
      usuario: "@marilo",
      tiempo: "12m",
      titulo: `Otro post relacionado con ${query}`,
      avatar: "../perfil_usuario/imagenPrueba.jpeg",
      categorias: ["Diseño", "Creatividad", query],
    },
  ];

  // Filtro de resultados
  let resultados = [];

  if (filtro === "posts") {
    resultados = allPosts.filter((post) =>
      post.titulo.toLowerCase().includes(query.toLowerCase())
    );
  } else if (filtro === "categorias") {
    resultados = allPosts.filter((post) =>
      post.categorias.some((cat) =>
        cat.toLowerCase() === query.toLowerCase()
      )
    );
  }

  // Renderizar posts encontrados
  resultados.forEach((post) => {
    const postHTML = crearPostHTML(post);
    container.appendChild(postHTML);
  });

  // Si no hay resultados, mostrar un mensaje
  if (resultados.length === 0) {
    const mensaje = document.createElement("div");
    mensaje.className = "notification is-warning";
    mensaje.textContent = `No se encontraron resultados para "${query}" en ${filtro}`;
    container.appendChild(mensaje);
  }
}
