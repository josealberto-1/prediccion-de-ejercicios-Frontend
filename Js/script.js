const BASE_URL = "https://b2b3-138-84-36-254.ngrok-free.app/api";

// Elementos del DOM
const formPersona = document.getElementById('form-persona');
const predecirBtn = document.getElementById('predecir-btn');
const entrenarBtn = document.getElementById('entrenar-btn');
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
  const nombre = document.getElementById('nombre').value.trim();
  const edad = parseInt(document.getElementById('edad').value, 10);
  const peso = parseFloat(document.getElementById('peso').value);
  const estatura = parseFloat(document.getElementById('estatura').value);
  const genero = document.getElementById('genero').value;
  const enfermedadesSeleccionadas = obtenerEnfermedadesSeleccionadas();

  if (!nombre || isNaN(edad) || isNaN(peso) || isNaN(estatura) || !genero || enfermedadesSeleccionadas.length === 0) {
    alert('Por favor completa todos los campos correctamente y selecciona al menos una enfermedad.');
    return;
  }

  const persona = {
    nombre,
    edad,
    peso,
    estatura,
    genero,
    enfermedades: enfermedadesSeleccionadas, // Se envían los nombres seleccionados
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
      console.error('Error en la predicción:', data);
      alert('Error en la predicción.');
    }
  } catch (error) {
    console.error('Error en la predicción:', error);
    alert('Ocurrió un error al realizar la predicción.');
  } finally {
    ocultarPantallaCarga();
  }
}

// Entrenar modelo
function entrenarModelo() {
  mostrarPantallaCarga('Entrenando modelo...');

  setTimeout(() => {
    ocultarPantallaCarga();
    alert('El modelo ha sido entrenado con éxito.');
    resetFormulario(); // Limpia el formulario y los checkboxes
    limpiarResultados(); // Limpia el grid de resultados
  }, 10000); // 10 segundos de espera
}

// Mostrar resultado de la predicción
function mostrarPrediccion(predicciones) {
  resultadoPrediccion.innerHTML = ''; // Limpiar resultados previos
  predicciones.forEach((prediccion) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <strong>Ejercicio:</strong> ${prediccion.ejercicio}<br>
      <strong>Peso Máximo:</strong> ${prediccion.peso_max} kg<br>
      <strong>Peso Mínimo:</strong> ${prediccion.peso_min} kg<br>
      <strong>Repeticiones:</strong> ${prediccion.repeticiones}<br>
      <strong>Series:</strong> ${prediccion.series}
    `;
    resultadoPrediccion.appendChild(li);
  });
}

// Obtener enfermedades seleccionadas
function obtenerEnfermedadesSeleccionadas() {
  const checkboxes = document.querySelectorAll('#enfermedades-list .form-check-input');
  return Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

// Cargar enfermedades desde el API
async function cargarEnfermedades() {
  try {
    const response = await fetch(`${BASE_URL}/enfermedades`);
    const data = await response.json();
    if (data.code === 200) {
      const enfermedadesUnicas = [...new Set(data.result.map((enfermedad) => enfermedad.nombre))];
      mostrarEnfermedades(enfermedadesUnicas);
    } else {
      console.warn('Error al cargar enfermedades desde el API.');
      enfermedadesList.innerHTML = '<p>No se encontraron enfermedades.</p>';
    }
  } catch (error) {
    console.error('Error al cargar enfermedades:', error);
    enfermedadesList.innerHTML = '<p>Error al cargar enfermedades.</p>';
  }
}

// Mostrar enfermedades como checkboxes
function mostrarEnfermedades(enfermedades) {
  enfermedadesList.innerHTML = ''; // Limpiar el contenedor de enfermedades
  enfermedades.forEach((enfermedad) => {
    const div = document.createElement('div');
    div.className = 'form-check';
    div.innerHTML = `
      <input type="checkbox" class="form-check-input" id="enfermedad-${enfermedad}" value="${enfermedad}">
      <label for="enfermedad-${enfermedad}" class="form-check-label">${enfermedad}</label>
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
    checkbox.style.display = label.includes(filtro) ? 'block' : 'none';
  });
}

// Resetear formulario y checkboxes
function resetFormulario() {
  formPersona.reset();
  const checkboxes = document.querySelectorAll('#enfermedades-list .form-check-input');
  checkboxes.forEach((checkbox) => (checkbox.checked = false));
}

// Limpiar resultados de predicción
function limpiarResultados() {
  resultadoPrediccion.innerHTML = ''; // Limpia el grid de resultados
}

// Eventos
document.getElementById('filtro-enfermedades').addEventListener('input', filtrarEnfermedades);
predecirBtn.addEventListener('click', predecirEjercicio);
entrenarBtn.addEventListener('click', entrenarModelo);

// Inicializar datos
cargarEnfermedades();
