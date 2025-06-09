

const btnAcceder = document.getElementById("btnAcceder");
const perfilBtn = document.getElementById("perfilBtn")

const user = localStorage.getItem("userId") || "L";

perfilBtn.addEventListener("click", () => {

  if (user === "L") {
    alert("Mira loco tenes que estar logeado para acceder aqui")
    return;
  }

})

document.addEventListener("DOMContentLoaded", () => {
  // lógica para el evento de la barra de búsqueda

  if(user !== "L"){
    btnAcceder.classList.add("is-hidden")
    perfilBtn.setAttribute("href", "../perfil_usuario/perfil_usuario.html")
  }



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

  renderizarPosts(posts);
});

const posts = [
  {
    autor: "John Smith",
    usuario: "@jo",
    tiempo: "31m",
    titulo: "Titulo del post mandanga mandanaga",
    avatar: "../perfil_usuario/imagenPrueba.jpeg",
    categorias: ["Tecnología", "Programación", "AI"],
  },
  {
    autor: "Maria López",
    usuario: "@marilo",
    tiempo: "12m",
    titulo: "Un título diferente para otro post",
    avatar: "../perfil_usuario/imagenPrueba.jpeg",
    categorias: ["Diseño", "Creatividad"],
  },
  // más posts...
];

function crearPostHTML(post) {
  const postDiv = document.createElement("div");
  postDiv.className = "box is-clickable";

  // Generar el HTML dinámico para las categorías
  let categoriasHTML = "";
  if (Array.isArray(post.categorias)) {
    categoriasHTML = post.categorias
      .map(
        (categoria) =>
          `<span class="column is-narrow">
            <p class="categoria is-clickable" data-categoria="${encodeURIComponent(categoria)}">${categoria}</p>
          </span>`
      )
      .join("");
  }

  postDiv.innerHTML = `
    <article class="media">
      <div class="media-left is-flex">
        <figure class="image is-64x64 is-flex">
          <img src="${post.avatar}" alt="Avatar" class="is-rounded" style="object-fit: cover;" />
        </figure>
      </div>
      <div class="media-content">
        <div class="content is-clipped">
          <p>
            <strong>${post.autor}</strong> <small>${post.usuario}</small>
            <small>${post.tiempo}</small>
          </p>
          <p class="is-size-5">${post.titulo}</p>
          <div class="columns is-mobile is-multiline">
            ${categoriasHTML}
          </div>  
        </div>
        <nav class="level is-mobile">
          <div class="level-left is-flex-direction-row" style="gap: 1.5rem;">
            <a class="level-item pt-2" aria-label="reply">
              <span class="icon is-small">
                <i class="fa-regular fa-comment" aria-hidden="true"></i>
              </span>
            </a>
            <a class="level-item pt-2" aria-label="retweet">
              <span class="icon is-small">
                <i class="fa-regular fa-bookmark" aria-hidden="true"></i>
              </span>
            </a>
            <a class="level-item pt-2" aria-label="like">
              <span class="icon is-small">
                <i class="fa-solid fa-heart" style="color: red;"></i>
              </span>
            </a>
          </div>
        </nav>
      </div>
    </article>
  `;

  // Añadir evento click a cada categoria (como en busquedas.js)
  const categoriaElements = postDiv.querySelectorAll(".categoria");
  categoriaElements.forEach((el) => {
    el.addEventListener("click", (event) => {
      const categoria = el.dataset.categoria;
      // Redirigimos a la vista de busqueda con filtro=categorias (plural)
      window.location.href = `/views/busqueda/busquedas.html?q=${categoria}&filtro=categorias`;
    });
  });

  return postDiv;
}

function renderizarPosts(posts) {
  const container = document.getElementById("post-container");

  // Borra los posts anteriores si los hay
  container.innerHTML = "";

  posts.forEach((post) => {
    const postHTML = crearPostHTML(post);
    container.appendChild(postHTML);
  });
}
