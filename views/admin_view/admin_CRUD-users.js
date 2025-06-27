import {
  obtenerTodosLosUsers,
  addUser,
  hashPassword,
  buscarEmail,
  buscarId,
  buscarUser,
  putUser,
  deleteUser,
  cargarPosts,
} from "../../js/IndexedDB/indexDB.js";

const almacenadorDeUsuarios = document.createElement("div");

let curreneditUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tabs ul li");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));

      // Agregar la clase "is-active" a la pestaña seleccionada
      tab.classList.add("is-active");

      // Ocultar todo el contenido de las pestañas
      tabContents.forEach((content) => content.classList.add("is-hidden"));

      // Mostrar el contenido de la pestaña seleccionada
      const tabId = tab.getAttribute("data-tab");
      const activeContent = document.getElementById(tabId);
      if (activeContent) {
        activeContent.classList.remove("is-hidden");
      }
    });
  });
  //Inicializador de la funcionalidad de los usersa
  cargarAllUsers();
  agregarUser();
});

//A ESTA FUNCIÓN LE PODES AGREGAR YA SEA DESDE LAS CLASE DE BULMA
//O TAMBIÉN COMO QUERRAS PERO AQUÍ EDITADLO SI TE SALE MEJOR
const adminId = localStorage.getItem("adminId");
const adminRol = localStorage.getItem("adminRol");
if (adminId === "L" || adminRol != "admin") {
  // Si no hay adminId en localStorage, redirige o muestra error
  console.error("No estás logueado como admin, por favor iniciar sesión.");
  window.location.href = "../autenticacion/auth.html";
} else {
  console.log("Admin logueado con ID:", adminId);
}

async function cargarAllUsers() {
  const listaUsuarios = document.getElementById("mostrar-users");

  try {
    const users = await obtenerTodosLosUsers();

    if (!users || users.length === 0) {
      listaUsuarios.innerHTML =
        '<p class="has-text-warning">No hay usuarios registrados por el momento.</p>';
      return;
    }

    let htmlUsers = `
          <table class="table is-fullwidth is-striped is-hoverable is-narrow">
            <thead>
              <tr>
                <th>ID</th>
                <th>Foto</th>
                <th>Nombre</th>
                <th>User (Nickname)</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th>Edad</th>
                <th>Baneado</th>
                <th class="has-text-centered">Acciones</th>
              </tr>
            </thead>
            <tbody>
        `;

    users.forEach((user) => {
      const fotoPerfilHTML = user.fotoPerfil
        ? `<img src="${user.fotoPerfil}" alt="Foto de ${
            user.usuario || "usuario"
          }" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`
        : '<span class="tag is-light">Sin foto</span>';

      const estadoBaneadoHTML = user.banned
        ? '<span class="tag is-danger">Sí</span>'
        : '<span class="tag is-success">No</span>';

      htmlUsers += `
            <tr>
              <td>${user.id}</td>
              <td>${fotoPerfilHTML}</td>
              <td>${user.nombre || "N/A"}</td>
              <td>${user.usuario || "N/A"}</td>
              <td>${user.email || "N/A"}</td>
              <td><span class="tag ${
                user.tipo === "admin" ? "is-info" : "is-light"
              }">${user.tipo || "N/A"}</span></td>
              <td>${user.ciudad || "N/A"}</td>
              <td>${user.telefono || "N/A"}</td>
              <td>${user.edad || "N/A"}</td>
              <td>${estadoBaneadoHTML}</td>
              <td class="has-text-centered">
                <div class="buttons are-small is-centered">
                  <button class="button is-warning" onclick="editarUsuario(${
                    user.id
                  })">
                    <span class="icon"><i class="fas fa-edit"></i></span>
                    <span>Editar</span>
                  </button>
                  <button class="button is-danger" onclick="eliminarUser(${
                    user.id
                  })">
                    <span class="icon"><i class="fas fa-trash-alt"></i></span>
                    <span>Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>`;
    });

    htmlUsers += "</tbody></table>";
    listaUsuarios.innerHTML = htmlUsers;
  } catch (error) {
    listaUsuarios.innerHTML =
      '<p class="has-text-danger">Error al cargar los usuarios. Por favor, intente de nuevo más tarde.</p>';
    console.error("Error en cargarAllUsers:", error);
  }
}
window.eliminarUser = eliminarUser;
window.editarUsuario = editarUsuario;

