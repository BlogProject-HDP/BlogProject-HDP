import { cargarPosts } from "../IndexedDB/indexDB.js";

export async function tablasComentarios(contenedor) {
  const posts = await cargarPosts();

  // Limpiar y mostrar título principal
  contenedor.innerHTML = "";
  const titulo = document.createElement("div");
  titulo.innerHTML = `
    <h2 class="subtitle">Administrador de Comentarios</h2>
  `;
  contenedor.appendChild(titulo);

  // Recorrer posts
  posts.forEach((post) => {
    // Crear contenedor para el post
    const postContainer = document.createElement("div");
    postContainer.classList.add("box", "m-4");
    //FECHA
    const fechaIso = post.fechaDePublicacion;
    const fecha = new Date(fechaIso);

    const horaLegible = fecha.toLocaleTimeString("es-SV", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit", // <-- aquí agregas los segundos
      hour12: true, // true = AM/PM, false = 24h
    });

    postContainer.innerHTML = `
    <h3 class="title is-4 has-text-primary">Post: ${post.nombre}<br> Fecha publicacion: ${horaLegible}</h3>
    
    <h4 class="has-text-warning">Comentarios Pendientes</h4>
    <table class="table is-bordered m-4" style="width: 80vw">
      <thead class="has-background-link">
        <tr>
          <th>Comentario</th>
          <th>Opción</th>
        </tr>
      </thead>
      <tbody id="pendientesBody-${post.id}">
      </tbody>
    </table>

    <h4 class="has-text-success">Comentarios Aprobados</h4>
    <table class="table is-bordered m-4" style="width: 80vw">
      <thead class="has-background-link">
        <tr>
          <th>Comentario</th>
          <th>Opción</th>
        </tr>
      </thead>
      <tbody id="aprobadosBody-${post.id}">
      </tbody>
    </table>
  `;

    // Agregar el contenedor del post al contenedor principal
    contenedor.appendChild(postContainer);

    // Variables para contar cuántos comentarios agregamos
    let pendientesCount = 0;
    let aprobadosCount = 0;

    // Recorrer comentarios
    post.comentarios.forEach((comentarioEnPost) => {
      if (comentarioEnPost[2]) {
        // Pendiente → botón Aprobar
        const bodyTable = document.getElementById(`pendientesBody-${post.id}`);
        const row = document.createElement("tr");
        bodyTable.appendChild(row);
        row.innerHTML = `
        <td style="white-space: normal; word-break: break-word;">
          Usuario ID: ${comentarioEnPost[0]} <br> Comentario: <br>
          ${comentarioEnPost[1]}
        </td>
       <td class="has-text-centered is-flex is-flex-direction-column is-align-items-center is-justify-content-center" style="vertical-align: middle;">
          <button class="button is-success m-1" onclick="aprobar('${comentarioEnPost[0]}', '${post.id}', '${comentarioEnPost[3]}')">Aprobar</button>
          <button class="button is-danger" onclick="eliminarComentario('${comentarioEnPost[0]}', '${post.id}', '${comentarioEnPost[3]}')">Eliminar</button>
        </td>
      `; //   la fecha por si hay mas comentarios con el id del usuario
        pendientesCount++; // <--- SUMAR CONTADOR!
      } else {
        // Aprobado → botón Reprobar
        const bodyTable = document.getElementById(`aprobadosBody-${post.id}`);
        const row = document.createElement("tr");
        bodyTable.appendChild(row);
        row.innerHTML = `
        <td style="white-space: normal; word-break: break-word;">
          Usuario ID: ${comentarioEnPost[0]} <br> Comentario: <br>
          ${comentarioEnPost[1]}
        </td>
        <td class="has-text-centered" style="vertical-align: middle;">
          <button class="button is-danger" onclick="reprobar('${comentarioEnPost[0]}', '${post.id}', '${comentarioEnPost[3]}')">Reprobar</button>
        </td>
      `;
        aprobadosCount++; // <--- SUMAR CONTADOR!
      }
    });

    // Si no hay pendientes, mostrar mensaje
    if (pendientesCount === 0) {
      const bodyTable = document.getElementById(`pendientesBody-${post.id}`);
      const row = document.createElement("tr");
      row.innerHTML = `
      <td colspan="2" class="has-text-centered has-text-grey">No hay nada para aprobar</td>
    `;
      bodyTable.appendChild(row);
    }

    // Si no hay aprobados, mostrar mensaje
    if (aprobadosCount === 0) {
      const bodyTable = document.getElementById(`aprobadosBody-${post.id}`);
      const row = document.createElement("tr");
      row.innerHTML = `
      <td colspan="2" class="has-text-centered has-text-grey">No hay comentarios aprobados</td>
    `;
      bodyTable.appendChild(row);
    }
  });
}
