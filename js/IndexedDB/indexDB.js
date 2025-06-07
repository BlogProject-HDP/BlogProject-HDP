// ----------------------------------------------------------------
// Abrir IndexedDB
export function crearIndexedDB() {
  let db;

  const request = indexedDB.open("dbBlog-Tech", 1);

  request.onupgradeneeded = (e) => {
    db = e.target.result;

    // ----------------------------------------------------------------
    // Tabla para los usuarios
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
    userStore.createIndex("comentarios", "comentarios", { multiEntry: true });
    userStore.createIndex("likes", "likes", { multiEntry: true });

    // ----------------------------------------------------------------
    // Tabla para los posts
    const postStore = db.createObjectStore("posts", {
      keyPath: "id",
      autoIncrement: true,
    });

    postStore.createIndex("nombre", "nombre", { unique: true });
    postStore.createIndex("imagen", "imagen", { unique: false });
    postStore.createIndex("contenido", "contenido", { unique: false });
    postStore.createIndex("fechaDePublicacion", "fechaDePublicacion", {
      unique: false,
    });
    postStore.createIndex("categorias", "categorias", { multiEntry: true });
    postStore.createIndex("comentarios", "comentarios", { multiEntry: true });
    postStore.createIndex("likes", "likes", { multiEntry: true });
  };

  // ----------------------------------------------------------------
  // Exito
  request.onsuccess = (e) => {
    db = e.target.result;

    // ----------------------------------------------------------------
    // Creamos el admin por defecto
    const admin = {
      usuario: "admin",
      tipo: "admin",
      email: "admin@gmail.com",
      password: "password",
    };

    const transaccion = db.transaction("users", "readwrite");
    const objeto = transaccion.objectStore("users");
    const add = objeto.add(admin);
    add.onsuccess = () => {
      console.log("Se creo admin e IndexedDB con exito");
    };
  };

  // ----------------------------------------------------------------
  // Error
  request.onerror = (e) => {
    console.error("Error al crear IndexDB", e.target.result);
  };
}

// ----------------------------------------------------------------
// Agregar usuario
export function addUser(usuario) {
  let db;

  const request = indexedDB.open("dbBlog-Tech", 1);

  request.onsuccess = (e) => {
    db = e.target.result;

    // Agregar usuario

    const transaccion = db.transaction("users", "readwrite");
    const objeto = transaccion.objectStore("users");
    const add = objeto.add(usuario);
    add.onsuccess = () => {
      console.log("Se agrego usuario con exito");
    };
  };
}
