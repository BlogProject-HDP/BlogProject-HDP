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
      banned: false, // NO BANEADO
    };
    const admin2 = {
      usuario: "admin2",
      tipo: "admin",
      email: "admin2@gmail.com",
      password: hash,
      banned: true, // BANEADO
    };

    const admin3 = {
      usuario: "admin3",
      tipo: "admin",
      email: "admin3@gmail.com",
      password: hash,
      banned: false, // NO BANEADO
    };

    const transaccion = db.transaction("users", "readwrite");
    const objeto = transaccion.objectStore("users");
    const add = objeto.add(admin);
    add.onsuccess = () => {
      console.log("Se creo admin e IndexedDB con exito");
    };

    const transaccion2 = db.transaction("users", "readwrite");
    const objeto2 = transaccion2.objectStore("users");
    const add2 = objeto2.add(admin2);
    add2.onsuccess = () => {
      console.log("Se creo admin 2 e IndexedDB con exito");
    };

    const transaccion3 = db.transaction("users", "readwrite");
    const objeto3 = transaccion3.objectStore("users");
    const add3 = objeto3.add(admin3);
    add3.onsuccess = () => {
      console.log("Se creo admin 3 e IndexedDB con exito");
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
// Put usuario: actualiza el usuario (usuario es un objeto javascript)
export function putUser(usuario) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readwrite");
      const objeto = transaccion.objectStore("users");
      const add = objeto.put(usuario);

      add.onsuccess = () => {
        console.log("Se actualizó el usuario con éxito");
        db.close();
        resolve();
      };

      add.onerror = () => {
        console.error("Error al actualizar el usuario");
        db.close();
        reject("Error al actualizar el usuario");
      };
    };

    request.onerror = () => {
      console.error("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
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

// ----------------------------------------------------------------
// Bucar usuario por id: Devuelve el usuario si existe o null
export function buscarId(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readonly");
      const objeto = transaccion.objectStore("users");
      const getRequest = objeto.get(id);

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
// Obtener todos los usuarios
export function obtenerTodosLosUsers() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readonly");
      const objeto = transaccion.objectStore("users");
      const getAllRequest = objeto.getAll();

      getAllRequest.onsuccess = () => {
        const resultados = getAllRequest.result;
        db.close();
        resolve(resultados); // Esto será un array con todos los usuarios
      };

      getAllRequest.onerror = () => {
        db.close();
        console.log("Error al obtener todos los usuarios");
        reject("Error al obtener todos los usuarios");
      };
    };

    request.onerror = () => {
      console.log("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}
