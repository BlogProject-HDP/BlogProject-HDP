


document.addEventListener('DOMContentLoaded', () => {


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


});




