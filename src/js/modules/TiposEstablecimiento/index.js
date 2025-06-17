// js/modules/TiposEstablecimiento/index.js

import { fetchData } from "../../api.js"; // Importar la función fetchData

function processEstablishmentTypeData(apiData) {
  const typeCounts = {};

  apiData.forEach((item) => {
    const type = item.tipo_establecimiento
      ? item.tipo_establecimiento.trim().toUpperCase()
      : "NO ESPECIFICADO";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const labels = Object.keys(typeCounts);
  const data = Object.values(typeCounts);

  // Opcional: Ordenar los datos de mayor a menor para mejor visualización
  const sorted = labels
    .map((label, i) => ({ label, data: data[i] }))
    .sort((a, b) => b.data - a.data);
  const sortedLabels = sorted.map((item) => item.label);
  const sortedData = sorted.map((item) => item.data);

  return {
    labels: sortedLabels,
    data: sortedData,
    totalCount: apiData.length,
  };
}

export async function renderChart(canvasId, descriptionElement, filters) {
  let rawData;
  try {
    rawData = await fetchData(filters); // Usar los filtros aquí
  } catch (error) {
    descriptionElement.textContent = `Error al cargar datos para el gráfico de Tipos de Establecimiento: ${error.message}`;
    return null;
  }

  if (!rawData || rawData.length === 0) {
    descriptionElement.textContent = `No se encontraron datos de establecimientos por tipo con los filtros seleccionados.`;
    return null;
  }

  const processedData = processEstablishmentTypeData(rawData);

  descriptionElement.textContent = `Distribución de ${processedData.totalCount.toLocaleString()} establecimientos educativos por tipo.`;
  if (filters.a_o) descriptionElement.textContent += ` Año: ${filters.a_o}.`;
  if (filters.secretaria)
    descriptionElement.textContent += ` Secretaría: ${filters.secretaria
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())}.`;

  return {
    type: "bar", // Gráfico de barras horizontales
    data: {
      labels: processedData.labels,
      datasets: [
        {
          label: "Cantidad de Establecimientos",
          data: processedData.data,
          backgroundColor: "rgba(255, 99, 132, 0.7)", // Color rojo
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y", // Hace las barras horizontales
      responsive: true,
      maintainAspectRatio: false, // Controlado por el wrapper CSS
      plugins: {
        title: {
          display: true,
          text: `Establecimientos por Tipo`,
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
            text: "Tipo de Establecimiento",
            font: { size: 14 },
          },
        },
      },
    },
  };
}
