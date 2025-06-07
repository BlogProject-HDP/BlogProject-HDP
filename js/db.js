let db;

const dbName = "dbBlog-Tech"; // 

const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;

  // USERS
  const userStore = db.createObjectStore("users", {
    keyPath: "id",
    autoIncrement: true,
  });
  userStore.createIndex("usuario", "usuario", { unique: true });
  userStore.createIndex("tipo", "tipo", { unique: false });
  userStore.createIndex("email", "email", { unique: true });
  userStore.createIndex("password", "password", { unique: false });
  userStore.createIndex("banned", "banned", { unique: false });
  userStore.createIndex("nombre", "nombre", { unique: false });
  userStore.createIndex("ciudad", "ciudad", { unique: false });
  userStore.createIndex("telefono", "telefono", { unique: true });
  userStore.createIndex("edad", "edad", { unique: false });
  userStore.createIndex("comentarios","comentarios",{ multiEntry: true }); //ojo aquí al multientry
  userStore.createIndex("likes", "likes", { unique: false });

  // POSTS
  const postStore = db.createObjectStore("posts", {
    keyPath: "id",
    autoIncrement: true,
  });
  postStore.createIndex("nombre", "nombre", { unique: false });
  postStore.createIndex("imagen", "imagen", { unique: false });
  postStore.createIndex("contenido", "contenido", { unique: false });
  postStore.createIndex("fechaDePublicacion", "fechaDePublicacion", { unique: false });
  postStore.createIndex("categorias", "categorias", { multiEntry: true });
  postStore.createIndex("comentarios", {keyPath: "idComentarios",
    autoIncrement:true
  }, {multiEntry: true});
  postStore.createIndex("likes", "likes", { multiEntry: true }, {unique: false});

  console.log("Base de datos actualizada");
};

request.onsuccess = (e) => {
  db = e.target.result;
  console.log("Base de datos abierta con éxito.");
};

request.onerror = (e) => {
  console.error("Error al abrir la base de datos:", e.target.errorCode);
};

const form = document.getElementById("formComentario");
const comentariosDiv = document.getElementById("comentarios"); //unicamente para comprobación o para ver en el html

//Formulario de envar comentarios
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const texto = document.getElementById("textoComentario").value;
  if (texto && usuarioActualId) {
    agregarComentarioUsuario(usuarioActualId, texto, postId); //ojo que aquí se tiene que obtener el post id para agregarlo
    form.reset();                                             //falta que el front mande el id del post
  }
});

//Agrega un comentario al array de comentarios del usuario
function agregarComentarioUsuario(userId, texto, postId) {
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");
  const request = store.get(userId);

  request.onsuccess = function () {
    const user = request.result;
    if (!user.comentarios) user.comentarios = []; //verifica que el usuario tenga el array de comentarios
    user.comentarios.push({
      texto,
      fecha: new Date().toISOString(),
      estado: "pendiente",
      postId,
      userId
    });
    store.put(user);
    console.log(texto)
  };
  tx.oncomplete = function () {
    mostrarComentariosUsuario(userId);
  };
}

function mostrarComentariosUsuario(userId) {
  const tx = db.transaction("users", "readonly");
  const store = tx.objectStore("users");
  const request = store.get(userId);

  request.onsuccess = function () {
    const user = request.result;
    comentariosDiv.innerHTML = "";
    if (user && user.comentarios) {
      user.comentarios.forEach((comentario) => {
        const p = document.createElement("p");
        p.textContent = comentario.texto + " (" + comentario.estado + ")";
        comentariosDiv.appendChild(p);
      });
    }
  };
}

//Función pendiente para moderar comentarios
function moderarComentario(userId, fecha, nuevoEstado) {
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");
  const request = store.get(userId);

  request.onsuccess = function () {
    const user = request.result;
    if (user && user.comentarios) {
      const comentario = user.comentarios.find(c => c.fecha === fecha);
      if (comentario) {
        comentario.estado = nuevoEstado; // "aprobado" o "rechazado"
        store.put(user);
      }
    }
  };
  request.onerror = function () {
    console.error("No se pudo moderar el comentario.");
  };
  tx.oncomplete = function () {
    console.log("Comentario moderado:", nuevoEstado);
  };
}

function obtenerComentariosPendientesPorPost(postId, callback) {
  const tx = db.transaction("users", "readonly");
  const store = tx.objectStore("users");
  const request = store.openCursor();
  let comentariosPendientes = [];

  request.onsuccess = function (e) {
    const cursor = e.target.result;
    if (cursor) {
      const user = cursor.value;
      if (user.comentarios) {
        user.comentarios.forEach(comentario => {
          if (comentario.postId === postId && comentario.estado === "pendiente") {
            comentariosPendientes.push({
              comentario,
              usuario: user.usuario,
              userId: user.id
            });
          }
        });
      }
      cursor.continue();
    } else {
      callback(comentariosPendientes);
    }
  };
}
