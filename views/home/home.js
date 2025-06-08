document.addEventListener("DOMContentLoaded", () => {
  //logica para el evento de la barra de busqueda
  const inputBusqueda = document.getElementById("barra-busqueda");
  inputBusqueda.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = inputBusqueda.value.trim();
      if (query !== "") {
        // Codificamos el término de búsqueda para que sea seguro en una URL
        const encodedQuery = encodeURIComponent(query);
        //la brarra inicial en la ruta indica que es desde la razi del server
        // window.location.href = `/views/busqueda/busquedas.html?q=${encodedQuery}`;
        window.location.href = `/views/busqueda/busquedas.html?q=${encodedQuery}&filtro=posts`;
        inputBusqueda.value = "";
      }
    }
  });


  renderizarPosts(posts)
});





const posts = [
  {
    autor: "John Smith",
    usuario: "@jo",
    tiempo: "31m",
    titulo: "Titulo del post mandanga mandanaga",
    avatar: "../perfil_usuario/imagenPrueba.jpeg",
  },
  {
    autor: "Maria López",
    usuario: "@marilo",
    tiempo: "12m",
    titulo: "Un título diferente para otro post",
    avatar: "../perfil_usuario/imagenPrueba.jpeg",
  },
  // más posts...
];





function crearPostHTML(post) {
  const postDiv = document.createElement("div");
  postDiv.className = "box is-clickable";
  postDiv.innerHTML = `
    <article class="media">
      <div class="media-left is-flex">
        <figure class="image is-64x64 is-flex">
          <img src="${post.avatar}" alt="Avatar" class="is-rounded" style="object-fit: cover;" />
        </figure>
      </div>
      <div class="media-content">
        <div class="content">
          <p>
            <strong>${post.autor}</strong> <small>${post.usuario}</small>
            <small>${post.tiempo}</small>
          </p>
          <p class="is-size-5">${post.titulo}</p>
          <p class="is-size-5">C# Python</p>
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
  return postDiv;
}

function renderizarPosts(posts) {
  const container = document.getElementById("post-container");

  // Borra los posts anteriores si los hay
  container.innerHTML = "";

  posts.forEach(post => {
    const postHTML = crearPostHTML(post);
    container.appendChild(postHTML);
  });
}


