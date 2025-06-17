// js/modules/Jornadas/index.js

import { fetchData } from "../../api.js"; // Importar la función fetchData

function processJornadaData(apiData) {
  const jornadaCounts = {};

  apiData.forEach((item) => {
    const jornadas = item.jornada
      ? item.jornada
          .split(",")
          .map((j) => j.trim().toUpperCase())
          .filter((j) => j)
      : ["NO ESPECIFICADA"];
    jornadas.forEach((j) => {
      jornadaCounts[j] = (jornadaCounts[j] || 0) + 1;
    });
  });

  const labels = Object.keys(jornadaCounts);
  const data = Object.values(jornadaCounts);

  // Opcional: Ordenar los datos de mayor a menor
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
    descriptionElement.textContent = `Error al cargar datos para el gráfico de Jornadas: ${error.message}`;
    return null;
  }

  if (!rawData || rawData.length === 0) {
    descriptionElement.textContent = `No se encontraron datos de establecimientos por jornada con los filtros seleccionados.`;
    return null;
  }

  const processedData = processJornadaData(rawData);

  descriptionElement.textContent = `Distribución de ${processedData.totalCount.toLocaleString()} establecimientos educativos por tipo de jornada.`;
  if (filters.a_o) descriptionElement.textContent += ` Año: ${filters.a_o}.`;
  if (filters.secretaria)
    descriptionElement.textContent += ` Secretaría: ${filters.secretaria
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())}.`;

  return {
    type: "bar", // Gráfico de barras verticales
    data: {
      labels: processedData.labels,
      datasets: [
        {
          label: "Cantidad de Establecimientos",
          data: processedData.data,
          backgroundColor: "rgba(54, 162, 235, 0.7)", // Color azul
          borderColor: "rgba(54, 162, 235, 1)",
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
          text: `Establecimientos por Jornada`,
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
              if (context.parsed.y !== null) {
                label += context.parsed.y.toLocaleString();
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Tipo de Jornada",
            font: { size: 14 },
          },
        },
        y: {
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
      },
    },
  };
}
