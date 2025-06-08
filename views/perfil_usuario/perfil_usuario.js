function crearComment({ nombre, usuario, tiempo, contenido }) {
    const box = document.createElement("div");
    box.className = "box comment-box";

    const article = document.createElement("article");
    article.className = "media";

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

    const nav = document.createElement("nav");
    nav.className = "level is-mobile";

    const levelLeft = document.createElement("div");
    levelLeft.className = "level-left is-flex-direction-row";
    levelLeft.style.gap = "1.5rem";

    const acciones = [
        { icon: "fas fa-reply", label: "reply" },
        { icon: "fas fa-retweet", label: "retweet" },
        { icon: "fa-solid fa-heart", label: "like", color: "red" }
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


document.addEventListener("DOMContentLoaded", () => {

});


function crearPost({ nombre, usuario, tiempo, titulo, imagen }) {
    const box = document.createElement("div");
    box.className = "box post-box";

    const article = document.createElement("article");
    article.className = "media";

    // media-left (imagen)
    const mediaLeft = document.createElement("div");
    mediaLeft.className = "media-left";

    const figure = document.createElement("figure");
    figure.className = "image is-64x64";

    const img = document.createElement("img");
    img.src = imagen || "https://bulma.io/assets/images/placeholders/128x128.png";
    img.alt = "Image";

    figure.appendChild(img);
    mediaLeft.appendChild(figure);

    // media-content
    const mediaContent = document.createElement("div");
    mediaContent.className = "media-content";

    const content = document.createElement("div");
    content.className = "content";

    const pInfo = document.createElement("p");
    pInfo.innerHTML = `
        <strong>${nombre}</strong> <small>@${usuario}</small>
        <small>${tiempo}</small>
        <br />
    `;

    const pTitulo = document.createElement("p");
    pTitulo.className = "is-size-4";
    pTitulo.textContent = titulo;

    content.appendChild(pInfo);
    content.appendChild(pTitulo);
    mediaContent.appendChild(content);

    // nivel de acciones
    const nav = document.createElement("nav");
    nav.className = "level is-mobile";

    const levelLeft = document.createElement("div");
    levelLeft.className = "level-left";

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

    // estructura final
    article.appendChild(mediaLeft);
    article.appendChild(mediaContent);
    box.appendChild(article);

    return box;
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
        imagen: "https://i.pravatar.cc/64?img=55"
    };

    const contenedor = document.getElementById("post");
    const nuevoPost = crearPost(postData);
    contenedor.appendChild(nuevoPost);
    const nuevoPost2 = crearPost(postData);
    contenedor.appendChild(nuevoPost2);

    const datosPost = {
        nombre: "John Smith",
        usuario: "johnsmith",
        tiempo: "31m",
        contenido: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur sit amet massa fringilla egestas."
    };

    const postWrapper = document.getElementById("comments");
    const nuevoComment = crearComment(datosPost);
    postWrapper.appendChild(nuevoComment);

    const datosUsuario = {
        nombre: "Alexis Ventura",
        usuario: "alexis_ve",
        bio: "Apasionado por la tecnología y el desarrollo web.",
        fechaNacimiento: "7 de junio de 2001",
        imagen: "imagenPrueba.jpeg"
    };

    actualizarPerfil(datosUsuario);

    actualizarEstadisticas();
});