import {
  editPost,
  buscarId,
  cargarPosts,
  addUser,
  putUser,
} from "../IndexedDB/indexDB.js";

// ------------------------------------------------------
// Crear comentario en post y en usuario
export async function comentarUser(post, contenido, userID, pendiente) {
  //
  // Actualizar comentarios de post
  //
  const comentario = [
    userID,
    contenido,
    pendiente,
    new Date(post.fechaDePublicacion).toLocaleString(),
  ];
  post.comentarios = post.comentarios || [];
  post.comentarios.push(comentario);
  await editPost(post);

  //
  // Actualizar comentarios del usuario (guardar postID)
  //
  const usuario = await buscarId(userID);
  usuario.comentarios = usuario.comentarios || [];
  const comentarioUsuario = [
    post.id, // postID
    contenido,
    pendiente,
    new Date(post.fechaDePublicacion).toLocaleString(),
  ];
  usuario.comentarios.push(comentarioUsuario);
  await putUser(usuario);

  //
  // Mostrar todos los comentarios actualizados
  //
  await mostrarTodoComentarios(post, userID);
}

// ------------------------------------------------------
// Mostrar comentarios del usuario con boton eliminar
export async function mostrarComentariosUser(
  contenedorComentarios,
  post,
  userID
) {
  contenedorComentarios.innerHTML = "";

  // Filtrar TODOS los comentarios del usuario (pendientes o no)
  const comentariosDelUsuario = post.comentarios.filter((p) => p[0] == userID);

  console.log("Comentarios del usuario en este post: ");
  console.log(comentariosDelUsuario);

  if (comentariosDelUsuario.length > 0) {
    const titulo = document.createElement("h1");
    titulo.className = "subtitle has-text-info";
    titulo.textContent = "Tus comentarios en este post";
    contenedorComentarios.appendChild(titulo);
  }

  const usuario = await buscarId(userID);

  comentariosDelUsuario.forEach((comentario) => {
    const articulo = document.createElement("article");
    articulo.className = "media";
    contenedorComentarios.appendChild(articulo);

    // Si el comentario está pendiente, mostrar el texto
    const estadoPendiente =
      comentario[2] === true
        ? `<span class="tag is-warning is-light">Pendiente de aprobación</span>`
        : "";

    articulo.innerHTML = `
<figure class="media-left">
<p class="image is-64x64">
    <img src="${usuario.fotoPerfil}" alt="fotoPerfil"/>
</p>
</figure>
<div class="media-content">
    <div class="content">
        <p>
            <strong>${usuario.usuario}</strong>
            <br />
            ${comentario[1]}
            <br />
            <br />
            <small><strong>${comentario[3]}</strong></small>
            <br />
            ${estadoPendiente}
        </p>
        <button class="button is-danger">Eliminar</button>
    </div>   
</div> 
    `;

    const indexComentarioPost = post.comentarios.findIndex(
      (c) =>
        c[0] === comentario[0] &&
        c[1] === comentario[1] &&
        c[2] === comentario[2] &&
        c[3] === comentario[3]
    );

    const indexComentarioUsuario = usuario.comentarios.findIndex(
      (c) =>
        c[0] === post.id && // ahora c[0] es postID
        c[1] === comentario[1] &&
        c[2] === comentario[2] &&
        c[3] === comentario[3]
    );

    const btnEliminar = articulo.querySelector(".button.is-danger");
    btnEliminar.addEventListener("click", () => {
      eliminarComentario(
        userID,
        post,
        indexComentarioPost,
        indexComentarioUsuario
      );
    });
  });
}

// ------------------------------------------------------
// Mostrar comentarios de otros usuarios (sin boton eliminar)
export async function mostrarComentarios(contenedorComentarios, post, userID) {
  contenedorComentarios.innerHTML = "";

  // Filtrar comentarios de otros usuarios que NO son pendientes
  const comentariosOtrosUsuarios = post.comentarios.filter(
    (p) => p[0] != userID && p[2] === false
  );

  console.log("Comentarios de otros usuarios en este post: ");
  console.log(comentariosOtrosUsuarios);

  if (comentariosOtrosUsuarios.length > 0) {
    const titulo = document.createElement("h1");
    titulo.className = "subtitle has-text-link";
    titulo.textContent = "Comentarios de otros usuarios";
    contenedorComentarios.appendChild(titulo);
  }

  for (const comentario of comentariosOtrosUsuarios) {
    const usuarioComentario = await buscarId(comentario[0]);

    const articulo = document.createElement("article");
    articulo.className = "media";
    contenedorComentarios.appendChild(articulo);

    articulo.innerHTML = `
<figure class="media-left">
<p class="image is-64x64">
    <img src="${usuarioComentario.fotoPerfil}" alt="fotoPerfil"/>
</p>
</figure>
<div class="media-content">
    <div class="content">
        <p>
            <strong>${usuarioComentario.email}</strong>
            <br />
            ${comentario[1]}
            <br />
            <br />
            <small><strong>${comentario[3]}</strong></small>
        </p>
    </div>   
</div> 
    `;
  }
}

// ------------------------------------------------------
// Eliminar comentario de post y de usuario
export async function eliminarComentario(
  userID,
  post,
  indexComentarioPost,
  indexComentarioUsuario
) {
  const usuario = await buscarId(userID);

  // Eliminar del post
  post.comentarios.splice(indexComentarioPost, 1);
  await editPost(post);

  // Eliminar del usuario
  usuario.comentarios.splice(indexComentarioUsuario, 1);
  await putUser(usuario);

  // Mostrar todo de nuevo sincronizado
  await mostrarTodoComentarios(post, userID);
}

// ------------------------------------------------------
// Mostrar todos los comentarios (funcion auxiliar para mantener limpio el codigo)
export async function mostrarTodoComentarios(post, userID) {
  const comentariosUser = document.getElementById("comentariosUser");
  comentariosUser.innerHTML = "";
  await mostrarComentariosUser(comentariosUser, post, userID);

  const comentariosAll = document.getElementById("comentariosAll");
  comentariosAll.innerHTML = "";
  await mostrarComentarios(comentariosAll, post, userID);

  const num = document.getElementById("numeroComments");
  const comentariosVisibles = post.comentarios.filter((p) => p[2] === false);
  num.textContent = comentariosVisibles.length;
}
