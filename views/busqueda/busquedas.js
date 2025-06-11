import {
  cargarPosts,
  buscarId,
  putUser,
  buscarPostPoId,
  editPost,
} from "/js/indexedDB/IndexDB.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("window.location.search:", window.location.search);
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  console.log("query obtenida:", query);

  let filtro = params.get("filtro") || "posts";

  const paramLabel = document.getElementById("paramLabel");
  const tabs = document.querySelectorAll(".panel-tabs a");

  // Mapeo para normalizar nombres de filtro vs tabs
  const tabMap = {
    posts: "posts",
    categoria: "categorias",
    categorias: "categorias",
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
    tabs.forEach((tab) => {
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
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const nuevoFiltro = tab.textContent.trim().toLowerCase();
      if (nuevoFiltro === tabMap[filtro]) return; // Evita redibujar si no cambió

      filtro = nuevoFiltro;

      // Actualiza URL y estado en el historial
      const nuevaURL = `${window.location.pathname}?q=${encodeURIComponent(
        query
      )}&filtro=${filtro}`;
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
  console.log("Post:", post);

  let categoriasHTML = "";
  if (Array.isArray(post.categorias)) {
    categoriasHTML = post.categorias
      .map(
        (categoria) =>
          `<span class="column is-narrow">
            <p class="categoria is-clickable" data-categoria="${encodeURIComponent(
              categoria
            )}">${categoria}</p>
          </span>`
      )
      .join("");
  }

  const postDiv = document.createElement("div");
  postDiv.className = "box";
  postDiv.style.border = "1px solid #ccc";
  // postDiv.style.padding = "10px";
  // postDiv.style.borderRadius = "10px";
  // postDiv.style.marginBottom = "10px";
  postDiv.style.display = "flex";
  postDiv.style.gap = "10px";
  postDiv.style.alignItems = "center";

  const img = document.createElement("img");
  img.src = post.imagen || "";
  img.alt = post.nombre;
  img.style.width = "300px";
  img.style.padding = "2px";
  img.style.height = "150px";
  img.style.objectFit = "cover";
  postDiv.appendChild(img);

  const info = document.createElement("div");
  info.style.flex = "1";

  info.innerHTML = `
        <h3><strong>Nombre:</strong> ${post.nombre}</h3>
        <p><strong>Publicado:</strong> ${
          new Date(post.fechaDePublicacion).toLocaleDateString() || "Sin fecha"
        }</p>
        <p><strong>Comentarios: </strong> ${
          post.comentarios ? post.comentarios.length : 0
        }</p>
        <p><strong>Likes:</strong> ${post.likes ? post.likes.length : 0}</p>
        <p><strong>Categorías: </strong></p>
        <div class="columns is-mobile is-multiline">
                ${categoriasHTML}
              </div>  
      `;

  postDiv.appendChild(info);

  // -- Contenedor de los botones
  const contenedor = document.createElement("div");
  contenedor.className = "box is-clickable";
  contenedor.style.padding = "5px";
  contenedor.style.height = "160px";
  contenedor.style.width = "150px";
  contenedor.style.display = "flex";
  contenedor.style.flexDirection = "column";
  contenedor.style.gap = "10px";
  contenedor.style.justifyContent = "center";
  postDiv.appendChild(contenedor);

  // -- Boton ver
  const btnVer = document.createElement("button");
  btnVer.style.background = "transparent";
  btnVer.style.border = "none";
  btnVer.style.padding = "10px";
  btnVer.style.cursor = "pointer";
  btnVer.style.color = "#3498db"; // azul

  btnVer.innerHTML = `
    <i class="fas fa-eye"> Ver</i>
  `;
  contenedor.appendChild(btnVer);

  // -- Boton like
  const btnLike = document.createElement("button");
  btnLike.style.background = "transparent";
  btnLike.style.border = "none";
  btnLike.style.padding = "10px";
  btnLike.style.cursor = "pointer";
  btnLike.style.color = "#e74c3c";
  btnLike.addEventListener("click", () => like(post.id, contenedor));

  btnLike.innerHTML = `
    <i class="fas fa-heart"> Like</i>
  `;
  contenedor.appendChild(btnLike);

  const idUsuario = parseInt(localStorage.getItem("userId"));
  //
  //
  // Cambiar color a "contenedor" si ese post tiene like
  // del usuario actual
  if (post.likes.includes(idUsuario)) {
    contenedor.classList.add("has-background-primary");
  }
  //
  //
  //

  const categoriaElements = postDiv.querySelectorAll(".categoria");
  categoriaElements.forEach((el) => {
    el.addEventListener("click", (event) => {
      const categoria = el.dataset.categoria;
      window.location.href = `/views/busqueda/busquedas.html?q=${categoria}&filtro=categorias`;
    });
  });

  return postDiv;
}

// Evento like
// esta es diferente que la de pagination.js
export async function like(idPost, contenedor) {
  const prueba = localStorage.getItem("userId");

  // USUARIO TIENE QUE ESTAR LOGUEADO
  if (prueba !== "L" && prueba !== null) {
    console.log(prueba);
    const idUsuario = parseInt(localStorage.getItem("userId"));
    const usuario = await buscarId(idUsuario);
    // Agregar su like al usuario guardamos el id del post, quiere decir que ahi
    // hizo like, si ya lo contenia lo eliminamos
    if (!usuario.likes) {
      usuario.likes = []; // inicializar si no existe
    }

    if (!usuario.likes.includes(idPost)) {
      // No estas --> agregar
      usuario.likes.push(idPost);
      await putUser(usuario);
      //
      //
      // Agregar al post el like del usuario guardamos su id
      const post = await buscarPostPoId(idPost); // obtener post
      contenedor.classList.add("has-background-primary");
      if (!post.likes) {
        post.likes = []; // inicializar si no existe
      }

      if (!post.likes.includes(idUsuario)) {
        // No estas --> agregar
        post.likes.push(idUsuario);
        await editPost(post);
      }
      //
      //

      console.log(`Like agregado al post ${idPost} y al usuario ${idUsuario}`);
    } else {
      // Ya esta --> eliminar
      usuario.likes = usuario.likes.filter((id) => id !== idPost);
      contenedor.classList.remove("has-background-primary");
      await putUser(usuario);
      //
      //
      //
      // Eliminar si ya estaba el link en la tabla post
      const post = await buscarPostPoId(idPost); // obtener post
      post.likes = post.likes.filter((id) => id !== idUsuario);
      await editPost(post);
      //
      //
      //

      console.log(
        `Like eliminado del post ${idPost} y del usuario ${idUsuario}`
      );
    }

    // Recargar todo
    location.reload();
  } else {
    console.log("L: no esta logueado ");
  }
}

// Simulación de renderizado
async function renderizarResultados(query, filtro) {
  const container = document.getElementById("post-container");
  container.innerHTML = "";

  try {
    const allPosts = await cargarPosts();
    console.log("Posts cargados:", allPosts); // <--- Aquí

    let resultados = [];

    if (filtro === "posts") {
      resultados = allPosts.filter(
        (post) =>
          typeof post.nombre === "string" &&
          post.nombre.toLowerCase().includes(query.toLowerCase())
      );
    } else if (filtro === "categorias") {
      resultados = allPosts.filter(
        (post) =>
          Array.isArray(post.categorias) &&
          post.categorias.some(
            (cat) =>
              typeof cat === "string" &&
              cat.toLowerCase() === query.toLowerCase()
          )
      );
    }

    if (resultados.length > 0) {
      resultados.forEach((post) => {
        const postHTML = crearPostHTML(post);
        container.appendChild(postHTML);
      });
    } else {
      const mensaje = document.createElement("div");
      mensaje.className = "notification is-warning";
      mensaje.textContent = `No se encontraron resultados para "${query}" en ${filtro}`;
      container.appendChild(mensaje);
    }
  } catch (error) {
    console.error("Error al cargar los posts desde IndexedDB:", error);
    const mensaje = document.createElement("div");
    mensaje.className = "notification is-danger";
    mensaje.textContent = "Hubo un error al cargar los resultados.";
    container.appendChild(mensaje);
  }
}
