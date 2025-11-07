/**
 * Extrae el patrón SX (S1, S2, S3, etc.) de una etiqueta de plano
 * Ejemplo: "LED_CIRCLE_0F_ENT_S1" → "S1"
 * También maneja variaciones como "S01", "S_1", etc.
 */
export const extractSXPattern = (etiquetaPlano) => {
  const nombre = String(etiquetaPlano || '').trim().toUpperCase();
  // Buscar patrón S seguido de guión bajo opcional y uno o más dígitos
  // Ejemplos: S1, S_1, S01, S_01, etc.
  const match = nombre.match(/S_?(\d+)/);
  return match ? `S${match[1]}` : null; // Normalizar a "S1", "S2", etc.
};

/**
 * Elimina duplicados de pantallas basados en el patrón SX
 * Solo mantiene la primera ocurrencia de cada SX único
 */
export const removeDuplicatesBySX = (pantallas) => {
  const seenSX = new Set();
  const pantallasUnicas = [];
  const duplicadosEliminados = [];

  for (const pantalla of pantallas) {
    const sxPattern = extractSXPattern(pantalla.etiquetaPlano);
    
    if (sxPattern) {
      // Si ya existe un SX con este patrón, es un duplicado
      if (seenSX.has(sxPattern)) {
        duplicadosEliminados.push({
          etiqueta: pantalla.etiquetaPlano,
          sxPattern: sxPattern
        });
        continue; // Saltar este duplicado
      }
      seenSX.add(sxPattern);
    }
    
    pantallasUnicas.push(pantalla);
  }

  if (duplicadosEliminados.length > 0) {
    console.warn(`Se eliminaron ${duplicadosEliminados.length} duplicados por patrón SX:`, duplicadosEliminados);
    console.log(`Pantallas únicas después del filtro anti-duplicados: ${pantallasUnicas.length}`);
  }

  return { 
    pantallasUnicas, 
    duplicadosEliminados: duplicadosEliminados.length 
  };
};

/**
 * Procesa un archivo Excel y extrae datos de pantallas
 * Reglas:
 * - Archivo DEBE contener "Validación_MKD" o "Validacion_MKD" en el nombre (obligatorio)
 * - Leer desde la fila 4 (índice 3)
 * - FILTRO 1 (PRIMERO): Columna U (índice 20) debe contener "LED" (obligatorio)
 * - FILTRO 2 (SEGUNDO): Columna C (índice 2) debe contener "Alta"
 */
