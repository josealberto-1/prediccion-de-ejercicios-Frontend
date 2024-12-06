const BASE_URL = "http://ec2-18-224-44-102.us-east-2.compute.amazonaws.com:5000/api";

// Elementos del DOM
const formPersona = document.getElementById('form-persona');
const predecirBtn = document.getElementById('predecir-btn');
const resultadoPrediccion = document.getElementById('resultado-prediccion');
const enfermedadesList = document.getElementById('enfermedades-list');

// Mostrar pantalla de carga
function mostrarPantallaCarga(mensaje) {
  const overlay = document.createElement('div');
  overlay.id = 'pantalla-carga';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = 9999;

  const texto = document.createElement('div');
  texto.style.color = '#fff';
  texto.style.fontSize = '1.5rem';
  texto.textContent = mensaje;

  overlay.appendChild(texto);
  document.body.appendChild(overlay);
}

// Ocultar pantalla de carga
function ocultarPantallaCarga() {
  const overlay = document.getElementById('pantalla-carga');
  if (overlay) {
    overlay.remove();
  }
}

// Predicción de ejercicio
async function predecirEjercicio() {
  const nombre = document.getElementById('nombre').value;
  const edad = parseInt(document.getElementById('edad').value, 10);
  const estatura = parseFloat(document.getElementById('estatura').value);
  const peso = parseFloat(document.getElementById('peso').value);
  const genero = document.getElementById('genero').value;
  const enfermedadesSeleccionadas = obtenerEnfermedadesSeleccionadas();

  if (!nombre || isNaN(edad) || isNaN(estatura) || isNaN(peso) || !genero || enfermedadesSeleccionadas.length === 0) {
    alert('Por favor completa todos los campos y selecciona enfermedades.');
    return;
  }

  const persona = {
    nombre,
    edad,
    estatura,
    peso,
    genero,
    enfermedades: enfermedadesSeleccionadas,
  };

  mostrarPantallaCarga('Realizando predicción...');

  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(persona),
    });

    const data = await response.json();
    if (response.ok && data.code === 200) {
      mostrarPrediccion(data.result);
    } else {
      alert('Error en la predicción.');
    }
  } catch (error) {
    console.error('Error en la predicción:', error);
    alert('Ocurrió un error al realizar la predicción.');
  } finally {
    ocultarPantallaCarga();
  }
}

// Mostrar resultado de la predicción
function mostrarPrediccion(prediccion) {
  resultadoPrediccion.innerHTML = `
    <li class="list-group-item"><strong>Ejercicio:</strong> ${prediccion.ejercicio}</li>
    <li class="list-group-item"><strong>Peso Máximo:</strong> ${prediccion.peso_max} kg</li>
    <li class="list-group-item"><strong>Peso Mínimo:</strong> ${prediccion.peso_min} kg</li>
    <li class="list-group-item"><strong>Repeticiones:</strong> ${prediccion.repeticiones}</li>
    <li class="list-group-item"><strong>Series:</strong> ${prediccion.series}</li>
  `;
}

// Obtener enfermedades seleccionadas
function obtenerEnfermedadesSeleccionadas() {
  const checkboxes = document.querySelectorAll('#enfermedades-list .form-check-input');
  return Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

// Entrenar modelo
async function entrenarModelo(event) {
  event.preventDefault();
  mostrarPantallaCarga('Entrenando modelo...');

  try {
    const response = await fetch(`${BASE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      alert('El modelo se entrenó correctamente.');
      location.reload();
    } else {
      alert('Error al entrenar el modelo.');
    }
  } catch (error) {
    console.error('Error al entrenar el modelo:', error);
    alert('Ocurrió un error al entrenar el modelo.');
  } finally {
    ocultarPantallaCarga();
  }
}

// Cargar enfermedades desde el API
async function cargarEnfermedades() {
  try {
    const response = await fetch(`${BASE_URL}/enfermedades`);
    const data = await response.json();
    if (data.code === 200) {
      mostrarEnfermedades(data.result);
    } else {
      alert('Error al cargar enfermedades.');
    }
  } catch (error) {
    console.error('Error al cargar enfermedades:', error);
  }
}

// Mostrar enfermedades como checkboxes
function mostrarEnfermedades(enfermedades) {
  enfermedadesList.innerHTML = '';
  enfermedades.forEach((enfermedad) => {
    const div = document.createElement('div');
    div.className = 'form-check';
    div.innerHTML = `
      <input type="checkbox" class="form-check-input" id="enfermedad-${enfermedad.id}" value="${enfermedad.id}">
      <label for="enfermedad-${enfermedad.id}" class="form-check-label">${enfermedad.nombre}</label>
    `;
    enfermedadesList.appendChild(div);
  });
}
// Filtrar enfermedades dinámicamente
function filtrarEnfermedades() {
  const filtro = document.getElementById('filtro-enfermedades').value.toLowerCase();
  const checkboxes = document.querySelectorAll('#enfermedades-list .form-check');

  checkboxes.forEach((checkbox) => {
    const label = checkbox.querySelector('label').textContent.toLowerCase();
    if (label.includes(filtro)) {
      checkbox.style.display = 'block';
    } else {
      checkbox.style.display = 'none';
    }
  });
}

function mostrarEnfermedades(enfermedades) {
  enfermedadesList.innerHTML = '';
  enfermedades.forEach((enfermedad) => {
    const div = document.createElement('div');
    div.className = 'form-check';
    div.innerHTML = `
      <input type="checkbox" class="form-check-input" id="enfermedad-${enfermedad.id}" value="${enfermedad.id}">
      <label for="enfermedad-${enfermedad.id}" class="form-check-label">${enfermedad.nombre}</label>
    `;
    enfermedadesList.appendChild(div);
  });
}
// Mostrar mensaje de error en pantalla
function mostrarError(mensaje) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = mensaje;
  errorDiv.style.display = 'block';

  // Ocultar el mensaje después de 5 segundos
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// Entrenar modelo
async function entrenarModelo(event) {
  event.preventDefault();
  mostrarPantallaCarga('Entrenando modelo...');

  try {
    const response = await fetch(`${BASE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      alert('El modelo se entrenó correctamente.');
    } else {
      const errorMessage = `Error ${response.status}: ${response.statusText}`;
      mostrarError(errorMessage);
    }
  } catch (error) {
    console.error('Error al entrenar el modelo:', error);
    mostrarError('Ocurrió un error al entrenar el modelo.');
  } finally {
    limpiarFormulario(); // Limpia el formulario y los filtros
    ocultarPantallaCarga(); // Ocultar la pantalla de carga
  }
}

// Limpiar formulario y filtros
function limpiarFormulario() {
  document.getElementById('form-persona').reset();
  document.getElementById('filtro-enfermedades').value = '';
  const checkboxes = document.querySelectorAll('#enfermedades-list .form-check-input');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
}



// Evento para filtrar enfermedades
document.getElementById('filtro-enfermedades').addEventListener('input', filtrarEnfermedades);


// Eventos
formPersona.addEventListener('submit', entrenarModelo);
predecirBtn.addEventListener('click', predecirEjercicio);

// Inicializar datos
cargarEnfermedades();
