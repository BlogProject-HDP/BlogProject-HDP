import {
  getBaneados,
  getNoBaneados,
  desbloquear,
  bannear,
} from "../../js/baneados/baneador.js";

// Tabs principales
document.querySelectorAll(".tabs ul li").forEach((tab) => {
  tab.addEventListener("click", function () {
    document
      .querySelectorAll(".tabs ul li")
      .forEach((t) => t.classList.remove("is-active"));
    this.classList.add("is-active");
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.add("is-hidden"));
    document
      .getElementById(this.getAttribute("data-tab"))
      .classList.remove("is-hidden");
  });
});
// Subtabs de comentarios
document.querySelectorAll(".tabs.is-toggle ul li").forEach((subtab) => {
  subtab.addEventListener("click", function () {
    document
      .querySelectorAll(".tabs.is-toggle ul li")
      .forEach((t) => t.classList.remove("is-active"));
    this.classList.add("is-active");
    document
      .querySelectorAll(".subtab-content")
      .forEach((c) => c.classList.add("is-hidden"));
    document
      .getElementById(this.getAttribute("data-subtab"))
      .classList.remove("is-hidden");
  });
});

//obtenemos aquí el id del admin
const adminId = localStorage.getItem("adminId");
if (adminId === "L") {
  // Si no hay adminId en localStorage, redirige o muestra error
  console.error("No estás logueado como admin.");
  window.location.href = "../autenticacion/auth.html";
} else {
  console.log("Admin logueado con ID:", adminId);
}

// ----------------------------------------------------------------
// Mostrar baneados y no baneados con opciones para
// desbloquear y bannear respectivamente y un input
// de busqueda
document.getElementById("ban").addEventListener("click", banner);
function banner() {
  buscar(); // Buscar usuario por id o nombre para bloquear o desbloquear
  mostrarBaneados(); // Baneados
  mostrarNoBaneados(); // NO Baneados
}

// ----------------------------------------------------------------
// Mostrar tabla de baneado
async function mostrarBaneados() {
  // Donde se muestran
  const divBan = document.getElementById("shadowban");

  // Titulo
  const titulo = document.createElement("h2");
  titulo.className = "subtitle";
  titulo.textContent = "Usuarios baneados";
  divBan.appendChild(titulo);

  // Table
  const table = document.createElement("table");
  table.className = "table is-fullwidth is-striped";
  divBan.appendChild(table);

  // Table head
  const tableHead = document.createElement("thead");
  table.appendChild(tableHead);

  const tr1 = document.createElement("tr");
  tr1.className = "has-background-primary has-text-white";
  tableHead.appendChild(tr1);

  const th1 = document.createElement("th");
  th1.textContent = "Usuario";
  tr1.appendChild(th1);

  const th2 = document.createElement("th");
  th2.className = "has-text-right";
  th2.textContent = "Desbloquear";
  tr1.appendChild(th2);

  // Table body
  const tableBody = document.createElement("tbody"); // CORREGIDO
  table.appendChild(tableBody);

  // Obtener usuarios baneados
  const baneados = await getBaneados();
  console.log(baneados);

  baneados.forEach((element) => {
    // Nueva fila
    const tr = document.createElement("tr");

    // Columna usuario
    const tdUsuario = document.createElement("td");
    tdUsuario.textContent = element;
    tr.appendChild(tdUsuario);

    // Columna botón
    const tdBoton = document.createElement("td");
    tdBoton.className = "has-text-right";

    // Boton
    const button = document.createElement("button");
    button.className = "button is-danger";
    button.textContent = "Desbloquear";
    button.onclick = () => desblo(element); // es un nombre de usuario

    tdBoton.appendChild(button);
    tr.appendChild(tdBoton);

    tableBody.appendChild(tr);
  });
}

async function desblo(nombre) {
  await desbloquear(nombre);
  limpiar();
  buscar();
  mostrarBaneados();
  mostrarNoBaneados();
}

function limpiar() {
  // Donde se muestran
  const divBan = document.getElementById("shadowban");
  divBan.innerHTML = "";
}

async function ban(nombre) {
  await bannear(nombre);
  limpiar();
  buscar();
  mostrarBaneados();
  mostrarNoBaneados();
}

// ----------------------------------------------------------------
// Mostrar tabla de NO baneado
async function mostrarNoBaneados() {
  // Donde se muestran
  const divBan = document.getElementById("shadowban");

  // Titulo
  const titulo = document.createElement("h2");
  titulo.className = "subtitle";
  titulo.textContent = "Usuarios NO baneados";
  divBan.appendChild(titulo);

  // Table
  const table = document.createElement("table");
  table.className = "table is-fullwidth is-striped";
  divBan.appendChild(table);

  // Table head
  const tableHead = document.createElement("thead");
  table.appendChild(tableHead);

  const tr1 = document.createElement("tr");
  tr1.className = "has-background-primary has-text-white";
  tableHead.appendChild(tr1);

  const th1 = document.createElement("th");
  th1.textContent = "Usuario";
  tr1.appendChild(th1);

  const th2 = document.createElement("th");
  th2.className = "has-text-right"; // alinear texto a la derecha
  th2.textContent = "Bloquear";
  tr1.appendChild(th2);

  // Table body (corregido aquí)
  const tableBody = document.createElement("tbody");
  table.appendChild(tableBody);

  // Obtener usuarios NO baneados
  const noBaneados = await getNoBaneados();
  console.log(noBaneados);

  noBaneados.forEach((element) => {
    // Nueva fila
    const tr = document.createElement("tr");

    const tdUsuario = document.createElement("td");
    tdUsuario.textContent = element;
    tr.appendChild(tdUsuario);

    const tdBoton = document.createElement("td");
    tdBoton.className = "has-text-right"; // alinear botón a la derecha

    // Boton
    const button = document.createElement("button");
    button.className = "button is-danger";
    button.textContent = "Bloquear";
    button.onclick = () => ban(element); // es un nombre de usuario

    tdBoton.appendChild(button);
    tr.appendChild(tdBoton);

    tableBody.appendChild(tr);
  });
}
