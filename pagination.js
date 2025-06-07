// LA INDEXDB ES TEMPORAL HASTA QUE SE TERMINE LA INDEXDB CREADA POR DAVID
let bd, pagina = 1, total = 0;
const LIMITE = 10;

function iniciar() {
  let solicitud = indexedDB.open("BlogV4", 1);
  solicitud.onupgradeneeded = e => {
    let db = e.target.result;
    let tabla = db.createObjectStore("posts", { keyPath: "id", autoIncrement: true });
    tabla.createIndex("categoria", "categoria");
    for (let i = 1; i <= 500; i++) {
    tabla.add({ titulo: "Post " + i, categoria: "Tech", contenido: "Contenido del post " + i });
    }
  };
  solicitud.onsuccess = e => {
    bd = e.target.result;
    bd.transaction("posts", "readonly").objectStore("posts").index("categoria").count("Tech").onsuccess = c => {
      total = c.target.result;
      cargarPosts();
    };
  };
}


function cargarPosts() {
  let lista = [], desde = (pagina - 1) * LIMITE, i = 0;
  let cursor = bd.transaction("posts", "readonly").objectStore("posts").index("categoria").openCursor(IDBKeyRange.only("Tech"));

  cursor.onsuccess = e => {
    let actual = e.target.result;
    if (!actual || lista.length >= LIMITE) return mostrarPosts(lista);
    if (i++ >= desde) lista.push(actual.value);
    actual.continue();
  };
}

function mostrarPosts(posts) {
  let div = document.getElementById("posts");
  div.innerHTML = "";

  let fila = document.createElement("div");
  fila.style.display = "flex";
  fila.style.gap = "20px";

  let col1 = document.createElement("div"), col2 = document.createElement("div");
  col1.style.flex = col2.style.flex = "1";

  posts.forEach((p, i) => {
    let e = document.createElement("div");
    e.className = "post";
    e.innerHTML = `<h3>${p.titulo}</h3><p>${p.contenido}</p>`;
    (i < 5 ? col1 : col2).appendChild(e);
  });

  fila.appendChild(col1);
  fila.appendChild(col2);
  div.appendChild(fila);

  let pag = document.getElementById("pagination");
  pag.innerHTML = "";

  let totalPaginas = Math.ceil(total / LIMITE);
  if (totalPaginas === 0) return; 

  function crearBoton(text, page, activo = false, deshabilitado = false) {
    let b = document.createElement("button");
    b.textContent = text;
    if (activo) b.classList.add("active");
    if (deshabilitado) b.disabled = true;
    if (!deshabilitado && page !== null) {
      b.onclick = () => {
        pagina = page;
        cargarPosts();
      };
    }
    return b;
  }

  pag.appendChild(crearBoton("<", pagina - 1, false, pagina === 1));

  pag.appendChild(crearBoton("1", 1, pagina === 1));

  if (pagina - 2 > 2) {
    let dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "0 8px";
    pag.appendChild(dots);
  }

  for (let i = pagina - 1; i <= pagina + 1; i++) {
    if (i > 1 && i < totalPaginas) {
      pag.appendChild(crearBoton(i.toString(), i, i === pagina));
    }
  }

  if (pagina + 2 < totalPaginas - 1) {
    let dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "0 8px";
    pag.appendChild(dots);
  }

  if (totalPaginas > 1) {
    pag.appendChild(crearBoton(totalPaginas.toString(), totalPaginas, pagina === totalPaginas));
  }

  pag.appendChild(crearBoton(">", pagina + 1, false, pagina === totalPaginas));
}


iniciar();