async function agregarUser() {
  const formCrear = document.getElementById("form-crear-user");
  if (formCrear) {
    formCrear.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Obtener valores de los campos
      const nombre = document.getElementById("user-nombre").value.trim();
      const usuario = document.getElementById("user-user").value.trim();
      const tipoUsuario = document.getElementById("user-tipo").value;
      const email = document.getElementById("user-email").value.trim();
      const passwordValue = document.getElementById("user-password").value;
      const ciudad = document.getElementById("user-ciudad").value.trim();
      const telefono = document.getElementById("user-telefono").value.trim();
      const edadInput = document.getElementById("user-edad").value;
      const descripcion = document
        .getElementById("user-descripcion")
        .value.trim();
      const fotoPerfilInputFile = document.getElementById("user-fotoPerfil");
      const banned = document.getElementById("user-banned").value === "true";

      //  VALIDACIONES
      if (!nombre || !usuario || !tipoUsuario || !email) {
        alert(
          "Los campos Nombre, User (Nickname), Rol y Email son obligatorios."
        );
        return;
      }
      if (!curreneditUser && !passwordValue) {
        alert("La contraseña es obligatoria al crear un nuevo usuario.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Por favor, ingrese un formato de correo electrónico válido.");
        return;
      }
      if (!curreneditUser) {
        try {
          const existeUsuario = await buscarUser(usuario);
          if (existeUsuario) {
            alert(
              "El nombre de usuario (User/Nickname) ya está en uso. Por favor, elige otro."
            );
            return;
          }
          const existeEmail = await buscarEmail(email);
          if (existeEmail) {
            alert(
              "El correo electrónico ya está registrado. Por favor, usa otro."
            );
            return;
          }
        } catch (error) {
          console.error("Error al verificar duplicados:", error);
          alert(
            "Error al verificar si el usuario o email ya existen. Inténtalo de nuevo."
          );
          return;
        }
      }

      // Manejo de la foto de pefil, aquí asicamente se está manejadno agregar/editar la foto de perfil
      let fotoPerfilBase64 = null;
      if (fotoPerfilInputFile.files && fotoPerfilInputFile.files.length > 0) {
        try {
          fotoPerfilBase64 = await convertirImagenABase64(
            fotoPerfilInputFile.files[0]
          );
        } catch (error) {
          console.error("Error al convertir imagen:", error);
          alert("Hubo un error al procesar la imagen de perfil.");
          return;
        }
      } else if (curreneditUser) {
        // Si estamos editando y no se subió nueva foto
        const usuarioExistente = await buscarId(curreneditUser);
        if (usuarioExistente) fotoPerfilBase64 = usuarioExistente.fotoPerfil;
      }

      let hashedPassword = null;
      if (passwordValue) {
        hashedPassword = await hashPassword(passwordValue);
      }

      // Crear el objeto que ocupamos para la indexDB
      const userData = {
        nombre,
        usuario,
        tipo: tipoUsuario,
        email,
        ciudad: ciudad || null,
        telefono: telefono || null,
        edad: edadInput ? parseInt(edadInput, 10) : null,
        descripcion: descripcion || null,
        fotoPerfil: fotoPerfilBase64,
        banned,
        // Inicializar solo si es nuevo usuario, en caso de que no, lo dejamos como está
        comentarios: curreneditUser ? undefined : [],
        likes: curreneditUser ? undefined : [],
      };

      if (hashedPassword) {
        userData.password = hashedPassword;
      }

      // INDEXDB
      try {
        if (curreneditUser) {
          userData.id = curreneditUser;
          // Si no se proveyó nueva contraseña, no enviar 'password' para no sobreescribir con null
          if (!hashedPassword) {
            delete userData.password; // No actualizar contraseña si no se proveyó una nueva
          }
          await putUser(userData); //Acá lo modificamos completamente
          //EN caso de que por ejemplo el admin se actualice a usuario (ERROR DE CAPA 8), se le sale de la vista del panel de admin
          if (
            userData.id == localStorage.getItem("adminId") &&
            userData.tipo !== "admin"
          ) {
            // Limpiar datos de admin y redirigir
            localStorage.setItem("adminId", "L");
            localStorage.setItem("adminRol", "LL");
            alert("Tu rol ha cambiado. Saliendo del panel de administración.");
            window.location.href = "../autenticacion/auth.html";
            return; // Detener ejecución
          }
          alert(`Usuario "${userData.nombre}" actualizado con éxito.`);
          curreneditUser = null;
          document.querySelector(
            "#form-crear-user button[type='submit']"
          ).textContent = "Crear Usuario";
          document.getElementById("user-password").placeholder =
            "Ingrese la contraseña...";
        } else {
          // --- LÓGICA DE CREACIÓN ---
          if (!userData.password) {
            // Contraseña es obligatoria al crear
            alert(
              "Error interno: La contraseña no fue hasheada para el nuevo usuario."
            );
            return;
          }
          await addUser(userData);
          alert(`Usuario "${userData.nombre}" creado con éxito.`);
        }

        formCrear.reset();
        cargarAllUsers();
      } catch (error) {
        console.error("Error al guardar el usuario:", error);
        alert(
          `Error al guardar el usuario: ${
            error.message || "Error desconocido."
          }`
        );
      }
    });
  }
}