export const processExcelPantallas = async (file) => {
  if (!file) return { pantallas: [], duplicadosEliminados: 0 };

  try {
    // Validar nombre del archivo - DEBE contener "Validación_MKD" o "Validacion_MKD"
    const fileName = file.name;
    const fileNameUpper = fileName.toUpperCase();
    
    // Validación estricta: el nombre del archivo debe contener el patrón
    // Nota: toUpperCase() convierte "Validación" a "VALIDACION", así que buscamos "VALIDACION_MKD"
    // También buscamos en el nombre original por si acaso (aunque debería funcionar con mayúsculas)
    const tieneValidacionMKD = fileNameUpper.includes('VALIDACION_MKD') || 
                                fileName.includes('Validación_MKD') || 
                                fileName.includes('Validacion_MKD');
    
    if (!tieneValidacionMKD) {
      alert(`El archivo "${file.name}" no es válido.\n\nSolo se procesan archivos Excel que contengan "Validación_MKD" o "Validacion_MKD" en el nombre.`);
      return { pantallas: [], fotos: [] };
    }

    const arrayBuffer = await file.arrayBuffer();
    const XLSXLib = await import('xlsx');
    const workbook = XLSXLib.read(arrayBuffer, { type: 'array', defval: '' });
    
    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Obtener todas las filas como arrays
    const allRows = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (!allRows || allRows.length === 0) {
      alert('El archivo Excel está vacío');
      return { pantallas: [], fotos: [] };
    }

    // Leer desde la fila 4 (índice 3)
    const startRowIndex = 3;
    
    if (allRows.length <= startRowIndex) {
      alert('El archivo no tiene suficientes filas (mínimo 4 filas)');
      return { pantallas: [], fotos: [] };
    }

    // Procesar las filas desde la fila 4
    const pantallasFromExcel = [];
    
    for (let i = startRowIndex; i < allRows.length; i++) {
      const row = allRows[i];
      
      // Validar que la fila tenga suficientes columnas (necesitamos al menos columna U = índice 20)
      if (!row || row.length < 21) {
        continue; // Saltar filas sin suficientes columnas
      }
      
      // ============================================
      // FILTRO 1 (PRIMERO Y OBLIGATORIO): Columna U (índice 20) debe contener "LED"
      // ============================================
      const columnaU = String(row[20] || '').trim();
      
      // Validar que la columna U tenga contenido
      if (!columnaU || columnaU.length === 0) {
        continue; // Saltar si está vacía
      }
      
      // Validación OBLIGATORIA: debe contener "LED" en cualquier parte del texto (case insensitive)
      const columnaUUpper = columnaU.toUpperCase();
      if (!columnaUUpper.includes('LED')) {
        continue; // Saltar esta fila si no contiene "LED" - ESTE ES EL PRIMER FILTRO
      }
      
      // ============================================
      // FILTRO 2 (SEGUNDO): Columna C (índice 2) debe contener "Alta"
      // ============================================
      const columnaC = String(row[2] || '').trim();
      if (!columnaC || !columnaC.toUpperCase().includes('ALTA')) {
        continue; // Saltar esta fila si no contiene "Alta"
      }
      
      // Extraer datos según las columnas especificadas
      const nombrePantalla = columnaU; // Columna U
      const hostname = String(row[19] || '').trim(); // Columna T (índice 19)
      const resolucion = String(row[12] || '').trim(); // Columna M (índice 12)
      
      // Campos externos (se llenan manualmente)
      const contrato = '';
      const puertoPatch = '';
      const puertoSwitch = '';
      const termicoPantalla = '';
      const termicoPC = '';
      
      pantallasFromExcel.push({
        etiquetaPlano: nombrePantalla,
        hostname: hostname,
        mac: '', // No se importa
        serie: '', // No se importa
        resolucion: resolucion,
        fondo: '', // No se importa
        puertoPatch: puertoPatch,
        puertoSwitch: puertoSwitch,
        contrato: contrato,
        termicoPantalla: termicoPantalla,
        termicoPC: termicoPC,
        horas24: '', // No se importa
      });
    }

    if (pantallasFromExcel.length === 0) {
      alert('No se encontraron pantallas válidas que cumplan los criterios:\n- Columna U contiene "LED"\n- Columna C contiene "Alta"');
      return { pantallas: [], duplicadosEliminados: 0 };
    }

    // Validación final: asegurarse de que todas las pantallas importadas contengan "LED"
    const pantallasValidadas = pantallasFromExcel.filter(pantalla => {
      const nombre = String(pantalla.etiquetaPlano || '').trim().toUpperCase();
      return nombre.includes('LED');
    });

    if (pantallasValidadas.length !== pantallasFromExcel.length) {
      console.warn(`Se filtraron ${pantallasFromExcel.length - pantallasValidadas.length} pantallas que no cumplían el criterio "LED"`);
    }

    // ============================================
    // FILTRO ANTI-DUPLICADOS: Eliminar duplicados por patrón SX
    // ============================================
    const { pantallasUnicas, duplicadosEliminados } = removeDuplicatesBySX(pantallasValidadas);

    // NOTA: Las entradas de fotos se sincronizan automáticamente en FotosPantallasEditor.jsx
    return { 
      pantallas: pantallasUnicas, 
      duplicadosEliminados: duplicadosEliminados.length
    };
  } catch (error) {
    console.error('Error al procesar el Excel:', error);
    alert('Error: ' + error.message);
    return { pantallas: [], duplicadosEliminados: 0 };
  }
};

