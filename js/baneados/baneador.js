import {
  obtenerTodosLosUsers,
  buscarUser,
  putUser,
} from "../IndexedDB/indexDB.js";

// ----------------------------------------------------------------
// Obtener los usuarios baneados
export async function getBaneados() {
  // Obtener todos los usuarios de la IndexedDB
  const usuarios = await obtenerTodosLosUsers();
  const idAdmi = localStorage.getItem("adminId");

  // Crear una tabla con nombre de usuario y opcion de "Desbloquear"
  // false (0): No baneado
  // true (1): Baneado

  // Almacenar usuarios baneados
  const baneados = [];
  usuarios.forEach((element) => {
    // Excluir al admi
    if (idAdmi != element.id) {
      if (element.banned) {
        baneados.push(element.usuario);
      }
    }
  });

  return baneados;
}

// ----------------------------------------------------------------
// Obtener los usuarios NO baneados
export async function getNoBaneados() {
  // Obtener todos los usuarios de la IndexedDB
  const usuarios = await obtenerTodosLosUsers();
  const idAdmi = localStorage.getItem("adminId");

  // Crear una tabla con nombre de usuario y opcion de "Desbloquear"
  // false (0): No baneado
  // true (1): Baneado

  // Almacenar usuarios baneados
  const noBaneados = [];
  usuarios.forEach((element) => {
    // Excluir al admi
    if (idAdmi != element.id) {
      if (!element.banned) {
        noBaneados.push(element.usuario);
      }
    }
  });

  return noBaneados;
}

// ----------------------------------------------------------------
// Desbloquear usuario baneado
export async function desbloquear(nombre) {
  const usuario = await buscarUser(nombre);
  if (usuario) {
    usuario.banned = false;
    await putUser(usuario);
  }
}

// ----------------------------------------------------------------
// Bloquear usuario
export async function bannear(nombre) {
  const usuario = await buscarUser(nombre);
  if (usuario) {
    usuario.banned = true;
    await putUser(usuario);
  }
}
