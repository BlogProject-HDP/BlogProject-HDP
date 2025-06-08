let db;
const nameDB = 'prueba';
let dataPosts;

const request = indexedDB.open(nameDB, 1);

//Consumir api

async function consumirAPI() {
    
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    return response.json();
}

request.onupgradeneeded = (evento) => {

    db = evento.target.result;

    const almacen = db.createObjectStore('Posts', { keyPath: 'id', autoIncrement: true });
    almacen.createIndex('porContenido', 'contenido', { unique: false });
};

request.onsuccess = (evento) => {

    db = evento.target.result;
    console.log('Se creo la base de datos');

    consumirAPI().then( data => {

        dataPosts = data;

        console.log(typeof dataPosts);

        const transaccion = db.transaction(['Posts'], 'readwrite');
        const almacen = transaccion.objectStore('Posts');

        for(const post of dataPosts){

            almacen.add(post);
        }

        transaccion.onsuccess = () => {

            console.log('Se guardaron los datos correctamente.')
        }
    });
}

document.getElementById('input-busqueda').addEventListener('input', dibujarPosts);

function dibujarPosts() {

    const textoBuscado = document.getElementById('input-busqueda').value.toLowerCase();
    const contenedor = document.getElementById('resultados-busqueda');

    contenedor.innerHTML = '';

    const transaccion = db.transaction(['Posts'], 'readonly');
    const almacen = transaccion.objectStore('Posts');

    const request = almacen.openCursor();

    request.onsuccess = (evento) => {

        const cursor = evento.target.result;

        if (cursor) {

            const post = cursor.value;

            for(const post of dataPosts){

                if (post.title.includes(textoBuscado) && post.body.toLowerCase().includes(textoBuscado)) {

                console.log(`Lo contiene ${post.id}`);
                //const divPost = document.createElement('div');
                //divPost.textContent = post.contenido;

                //contenedor.appendChild(divPost);
            }
            }
            
            cursor.continue();
        }
    };
};