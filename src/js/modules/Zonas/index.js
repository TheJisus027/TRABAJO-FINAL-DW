// js/modules/Zonas/index.js

import { fetchData } from "../../api.js"; // Importar la función fetchData

/**
 * Procesa los datos para el gráfico de Zonas (Doughnut).
 * @param {Array} apiData - Datos brutos de la API.
 * @returns {Object} - Datos procesados para Chart.js.
 */
function processZoneData(apiData) {
  const zoneCounts = {};
  let totalCount = 0;

  apiData.forEach((item) => {
    // Asegurarse de que el año del item coincida con el filtro de año si aplica.
    // Ojo: Si ya se filtró en fetchData, este filtro es redundante.
    // Asumimos que fetchData ya devuelve los datos filtrados por año/secretaría.

    const zone = item.zona ? item.zona.trim().toUpperCase() : "NO ESPECIFICADA";
    const zones = zone
      .split(",")
      .map((z) => z.trim())
      .filter((z) => z);

    if (zones.length > 0) {
      zones.forEach((singleZone) => {
        zoneCounts[singleZone] = (zoneCounts[singleZone] || 0) + 1;
      });
      totalCount++; // Contamos cada establecimiento una vez, incluso si tiene múltiples zonas (menos común)
      // Si un establecimiento puede tener 'RURAL,URBANA', el conteo es para cada etiqueta,
      // pero el total aquí sería el total de registros únicos.
    } else {
      zoneCounts["NO ESPECIFICADA"] = (zoneCounts["NO ESPECIFICADA"] || 0) + 1;
      totalCount++;
    }
  });

  const labels = Object.keys(zoneCounts);
  const data = Object.values(zoneCounts);

  // Si queremos que el total sea la suma de conteos de cada categoría, no solo los registros
  // totalCount = data.reduce((sum, count) => sum + count, 0);

  return {
    labels: labels,
    data: data,
    totalCount: apiData.length, // Usamos el número de registros en los datos filtrados
  };
}

/**
 * Función principal para renderizar el gráfico del Módulo de Zonas.
 * @param {string} canvasId - ID del elemento canvas.
 * @param {HTMLElement} descriptionElement - Elemento para la descripción.
 * @param {Object} filters - Filtros actuales desde main.js.
 * @returns {Promise<Object|null>} - Promesa que resuelve con la configuración de Chart.js o null si no hay datos.
 */
export async function renderChart(canvasId, descriptionElement, filters) {
  let rawData;
  try {
    rawData = await fetchData(filters); // Usar los filtros aquí
  } catch (error) {
    descriptionElement.textContent = `Error al cargar datos para el gráfico de Zonas: ${error.message}`;
    return null;
  }

  if (!rawData || rawData.length === 0) {
    descriptionElement.textContent = `No se encontraron datos de establecimientos por zona con los filtros seleccionados.`;
    return null;
  }

  const processedData = processZoneData(rawData);

  descriptionElement.textContent = `Distribución de ${processedData.totalCount.toLocaleString()} establecimientos educativos por tipo de zona.`;
  if (filters.a_o) descriptionElement.textContent += ` Año: ${filters.a_o}.`;
  if (filters.secretaria)
    descriptionElement.textContent += ` Secretaría: ${filters.secretaria
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())}.`;

  // Generar colores aleatorios para el gráfico de Doughnut
  const backgroundColors = processedData.labels.map(
    () =>
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 0.7)`
  );
  const borderColors = backgroundColors.map((color) =>
    color.replace("0.7", "1")
  );

  return {
    type: "doughnut",
    data: {
      labels: processedData.labels,
      datasets: [
        {
          label: "Establecimientos",
          data: processedData.data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Controlado por el wrapper CSS
      plugins: {
        title: {
          display: true,
          text: `Establecimientos por Zona`,
          font: { size: 18, weight: "bold" },
          color: "#333",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed !== null) {
                label += `${context.parsed.toLocaleString()} (${(
                  (context.parsed / processedData.totalCount) *
                  100
                ).toFixed(2)}%)`;
              }
              return label;
            },
          },
        },
      },
    },
  };
}
