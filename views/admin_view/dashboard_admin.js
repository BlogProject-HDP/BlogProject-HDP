
// Tabs principales
    document.querySelectorAll('.tabs ul li').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tabs ul li').forEach(t => t.classList.remove('is-active'));
            this.classList.add('is-active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('is-hidden'));
            document.getElementById(this.getAttribute('data-tab')).classList.remove('is-hidden');
        });
    });
    // Subtabs de comentarios
    document.querySelectorAll('.tabs.is-toggle ul li').forEach(subtab => {
        subtab.addEventListener('click', function() {
            document.querySelectorAll('.tabs.is-toggle ul li').forEach(t => t.classList.remove('is-active'));
            this.classList.add('is-active');
            document.querySelectorAll('.subtab-content').forEach(c => c.classList.add('is-hidden'));
            document.getElementById(this.getAttribute('data-subtab')).classList.remove('is-hidden');
        });
    });
   

// Al cargar la página o cuando se muestre la pestaña de admin-posts
document.addEventListener('DOMContentLoaded', () => {
    const adminPostsTab = document.getElementById('admin-posts');
    if (adminPostsTab) {
        cargarPostsAdmin();
        agregarEventosCrudPost();
    }
});

// 1. Leer y mostrar todos los posts (de tu store "posts")
function cargarPostsAdmin() {
    const lista = document.getElementById('admin-posts-lista');
    if (!lista) return;

    lista.innerHTML = '<p>Cargando posts...</p>';

    const tx = window.db.transaction('posts', 'readonly');
    const store = tx.objectStore('posts');
    const request = store.getAll(); // Obtiene todos los posts

    request.onsuccess = () => {
        const posts = request.result || [];
        if (posts.length === 0) {
            lista.innerHTML = '<p>No hay posts creados.</p>';
            return;
        }

        // Generar una tabla simple con botones para editar y eliminar
        let html = `
            <table class="table is-fullwidth is-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categorías</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `;
        posts.forEach(post => {
            html += `
            <tr>
                <td>${post.id}</td>
                <td>${post.nombre}</td>
                <td>${(post.categorias || []).join(', ')}</td>
                <td>
                    <button class="button is-small is-warning" data-edit="${post.id}">Editar</button>
                    <button class="button is-small is-danger" data-delete="${post.id}">Eliminar</button>
                </td>
            </tr>`;
        });
        html += `</tbody></table>`;
        lista.innerHTML = html;
    };
    request.onerror = () => {
        lista.innerHTML = '<p>Error al cargar los posts.</p>';
    };
}

// crear un nuevo post
function agregarEventosCrudPost() {
    // Asume que tienes un formulario con ID "form-crear-post" en tu HTML
    const formCrear = document.getElementById('form-crear-post');
    if (formCrear) {
        formCrear.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('post-nombre').value.trim();
            const categorias = document.getElementById('post-categorias').value.split(',').map(x => x.trim());
            const contenido = document.getElementById('post-contenido').value.trim();
            if (!nombre) return alert('El nombre del post es obligatorio');

            const tx = window.db.transaction('posts', 'readwrite');
            const store = tx.objectStore('posts');
            store.add({
                nombre,
                categorias,
                contenido,
                fechaDePublicacion: new Date().toISOString(),
                likes: [],
                comentarios: []
            });
            tx.oncomplete = () => {
                formCrear.reset();
                cargarPostsAdmin();
                alert('Post creado con éxito.');
            };
            tx.onerror = () => {
                alert('Error al crear el post (posible duplicado en "nombre").');
            };
        });
    }

    // 3. Escucha botones "Editar" y "Eliminar" en la tabla de posts
    document.getElementById('admin-posts-lista').addEventListener('click', (e) => {
        if (e.target.dataset.edit) {
            editarPost(e.target.dataset.edit);
        } else if (e.target.dataset.delete) {
            eliminarPost(e.target.dataset.delete);
        }
    });
}

// 4. Editar un post
function editarPost(id) {
    const nuevoNombre = prompt('Nuevo nombre para el post:');
    if (!nuevoNombre) return;

    const tx = window.db.transaction('posts', 'readwrite');
    const store = tx.objectStore('posts');
    const request = store.get(Number(id));

    request.onsuccess = () => {
        const post = request.result;
        if (!post) return alert('Post no encontrado');
        post.nombre = nuevoNombre;
        store.put(post);
    };
    tx.oncomplete = () => {
        cargarPostsAdmin();
        alert('Post editado con éxito.');
    };
    tx.onerror = () => {
        alert('Error al editar el post (posible duplicado en "nombre").');
    };
}

// 5. Eliminar un post
function eliminarPost(id) {
    if (!confirm('¿Seguro que deseas eliminar este post?')) return;

    const tx = window.db.transaction('posts', 'readwrite');
    const store = tx.objectStore('posts');
    store.delete(Number(id));
    tx.oncomplete = () => {
        cargarPostsAdmin();
        alert('Post eliminado con éxito.');
    };
    tx.onerror = () => {
        alert('Error al eliminar el post.');
    };
}