// js/modules/ServicioYPropiedad/index.js

import { fetchData } from "../../api.js";

/**
 * Procesa los datos para el gráfico de Prestador de Servicio y Propiedad de Planta Física.
 * @param {Array} apiData - Datos brutos de la API.
 * @returns {Object} - Datos procesados para Chart.js.
 */
function processServiceAndPropertyData(apiData) {
  const prestadorCounts = {};
  const propiedadCounts = {};
  let totalCount = 0;

  apiData.forEach((item) => {
    const prestador = item.prestador_de_servicio
      ? item.prestador_de_servicio.trim().toUpperCase()
      : "NO ESPECIFICADO";
    const propiedad = item.propiedad_planta_fisica
      ? item.propiedad_planta_fisica.trim().toUpperCase()
      : "NO ESPECIFICADA";

    prestadorCounts[prestador] = (prestadorCounts[prestador] || 0) + 1;
    propiedadCounts[propiedad] = (propiedadCounts[propiedad] || 0) + 1;
    totalCount++;
  });

  // Convertir a arrays ordenados
  const sortedPrestadores = Object.keys(prestadorCounts).sort();
  const sortedPropiedades = Object.keys(propiedadCounts).sort();

  return {
    prestadores: sortedPrestadores,
    prestadorData: sortedPrestadores.map((key) => prestadorCounts[key]),
    propiedades: sortedPropiedades,
    propiedadData: sortedPropiedades.map((key) => propiedadCounts[key]),
    totalCount: totalCount,
  };
}

/**
 * Función principal para renderizar el gráfico del Módulo de Servicio y Propiedad.
 * @param {string} canvasId - ID del elemento canvas.
 * @param {HTMLElement} descriptionElement - Elemento para la descripción.
 * @param {Object} filters - Filtros actuales desde main.js.
 * @returns {Promise<Object|null>} - Promesa que resuelve con la configuración de Chart.js o null si no hay datos.
 */
