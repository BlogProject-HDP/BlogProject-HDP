document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  let filtro = params.get("filtro") || "posts";

  const paramLabel = document.getElementById("paramLabel");
  const tabs = document.querySelectorAll(".panel-tabs a");


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

  // Función para activar visualmente el tab correcto
  function activarTabActual(filtroActivo) {
    tabs.forEach(tab => {
      const tabFiltro = tab.textContent.trim().toLowerCase();
      if (tabFiltro === filtroActivo) {
        tab.classList.add("is-active");
      } else {
        tab.classList.remove("is-active");
      }
    });
  }

  // Renderizado centralizado
  function actualizarVista(filtroNuevo) {
    paramLabel.textContent = `Resultados para "${query}" en ${filtroNuevo}`;
    activarTabActual(filtroNuevo);
    renderizarResultados(query, filtroNuevo);
  }

  // Primer renderizado
  actualizarVista(filtro);

  // Eventos de click en tabs
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const nuevoFiltro = tab.textContent.trim().toLowerCase();
      if (nuevoFiltro === filtro) return; // Evita redibujar si no cambió

      filtro = nuevoFiltro;

      // Actualiza URL y estado en el historial
      const nuevaURL = `${window.location.pathname}?q=${encodeURIComponent(query)}&filtro=${filtro}`;
      window.history.pushState({ filtro }, "", nuevaURL);

      actualizarVista(filtro);
    });
  });

  // Manejar el botón "atrás" / "adelante"
  window.onpopstate = () => {
    const params = new URLSearchParams(window.location.search);
    const filtroHistorial = params.get("filtro") || "posts";
    filtro = filtroHistorial;
    actualizarVista(filtro);
  };
});

// Simulación de renderizado
function renderizarResultados(query, filtro) {
  const container = document.getElementById("post-container");

  // Elimina los resultados anteriores
  container.querySelectorAll(".post-result, .cat-result").forEach(el => el.remove());

  if (filtro === "posts") {
    const resultados = [
      `Aprende ${query} desde cero`,
      `Tips avanzados de ${query}`,
      `${query} para desarrollo web`
    ];
    resultados.forEach(texto => {
      const div = document.createElement("div");
      div.className = "post-result box";
      div.textContent = texto;
      container.appendChild(div);
    });
  } else if (filtro === "categorias") {
    const categorias = [
      `${query} básico`,
      `${query} intermedio`,
      `${query} avanzado`
    ];
    categorias.forEach(cat => {
      const div = document.createElement("div");
      div.className = "cat-result notification is-info";
      div.textContent = `Categoría: ${cat}`;
      container.appendChild(div);
    });
  }
}
