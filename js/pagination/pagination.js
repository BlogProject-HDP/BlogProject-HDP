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

    // Categorias
    // Construir categorías
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

    info.innerHTML = `
      <h3><strong>Nombre:</strong> ${post.nombre}</h3>
      <p><strong>Publicado:</strong> ${
        new Date(post.fechaDePublicacion).toLocaleString() || "Sin fecha"
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
    // btnVer.addEventListener("click", () => abrirPost(post.id));

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

    // Evento para categorías que redirige al filtro de búsqueda
    const categoriaElements = postDiv.querySelectorAll(".categoria");
    categoriaElements.forEach((el) => {
      el.addEventListener("click", (event) => {
        event.stopPropagation(); // evitar que se dispare el click general
        const categoria = el.dataset.categoria;
        window.location.href = `../busqueda/busquedas.html?q=${categoria}&filtro=categorias`;
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
