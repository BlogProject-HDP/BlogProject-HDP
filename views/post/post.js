document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  // Simulación de "base de datos"
  const allPosts = [
    {
      id: "1",
      autor: "John Smith",
      usuario: "@jo",
      tiempo: "31m",
      titulo: "Titulo del post mandanga mandanaga",
      avatar: "../perfil_usuario/imagenPrueba.jpeg",
      portada: "../../resources/test_portada.webp",
      categorias: ["Tecnología", "Programación", "AI"],
      contenido: `
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus...</p>
        <p>Aliquam erat volutpat. Nulla facilisi. Etiam sit amet facilisis erat.</p>
      `
    },
    {
      id: "2",
      autor: "Maria López",
      usuario: "@marilo",
      tiempo: "12m",
      titulo: "Un título diferente para otro post",
      avatar: "../perfil_usuario/imagenPrueba.jpeg",
      portada: "../../resources/test_portada.webp",
      categorias: ["Diseño", "Creatividad"],
      contenido: `
        <p>En esta publicación exploraremos cómo el diseño impacta la experiencia del usuario en la web moderna.</p>
      `
    }
    // ... más posts
  ];

  // Buscar el post correspondiente
  const post = allPosts.find(p => p.id === postId);

  if (!post) {
    document.getElementById("postCardContainer").innerHTML = `
      <div class="notification is-danger">
        No se encontró el post solicitado.
      </div>
    `;
    return;
  }

  // Rellenar avatar
  const avatarImg = document.getElementById("avatarImg");
  if (avatarImg) avatarImg.src = post.avatar;

  // Rellenar autor, usuario, tiempo
  const authorInfoP = document.querySelector("#postCardContainer .column p");
  if (authorInfoP) {
    authorInfoP.innerHTML = `
      <strong>${post.autor}</strong> <small>${post.usuario}</small> <small>${post.tiempo}</small>
    `;
  }

  // Rellenar título
  const titleP = document.querySelector("#postCardContainer .is-size-5");
  if (titleP) {
    titleP.textContent = post.titulo;
  }

  // Rellenar imagen de portada
  const portadaImg = document.getElementById("portadaImg");
  if (portadaImg) {
    portadaImg.src = post.portada;
  }

  // Rellenar categorías
  const categoriesContainer = document.querySelector("#postCardContainer .columns.is-multiline");
  categoriesContainer.innerHTML = ""; // limpiar

  post.categorias.forEach(cat => {
    const span = document.createElement("span");
    span.className = "column is-narrow";
    span.innerHTML = `
      <p class="categoria is-clickable" data-categoria="${encodeURIComponent(cat)}">${cat}</p>
    `;
    categoriesContainer.appendChild(span);

    // Hacer la categoría clicable
    span.querySelector(".categoria").addEventListener("click", () => {
      window.location.href = `../busqueda/busquedas.html?q=${encodeURIComponent(cat)}&filtro=categorias`;
    });
  });

  // Rellenar contenido
  const contenidoDiv = document.getElementById("Contenido");
  if (contenidoDiv) {
    contenidoDiv.innerHTML = post.contenido;
  }

  // Por ahora los comentarios puedes dejarlos estáticos o luego hacerlos dinámicos
});
