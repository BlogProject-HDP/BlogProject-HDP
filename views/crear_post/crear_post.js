
import { addPost, buscarId } from "../../js/IndexedDB/indexDB.js";


document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  let editor = null;
  let portadaBase64 = "";


  // ===================
  // PORTADA DINÁMICA
  // ===================
  const botonAgregarPortada = document.getElementById('botonAgregarPortada');
  const inputAgregarPortada = document.getElementById('inputAgregarPortada');
  const controlesImagen = document.getElementById('controlesImagen');
  const inputCambiarImagen = document.getElementById('inputCambiarImagen');
  const btnEliminarImagen = document.getElementById('btnEliminarImagen');
  const previewImagen = document.getElementById('previewImagen');
  const imgPreview = document.getElementById('imgPreview');

  function mostrarImagenPreview(file) {
    const reader = new FileReader();
    reader.onload = () => {
      portadaBase64 = reader.result;
      imgPreview.src = reader.result;
      previewImagen.classList.remove('is-hidden');
    };
    reader.readAsDataURL(file);
  }

  function resetearEstado() {
    imgPreview.src = '';
    previewImagen.classList.add('is-hidden');
    controlesImagen.classList.add('is-hidden');
    botonAgregarPortada.classList.remove('is-hidden');
  }

  inputAgregarPortada.addEventListener('change', () => {
    const file = inputAgregarPortada.files[0];
    if (file) {
      mostrarImagenPreview(file);
      botonAgregarPortada.classList.add('is-hidden');
      controlesImagen.classList.remove('is-hidden');
    }
  });

  inputCambiarImagen.addEventListener('change', () => {
    const file = inputCambiarImagen.files[0];
    if (file) {
      mostrarImagenPreview(file);
    }
  });

  btnEliminarImagen.addEventListener('click', (e) => {

    e.preventDefault()
    e.stopPropagation()

    inputAgregarPortada.value = '';
    inputCambiarImagen.value = '';
    resetearEstado();
  });

  const inputCategoria = document.getElementById('inputCategoria');
  const btnAgregarCategoria = document.getElementById('btnAgregarCategoria');
  const listaCategorias = document.getElementById('listaCategorias');
  //CATEGORIAS VIVOO
  // Array para almacenar las categorías
  let categorias = [];

  function renderizarCategorias() {
    // Limpiar lista visual
    listaCategorias.innerHTML = '';

    categorias.forEach((categoria, index) => {
      const tag = document.createElement('span');
      tag.className = 'tag is-primary is-medium mr-2 mb-2';

      tag.innerHTML = `
      ${categoria}
      <button class="delete is-small ml-2" data-index="${index}"></button>
    `;

      listaCategorias.appendChild(tag);
    });
  }

  btnAgregarCategoria.addEventListener('click', () => {
    const nuevaCategoria = inputCategoria.value.trim();

    if (nuevaCategoria === '') {
      return; // no permitir categoría vacía
    }

    if (categorias.length >= 4) {
      alert('Solo se pueden agregar hasta 4 categorías.');
      return;
    }

    if (categorias.includes(nuevaCategoria)) {
      alert('Esta categoría ya fue agregada.');
      return;
    }

    categorias.push(nuevaCategoria);
    renderizarCategorias();

    inputCategoria.value = '';
    inputCategoria.focus();
  });

  // Eliminar categoría al hacer click en botón delete
  listaCategorias.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {
      const index = event.target.dataset.index;
      categorias.splice(index, 1);
      renderizarCategorias();
    }
  });

  // ===================
  // EDITOR TOAST UI
  // ===================

  function createEditor(theme, content = '') {
    if (editor) {
      editor.destroy();
      editor = null;
    }

    editor = new toastui.Editor({
      el: document.querySelector('#editor'),
      height: '70dvh',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      theme: theme,
      initialValue: content
    });
  }

  const currentTheme = html.dataset.theme || 'light';
  createEditor(currentTheme);

  window.addEventListener('themeChanged', (e) => {
    const newTheme = e.detail.theme;
    const currentContent = editor.getMarkdown();
    createEditor(newTheme, currentContent);
  });

   // ===================
  // PUBLICAR POST
  // ===================
  const btnPublicar = document.getElementById("btnPublicarPost");

  btnPublicar.addEventListener("click", async () => {
    const tituloInput = document.querySelector(".postTitleContainer input");
    const titulo = tituloInput.value.trim();

    if (titulo === "") {
      alert("Debes ingresar un título.");
      return;
    }

    if (categorias.length === 0) {
      alert("Debes agregar al menos una categoría.");
      return;
    }

    if (!editor) {
      alert("Editor no inicializado.");
      return;
    }

    const contenidoHTML = editor.getHTML();

    // Obtener adminId desde localStorage
    const adminId = parseInt(localStorage.getItem("adminId"));

    if (!adminId) {
      alert("No se encontró adminId en LocalStorage.");
      return;
    }

    let adminUser;
    try {
      adminUser = await buscarId(adminId);
      if (!adminUser) {
        alert("No se pudo obtener el usuario admin.");
        return;
      }
    } catch (error) {
      console.error("Error al buscar el usuario admin:", error);
      alert("Error al obtener el usuario admin.");
      return;
    }

    // Construir post
    const post = {
      autor: adminUser.usuario,
      fotoPerfilAutor: adminUser.fotoPerfil || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqf7MJNlh6GfxfrjCep_dnXOBm0EwGc0X12A&s",
      nombre: titulo,
      imagen: portadaBase64,
      contenido: contenidoHTML,
      fechaDePublicacion: new Date().toISOString(),
      categorias: categorias,
      comentarios: [],
      likes: [],
    };

    try {
      await addPost(post);
      alert("Post publicado con éxito!");
      window.location.href = "../../index.html"; // o redirige donde quieras
    } catch (error) {
      console.error("Error al guardar el post:", error);
      alert("Ocurrió un error al guardar el post.");
    }
  });
});




