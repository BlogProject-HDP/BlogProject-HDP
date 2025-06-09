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

function actualizarComments() {

    const numeroComentarios = document.querySelectorAll(".comment-box").length;
    document.getElementById('numeroComments').textContent = numeroComentarios
}

function actualizarPerfil({ nombre, usuario, fechapost, imagen }) {
    const nombreElem = document.getElementById("name");
    if (nombreElem) nombreElem.textContent = nombre;

    const usuarioElem = document.getElementById("user");
    if (usuarioElem) usuarioElem.textContent = `@${usuario}`;

    const fechaPost = document.querySelector("#fechaPost");
    if (fechaPost) fechaPost.textContent = fechapost;

    const imagenElem = document.querySelector(".image img.is-rounded");
    if (imagenElem) imagenElem.src = imagen;
}



document.addEventListener("DOMContentLoaded", () => {
    const datosPost = {
        nombre: "John Smith",
        usuario: "johnsmith",
        tiempo: "31m",
        contenido: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur sit amet massa fringilla egestas."
    };

    const comments = document.getElementById('comments')
    for (let index = 0; index < 10; index++) {
        const nuevoComment = crearComment(datosPost);

        comments.appendChild(nuevoComment)

    }
actualizarComments();

const datosUsuario = {
        nombre: "Alexis Ventura",
        usuario: "alexis_ve",
        fechapost: "15/05/2005",
        imagen: "https://i.pravatar.cc/64?img=55"
    };


    actualizarPerfil(datosUsuario);

    const datosUsuario2 = {
        titulo: "Alexis Ventura",
        texto: ["alexis_ve",'as'],
        
    };
    actualizarPost(datosUsuario2)
});

function actualizarPost({ titulo, texto }) {
    const title = document.getElementById('titulo');
    const contenido = document.getElementById('Contenido');

    if (title) title.textContent = titulo;

    if (contenido) {
        
        texto.forEach(element => {
            const p = document.createElement('p');
            p.textContent = element;
            contenido.appendChild(p);
        });
    }
}