async function eliminarUser(idUser) {
  if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
    try {
      await deleteUser(idUser);
      alert("Usuario eliminado");
      // SE PUEDE AGREGAR:
      // Eliminar comentarios del usuario
      // si el usuario esta eliminado
      cargarAllUsers();
    } catch (error) {
      alert("Error al eliminar el post");
      console.error(error);
    }
  }
}
async function editarUsuario(idUser) {
  console.log(`Intentando editar usuario con ID: ${idUser}`);
  curreneditUser = idUser; // Establecer el ID del usuario que se está editando

  try {
    const user = await buscarId(idUser);

    if (user) {
      // Rellenar el formulario con los datos del usuario
      document.getElementById("user-nombre").value = user.nombre || "";
      document.getElementById("user-user").value = user.usuario || "";
      document.getElementById("user-tipo").value = user.tipo || "user"; // 'user' como valor por defecto
      document.getElementById("user-email").value = user.email || "";

      // No rellenar la contraseña por seguridad, solo permitir cambiarla
      const passwordInput = document.getElementById("user-password");
      passwordInput.value = "";
      passwordInput.placeholder = "Dejar en blanco para no cambiar";

      document.getElementById("user-ciudad").value = user.ciudad || "";
      document.getElementById("user-telefono").value = user.telefono || "";
      document.getElementById("user-edad").value = user.edad || "";
      document.getElementById("user-descripcion").value =
        user.descripcion || "";
      document.getElementById("user-banned").value = user.banned
        ? "true"
        : "false";

      document.getElementById("user-fotoPerfil").value = ""; // Limpiar el input de archivo

      // Cambiar el texto del botón del formulario
      const submitButton = document.querySelector(
        "#form-crear-user button[type='submit']"
      );
      if (submitButton) {
        submitButton.textContent = "Actualizar Usuario";
      }

      const formElement = document.getElementById("form-crear-user");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      alert("Usuario no encontrado para editar.");
      curreneditUser = null; // Resetear si no se encuentra el usuario
      const submitButton = document.querySelector(
        "#form-crear-user button[type='submit']"
      );
      if (submitButton) {
        submitButton.textContent = "Crear Usuario";
      }
    }
  } catch (error) {
    console.error("Error al cargar datos del usuario para editar:", error);
    alert(
      "Error al cargar datos del usuario para editar. Por favor, intente de nuevo."
    );
    curreneditUser = null; // Resetear en caso de error
    const submitButton = document.querySelector(
      "#form-crear-user button[type='submit']"
    );
    if (submitButton) {
      submitButton.textContent = "Crear Usuario";
    }
  }
}
function convertirImagenABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject("ERROR: ", e);
  });
}