export async function renderChart(canvasId, descriptionElement, filters) {
  let rawData;
  try {
    rawData = await fetchData(filters); // Aplicamos todos los filtros globales
  } catch (error) {
    descriptionElement.textContent = `Error al cargar datos para el gráfico de Servicio y Propiedad: ${error.message}`;
    return null;
  }

  if (!rawData || rawData.length === 0) {
    descriptionElement.textContent = `No se encontraron datos de establecimientos por prestador de servicio o propiedad de planta física con los filtros seleccionados.`;
    return null;
  }

  const processedData = processServiceAndPropertyData(rawData);

  descriptionElement.textContent = `Análisis de ${processedData.totalCount.toLocaleString()} establecimientos educativos por prestador de servicio y propiedad de planta física.`;
  if (filters.a_o) descriptionElement.textContent += ` Año: ${filters.a_o}.`;
  if (filters.secretaria)
    descriptionElement.textContent += ` Secretaría: ${filters.secretaria
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())}.`;

  // Vamos a crear un gráfico de barras con dos datasets (Prestador y Propiedad)
  // Usaremos un truco para que parezcan barras separadas o apiladas si se desea.
  // Para simplificar, haremos dos barras separadas para cada categoría principal,
  // o un grouped bar chart. O incluso dos gráficos pequeños si el espacio lo permite.

  // Para un solo gráfico con dos barras para cada categoría (ej. uno para prestador, uno para propiedad),
  // necesitaríamos fusionar las etiquetas.
  // Una mejor idea es un 'grouped bar chart' o dos datasets en un mismo chart si las categorías son las mismas.
  // Dado que 'prestador_de_servicio' y 'propiedad_planta_fisica' tienen categorías diferentes,
  // lo más claro sería un 'horizontal bar chart' con dos datasets distintos o un 'bar chart' con 'sub-groups'.

  // Opción 1: Un gráfico de barras horizontal mostrando los conteos de prestadores y propiedades
  // Para hacer esto en un solo gráfico de barras horizontales, debemos unificar las etiquetas
  // y usar dos datasets, o crear dos gráficos separados.

  // Optemos por un enfoque de barras agrupadas o un solo gráfico que muestre ambas distribuciones de manera clara.
  // La forma más sencilla con Chart.js para dos distribuciones distintas es tener dos barras
  // por cada "tipo" si las categorías fueran compartidas. Pero no lo son.
  // Así que, lo mejor es un gráfico de barras horizontales simple para cada tipo.
  // Por simplicidad y claridad, vamos a usar un gráfico de barras horizontal para "Prestador de Servicio"
  // y uno de barras vertical para "Propiedad de Planta Física".
  // Esto implicaría cambiar la estructura si queremos ambos en el mismo canvas.

  // Reconsideración: Hagamos un gráfico de barras **horizontal** para Prestador de Servicio
  // y para Propiedad de Planta Física, usaremos un truco para que se vea como dos secciones de un mismo gráfico si es posible,
  // o simplemente un gráfico de barras por cada uno en el mismo canvas (si Chart.js lo permite fácilmente).

  // La manera más "técnica" y clara para dos categorías de data independientes es un "multichart layout"
  // dentro del mismo div si fuera posible, o dos datasets en un bar chart.

  // Vamos a crear un gráfico de barras horizontal para "Prestador de Servicio"
  // y usar la misma lógica para "Propiedad de Planta Física" para un segundo dataset
  // si tienen las mismas etiquetas. No es el caso.

  // La mejor opción es un 'Bar Chart' donde cada barra represente una categoría de Prestador de Servicio
  // Y otra serie de barras para Propiedad de Planta Física si queremos ambos en el mismo lienzo.
  // Esto implicaría un solo 'labels' array que incluya todos los tipos únicos de ambos.
  // Si queremos que el usuario pueda comparar de un vistazo, hagamos dos datasets.

  const allLabels = [
    ...new Set([...processedData.prestadores, ...processedData.propiedades]),
  ].sort();

  // Crear datasets que puedan ser renderizados juntos.
  // Esto es un poco complicado porque las categorías no se superponen directamente.
  // La forma más "técnica" y útil es un gráfico de barras donde se puedan ver ambos aspectos.

  // Simplificado: Hagamos un gráfico de barras horizontal mostrando la distribución por PRESTADOR DE SERVICIO.
  // Y la descripción del gráfico también mencionará la propiedad.
  // Si el usuario quiere ver "Propiedad de Planta Física", tendría que ser otro módulo.

  // Para mantenerlo en un solo gráfico y ser "más técnico", vamos a hacer un "Grouped Bar Chart"
  // o un "Bar Chart" con datos para ambas categorías en el mismo eje X.
  // Esto significa que necesitamos que las "etiquetas" (labels) sean las categorías principales,
  // y luego los "datasets" representen los conteos.

  // Si queremos un gráfico que muestre ambos, es mejor un horizontal bar chart
  // donde cada "barra" es una categoría y tenemos dos datasets: uno para Prestador y otro para Propiedad.

  // Este enfoque podría llevar a barras con valor 0 si una categoría no existe en el otro conjunto.
  const prestadorMap = new Map(
    processedData.prestadores.map((p, i) => [p, processedData.prestadorData[i]])
  );
  const propiedadMap = new Map(
    processedData.propiedades.map((p, i) => [p, processedData.propiedadData[i]])
  );

  // Consolidar todas las etiquetas únicas de ambos campos
  const combinedLabels = [
    ...new Set([...processedData.prestadores, ...processedData.propiedades]),
  ].sort();

  const prestadorDatasetData = combinedLabels.map(
    (label) => prestadorMap.get(label) || 0
  );
  const propiedadDatasetData = combinedLabels.map(
    (label) => propiedadMap.get(label) || 0
  );

  return {
    type: "bar",
    data: {
      labels: combinedLabels,
      datasets: [
        {
          label: "Cantidad por Prestador de Servicio",
          data: prestadorDatasetData,
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Cantidad por Propiedad de Planta Física",
          data: propiedadDatasetData,
          backgroundColor: "rgba(255, 159, 64, 0.7)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y", // Barras horizontales
      responsive: true,
      maintainAspectRatio: false, // Controlado por el wrapper CSS
      plugins: {
        title: {
          display: true,
          text: `Establecimientos por Prestador de Servicio y Propiedad de Planta Física`,
          font: { size: 18, weight: "bold" },
          color: "#333",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.x !== null) {
                label += context.parsed.x.toLocaleString();
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Cantidad de Establecimientos",
            font: { size: 14 },
          },
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Categoría",
            font: { size: 14 },
          },
        },
      },
    },
  };
}
