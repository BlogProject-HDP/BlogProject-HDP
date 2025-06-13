import { iniciar } from "../../js/pagination/pagination.js";
import { cargarPosts, crearIndexedDB } from "../../js/IndexedDB/indexDB.js";

// Botones acceder y perfil
const btnAcceder = document.getElementById("btnAcceder");
const perfilBtn = document.getElementById("perfilBtn");

mostrarAlerta("Bienvenido", "is-info");
// Obtenemos el modo en el que se encuentra el usuario
// L : Invitado
// const user = localStorage.getItem("userId") || "L"; esto funciona pero esta es mejor:

if (localStorage.getItem("userId") === null) {
  localStorage.setItem("userId", "L");
}

if (localStorage.getItem("adminId") === null) {
  localStorage.setItem("adminId", "L");
} //con esto estos valores se inincializarian en home pero solo si no existen, de esta forma se evita que se sobreescriban si viene de admin

const user = localStorage.getItem("userId");
const admin = localStorage.getItem("adminId"); //Ojo que aquí no se utiliza el admin, es probable que ocupemos otra validación para
//saber si 
//o si no pues, para que se loguee

// No esta logueado es invitado
// Opcion: Ver perfil no disponible
perfilBtn.addEventListener("click", () => {
  if (user === "L") {
    mostrarAlerta("Debes iniciar sesion para continuar", "is-warning");
    return;
  }
});

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  // Si esta logueado ocultar el boton acceder
  if (user !== "L") {
    btnAcceder.classList.add("is-hidden");
    perfilBtn.setAttribute("href", "views/perfil_usuario/perfil_usuario.html");
  }

  // Logica para el evento de la barra de busqueda
  const inputBusqueda = document.getElementById("barra-busqueda");
  inputBusqueda.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = inputBusqueda.value.trim();
      if (query !== "") {
        const encodedQuery = encodeURIComponent(query);
        window.location.href = `views/busqueda/busquedas.html?q=${encodedQuery}&filtro=posts`;
        inputBusqueda.value = "";
      }
    }
  });

  // Asegurarse que la base exista si no crearla
  // esto se debe hacer ya que estamos haciendo operaciones sobre la base
  // EXISTE LA IndexedDB "dbBlog-Tech" con version 1
  const dbs = await indexedDB.databases();
  const existe = dbs.some((db) => db.name === "dbBlog-Tech");

  if (existe) {
    // EXISTE
    console.log("La base de datos ya existe, solo la abrimos.");
  } else {
    // CREAR
    console.log("La base de datos NO existe, llamamos a crearIndexedDB.");
    await crearIndexedDB();
  }

  // OPCION ACTUAL
  // Paginacion + mostrar post con opciones de like y ver
  await iniciar();
});
