// js/api.js

const API_BASE_URL = "https://www.datos.gov.co/resource/qijw-htwa.json";
const API_RECORD_LIMIT = 100000; // Máximo de registros por defecto para evitar truncamiento

/**
 * Realiza una petición GET a la API de datos.gov.co.
 * @param {Object} queryParams - Un objeto con los parámetros de la query.
 * Soporta operadores LIKE para 'jornada' y 'niveles'.
 * @returns {Promise<Array>} - Una promesa que resuelve con los datos de la API.
 */
export async function fetchData(queryParams = {}) {
  const params = new URLSearchParams();
  let soqlWhereClauses = [];

  // Construir los parámetros y cláusulas WHERE
  for (const key in queryParams) {
    if (
      queryParams.hasOwnProperty(key) &&
      queryParams[key] &&
      queryParams[key] !== "all"
    ) {
      const value = queryParams[key];
      // Para campos multivaluados que necesitan LIKE
      if (key === "jornada" || key === "niveles") {
        soqlWhereClauses.push(`${key} LIKE '%${value}%'`);
      } else {
        // Para campos de valor único o exacto
        // Esto incluirá ahora 'prestador_de_servicio'
        params.set(key, String(value));
      }
    }
  }

  // Si hay cláusulas WHERE complejas, añadirlas como $where
  if (soqlWhereClauses.length > 0) {
    params.set("$where", soqlWhereClauses.join(" AND "));
  }

  params.set("$limit", API_RECORD_LIMIT); // Añade el límite de registros

  const queryUrl = `${API_BASE_URL}?${params.toString()}`;
  console.log(`[API] Fetching: ${queryUrl}`);

  try {
    const response = await fetch(queryUrl);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status}. Body: ${errorBody}`
      );
    }
    const data = await response.json();
    console.log(`[API] Received ${data.length} records.`);
    return data;
  } catch (error) {
    console.error("[API] Error fetching data:", error);
    throw error; // Propagar el error para que el módulo lo maneje
  }
}

/**
 * Obtiene todos los "prestador_de_servicio" únicos presentes en la API.
 * Ahora siempre usa la lógica de fallback para garantizar la extracción correcta.
 * @returns {Promise<Array<string>>} - Promesa que resuelve con un array de prestadores de servicio únicos.
 */
export async function getUniquePrestadorServicio() {
  try {
    console.log(
      "[API-getUniquePrestadorServicio] Fetching all data to derive unique prestador_de_servicio..."
    );
    // Solicitamos solo la columna 'prestador_de_servicio' para optimizar,
    // pero la API podría seguir enviando registros completos.
    // Lo importante es que procesaremos la unicidad localmente.
    const allData = await fetchData({
      $select: "prestador_de_servicio",
      $limit: 100000,
    });

    const prestadores = allData
      .map((item) => (item ? item.prestador_de_servicio : null))
      .filter(
        (value) => value && typeof value === "string" && value.trim() !== ""
      );

    const uniquePrestadores = [...new Set(prestadores)].sort();
    console.log(
      `[API-getUniquePrestadorServicio] Processed prestadores:`,
      uniquePrestadores
    );
    return uniquePrestadores;
  } catch (error) {
    console.error(
      "[API-getUniquePrestadorServicio] Error fetching and processing unique prestador_de_servicio:",
      error
    );
    return []; // Retorna un array vacío si hay un error irrecuperable
  }
}

/**
 * Obtiene todas las jornadas únicas presentes en la API (maneja multivalor).
 * @returns {Promise<Array<string>>} - Promesa que resuelve con un array de jornadas únicas.
 */
export async function getUniqueJornadas() {
  try {
    // La consulta con $select=jornada suele funcionar bien para obtener la columna
    const url = `${API_BASE_URL}?$select=jornada&$limit=100000`;
    console.log(`[API-getUniqueJornadas] Fetching: ${url}`);
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Failed to fetch jornada data. Status: ${response.status}`
      );
    const data = await response.json();
    console.log(
      `[API-getUniqueJornadas] Raw data received:`,
      data.length,
      "records."
    );
    let allJornadas = new Set();
    data.forEach((item) => {
      if (item.jornada) {
        item.jornada.split(",").forEach((j) => {
          const trimmedJ = j.trim().toUpperCase();
          if (trimmedJ) allJornadas.add(trimmedJ);
        });
      }
    });
    const uniqueJornadas = [...allJornadas].sort();
    console.log(`[API-getUniqueJornadas] Processed jornadas:`, uniqueJornadas);
    return uniqueJornadas;
  } catch (error) {
    console.error(
      "[API-getUniqueJornadas] Error fetching distinct jornadas. Using fallback (fetching all data to derive).",
      error
    );
    // Fallback: Si falla el $select=jornada, se intenta con fetchData completa
    try {
      console.log(
        "[API-getUniqueJornadas] Falling back to full data fetch to get jornadas..."
      );
      const allData = await fetchData({ $select: "jornada", $limit: 100000 });
      let allJornadas = new Set();
      allData.forEach((item) => {
        if (item.jornada) {
          item.jornada.split(",").forEach((j) => {
            const trimmedJ = j.trim().toUpperCase();
            if (trimmedJ) allJornadas.add(trimmedJ);
          });
        }
      });
      const uniqueJornadas = [...allJornadas].sort();
      console.log(
        `[API-getUniqueJornadas] Fallback processed jornadas:`,
        uniqueJornadas
      );
      return uniqueJornadas;
    } catch (fallbackError) {
      console.error(
        "[API-getUniqueJornadas] Fallback also failed for unique jornadas:",
        fallbackError
      );
      return [];
    }
  }
}

