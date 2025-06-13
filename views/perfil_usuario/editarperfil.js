import { buscarId, hashPassword, putUser } from "../../js/IndexedDB/indexDB.js";
import { logout, startAutoLogout} from "../../js/autenticacion/logout.js";

document.getElementById("logoutBtn").addEventListener("click", logout); //Función de logout
// Funcón para imagen a Base64 reciclado del CRUD de los post
function convertirImagenABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Elementos de la vista principal del perfil
  const profileImageDisplay = document.querySelector(
    ".profile-box figure.image img"
  );
  const nameDisplay = document.getElementById("name");
  const userDisplay = document.getElementById("user");
  const bioDisplay = document.querySelector("#bio span");
  const birthdayDisplay = document.querySelector("#birthday span");

  // --- Elementos del formulario "modal-info" (Información Personal) ---
  const formEditarInfo = document.getElementById("form-editar-info-perfil");
  const modalInfoNombreInput = document.getElementById("modal-info-nombre");
  const modalInfoBioInput = document.getElementById("modal-info-bio");
  const modalInfoBirthdayInput = document.getElementById(
    "modal-info-birthday-input"
  );
  const modalInfoCiudadInput = document.getElementById("modal-info-ciudad");
  const modalInfoTelefonoInput = document.getElementById("modal-info-telefono");
  const modalInfoImagenInput = document.getElementById("modal-info-imagen");

  // --- Elementos del formulario "modal-user" (Usuario, Email, Contraseña) ---
  const formEditarUser = document.getElementById("form-editar-user-perfil");
  const modalUserUsuarioInput = document.getElementById("modal-user-usuario");
  const modalUserEmailInput = document.getElementById("modal-user-email");
  const modalUserPasswordInput = document.getElementById("modal-user-password");
  const modalUserPasswordConfirmInput = document.getElementById(
    "modal-user-password-confirm"
  );

  const userIdFromStorage = localStorage.getItem("userId");

  if (!userIdFromStorage || userIdFromStorage === "L") {
    console.error("Redireccionando: No estás logueado como usuario válido.");
    window.location.href = "../autenticacion/auth.html";
    return; 
  }

  let currentUserData = null;

  try {
    const numericUserId = parseInt(userIdFromStorage, 10);
    if (isNaN(numericUserId)) {
      console.error("ID de usuario en localStorage no es un número válido.");
      localStorage.removeItem("userId");
      if (nameDisplay) nameDisplay.textContent = "ID de usuario inválido";
      if (userDisplay) userDisplay.textContent = "";
      if (profileImageDisplay) profileImageDisplay.src = "../../resources/noregistrado.png";
      if (formEditarInfo) formEditarInfo.style.display = "none";
      if (formEditarUser) formEditarUser.style.display = "none";
      return;
    }

    currentUserData = await buscarId(numericUserId);

    if (currentUserData) {
      // Poblar la vista principal del perfil
      if (profileImageDisplay) {
        profileImageDisplay.src =
          currentUserData.fotoPerfil || "../../resources/noregistrado.png";
        profileImageDisplay.alt = `Foto de perfil de ${
          currentUserData.nombre || "usuario"
        }`;
      }
      if (nameDisplay)
        nameDisplay.textContent =
          currentUserData.nombre || "Nombre no disponible";
      if (userDisplay)
        userDisplay.textContent = currentUserData.usuario
          ? `@${currentUserData.usuario}`
          : "Usuario no disponible";
      if (bioDisplay)
        bioDisplay.textContent =
          currentUserData.descripcion || "Bio no disponible";
      if (birthdayDisplay) {
        birthdayDisplay.textContent = currentUserData.edad
          ? `${currentUserData.edad} años`
          : "Edad no disponible";
      }

      // Poblar campos del formulario "modal-info"
      if (modalInfoNombreInput)
        modalInfoNombreInput.value = currentUserData.nombre || "";
      if (modalInfoBioInput)
        modalInfoBioInput.value = currentUserData.descripcion || "";
      if (modalInfoBirthdayInput && currentUserData.edad !== undefined) {
        modalInfoBirthdayInput.value = currentUserData.edad;
      }
      if (modalInfoCiudadInput)
        modalInfoCiudadInput.value = currentUserData.ciudad || "";
      if (modalInfoTelefonoInput)
        modalInfoTelefonoInput.value = currentUserData.telefono || "";
      
      // Poblar campos del formulario "modal-user"
      if (modalUserUsuarioInput)
        modalUserUsuarioInput.value = currentUserData.usuario || "";
      if (modalUserEmailInput)
        modalUserEmailInput.value = currentUserData.email || "";
      // Los campos de contraseña (modalUserPasswordInput, modalUserPasswordConfirmInput) se dejan vacíos intencionalmente

    } else {
      console.error(`Usuario con ID ${numericUserId} no encontrado.`);
      localStorage.removeItem("userId");
      if (nameDisplay) nameDisplay.textContent = "Usuario no encontrado";
      if (userDisplay) userDisplay.textContent = "";
      if (profileImageDisplay) profileImageDisplay.src = "../../resources/noregistrado.png";
      if (formEditarInfo) formEditarInfo.style.display = "none";
      if (formEditarUser) formEditarUser.style.display = "none";
    }
  } catch (error) {
    console.error("Error al cargar datos del perfil:", error);
    if (nameDisplay) nameDisplay.textContent = "Error al cargar perfil";
    if (userDisplay) userDisplay.textContent = "";
    if (profileImageDisplay) profileImageDisplay.src = "../../resources/noregistrado.png";
    if (formEditarInfo) formEditarInfo.style.display = "none";
    if (formEditarUser) formEditarUser.style.display = "none";
  }

  // --- Event Listener para el formulario de Información Personal (modal-info) ---
  if (formEditarInfo) {
    formEditarInfo.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentUserData) {
        alert("Error: No hay datos de usuario para actualizar. Intenta recargar la página.");
        return;
      }

      const nombreActualizado = modalInfoNombreInput
        ? modalInfoNombreInput.value.trim()
        : currentUserData.nombre;
      const bioActualizada = modalInfoBioInput
        ? modalInfoBioInput.value.trim()
        : currentUserData.descripcion;
      const edadActualizada = modalInfoBirthdayInput
        ? parseInt(modalInfoBirthdayInput.value, 10)
        : currentUserData.edad;
      const ciudadActualizada = modalInfoCiudadInput
        ? modalInfoCiudadInput.value.trim()
        : currentUserData.ciudad;
      const telefonoActualizado = modalInfoTelefonoInput
        ? modalInfoTelefonoInput.value.trim()
        : currentUserData.telefono;

      if (!nombreActualizado) {
        alert("El nombre no puede estar vacío.");
        return;
      }

      const usuarioParaActualizar = {
        ...currentUserData, // Comienza con los datos existentes (incluyendo id, usuario, email, password, tipo, etc.)
        nombre: nombreActualizado,
        descripcion: bioActualizada,
        edad: isNaN(edadActualizada) ? currentUserData.edad : edadActualizada,
        ciudad: ciudadActualizada,
        telefono: telefonoActualizado,
        // fotoPerfil se manejará a continuación
      };

      // Lógica para la imagen de perfil (solo en modal-info)
      if (modalInfoImagenInput && modalInfoImagenInput.files && modalInfoImagenInput.files[0]) {
        const file = modalInfoImagenInput.files[0];
        try {
          const fotoPerfilBase64 = await convertirImagenABase64(file);
          usuarioParaActualizar.fotoPerfil = fotoPerfilBase64;
        } catch (error) {
          console.error("Error al procesar la imagen:", error);
          alert("Hubo un error al procesar la imagen. Inténtalo de nuevo.");
          return;
        }
      } else {
        // Si no se selecciona una nueva imagen, mantener la existente.
        usuarioParaActualizar.fotoPerfil = currentUserData.fotoPerfil;
      }

      try {
        await putUser(usuarioParaActualizar);
        alert("Información personal actualizada con éxito.");

        // Actualizar la información mostrada en la página (relacionada con modal-info)
        if (nameDisplay) nameDisplay.textContent = usuarioParaActualizar.nombre;
        if (bioDisplay) bioDisplay.textContent = usuarioParaActualizar.descripcion;
        if (birthdayDisplay) {
          birthdayDisplay.textContent = usuarioParaActualizar.edad
            ? `${usuarioParaActualizar.edad} años`
            : "Edad no disponible";
        }
        if (profileImageDisplay && usuarioParaActualizar.fotoPerfil) {
          profileImageDisplay.src = usuarioParaActualizar.fotoPerfil;
        }
        
        currentUserData = { ...usuarioParaActualizar }; // Actualizar datos locales
        if (modalInfoImagenInput) modalInfoImagenInput.value = ""; // Limpiar input de imagen
        // Considera cerrar el modal aquí si es necesario
        // document.getElementById('modal-info').classList.remove('is-active'); 
      } catch (error) {
        console.error("Error al actualizar la información personal en IndexedDB:", error);
        let errorMessage = "Hubo un error al actualizar tu información. Inténtalo de nuevo.";
        if (error && error.name === "ConstraintError") {
          if (error.message.toLowerCase().includes("telefono")) {
            errorMessage = "Error: El número de teléfono ya está en uso por otro usuario.";
          }
          // Otras ConstraintErrors (email, usuario) se manejan en el otro formulario
        }
        alert(errorMessage);
      }
    });
  }

  // --- Event Listener para el formulario de Usuario/Email/Contraseña (modal-user) ---
  if (formEditarUser) {
    formEditarUser.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentUserData) {
        alert("Error: No hay datos de usuario para actualizar. Intenta recargar la página.");
        return;
      }

      const usuarioActualizado = modalUserUsuarioInput
        ? modalUserUsuarioInput.value.trim()
        : currentUserData.usuario;
      const emailActualizado = modalUserEmailInput
        ? modalUserEmailInput.value.trim()
        : currentUserData.email;

      if (!usuarioActualizado) {
        alert("El nombre de usuario no puede estar vacío.");
        return;
      }
      if (!emailActualizado) {
        // Aquí podrías añadir una validación de formato de email si lo deseas
        alert("El email no puede estar vacío.");
        return;
      }
      
      const usuarioParaActualizar = {
        ...currentUserData, // Comienza con los datos existentes (incluyendo id, nombre, bio, etc.)
        usuario: usuarioActualizado,
        email: emailActualizado,
      };

      // Lógica para la contraseña (solo en modal-user)
      const passwordIngresada = modalUserPasswordInput ? modalUserPasswordInput.value : "";
      const passwordConfirmada = modalUserPasswordConfirmInput ? modalUserPasswordConfirmInput.value : "";

      if (passwordIngresada || passwordConfirmada) { // Solo si se intenta cambiar la contraseña
        if (passwordIngresada !== passwordConfirmada) {
          alert("Las contraseñas no coinciden.");
          return;
        }
        if (passwordIngresada.length > 0) { // Solo hashear y actualizar si se ingresó una nueva contraseña
          try {
            usuarioParaActualizar.password = await hashPassword(passwordIngresada);
          } catch (hashError) {
            console.error("Error al hacer hash de la contraseña:", hashError);
            alert("Error al procesar la contraseña. Inténtalo de nuevo.");
            return;
          }
        }
        // Si ambos campos de contraseña están vacíos, no se modifica la contraseña existente.
      }


      try {
        await putUser(usuarioParaActualizar);
        alert("Datos de usuario actualizados con éxito.");

        // Actualizar la información mostrada en la página (relacionada con modal-user)
        if (userDisplay) userDisplay.textContent = `@${usuarioParaActualizar.usuario}`;
        
        currentUserData = { ...usuarioParaActualizar }; // Actualizar datos locales

        // Limpiar campos de contraseña del modal user
        if(modalUserPasswordInput) modalUserPasswordInput.value = "";
        if(modalUserPasswordConfirmInput) modalUserPasswordConfirmInput.value = "";
      } catch (error) {
        console.error("Error al actualizar los datos de usuario en IndexedDB:", error);

        //Aquí validamos que no hayan errores y que no esté el correo ni el user usandose
        let errorMessage = "Hubo un error al actualizar tus datos. Inténtalo de nuevo.";
        if (error && error.name === "ConstraintError") {
          if (error.message.toLowerCase().includes("email")) {
            errorMessage = "Error: La dirección de correo electrónico ya está en uso por otro usuario.";
          } else if (error.message.toLowerCase().includes("usuario")) {
            errorMessage = "Error: El nombre de usuario ya está en uso.";
          }

        }
        alert(errorMessage);
      }
    });
  }
});
