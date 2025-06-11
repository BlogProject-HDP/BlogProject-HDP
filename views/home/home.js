import { cargarPosts } from "/js/indexedDB/IndexDB.js";  

const btnAcceder = document.getElementById("btnAcceder");
const perfilBtn = document.getElementById("perfilBtn")

const user = localStorage.getItem("userId") || "L";

perfilBtn.addEventListener("click", () => {

  if (user === "L") {
    alert("Mira loco tenes que estar logeado para acceder aqui")
    return;
  }

})

document.addEventListener("DOMContentLoaded", async () => {
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

});