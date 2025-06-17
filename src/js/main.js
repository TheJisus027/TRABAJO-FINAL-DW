// js/main.js

import {
  getUniquePrestadorServicio, // ¡Nueva importación!
  getUniqueJornadas,
  getUniqueNiveles,
} from "./api.js";

window.myChartInstance = null; // Almacena la instancia actual del gráfico de Chart.js
let currentModule = null; // Almacena el módulo actualmente activo

// Arrays para almacenar las opciones de filtro
let availablePrestadorServicio = []; // ¡Nuevo array!
let availableJornadas = [];
let availableNiveles = [];

// Elementos del DOM
const chartCanvasWrapper = document.getElementById("chart-canvas-wrapper");
const chartDescription = document.getElementById("chart-description");
const initialMessage = document.getElementById("initial-message");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingText = document.getElementById("loading-text");
const filtersContainer = document.getElementById("filters-container");

// Selects de filtros (solo los "técnicos" restantes)
// Mantenemos el ID "filter-naturaleza" pero internamente será "prestador_de_servicio"
const filterPrestadorServicioSelect =
  document.getElementById("filter-naturaleza");
const filterJornadaSelect = document.getElementById("filter-jornada");
const filterNivelSelect = document.getElementById("filter-nivel");

const applyFiltersBtn = document.getElementById("apply-filters-btn");

/**
 * Muestra el overlay de carga con un mensaje.
 * @param {string} message - El mensaje a mostrar.
 */
function showLoading(message = "Cargando datos...") {
  loadingText.textContent = message;
  loadingOverlay.classList.remove("hidden");
  chartCanvasWrapper.classList.add("hidden"); // Ocultar el canvas mientras carga
  chartDescription.textContent = ""; // Limpiar descripción
}

/**
 * Oculta el overlay de carga.
 */
function hideLoading() {
  loadingOverlay.classList.add("hidden");
  chartCanvasWrapper.classList.remove("hidden"); // Mostrar el canvas
}

/**
 * Obtiene los filtros seleccionados por el usuario.
 * @returns {Object} Un objeto con los filtros.
 */
function getCurrentFilters() {
  const filters = {};
  // Filtro de Prestador de Servicio
  if (
    filterPrestadorServicioSelect.value &&
    filterPrestadorServicioSelect.value !== "all"
  ) {
    filters.prestador_de_servicio = filterPrestadorServicioSelect.value; // ¡Cambio de nombre de campo!
  }
  if (filterJornadaSelect.value && filterJornadaSelect.value !== "all") {
    filters.jornada = filterJornadaSelect.value; // Será tratado con LIKE en api.js
  }
  if (filterNivelSelect.value && filterNivelSelect.value !== "all") {
    filters.niveles = filterNivelSelect.value; // Será tratado con LIKE en api.js
  }
  return filters;
}

/**
 * Carga dinámicamente un módulo y renderiza su gráfico con los filtros actuales.
 * @param {string} moduleName - El nombre de la carpeta del módulo a cargar (ej. 'Zonas').
 * @param {boolean} forceReload - Si es true, recarga el módulo aunque sea el mismo.
 */
async function loadModule(moduleName, forceReload = false) {
  if (!forceReload && currentModule === moduleName) {
    console.log(`[Main] Módulo ${moduleName} ya cargado. No se recarga.`);
    return; // No recargar si es el mismo módulo y no se fuerza
  }

  currentModule = moduleName; // Actualizar el módulo activo

  // 1. Mostrar estado de carga inicial
  showLoading(`Cargando módulo: ${moduleName}...`);
  initialMessage.classList.add("hidden"); // Ocultar el mensaje inicial

  // 2. Destruir cualquier gráfico existente
  if (window.myChartInstance) {
    window.myChartInstance.destroy();
    window.myChartInstance = null;
  }

  // 3. Limpiar canvas previo para asegurar un nuevo dibujo
  const oldCanvas = document.getElementById("myChart");
  if (oldCanvas) oldCanvas.remove();

  try {
    // 4. Importar el módulo dinámicamente
    console.log(
      `[Main] Intentando cargar módulo: ./modules/${moduleName}/index.js`
    );
    const module = await import(`./modules/${moduleName}/index.js`);

    if (module.renderChart) {
      // 5. Obtener filtros actuales
      const filters = getCurrentFilters();

      // 6. Preparar el nuevo canvas y el contenedor
      const newCanvas = document.createElement("canvas");
      newCanvas.id = "myChart";
      // Asegurarse de que el contenedor del canvas esté vacío antes de añadir el nuevo canvas
      chartCanvasWrapper.innerHTML = "";
      chartCanvasWrapper.appendChild(newCanvas);

      // Determinar si el módulo necesita un contenedor de tipo doughnut (ej: Zonas)
      if (moduleName === "Zonas") {
        chartCanvasWrapper.classList.add("is-doughnut");
      } else {
        chartCanvasWrapper.classList.remove("is-doughnut");
      }

      // 7. Renderizar el gráfico
      showLoading(`Obteniendo datos para ${moduleName}...`);
      const chartConfig = await module.renderChart(
        "myChart",
        chartDescription,
        filters
      ); // Pasamos los filtros

      if (chartConfig) {
        window.myChartInstance = new Chart(
          document.getElementById("myChart"),
          chartConfig
        );
        hideLoading(); // Ocultar carga y mostrar gráfico
        filtersContainer.classList.remove("hidden"); // Mostrar los filtros
      } else {
        hideLoading();
        chartDescription.textContent = `El módulo '${moduleName}' se cargó, pero no proporcionó una configuración de gráfico válida (posiblemente no hay datos con los filtros actuales).`;
        chartCanvasWrapper.classList.add("hidden"); // Ocultar canvas si no hay gráfico
        filtersContainer.classList.remove("hidden"); // Mostrar los filtros
      }
    } else {
      hideLoading();
      chartDescription.textContent = `Error: El módulo '${moduleName}' no exporta una función 'renderChart'.`;
      chartCanvasWrapper.classList.add("hidden");
    }
  } catch (error) {
    hideLoading();
    console.error(
      `[Main] Error al cargar o ejecutar el módulo '${moduleName}':`,
      error
    );
    chartDescription.textContent = `No se pudo cargar o ejecutar el módulo: ${moduleName}. Revisa la consola del navegador para más detalles.`;
    chartCanvasWrapper.classList.add("hidden");
    filtersContainer.classList.remove("hidden"); // Mostrar los filtros incluso con error
  }
}

