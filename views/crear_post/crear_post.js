import { addPost, buscarId } from "../../js/IndexedDB/indexDB.js";

document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  let editor = null;
  let portadaBase64 = "";

  // ===================
  // PORTADA DINÁMICA
  // ===================
  const botonAgregarPortada   = document.getElementById("botonAgregarPortada");
  const inputAgregarPortada   = document.getElementById("inputAgregarPortada");
  const controlesImagen       = document.getElementById("controlesImagen");
  const inputCambiarImagen    = document.getElementById("inputCambiarImagen");
  const btnEliminarImagen     = document.getElementById("btnEliminarImagen");
  const previewImagen         = document.getElementById("previewImagen");
  const imgPreview            = document.getElementById("imgPreview");
  const TAM_MAX_MB            = 5;
  const TAM_MAX_BYTES         = TAM_MAX_MB * 1024 * 1024;

function mostrarImagenPreview(file) {
  if (file.size > TAM_MAX_BYTES) {
    mostrarAlerta(`La imagen es demasiado grande. Máximo permitido: ${Tamaño_Maximo_img} MB.`, "is-danger");
    resetearEstado();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const imgTemp = new Image();
    imgTemp.onload = () => {
      const minAncho = 800;
      const minAlto = 400;

      if (imgTemp.width < minAncho || imgTemp.height < minAlto) {
        mostrarAlerta(`La imagen es demasiado pequeña. Mínimo requerido: ${minAncho}x${minAlto}px.`, "is-danger");
        resetearEstado();
        return;
      }

      portadaBase64 = reader.result;
      imgPreview.src = reader.result;
      previewImagen.classList.remove("is-hidden");
    };
    imgTemp.src = reader.result;
  };
  reader.readAsDataURL(file);
}

  function resetearEstado() {
    imgPreview.src = "";
    previewImagen.classList.add("is-hidden");
    controlesImagen.classList.add("is-hidden");
    botonAgregarPortada.classList.remove("is-hidden");
  }

  inputAgregarPortada.addEventListener("change", () => {
    const file = inputAgregarPortada.files[0];
    if (file) {
      mostrarImagenPreview(file);
      if (file.size < TAM_MAX_BYTES) {
        botonAgregarPortada.classList.add("is-hidden");
        controlesImagen.classList.remove("is-hidden");
      }
    }
  });

  inputCambiarImagen.addEventListener("change", () => {
    const file = inputCambiarImagen.files[0];
    if (file) mostrarImagenPreview(file);
  });

  btnEliminarImagen.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    inputAgregarPortada.value = "";
    inputCambiarImagen.value = "";
    resetearEstado();
  });

  // ===================
  // CATEGORÍAS (select persistente, máx. 4)
  // ===================
  const DEFAULT_CATEGORIES = [
    "Programación",
    "Desarrollo Web",
    "Inteligencia Artificial",
    "Machine Learning",
    "Ciberseguridad",
    "Gadgets",
    "Hardware",
    "Software",
    "Cloud Computing",
    "Opinión",
    "Tutoriales",
  ];

  // Catálogo global en localStorage
  let allCategories = JSON.parse(localStorage.getItem("blogCategories"));
  if (!Array.isArray(allCategories) || allCategories.length === 0) {
    allCategories = [...DEFAULT_CATEGORIES];
    localStorage.setItem("blogCategories", JSON.stringify(allCategories));
  }

  // Referencias UI
  const inputCategoria       = document.getElementById("inputCategoria");
  const btnAgregarCategoria  = document.getElementById("btnAgregarCategoria");
  const listaCategorias      = document.getElementById("listaCategorias");

  // Llena el select
  function renderSelectOptions() {
    inputCategoria.innerHTML =
      '<option value="" disabled selected>Seleccione una categoría…</option>';

    allCategories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      inputCategoria.appendChild(option);
    });
  }
  renderSelectOptions();

  // Categorías elegidas para ESTE post
  let categoriasSeleccionadas = [];

  // Pinta los tags
  function renderizarCategoriasSeleccionadas() {
    listaCategorias.innerHTML = "";
    categoriasSeleccionadas.forEach((cat, idx) => {
      const tag = document.createElement("span");
      tag.className = "tag is-primary is-medium mr-2 mb-2";
      tag.innerHTML = `
        ${cat}
        <button class="delete is-small ml-2" data-index="${idx}"></button>
      `;
      listaCategorias.appendChild(tag);
    });
  }

  // Agregar categoría
  btnAgregarCategoria.addEventListener("click", () => {
    const cat = inputCategoria.value;
    if (!cat) return;

    if (categoriasSeleccionadas.includes(cat)) {
      mostrarAlerta("Esta categoría ya fue agregada.", "is-warning");
      return;
    }
    if (categoriasSeleccionadas.length >= 4) {
      mostrarAlerta("Solo se pueden seleccionar 4 categorías.", "is-danger");
      return;
    }

    categoriasSeleccionadas.push(cat);
    renderizarCategoriasSeleccionadas();

    // Deshabilitar opción para evitar duplicados
    [...inputCategoria.options].forEach((o) => {
      if (o.value === cat) o.disabled = true;
    });

    inputCategoria.selectedIndex = 0; // Placeholder
  });

  // Eliminar categoría
  listaCategorias.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete")) return;

    const idx = parseInt(e.target.dataset.index);
    const cat = categoriasSeleccionadas[idx];
    categoriasSeleccionadas.splice(idx, 1);
    renderizarCategoriasSeleccionadas();

    // Re-habilitar en el select
    [...inputCategoria.options].forEach((o) => {
      if (o.value === cat) o.disabled = false;
    });
  });

  // ===================
  // EDITOR TOAST UI
  // ===================
  function createEditor(theme, content = "") {
    if (editor) {
      editor.destroy();
      editor = null;
    }

    editor = new toastui.Editor({
      el: document.querySelector("#editor"),
      height: "70dvh",
      initialEditType: "markdown",
      previewStyle: "vertical",
      theme,
      initialValue: content,
    });
  }

  createEditor(html.dataset.theme || "light");

  window.addEventListener("themeChanged", (e) => {
    const currentContent = editor.getMarkdown();
    createEditor(e.detail.theme, currentContent);
  });

  // ===================
  // PUBLICAR POST
  // ===================
  const btnPublicar = document.getElementById("btnPublicarPost");

  btnPublicar.addEventListener("click", async () => {
    const tituloInput = document.querySelector(".postTitleContainer input");
    const titulo = tituloInput.value.trim();
    
    const contenidoHTML = editor.getHTML();

    if (titulo === "") {
      mostrarAlerta("Debes ingresar un título.", "is-danger");
      return;
    }
    if (categoriasSeleccionadas.length === 0) {
      mostrarAlerta("Debes agregar al menos una categoría.", "is-danger");
      return;
    }
    if (!editor) {
      mostrarAlerta("Editor no inicializado.", "is-danger");
      return;
    }

    if (!contenidoHTML || contenidoHTML.replace(/<[^>]*>/g, '').trim() === "") {
    mostrarAlerta("El contenido del post no puede estar vacío.", "is-danger");
    return;
    }


    const adminId = parseInt(localStorage.getItem("adminId"));
    if (!adminId) {
      mostrarAlerta("No se encontró adminId en LocalStorage.", "is-danger");
      return;
    }

    let adminUser;
    try {
      adminUser = await buscarId(adminId);
      if (!adminUser) {
        mostrarAlerta("No se pudo obtener el usuario admin.", "is-danger");
        return;
      }
    } catch (err) {
      console.error("Error al buscar el usuario admin:", err);
      mostrarAlerta("Error al obtener el usuario admin.", "is-danger");
      return;
    }

    const post = {
      autor: adminUser.usuario,
      fotoPerfilAutor:
        adminUser.fotoPerfil ||
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqf7MJNlh6GfxfrjCep_dnXOBm0EwGc0X12A&s",
      nombre: titulo,
      imagen: portadaBase64,
      contenido: contenidoHTML,
      fechaDePublicacion: new Date().toISOString(),
      categorias: categoriasSeleccionadas,
      comentarios: [],
      likes: [],
    };

    try {
      await addPost(post);
      mostrarAlerta("¡Post publicado con éxito!", "is-success");
      setTimeout(() => {
        window.location.href = "../../index.html";
      }, 2000);
    } catch (err) {
      console.error("Error al guardar el post:", err);
      mostrarAlerta("Ocurrió un error al guardar el post.", "is-danger");
    }
  });
});
