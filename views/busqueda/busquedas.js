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
  const postDiv = document.createElement("div");
  postDiv.className = "box";
  postDiv.style.display = "flex";
  postDiv.style.alignItems = "flex-start";
  postDiv.style.gap = "10px";
  postDiv.style.cursor = "pointer";

  postDiv.addEventListener("click", () => {
    localStorage.setItem("IdPostUser", post.id.toString());
    window.location.href = "../../views/post/post.html";
  });

  // Columna 1: Foto de perfil del autor
  const columna1 = document.createElement("div");
  columna1.style.width = "90px";
  columna1.style.display = "flex";
  columna1.style.justifyContent = "center";

  const mainImg = document.createElement("img");
  mainImg.src = post.fotoPerfilAutor || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqf7MJNlh6GfxfrjCep_dnXOBm0EwGc0X12A&s";
  mainImg.alt = post.autor || "Autor";
  mainImg.style.width = "80px";
  mainImg.style.height = "80px";
  mainImg.style.objectFit = "cover";
  mainImg.style.borderRadius = "50%";
  columna1.appendChild(mainImg);
  postDiv.appendChild(columna1);

  // Columna central: contenido del post
  const contenido = document.createElement("div");
  contenido.style.flex = "1";
  contenido.style.display = "flex";
  contenido.style.flexDirection = "column";
  contenido.style.gap = "10px";

  // Cabecera con autor y fecha
  const cabecera = document.createElement("div");
  cabecera.style.display = "flex";
  cabecera.style.justifyContent = "space-between";

  cabecera.innerHTML = `
    <strong>${post.autor || "Desconocido"}</strong>
    <p><strong>Publicado:</strong> ${new Date(post.fechaDePublicacion).toLocaleString() || "Sin fecha"}</p>
  `;

  contenido.appendChild(cabecera);

  // Título
  const titulo = document.createElement("h1");
  titulo.innerHTML = `<strong>${post.nombre.length > 50 ? post.nombre.slice(0, 50) + "…" : post.nombre}</strong>`;
  titulo.style.fontSize = "22px";
  contenido.appendChild(titulo);

  // Imagen del post
  const imagen = document.createElement("img");
  imagen.src = post.imagen || "https://www.cronobierzo.es/wp-content/uploads/2020/01/no-image.jpg";
  imagen.alt = "Imagen del post";
  imagen.style.width = "100%";
  imagen.style.height = "200px";
  imagen.style.objectFit = "cover";
  imagen.style.borderRadius = "4px";
  contenido.appendChild(imagen);

  const contenidopost = document.createElement("p");
  contenidopost.innerHTML = post.contenido.length > 300
  ? post.contenido.slice(0, 300) + '<strong> Ver más...</strong>'
  : post.contenido;

  contenido.appendChild(contenidopost);
  // Likes y comentarios
  const interacciones = document.createElement("div");
  interacciones.style.display = "flex";
  interacciones.style.gap = "20px";

  const comentariosElem = document.createElement("p");
  comentariosElem.innerHTML = `<strong><i class="fas fa-comment" style="color: #3498db;"></i></strong> ${post.comentarios?.length || 0}`;

  const likeElem = document.createElement("p");
  const idUsuario = parseInt(localStorage.getItem("userId"));
  const yaDioLike = post.likes?.includes(idUsuario);
  const likeCount = post.likes?.length || 0;

  likeElem.innerHTML = `<strong><i class="${yaDioLike ? 'fas' : 'far'} fa-heart" style="color: #e74c3c;"></i></strong> ${likeCount}`;

  likeElem.style.cursor = "pointer";
  likeElem.addEventListener("click", (e) => {
    e.stopPropagation();
    like(post.id);
  });

  interacciones.appendChild(comentariosElem);
  interacciones.appendChild(likeElem);
  contenido.appendChild(interacciones);

  // Categorías
  if (Array.isArray(post.categorias)) {
    const catContenedor = document.createElement("div");
    catContenedor.innerHTML = `
      <div class="columns is-mobile is-multiline" style="align-items: center;">
        <p><strong></strong></p>
        ${post.categorias
          .map(
            (cat) => `
            <span class="column is-narrow">
              <p class="categoria is-clickable" data-categoria="${encodeURIComponent(cat)}">${cat}</p>
            </span>`
          )
          .join("")}
      </div>
    `;
    contenido.appendChild(catContenedor);
  }

  postDiv.appendChild(contenido);

  // Evitar que el click en categoría redirija al post
  postDiv.querySelectorAll(".categoria").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.stopPropagation();
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
              cat.toLowerCase().includes(query.toLowerCase())
          )
      );
    }

  if (resultados.length > 0) {
    resultados
      .sort((a, b) => new Date(b.fechaDePublicacion) - new Date(a.fechaDePublicacion)) // <-- Orden descendente
      .forEach((post) => {
        const postHTML = crearPostHTML(post);
        container.appendChild(postHTML);
      });
  }
  else {
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
