// alertas.js

(function () {
  // Crear un contenedor global de alertas si no existe
  let contenedorAlertas = document.getElementById('contenedor-alertas');
  if (!contenedorAlertas) {
    contenedorAlertas = document.createElement('div');
    contenedorAlertas.id = 'contenedor-alertas';
    contenedorAlertas.style.position = 'fixed';
    contenedorAlertas.style.top = '1rem';
    contenedorAlertas.style.right = '1rem';
    contenedorAlertas.style.zIndex = '9999';
    contenedorAlertas.style.display = 'flex';
    contenedorAlertas.style.flexDirection = 'column';
    contenedorAlertas.style.alignItems = 'flex-end';
    contenedorAlertas.style.gap = '0.5rem';
    document.body.appendChild(contenedorAlertas);
  }

  function mostrarAlerta(mensaje, tipo = 'is-info') {
    const titulos = {
      'is-success': 'Éxito',
      'is-info': 'Información',
      'is-warning': 'Advertencia',
      'is-danger': 'Error'
    };

    const alerta = document.createElement('article');
    alerta.className = `message ${tipo} alerta-flotante`;

    const header = document.createElement('div');
    header.className = 'message-header';

    const titulo = document.createElement('p');
    titulo.textContent = titulos[tipo] || 'Información';

    const botonCerrar = document.createElement('button');
    botonCerrar.className = 'delete';
    botonCerrar.setAttribute('aria-label', 'delete');

    botonCerrar.addEventListener('click', () => {
      ocultarAlerta(alerta);
    });

    header.appendChild(titulo);
    header.appendChild(botonCerrar);

    const body = document.createElement('div');
    body.className = 'message-body';
    body.innerHTML = `<p>${mensaje}</p>`;

    alerta.appendChild(header);
    alerta.appendChild(body);

    contenedorAlertas.appendChild(alerta);

    // Forzar reflow para que la animación se dispare correctamente
    void alerta.offsetWidth;
    alerta.classList.add('visible');

    setTimeout(() => {
      ocultarAlerta(alerta);
    }, 2000);
  }

  function ocultarAlerta(alerta) {
    alerta.classList.remove('visible');
    alerta.classList.add('salida');

    setTimeout(() => {
      alerta.remove();
    }, 500); // Tiempo para permitir la animación de salida
  }

  window.mostrarAlerta = mostrarAlerta;
})();
