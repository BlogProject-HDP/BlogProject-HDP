document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     REFERENCIAS GENERALES AL MODAL (es único en el HTML)
  ====================================================== */
  const modal            = document.querySelector(".modal");      // contenedor
  const modalContent     = modal.querySelector(".modal-content"); // cuerpo interno
  const modalClose       = modal.querySelector(".modal-close");
  const modalBackground  = modal.querySelector(".modal-background");

  /* =====================================================
     1.  BOTÓN DE AYUDA  ──────────────────────────────── */
  const ayudaButton = document.getElementById("ayudaButton");

  const helpHTML = `
    <div class="box content">
      <h3 class="title is-4">Guía rápida para el editor</h3>
      <p><strong>Negrita:</strong> <code>**texto**</code> → <strong>texto</strong></p>
      <p><strong>Cursiva:</strong> <code>*texto*</code> → <em>texto</em></p>
      <p><strong>Enlace:</strong> <code>[texto](https://ejemplo.com)</code></p>
      <p><strong>Imagen:</strong> <code>![texto alternativo](https://url-de-la-imagen.com)</code></p>
      <p><strong>Títulos:</strong></p>
      <pre>
# Título 1
## Título 2
### Título 3
      </pre>
      <p><strong>Comentario oculto:</strong> <code>&lt;!-- Esto no se mostrará --&gt;</code></p>
      <hr>
      <p>Puedes usar todas las funciones del editor Toast UI con esta sintaxis básica. ¡Experimenta y personaliza tu post!</p>
    </div>
  `;

  ayudaButton.addEventListener("click", () => {
    modalContent.innerHTML = helpHTML;          // carga contenido de ayuda
    modal.classList.add("is-active");           // abre modal
  });

  /* =====================================================
     2.  BOTÓN «Gestionar categorías»  ────────────────── */
  const gestionarBtn = document.getElementById("gestionarCategories");

  gestionarBtn.addEventListener("click", () => {
    modalContent.innerHTML = getCategoriesHTML(); // genera UI CRUD
    modal.classList.add("is-active");
    initCategoriesHandlers();                     // enlaza eventos
  });

  /* =====================================================
     3.  CIERRE DEL MODAL (común)  ─────────────────────── */
  const closeModal = () => modal.classList.remove("is-active");
  modalClose.addEventListener("click", closeModal);
  modalBackground.addEventListener("click", closeModal);

  /* =====================================================
     4.  UTILIDADES DE CATEGORÍAS  ─────────────────────── */
  const LS_KEY = "blogCategories";

  const loadCategories  = () =>
    Array.isArray(JSON.parse(localStorage.getItem(LS_KEY)))
      ? JSON.parse(localStorage.getItem(LS_KEY))
      : [];

  const saveCategories  = (arr) =>
    localStorage.setItem(LS_KEY, JSON.stringify(arr));

  function getCategoriesHTML() {
    return `
      <div class="box">
        <h3 class="title is-4">Gestionar categorías</h3>

        <div class="field has-addons mb-4">
          <div class="control is-expanded">
            <input id="nuevaCatInput" class="input" type="text" placeholder="Nueva categoría">
          </div>
          <div class="control">
            <button id="btnCrearCat" class="button is-primary">
              <span class="icon is-small"><i class="fas fa-plus"></i></span>
              <span>Añadir</span>
            </button>
          </div>
        </div>

        <table class="table is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Categoría</th>
              <th class="has-text-right">Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaCats"></tbody>
        </table>
      </div>
    `;
  }

  function initCategoriesHandlers() {
    const input  = document.getElementById("nuevaCatInput");
    const btnAdd = document.getElementById("btnCrearCat");
    const tbody  = document.getElementById("tablaCats");

    let cats = loadCategories();                 // copia local

    renderRows();

    /* ---- Renderizar tabla ------------------------------------ */
    function renderRows() {
      tbody.innerHTML = "";
      cats.forEach((cat, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cat}</td>
          <td class="has-text-right">
            <button class="button is-small is-info edit-btn" data-idx="${idx}">
              <span class="icon is-small"><i class="fas fa-edit"></i></span>
            </button>
            <button class="button is-small is-danger delete-btn" data-idx="${idx}">
              <span class="icon is-small"><i class="fas fa-trash-alt"></i></span>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    /* ---- Crear nueva categoría -------------------------------- */
    btnAdd.addEventListener("click", () => {
      const val = input.value.trim();
      if (!val) { return mostrarAlerta("Ingresa un nombre.", "is-warning"); }
      if (cats.includes(val)) {
        return mostrarAlerta("La categoría ya existe.", "is-warning");
      }
      cats.push(val);
      saveCategories(cats);
      input.value = "";
      renderRows();
      syncSelectOnPage();
    });

    /* ---- Editar / Eliminar ----------------------------------- */
    tbody.addEventListener("click", (e) => {
      const idx = e.target.closest("button")?.dataset.idx;
      if (idx === undefined) return;

      /* Eliminar */
      if (e.target.closest(".delete-btn")) {
        cats.splice(idx, 1);
        saveCategories(cats);
        renderRows();
        syncSelectOnPage();
        return;
      }

      /* Editar */
      if (e.target.closest(".edit-btn")) {
        const nuevo = prompt("Editar categoría:", cats[idx]);
        if (nuevo === null) return;                            // cancelado
        const nom = nuevo.trim();
        if (!nom) return mostrarAlerta("Nombre no válido.", "is-warning");
        if (cats.includes(nom) && nom !== cats[idx]) {
          return mostrarAlerta("Ya existe esa categoría.", "is-warning");
        }
        cats[idx] = nom;
        saveCategories(cats);
        renderRows();
        syncSelectOnPage();
      }
    });
  }

  /* =====================================================
     5.  Sincronizar el <select id="inputCategoria"> cada
         vez que cambie el catálogo global de categorías.
         (No hace falta recargar la página)
  ====================================================== */
  function syncSelectOnPage() {
    const select = document.getElementById("inputCategoria");
    if (!select) return;                         // no estamos en crear_post

    // Categorías hoy en LS
    const cats = loadCategories();

    // Mantén deshabilitadas las que el usuario ya eligió
    const currentlyDisabled = [...select.options]
      .filter((o) => o.disabled)
      .map((o) => o.value);

    select.innerHTML =
      '<option value="" disabled selected>Seleccione una categoría…</option>';

    cats.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      if (currentlyDisabled.includes(cat)) opt.disabled = true;
      select.appendChild(opt);
    });
  }
});
