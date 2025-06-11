function crearComment({ nombre, usuario, tiempo, contenido }) {
    const box = document.createElement("div");
    box.className = "box comment-box";

    const article = document.createElement("article");
    article.className = "media is-flex-wrap-wrap";

    const mediaContent = document.createElement("div");
    mediaContent.className = "media-content";

    const contentDiv = document.createElement("div");
    contentDiv.className = "content";

    const p = document.createElement("p");
    p.innerHTML = `
        <strong>${nombre}</strong> <small>@${usuario}</small>
        <small>${tiempo}</small>
        <br />
        ${contenido}
    `;

    contentDiv.appendChild(p);
    mediaContent.appendChild(contentDiv);

    // Acciones (íconos)
    const nav = document.createElement("nav");
    nav.className = "level is-mobile mt-2";

    const levelLeft = document.createElement("div");
    levelLeft.className = "level-left is-flex is-align-items-center";
    levelLeft.style.gap = "1rem";
    levelLeft.style.flexWrap = "nowrap";
    levelLeft.style.flexDirection = "row";

    const acciones = [
        { icon: "fas fa-reply", label: "reply" },
        { icon: "fa-regular fa-bookmark", label: "bookmark" },
        { icon: "fa-regular fa-heart", label: "like", color: "red" }
    ];

    acciones.forEach(({ icon, label, color }) => {
        const a = document.createElement("a");
        a.className = "level-item";
        a.setAttribute("aria-label", label);

        const span = document.createElement("span");
        span.className = "icon is-small";

        const i = document.createElement("i");
        i.className = icon;
        if (color) i.style.color = color;

        span.appendChild(i);
        a.appendChild(span);
        levelLeft.appendChild(a);
    });

    nav.appendChild(levelLeft);
    mediaContent.appendChild(nav);

    article.appendChild(mediaContent);
    box.appendChild(article);

    return box;
}


function crearPost({ nombre, usuario, tiempo, titulo, imagen, categorias = [] }) {
    const postDiv = document.createElement("div");
    postDiv.className = "box post-box is-clickable";

    let categoriasHTML = "";
    if (Array.isArray(categorias)) {
        categoriasHTML = categorias
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
          <img src="${imagen || "https://bulma.io/assets/images/placeholders/128x128.png"}" alt="Avatar" class="is-rounded" style="object-fit: cover;" />
        </figure>
      </div>
      <div class="media-content">
        <div class="content is-clipped">
          <p>
            <strong>${nombre}</strong> <small>@${usuario}</small>
            <small>${tiempo}</small>
          </p>
          <p class="is-size-5">${titulo}</p>
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

    // Hacer las categorías clicables (como en el resto del sistema)
    const categoriaElements = postDiv.querySelectorAll(".categoria");
    categoriaElements.forEach((el) => {
        el.addEventListener("click", (event) => {
            const categoria = el.dataset.categoria;
            window.location.href = `../busqueda/busquedas.html?q=${categoria}&filtro=categorias`;
        });
    });

    return postDiv;
}







function actualizarEstadisticas() {
    const statsContainer = document.getElementById("statistics");
    const columnas = statsContainer.querySelectorAll(".column");

    if (columnas.length >= 2) {

        const posts = document.querySelectorAll('.post-box').length;
        const comments = document.querySelectorAll('.comment-box').length;

        columnas[0].querySelector(".title").textContent = posts;
        columnas[1].querySelector(".title").textContent = comments;
    }
}

function actualizarPerfil({ nombre, usuario, bio, fechaNacimiento, imagen }) {
    // Actualiza nombre
    const nombreElem = document.getElementById("name");
    if (nombreElem) nombreElem.textContent = nombre;

    // Actualiza usuario
    const usuarioElem = document.getElementById("user");
    if (usuarioElem) usuarioElem.textContent = `@${usuario}`;

    // Actualiza bio
    const bioElem = document.querySelector("#bio span");
    if (bioElem) bioElem.textContent = bio;

    // Actualiza fecha de nacimiento
    const birthdayElem = document.querySelector("#birthday span");
    if (birthdayElem) birthdayElem.textContent = fechaNacimiento;

    // Actualiza imagen de perfil
    const imagenElem = document.querySelector(".image img.is-rounded");
    if (imagenElem) imagenElem.src = imagen;
}


document.addEventListener("DOMContentLoaded", () => {


    const postData = {
    nombre: "John Smith",
    usuario: "johnsmith",
    tiempo: "31m",
    titulo: "Este es un título dinámico",
    imagen: "https://i.pravatar.cc/64?img=55",
    categorias: ["Tecnología", "Programación", "IA"]
};

    const contenedor = document.getElementById("post");
    const nuevoPost = crearPost(postData);
    contenedor.appendChild(nuevoPost);
    // const nuevoPost2 = crearPost(postData);
    // contenedor.appendChild(nuevoPost2);

    const datosPost = {
        nombre: "John Smith",
        usuario: "johnsmith",
        tiempo: "31m",
        contenido: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur sit amet massa fringilla egestas."
    };

    const postWrapper = document.getElementById("comments");
    const nuevoComment = crearComment(datosPost);
    postWrapper.appendChild(nuevoComment);


    actualizarEstadisticas();

    // Función para abrir un modal
    function abrirModal(id) {
        document.getElementById(id).classList.add("is-active");
    }

    // Función para cerrar todos los modales
    function cerrarModales() {
        document.querySelectorAll(".modal").forEach(modal => {
            modal.classList.remove("is-active");
        });
    }

    // Eventos para abrir modales
    document.getElementById("abrir-modal-user").addEventListener("click", () => {
        abrirModal("modal-user");
    });

    document.getElementById("abrir-modal-info").addEventListener("click", () => {
        abrirModal("modal-info");
    });

    // Eventos para cerrar modales al hacer clic en fondo o botón de cierre
    document.querySelectorAll(".modal-background, .modal-close, .modal .button[type='button']").forEach(elemento => {
        elemento.addEventListener("click", cerrarModales);
    });
});