/**
 * Obtiene todos los niveles educativos únicos presentes en la API (maneja multivalor).
 * @returns {Promise<Array<string>>} - Promesa que resuelve con un array de niveles únicos.
 */
export async function getUniqueNiveles() {
  try {
    // La consulta con $select=niveles suele funcionar bien para obtener la columna
    const url = `${API_BASE_URL}?$select=niveles&$limit=100000`;
    console.log(`[API-getUniqueNiveles] Fetching: ${url}`);
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Failed to fetch niveles data. Status: ${response.status}`
      );
    const data = await response.json();
    console.log(
      `[API-getUniqueNiveles] Raw data received:`,
      data.length,
      "records."
    );
    let allNiveles = new Set();
    data.forEach((item) => {
      if (item.niveles) {
        item.niveles.split(",").forEach((n) => {
          const trimmedN = n.trim().toUpperCase();
          if (trimmedN) allNiveles.add(trimmedN);
        });
      }
    });
    const uniqueNiveles = [...allNiveles].sort();
    console.log(`[API-getUniqueNiveles] Processed niveles:`, uniqueNiveles);
    return uniqueNiveles;
  } catch (error) {
    console.error(
      "[API-getUniqueNiveles] Error fetching distinct niveles. Using fallback (fetching all data to derive).",
      error
    );
    // Fallback: Si falla el $select=niveles, se intenta con fetchData completa
    try {
      console.log(
        "[API-getUniqueNiveles] Falling back to full data fetch to get niveles..."
      );
      const allData = await fetchData({ $select: "niveles", $limit: 100000 });
      let allNiveles = new Set();
      allData.forEach((item) => {
        if (item.niveles) {
          item.niveles.split(",").forEach((n) => {
            const trimmedN = n.trim().toUpperCase();
            if (trimmedN) allNiveles.add(trimmedN);
          });
        }
      });
      const uniqueNiveles = [...allNiveles].sort();
      console.log(
        `[API-getUniqueNiveles] Fallback processed niveles:`,
        uniqueNiveles
      );
      return uniqueNiveles;
    } catch (fallbackError) {
      console.error(
        "[API-getUniqueNiveles] Fallback also failed for unique niveles:",
        fallbackError
      );
      return [];
    }
  }
}
