import { buscarId, putUser } from "../../js/IndexedDB/indexDB.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Elementos de la vista principal del perfil (donde se muestra la info)
  const profileImage = document.querySelector(".profile-box figure.image img");
  const nameDisplay = document.getElementById("name");
  const userDisplay = document.getElementById("user");
  const bioDisplay = document.querySelector("#bio span");
  const birthdayDisplay = document.querySelector("#birthday span");

  // Elementos del formulario de edición (asumimos que existen en el HTML,
  // podrían estar dentro de un modal o directamente en la página)
  const formEditarInfo = document.getElementById("form-editar-info-perfil"); // ID del <form>
  const modalInfoNombreInput = document.getElementById("modal-info-nombre"); // Input para el nombre
  const modalInfoBioInput = document.getElementById("modal-info-bio");       // Input para la bio/descripción
  const modalInfoBirthdayInput = document.getElementById("modal-info-birthday-input"); // Input para edad/fecha nac.

  const userIdFromStorage = localStorage.getItem("userId");

  if (!userIdFromStorage || userIdFromStorage === "L") {
    console.error("No estás logueado o el ID de usuario no es válido.");
    if (nameDisplay) nameDisplay.textContent = "Usuario no autenticado";
    // Considerar deshabilitar el formulario de edición si existe
    if (formEditarInfo) formEditarInfo.style.display = 'none';
    return;
  }

  let currentUserData = null; // Almacenará los datos del usuario cargado si es que lo hay 

  try {
    const numericUserId = parseInt(userIdFromStorage, 10);
    if (isNaN(numericUserId)) {
      console.error("ID de usuario en localStorage no es un número válido.");
      localStorage.removeItem("userId");
      if (nameDisplay) nameDisplay.textContent = "ID de usuario inválido";
      if (formEditarInfo) formEditarInfo.style.display = 'none';
      return;
    }

    currentUserData = await buscarId(numericUserId);

    if (currentUserData) {
      console.log("Datos del usuario cargados:", currentUserData);

      // 1. Poblar la vista principal del perfil
      if (profileImage && currentUserData.fotoPerfil) {
        profileImage.src = currentUserData.fotoPerfil;
        profileImage.alt = `Foto de perfil de ${currentUserData.nombre}`;
      } else if (profileImage) {
        profileImage.src = "../../img/user-default.png"; // Ruta a una imagen por defecto
        profileImage.alt = "Avatar por defecto";
      }

      if (nameDisplay) nameDisplay.textContent = currentUserData.user || "N/A";
      if (userDisplay) userDisplay.textContent = currentUserData.usuario ? `@${currentUserData.usuario}` : "N/A";
      if (bioDisplay) bioDisplay.textContent = currentUserData.descripcion || "N/A";
      if (birthdayDisplay) birthdayDisplay.textContent = currentUserData.edad ? `${currentUserData.edad} años` : "N/A";

      // 2. Poblar los campos del formulario de edición (si existen)
      // Esto se haría típicamente cuando el usuario decide editar.
      // Si el formulario está siempre visible, se puede hacer aquí.
      // Si es un modal, se haría al abrir el modal.
      if (modalInfoNombreInput) modalInfoNombreInput.value = currentUserData.nombre || "";
      if (modalInfoBioInput) modalInfoBioInput.value = currentUserData.descripcion || "";
      // Para el input de fecha/edad: si 'edad' es solo un número y el input es 'date', es complejo.
      // Si el input es 'number' o 'text' para la edad:
      if (modalInfoBirthdayInput && currentUserData.edad !== undefined) modalInfoBirthdayInput.value = currentUserData.edad;


    } else {
      console.error(`Usuario con ID ${numericUserId} no encontrado.`);
      localStorage.removeItem("userId");
      if (nameDisplay) nameDisplay.textContent = "Usuario no encontrado";
      if (formEditarInfo) formEditarInfo.style.display = 'none';
    }
  } catch (error) {
    console.error("Error al cargar datos del perfil:", error);
    if (nameDisplay) nameDisplay.textContent = "Error al cargar perfil";
    if (formEditarInfo) formEditarInfo.style.display = 'none';
  }

  // 3. Lógica para el envío del formulario de edición
  if (formEditarInfo) {
    formEditarInfo.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentUserData) {
        alert("Error: No hay datos de usuario para actualizar. Intenta recargar la página.");
        return;
      }

      // Recolectar datos del formulario
      const nombreActualizado = modalInfoNombreInput ? modalInfoNombreInput.value.trim() : currentUserData.nombre;
      const bioActualizada = modalInfoBioInput ? modalInfoBioInput.value.trim() : currentUserData.descripcion;
      const edadActualizada = modalInfoBirthdayInput ? parseInt(modalInfoBirthdayInput.value, 10) : currentUserData.edad;

      if (!nombreActualizado) {
        alert("El nombre no puede estar vacío.");
        return;
      }
      // Aquí podrías añadir más validaciones (ej. para la edad)

      const usuarioParaActualizar = {
        ...currentUserData, // Preserva todos los campos existentes (ID, email, password, tipo, etc.)
        nombre: nombreActualizado,
        descripcion: bioActualizada,
        edad: isNaN(edadActualizada) ? currentUserData.edad : edadActualizada, // Actualiza la edad
      };

      try {
        await putUser(usuarioParaActualizar);
        alert("Información del perfil actualizada con éxito.");
        
        // Actualizar la vista principal del perfil con los nuevos datos
        if (nameDisplay) nameDisplay.textContent = usuarioParaActualizar.nombre;
        if (bioDisplay) bioDisplay.textContent = usuarioParaActualizar.descripcion;
        if (birthdayDisplay) birthdayDisplay.textContent = usuarioParaActualizar.edad ? `${usuarioParaActualizar.edad} años` : "N/A";
        
        // Actualizar la variable local con los datos más recientes
        currentUserData = usuarioParaActualizar;

        // Si el formulario estuviera en un modal, aquí se cerraría el modal.
        // Ejemplo: if(infoModal) infoModal.classList.remove("is-active");

      } catch (error) {
        console.error("Error al actualizar la información del perfil:", error);
        alert("Hubo un error al actualizar tu información. Inténtalo de nuevo.");
      }
    });
  } else {
    console.warn("El formulario de edición 'form-editar-info-perfil' no fue encontrado en el DOM.");
  }
});