import {
  comentarUser,
  mostrarComentariosUser,
  mostrarComentarios,
} from "../../js/comentarios/comentarios.js";
import {
  cargarPosts,
  buscarId,
  buscarPostPoId,
} from "../../js/IndexedDB/indexDB.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get("id")); // IndexedDB guarda el id como number

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

    // Rellenar categorías
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

    // Rellenar imagen del usuario
    const usuario = await buscarId(userId);
    const imagen = document.getElementById("fotoFerfil");

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
      //
      // Mostrar los comentarios de otros usuarios
      //
      const comentariosAll = document.getElementById("comentariosAll");
      mostrarComentarios(comentariosAll, post, userId);

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
