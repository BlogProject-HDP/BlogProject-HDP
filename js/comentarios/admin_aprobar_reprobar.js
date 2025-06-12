import {
  cargarPosts,
  buscarId,
  putUser,
  editPost,
} from "../IndexedDB/indexDB.js";
import { tablasComentarios } from "./comentarios_admi.js";

//
//
//
// Aprobar comentario
window.aprobar = async function (idUsuario, postId, fechaComentario) {
  console.log("Aprobar:", idUsuario, postId, fechaComentario);

  // Buscar usuario
  idUsuario = parseInt(idUsuario);
  const usuario = await buscarId(idUsuario);
  if (!usuario) {
    console.error(`Usuario con ID ${idUsuario} no encontrado`);
    return;
  }

  // Modificar comentario en usuario
  usuario.comentarios.forEach((comentario) => {
    if (comentario[3] === fechaComentario && comentario[2]) {
      // Buscamos comentario pendiente con esa fecha
      comentario[2] = false; // Marcar como aprobado
    }
  });

  // Guardar usuario
  await putUser(usuario);

  // Buscar post
  const posts = await cargarPosts();
  const post = posts.find((p) => p.id == postId);
  if (!post) {
    console.error(`Post con ID ${postId} no encontrado`);
    return;
  }

  // Modificar comentario en post
  post.comentarios.forEach((comentario) => {
    if (
      comentario[0] == idUsuario &&
      comentario[3] === fechaComentario &&
      comentario[2]
    ) {
      comentario[2] = false; // Marcar como aprobado
    }
  });

  // Guardar post
  await editPost(post);

  // Recargar la tabla
  await tablasComentarios(document.getElementById("comentarios"));
};

//
//
//
// Reprobar comentario
window.reprobar = async function (idUsuario, postId, fechaComentario) {
  console.log("Reprobar:", idUsuario, postId, fechaComentario);

  // Buscar usuario
  idUsuario = parseInt(idUsuario);
  const usuario = await buscarId(idUsuario);
  if (!usuario) {
    console.error(`Usuario con ID ${idUsuario} no encontrado`);
    return;
  }

  // Modificar comentario en usuario
  usuario.comentarios.forEach((comentario) => {
    if (comentario[3] === fechaComentario && !comentario[2]) {
      // Buscamos comentario aprobado con esa fecha
      comentario[2] = true; // Marcar como pendiente
    }
  });

  // Guardar usuario
  await putUser(usuario);

  // Buscar post
  const posts = await cargarPosts();
  const post = posts.find((p) => p.id == postId);
  if (!post) {
    console.error(`Post con ID ${postId} no encontrado`);
    return;
  }

  // Modificar comentario en post
  post.comentarios.forEach((comentario) => {
    if (
      comentario[0] == idUsuario &&
      comentario[3] === fechaComentario &&
      !comentario[2]
    ) {
      comentario[2] = true; // Marcar como pendiente
    }
  });

  // Guardar post
  await editPost(post);

  // Recargar la tabla
  await tablasComentarios(document.getElementById("comentarios"));
};

//
//
//
// Eliminar comentario
window.eliminarComentario = async function (
  idUsuario,
  postId,
  fechaComentario
) {
  console.log("Eliminar comentario:", idUsuario, postId, fechaComentario);

  // Buscar usuario
  idUsuario = parseInt(idUsuario);
  const usuario = await buscarId(idUsuario);
  if (!usuario) {
    console.error(`Usuario con ID ${idUsuario} no encontrado`);
    return;
  }

  // Filtrar comentarios → quitar el comentario con esa fecha
  usuario.comentarios = usuario.comentarios.filter(
    (comentario) => comentario[3] !== fechaComentario
  );

  // Guardar usuario
  await putUser(usuario);

  // Buscar post
  const posts = await cargarPosts();
  const post = posts.find((p) => p.id == postId);
  if (!post) {
    console.error(`Post con ID ${postId} no encontrado`);
    return;
  }

  // Filtrar comentarios → quitar el comentario con esa fecha
  post.comentarios = post.comentarios.filter(
    (comentario) =>
      comentario[0] != idUsuario || comentario[3] !== fechaComentario
  );

  // Guardar post
  await editPost(post);

  // Recargar tabla
  await tablasComentarios(document.getElementById("comentarios")); // Poné tu contenedor
};
