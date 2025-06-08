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

    //Guardar los datos
    consumirAPI().then(data => {

        dataPosts = data;

        const transaccion = db.transaction(['Posts'], 'readwrite');
        const almacen = transaccion.objectStore('Posts');

        for (const post of dataPosts) {

            almacen.add(post);
        }

        transaccion.onsuccess = () => {

            console.log('Se guardaron los datos correctamente.')
        }
    });
}

//Seleccionar la entrada
document.getElementById('input-busqueda').addEventListener('input', dibujarPosts);

//Render de los resultados
function dibujarPosts() {

    //Ubicar el texto a buscar
    const textoBuscado = document.getElementById('input-busqueda').value.toLowerCase();
    const contenedor = document.getElementById('resultados-busqueda');

    const transaccion = db.transaction(['Posts'], 'readonly');
    const almacen = transaccion.objectStore('Posts');

    const request = almacen.openCursor();

    request.onsuccess = (evento) => {

        const cursor = evento.target.result;

        if (cursor) {

            const post = cursor.value;

            //Recorrer el obj extraido
            for (const publicacion of dataPosts) {

                //Buscar por id del usuario que publico el post
                if (textoBuscado == post.userId) {

                    console.log(`El usuario con el id ${textoBuscado} realizo los posts con el titulo ${post.title}`);

                }

            }

            cursor.continue();
        }
    };
};