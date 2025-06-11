import {
  buscarId,
  putUser,
  buscarPostPoId,
  editPost,
  crearIndexedDB,
} from "../IndexedDB/indexDB.js";

let bd,
  pagina = 1,
  total = 0;
const LIMITE = 10;

// --------------------------------------------------------------
// iniciar
export async function iniciar() {
  await crearIndexedDB();

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

  const cursorRequest = store.openCursor(null, "prev");

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

  // Titulo
  const titulo = document.createElement("h1");
  titulo.className = "subtitle has-text-info";
  titulo.textContent = "Posts recientes";
  div.appendChild(titulo);

  if (posts.length === 0) {
    titulo.textContent = "No hay posts creados ...";
    return;
  }

posts.forEach((post) => {
  const postDiv = document.createElement("div");
  postDiv.className = "box";
  postDiv.style.display = "flex";
  postDiv.style.alignItems = "flex-start";
  postDiv.style.gap = "10px";
  postDiv.style.cursor = "pointer";

  postDiv.addEventListener("click", () => {
    abrirPost(post.id); // 👉 Función que muestra detalle del post
  });

  // Columna 1: Imagen de perfil
  const columna1 = document.createElement("div");
  columna1.style.display = "flex";
  columna1.style.flexDirection = "column";
  columna1.style.justifyContent = "flex-start";
  columna1.style.alignItems = "center";
  columna1.style.width = "90px";

  const mainImg = document.createElement("img");
  mainImg.src = post.fotoPerfilAutor || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqf7MJNlh6GfxfrjCep_dnXOBm0EwGc0X12A&s";
  mainImg.alt = post.autor;
  mainImg.style.width = "80px";
  mainImg.style.height = "80px";
  mainImg.style.objectFit = "cover";
  mainImg.style.borderRadius = "50%";
  mainImg.style.padding = "2px";
  columna1.appendChild(mainImg);
  postDiv.appendChild(columna1);

  const filaCentro = document.createElement("div");
  filaCentro.style.display = "flex";
  filaCentro.style.flex = "1";
  filaCentro.style.flexDirection = "column";
  filaCentro.style.gap = "10px";

  const headerRow = document.createElement("div");
  headerRow.style.display = "flex";
  headerRow.style.justifyContent = "space-between";
  headerRow.style.alignItems = "center";
  headerRow.style.width = "100%";

  const autorYFecha = document.createElement("div");
  autorYFecha.style.flex = "1";
  autorYFecha.style.display = "flex";
  autorYFecha.style.justifyContent = "space-between";
  autorYFecha.innerHTML = `
    <strong>${post.autor || "Desconocido"}</strong>
    <p><strong>Publicado:</strong> ${new Date(post.fechaDePublicacion).toLocaleString() || "Sin fecha"}</p>
  `;

  headerRow.appendChild(autorYFecha);
  filaCentro.appendChild(headerRow);

  const filaInferior = document.createElement("div");
  filaInferior.style.display = "flex";
  filaInferior.style.gap = "10px";
  filaInferior.style.width = "100%";

  const columna2 = document.createElement("div");
  columna2.style.flex = "1";
  columna2.style.display = "flex";
  columna2.style.flexDirection = "column";
  columna2.style.gap = "10px";

  const titulo = document.createElement("h3");
  const nombreCorto = post.nombre.length > 50 ? post.nombre.slice(0, 50) + "…" : post.nombre;
  titulo.innerHTML = `<h1 style="font-size: 25px;"><strong>${nombreCorto}</strong></h1>`;
  columna2.appendChild(titulo);

  const imagenPost = document.createElement("img");
  imagenPost.src = post.imagen || "https://www.cronobierzo.es/wp-content/uploads/2020/01/no-image.jpg";
  imagenPost.alt = "Foto del post";
  imagenPost.style.width = "100%";
  imagenPost.style.height = "200px";
  imagenPost.style.objectFit = "cover";
  imagenPost.style.borderRadius = "4px";
  columna2.appendChild(imagenPost);

  const contenidopost = document.createElement("p");
contenidopost.innerHTML = post.contenido.length > 300
  ? post.contenido.slice(0, 300) + '<strong> Ver más...</strong>'
  : post.contenido;

  columna2.appendChild(contenidopost);

  // Interacciones con botón de like
  const interacciones = document.createElement("div");
  interacciones.style.display = "flex";
  interacciones.style.gap = "20px";

  const comentariosElem = document.createElement("p");
  comentariosElem.innerHTML = `<strong><i style="color: #3498db" class="fas fa-comment"></i></strong> ${post.comentarios?.length || 0}`;

  const likeElem = document.createElement("p");
  likeElem.style.cursor = "pointer";
  likeElem.style.userSelect = "none";

  const idUsuario = parseInt(localStorage.getItem("userId"));
  const yaDioLike = post.likes?.includes(idUsuario);
  let likeCount = post.likes?.length || 0;

  likeElem.innerHTML = `<strong><i class="${yaDioLike ? 'fas' : 'far'} fa-heart" style="color: #e74c3c"></i></strong> <span class="like-count">${likeCount}</span>`;

  likeElem.addEventListener("click", (event) => {
    event.stopPropagation(); // Evita redirigir al ver post
    const icon = likeElem.querySelector("i");
    const countSpan = likeElem.querySelector(".like-count");

    if (icon.classList.contains("far")) {
      icon.classList.remove("far");
      icon.classList.add("fas");
      likeCount++;
      countSpan.textContent = likeCount;
    } else {
      icon.classList.remove("fas");
      icon.classList.add("far");
      likeCount--;
      countSpan.textContent = likeCount;
    }

    like(post.id); // 👉 Tu función que guarda el like
  });

  interacciones.appendChild(comentariosElem);
  interacciones.appendChild(likeElem);
  columna2.appendChild(interacciones);

  // Categorías
  let categoriasHTML = "";
  if (Array.isArray(post.categorias)) {
    categoriasHTML = post.categorias
      .map(
        (categoria) => `
        <span class="column is-narrow">
          <p class="categoria is-clickable" data-categoria="${encodeURIComponent(
            categoria
          )}">${categoria}</p>
        </span>`
      )
      .join("");
  }

  const categoriasContainer = document.createElement("div");
categoriasContainer.innerHTML = `
  <div class="columns is-mobile is-multiline" style=" align-items: center; text-align: center;">
    <p><strong></strong></p>
    ${categoriasHTML}
  </div>`;
  columna2.appendChild(categoriasContainer);

  filaInferior.appendChild(columna2);
  filaCentro.appendChild(filaInferior);
  postDiv.appendChild(filaCentro);

  // Evitar que click en categorías dispare verPost
  postDiv.querySelectorAll(".categoria").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      const categoria = el.dataset.categoria;
      window.location.href = `/views/busqueda/busquedas.html?q=${categoria}&filtro=categorias`;
    });
  });

  div.appendChild(postDiv);
});

renderPagination();
}

// Evento like: cuando se da like a un post
async function like(idPost, contenedor) {
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
    await iniciar();
  } else {
    console.log("L: no esta logueado ");
  }
}

// Funcion para abrir un post
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
