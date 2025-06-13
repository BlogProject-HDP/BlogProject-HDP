import {
  comentarUser,
  mostrarComentariosUser,
  mostrarComentarios,
} from "../../js/comentarios/comentarios.js";
import {
  cargarPosts,
  buscarId,
  buscarPostPoId,
  putUser,
  editPost,
} from "../../js/IndexedDB/indexDB.js";

//
//
// Evento like
// esta es diferente que la de pagination.js y no se utiliza el de busqueda
// porque da error al intentar cargar las categorias
async function like(idPost) {
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

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get("id")); // IndexedDB guarda el id como number

  // const postId = parseInt(localStorage.getItem("IdPostUser"));

  try {
    const post = await buscarPostPoId(postId);

    if (!post) {
      document.getElementById("postCardContainer").innerHTML = `
        <div class="notification is-danger">
          No se encontró el post solicitado.
        </div>
      `;
      return;
    }

    //
    //
    // Rellenar el numero de likes verificar que el usuario no sea "L"
    const idUsuario = parseInt(localStorage.getItem("userId")) || "L";

    const likeElem = document.getElementById("heart");
    let likeCount;
    if (idUsuario !== "L") {
      const yaDioLike = post.likes?.includes(idUsuario);
      likeCount = post.likes?.length || 0;
      console.log("bastardp");
      likeElem.innerHTML = `<strong><i class="${
        yaDioLike ? "fas" : "far"
      } fa-heart" style="color: #e74c3c"></i></strong> <span class="like-count m-1">${likeCount}</span>`;
    } else {
      likeElem.innerHTML = "";
      const levelitem = document.getElementById("level-item");
      levelitem.innerHTML = "";
    }

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

      like(post.id);
    });

    // Rellenar avatar del autor
    const avatarImg = document.getElementById("avatarImg");
    if (avatarImg)
      avatarImg.src =
        post.fotoPerfilAutor || "../perfil_usuario/imagenPrueba.jpeg";

    // Rellenar autor
    const authorInfoP = document.querySelector("#postCardContainer .column p");
    if (authorInfoP) {
      authorInfoP.innerHTML = `
        <strong>${post.autor}</strong>
      `;
    }

    // Rellenar título
    const titleP = document.querySelector("#postCardContainer .is-size-5");
    if (titleP) {
      titleP.textContent = post.nombre;
    }

    // Rellenar imagen de portada
    const portadaImg = document.getElementById("portadaImg");
    if (portadaImg) {
      portadaImg.src = post.imagen;
    }

    //
    //
    // Rellenar categorias
    //
    //
    // Categorias
    const categoriesContainer = document.querySelector(
      "#postCardContainer .columns.is-multiline"
    );
    categoriesContainer.innerHTML = "";

    if (post.categorias && Array.isArray(post.categorias)) {
      post.categorias.forEach((cat) => {
        const span = document.createElement("span");
        span.className = "column is-narrow";
        span.innerHTML = `
          <p class="categoria is-clickable" data-categoria="${encodeURIComponent(
            cat
          )}">${cat}</p>
        `;
        categoriesContainer.appendChild(span);

        span.querySelector(".categoria").addEventListener("click", () => {
          window.location.href = `../busqueda/busquedas.html?q=${encodeURIComponent(
            cat
          )}&filtro=categorias`;
        });
      });
    }

    // Rellenar contenido
    const contenidoDiv = document.getElementById("Contenido");
    if (contenidoDiv) {
      contenidoDiv.innerHTML = post.contenido;
    }

    //
    // Comentar
    //
    const userId = parseInt(localStorage.getItem("userId")) || "L";

    let usuario;
    if (userId !== "L") {
      // Rellenar imagen del usuario
      usuario = await buscarId(userId);
      const imagen = document.getElementById("fotoPerfil");
      imagen.src = usuario.fotoPerfil;
    }

    //
    // Numero de comentarios
    //
    const num = document.getElementById("numeroComments");
    const comentariosVisibles = post.comentarios.filter((p) => p[2] === false);
    num.textContent = comentariosVisibles.length;

    //
    // Formulario boton enviar comentario
    //
    const enviarComentario = document.getElementById("enviarComentario");

    if (userId !== "L") {
      //
      // Mostrar los comentarios del usuario arriba
      //
      const comentariosUser = document.getElementById("comentariosUser");
      await mostrarComentariosUser(comentariosUser, post, userId);
    }
    //
    // Mostrar los comentarios de otros usuarios
    //
    const comentariosAll = document.getElementById("comentariosAll");
    mostrarComentarios(comentariosAll, post, userId);

    if (userId !== "L") {
      if (usuario.banned) {
        const form = document.getElementById("formulario");
        form.innerHTML = "";
        console.log("L: no puede comentar ha sido baneado");
        document.getElementById("formulario").innerHTML = "";
        document.getElementById(
          "alertaComentario"
        ).innerHTML = `<div class="notification is-warning">No puede comentar ha sido baneado</div>`;
      }

      //
      // Evento para agregar comentario
      //
      enviarComentario.addEventListener("click", async () => {
        // textarea
        const textarea = document.getElementById("textarea");
        //
        // Los comentarios estan pendientes por defecto
        //
        await comentarUser(post, textarea.value, userId, true);

        //
        // Actualizar Numero de comentarios
        //
        const num = document.getElementById("numeroComments");
        const comentariosVisibles = post.comentarios.filter(
          (p) => p[2] === false
        );
        num.textContent = comentariosVisibles.length;
        //
        // Limpiar
        //
        textarea.value = "";

        //
        // Mostrar alerta de comentario enviado
        //
        const alerta = document.getElementById("alertaComentario");
        alerta.innerHTML = `<div class="notification is-success">Comentario enviado !!!</div>`;
        // Ocultar alerta después de 5 segundos
        setTimeout(() => {
          alerta.innerHTML = "";
        }, 5000);
      });
    } else {
      // QUITAR LA OPCION DE CREAR COMENTARIO
      // COLOCAR UNA ALERT diciendole que no puede comentar
      // Mostrarle los comentarios
      console.log("L: no puede comentar");
      document.getElementById("formulario").innerHTML = "";
      document.getElementById(
        "alertaComentario"
      ).innerHTML = `<div class="notification is-warning">Acceda a su cuenta para comentar</div>`;
    }
  } catch (error) {
    console.error("Error cargando el post", error);
    document.getElementById("postCardContainer").innerHTML = `
      <div class="notification is-danger">
        Error cargando el post.
      </div>
    `;
  }
});
