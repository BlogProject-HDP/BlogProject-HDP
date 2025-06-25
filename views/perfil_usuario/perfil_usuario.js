







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