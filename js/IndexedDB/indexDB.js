// ----------------------------------------------------------------
// Abrir IndexedDB
export async function crearIndexedDB() {
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

  // Contraseña para el admin por defecto
  const hash = await hashPassword("password");

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
      password: hash,
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

// --------------------------------------------------------------
// Hash de contraseña para no guardarla en texto plano
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// ----------------------------------------------------------------
// Agregar usuario (usuario es un objeto javascript)
export function addUser(usuario) {
  const request = indexedDB.open("dbBlog-Tech", 1);

  request.onsuccess = (e) => {
    const db = e.target.result;

    // Agregar usuario
    const transaccion = db.transaction("users", "readwrite");
    const objeto = transaccion.objectStore("users");
    const add = objeto.add(usuario);
    add.onsuccess = () => {
      console.log("Se agrego usuario con exito");
    };
  };
}

// ----------------------------------------------------------------
// Bucar usuario por user: Devuelve el usuario si existe o null
export function buscarUser(user) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readonly");
      const objeto = transaccion.objectStore("users");

      const index = objeto.index("usuario");
      const getRequest = index.get(user);

      getRequest.onsuccess = () => {
        const resultado = getRequest.result;
        if (resultado) {
          resolve(resultado);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        console.log("Error al buscar el usuario");
        reject("Error al buscar el usuario");
      };
    };

    request.onerror = () => {
      console.log("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}

// ----------------------------------------------------------------
// Bucar usuario por email: Devuelve el usuario si existe o null
export function buscarEmail(email) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readonly");
      const objeto = transaccion.objectStore("users");

      const index = objeto.index("email");
      const getRequest = index.get(email);

      getRequest.onsuccess = () => {
        const resultado = getRequest.result;
        if (resultado) {
          resolve(resultado);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        console.log("Error al buscar el email");
        reject("Error al buscar el email");
      };
    };

    request.onerror = () => {
      console.log("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}