/**
 * Rellena los desplegables de filtros con las opciones disponibles.
 */
async function populateFilters() {
  showLoading("Cargando opciones de filtro...");
  console.log(
    "[Main-populateFilters] Iniciando carga de opciones de filtro..."
  );
  try {
    // Cargar todos los sets de datos para los filtros restantes en paralelo
    const [
      prestadorServicio, // ¡Cambio aquí!
      jornadas,
      niveles,
    ] = await Promise.allSettled([
      getUniquePrestadorServicio(), // ¡Nueva llamada a la API!
      getUniqueJornadas(),
      getUniqueNiveles(),
    ]);

    // Procesar los resultados de Promise.allSettled
    const getFulfilledValue = (promiseResult) =>
      promiseResult.status === "fulfilled" ? promiseResult.value : [];

    availablePrestadorServicio = getFulfilledValue(prestadorServicio); // ¡Asignar nuevo array!
    availableJornadas = getFulfilledValue(jornadas);
    availableNiveles = getFulfilledValue(niveles);

    console.log("[Main-populateFilters] Datos recibidos para filtros:", {
      prestadorServicio: availablePrestadorServicio, // Log actualizado
      jornadas: availableJornadas,
      niveles: availableNiveles,
    });

    // Función auxiliar para poblar un select
    const fillSelect = (selectElement, optionsArray, allText) => {
      selectElement.innerHTML = `<option value="all">${allText}</option>`;
      optionsArray.forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue;
        // Capitalizar y limpiar texto para la UI
        let displayValue = optionValue
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        // Casos especiales si hay inconsistencias en los datos o se prefiere un formato específico
        if (optionValue === "BASICA PRIMARIA") displayValue = "Básica Primaria";
        if (optionValue === "BASICA SECUNDARIA")
          displayValue = "Básica Secundaria";
        if (optionValue === "FIN DE SEMANA") displayValue = "Fin de Semana";
        if (optionValue === "NO APLICA") displayValue = "No Aplica";
        if (optionValue === "NO ESPECIFICADO") displayValue = "No Especificado";

        option.textContent = displayValue;
        selectElement.appendChild(option);
      });
      console.log(
        `[Main-populateFilters] Select ${selectElement.id} llenado con ${optionsArray.length} opciones.`
      );
    };

    fillSelect(
      filterPrestadorServicioSelect,
      availablePrestadorServicio,
      "Todos los Prestadores"
    ); // ¡Nueva llamada y texto!
    fillSelect(filterJornadaSelect, availableJornadas, "Todas las Jornadas");
    fillSelect(filterNivelSelect, availableNiveles, "Todos los Niveles");

    console.log("[Main-populateFilters] Filtros poblados exitosamente.");
    hideLoading();
  } catch (error) {
    console.error(
      "[Main-populateFilters] Error CRÍTICO al cargar opciones de filtro en populateFilters():",
      error
    );
    alert(
      "Error crítico al cargar las opciones de filtro. Revisa la consola para más detalles."
    );
    hideLoading();
  }
}

// --- Event Listeners y Inicialización ---
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Cargar y popular los filtros al iniciar
  await populateFilters();

  // 2. Configurar eventos de click para la navegación de módulos
  const navLinks = document.querySelectorAll("aside a[data-module]");
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const moduleName = event.target.dataset.module;
      if (moduleName) {
        loadModule(moduleName); // Cargar el módulo al hacer clic
      }
    });
  });

  // 3. Configurar evento para el botón "Aplicar Filtros"
  applyFiltersBtn.addEventListener("click", () => {
    if (currentModule) {
      loadModule(currentModule, true); // Recargar el módulo actual forzando la recarga con nuevos filtros
    } else {
      alert("Por favor, selecciona un módulo primero para aplicar filtros.");
    }
  });

  // Opcional: Cargar un módulo por defecto al inicio
  // loadModule('Zonas'); // Puedes descomentar esto para que inicie con un gráfico
});
