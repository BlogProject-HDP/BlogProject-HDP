import { iniciar } from "../../js/pagination/pagination.js";
import { cargarPosts, crearIndexedDB } from "../../js/IndexedDB/indexDB.js";

// Botones acceder y perfil
const btnAcceder = document.getElementById("btnAcceder");
const perfilBtn = document.getElementById("perfilBtn");

mostrarAlerta("Bienvenido", "is-info")
// Obtenemos el modo en el que se encuentra el usuario
// L : Invitado
// const user = localStorage.getItem("userId") || "L"; esto funciona pero esta es mejor:

if (localStorage.getItem('userId') === null) {
  localStorage.setItem('userId', 'L');
}

if (localStorage.getItem('adminId') === null) {
  localStorage.setItem('adminId', 'L');
}//con esto estos valores se inincializarian en home pero solo si no existen, de esta forma se evita que se sobreescriban si viene de admin

const user = localStorage.getItem("userId");
const admin = localStorage.getItem("adminId");


// No esta logueado es invitado
// Opcion: Ver perfil no disponible
perfilBtn.addEventListener("click", () => {
  if (user === "L") {
    mostrarAlerta('Debes iniciar sesion para continuar', 'is-warning')
    return;
  }
});

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  // Si esta logueado ocultar el boton acceder
  if (user !== "L") {
    btnAcceder.classList.add("is-hidden");
    perfilBtn.setAttribute("href", "/views/perfil_usuario/perfil_usuario.html");
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

  // OPCION ANTERIOR
  // try {
  //   const posts = await cargarPosts();
  //   renderizarPosts(posts);
  // } catch (error) {
  //   console.error("Error al cargar los posts desde IndexedDB:", error);
  // }
});

// OPCION ANTERIOR
// // Crea el HTML para un post
// function crearPostHTML(post) {
//   const postDiv = document.createElement("div");
//   postDiv.className = "box is-clickable";

//   // Generar el HTML dinámico para las categorías
//   let categoriasHTML = "";
//   if (Array.isArray(post.categorias)) {
//     categoriasHTML = post.categorias
//       .map(
//         (categoria) =>
//           `<span class="column is-narrow">
//             <p class="categoria is-clickable" data-categoria="${encodeURIComponent(
//               categoria
//             )}">${categoria}</p>
//           </span>`
//       )
//       .join("");
//   }

//   postDiv.innerHTML = `
//     <article class="media">
//       <div class="media-left is-flex">
//         <figure class="image is-64x64 is-flex">
//           <img src="${post.avatar}" alt="Avatar" class="is-rounded" style="object-fit: cover;" />
//         </figure>
//       </div>
//       <div class="media-content">
//         <div class="content is-clipped">
//           <p>
//             <strong>${post.autor}</strong> <small>${post.usuario}</small>
//             <small>${post.tiempo}</small>
//           </p>
//           <p class="is-size-5">${post.titulo}</p>
//           <div class="columns is-mobile is-multiline">
//             ${categoriasHTML}
//           </div>
//         </div>
//         <nav class="level is-mobile">
//           <div class="level-left is-flex-direction-row" style="gap: 1.5rem;">
//             <a class="level-item pt-2" aria-label="reply">
//               <span class="icon is-small">
//                 <i class="fa-regular fa-comment" aria-hidden="true"></i>
//               </span>
//             </a>
//             <a class="level-item pt-2" aria-label="retweet">
//               <span class="icon is-small">
//                 <i class="fa-regular fa-bookmark" aria-hidden="true"></i>
//               </span>
//             </a>
//             <a class="level-item pt-2" aria-label="like">
//               <span class="icon is-small">
//                 <i class="fa-solid fa-heart" style="color: red;"></i>
//               </span>
//             </a>
//           </div>
//         </nav>
//       </div>
//     </article>
//   `;

//   // Añadir evento click a cada categoria (como en busquedas.js)
//   const categoriaElements = postDiv.querySelectorAll(".categoria");
//   categoriaElements.forEach((el) => {
//     el.addEventListener("click", (event) => {
//       const categoria = el.dataset.categoria;
//       // Redirigimos a la vista de busqueda con filtro=categorias (plural)
//       window.location.href = `/views/busqueda/busquedas.html?q=${categoria}&filtro=categorias`;
//     });
//   });

//   return postDiv;
// }

// // Mostrar post en pantalla los posts
// function renderizarPosts(posts) {
//   const container = document.getElementById("post-container");

//   // Borra los posts anteriores si los hay
//   container.innerHTML = "";

//   posts.forEach((post) => {
//     const postHTML = crearPostHTML(post); // Crear HTML
//     container.appendChild(postHTML);
//   });
// }
