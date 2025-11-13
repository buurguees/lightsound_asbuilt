/**
 * Extrae el patrón SX (S1, S2, S3, etc.) de una etiqueta de plano o nombre de archivo
 * Ejemplo: "LED_CIRCLE_0F_ENT_S1" → "S1"
 * Ejemplo: "BSK_16909_FR_DIJON_LA-TOISON-DOR_CIRCLE_S1_FRONTAL" → "S1"
 * Ejemplo: "LED_PILARES_OF_MAN_S1" → "S1" (no "S" de "PILARES")
 * También maneja variaciones como "S01", "S_1", etc.
 * IMPORTANTE: Busca el patrón SX preferiblemente al final o después de un guión bajo/espacio
 */
export const extractSXPattern = (etiquetaPlano) => {
  const nombre = String(etiquetaPlano || '').trim().toUpperCase();
  
  if (!nombre) return null;
  
  // Buscar todos los patrones S seguido de dígitos, con guión bajo o espacio opcional antes
  // Patrón: _S1, S1, _S12, S12, etc.
  const allMatches = [...nombre.matchAll(/(?:[_\s]|^)S(\d+)/g)];
  
  if (allMatches.length === 0) {
    return null;
  }
  
  // Si hay múltiples coincidencias, tomar la última (más probable que sea el SX al final)
  // Ejemplo: "LED_PILARES_OF_MAN_S1" → tomar S1, no la S de "PILARES"
  const lastMatch = allMatches[allMatches.length - 1];
  const sxPattern = `S${lastMatch[1]}`;
  
  // Validar que el patrón extraído tenga sentido (al menos 1 dígito)
  if (lastMatch[1] && lastMatch[1].length > 0) {
    return sxPattern;
  }
  
  return null;
};

/**
 * Elimina duplicados de pantallas basados en el patrón SX
 * Solo mantiene la primera ocurrencia de cada SX único
 * NOTA: Si hay múltiples pantallas con el mismo SX, solo se mantiene la primera
 */
export const removeDuplicatesBySX = (pantallas) => {
  const seenSX = new Set();
  const pantallasUnicas = [];
  const duplicadosEliminados = [];

  console.log(`\n🔍 Aplicando filtro anti-duplicados a ${pantallas.length} pantalla(s)...`);

  for (const pantalla of pantallas) {
    const sxPattern = extractSXPattern(pantalla.etiquetaPlano);
    
    if (sxPattern) {
      // Si ya existe un SX con este patrón, es un duplicado
      if (seenSX.has(sxPattern)) {
        console.log(`   ⚠️ Duplicado detectado: ${pantalla.etiquetaPlano} (SX: ${sxPattern}) - Se elimina`);
        duplicadosEliminados.push({
          etiqueta: pantalla.etiquetaPlano,
          sxPattern: sxPattern
        });
        continue; // Saltar este duplicado
      }
      seenSX.add(sxPattern);
      console.log(`   ✅ Pantalla única: ${pantalla.etiquetaPlano} (SX: ${sxPattern})`);
    } else {
      // Si no se puede extraer SX, mantener la pantalla pero advertir
      console.warn(`   ⚠️ No se pudo extraer SX de: ${pantalla.etiquetaPlano} - Se mantiene sin SX`);
    }
    
    // Agregar la pantalla (ya sea con SX único o sin SX)
    pantallasUnicas.push(pantalla);
  }

  if (duplicadosEliminados.length > 0) {
    console.warn(`\n⚠️ Se eliminaron ${duplicadosEliminados.length} duplicado(s) por patrón SX:`);
    duplicadosEliminados.forEach(dup => {
      console.warn(`   - ${dup.etiqueta} (SX: ${dup.sxPattern})`);
    });
    console.log(`\n✅ Pantallas únicas después del filtro anti-duplicados: ${pantallasUnicas.length}`);
  } else {
    console.log(`\n✅ No se encontraron duplicados. Total de pantallas: ${pantallasUnicas.length}`);
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
    let filasProcesadas = 0;
    let filasConLED = 0;
    let filasConAlta = 0;
    let filasFiltradas = 0;
    
    console.log(`\n📊 Procesando Excel: ${file.name}`);
    console.log(`   Total de filas en el archivo: ${allRows.length}`);
    console.log(`   Leyendo desde la fila ${startRowIndex + 1} (índice ${startRowIndex})`);
    
    for (let i = startRowIndex; i < allRows.length; i++) {
      const row = allRows[i];
      if (!row || row.length === 0) continue;
      
      filasProcesadas++;
      
      // FILTRO 1 (PRIMERO): Columna U (índice 20) debe contener "LED"
      const columnaU = String(row[20] || '').trim();
      if (!columnaU || !columnaU.toUpperCase().includes('LED')) {
        // No es una fila válida, saltar
        continue;
      }
      
      filasConLED++;
      
      // FILTRO 2 (SEGUNDO): Columna C (índice 2) debe contener "Alta"
      const columnaC = String(row[2] || '').trim();
      if (!columnaC || !columnaC.toUpperCase().includes('ALTA')) {
        filasFiltradas++;
        continue; // Saltar esta fila si no contiene "Alta"
      }
      
      filasConAlta++;
      
      console.log(`   ✅ Fila ${i + 1}: VÁLIDA → "${columnaU}" (C: "${columnaC}")`);
      
      // Extraer datos según las columnas especificadas
      const nombrePantalla = columnaU; // Columna U (índice 20)
      const hostname = String(row[19] || '').trim(); // Columna T (índice 19)
      const mac = String(row[18] || '').trim(); // Columna S (índice 18)
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
        mac: mac, // Columna S del Excel
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
    
    console.log(`\n📊 Resumen del procesamiento:`);
    console.log(`   Filas procesadas: ${filasProcesadas}`);
    console.log(`   Filas con "LED" en columna U: ${filasConLED}`);
    console.log(`   Filas con "Alta" en columna C: ${filasConAlta}`);
    console.log(`   Filas filtradas (LED pero no Alta): ${filasFiltradas}`);
    console.log(`   Pantallas válidas encontradas: ${pantallasFromExcel.length}`);

    if (pantallasFromExcel.length === 0) {
      const mensaje = `No se encontraron pantallas válidas que cumplan los criterios:\n- Columna U contiene "LED"\n- Columna C contiene "Alta"\n\nFilas procesadas: ${filasProcesadas}\nFilas con LED: ${filasConLED}\nFilas con Alta: ${filasConAlta}`;
      console.error(mensaje);
      alert(mensaje);
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
    console.log(`\n🔍 Aplicando filtro anti-duplicados...`);
    console.log(`   Pantallas antes del filtro: ${pantallasValidadas.length}`);
    
    const { pantallasUnicas, duplicadosEliminados } = removeDuplicatesBySX(pantallasValidadas);
    
    console.log(`   Pantallas después del filtro: ${pantallasUnicas.length}`);
    console.log(`   Duplicados eliminados: ${duplicadosEliminados.length}`);
    
    if (duplicadosEliminados.length > 0) {
      console.warn(`⚠️ Se eliminaron ${duplicadosEliminados.length} pantalla(s) duplicada(s) por patrón SX`);
    }
    
    // Listar todas las pantallas importadas
    console.log(`\n✅ Pantallas importadas (${pantallasUnicas.length}):`);
    pantallasUnicas.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.etiquetaPlano} (Hostname: ${p.hostname})`);
    });

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

/**
 * Procesa un archivo Excel de banners y extrae datos
 * Reglas:
 * - Archivo DEBE contener "Validación_INTERNA_BANNERS" o "Validacion_INTERNA_BANNERS" en el nombre (obligatorio)
 * - Leer desde la fila 4 (índice 3)
 * - FILTRO 1 (PRIMERO): Columna C (índice 2) "NOMBRE DE LA PANTALLA" debe contener patrón SX (S1, S2, etc.)
 * - FILTRO 2 (SEGUNDO): Columna B (índice 1) "Columna2" debe contener "Alta"
 * - Columnas: Etiqueta de plano (M, índice 12), Modelo (I, índice 8), Resolución (F, índice 5), Tamaño Lineal (G, índice 6)
 */
export const processExcelBanners = async (file) => {
  if (!file) return { banners: [], duplicadosEliminados: 0 };

  try {
    // Validar nombre del archivo - DEBE contener "Validación_INTERNA_BANNERS" o "Validacion_INTERNA_BANNERS"
    const fileName = file.name;
    const fileNameUpper = fileName.toUpperCase();
    
    const tieneValidacionBanners = fileNameUpper.includes('VALIDACION_INTERNA_BANNERS') || 
                                    fileName.includes('Validación_INTERNA_BANNERS') || 
                                    fileName.includes('Validacion_INTERNA_BANNERS');
    
    if (!tieneValidacionBanners) {
      alert(`El archivo "${file.name}" no es válido.\n\nSolo se procesan archivos Excel que contengan "Validación_INTERNA_BANNERS" o "Validacion_INTERNA_BANNERS" en el nombre.`);
      return { banners: [], duplicadosEliminados: 0 };
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
      return { banners: [], duplicadosEliminados: 0 };
    }

    // Leer desde la fila 4 (índice 3)
    const startRowIndex = 3;
    
    if (allRows.length <= startRowIndex) {
      alert('El archivo no tiene suficientes filas (mínimo 4 filas)');
      return { banners: [], duplicadosEliminados: 0 };
    }

    // Procesar las filas desde la fila 4
    const bannersFromExcel = [];
    let filasProcesadas = 0;
    let filasConAlta = 0;
    
    console.log(`\n📊 Procesando Excel de Banners: ${file.name}`);
    console.log(`   Total de filas en el archivo: ${allRows.length}`);
    console.log(`   Leyendo desde la fila ${startRowIndex + 1} (índice ${startRowIndex})`);
    
    for (let i = startRowIndex; i < allRows.length; i++) {
      const row = allRows[i];
      if (!row || row.length === 0) continue;
      
      filasProcesadas++;
      
      // FILTRO: Columna B (índice 1) debe contener "Alta"
      const columnaB = String(row[1] || '').trim();
      if (!columnaB || !columnaB.toUpperCase().includes('ALTA')) {
        continue; // Saltar esta fila si no contiene "Alta"
      }
      
      filasConAlta++;
      
      // Validación INTERNA BANNERS: Etiqueta de plano (M), Modelo (I), Resolución (F), Resolución Lineal (G)
      const etiquetaPlano = String(row[12] || '').trim(); // Columna M (índice 12)
      const modelo = String(row[8] || '').trim(); // Columna I (índice 8)
      const resolucion = String(row[5] || '').trim(); // Columna F (índice 5)
      const resolucionLineal = String(row[6] || '').trim(); // Columna G (índice 6) - Resolución Lineal
      
      bannersFromExcel.push({
        etiquetaPlano: etiquetaPlano,
        modelo: modelo,
        resolucion: resolucion,
        tamanoLineal: resolucionLineal, // Resolución Lineal
        puertoPatch: '',
        puertoSwitch: '',
        contrato: '',
        termicoPantalla: '',
        termicoPC: ''
      });
    }
    
    console.log(`\n📊 Resumen del procesamiento:`);
    console.log(`   Filas procesadas: ${filasProcesadas}`);
    console.log(`   Filas con "Alta" en columna B: ${filasConAlta}`);
    console.log(`   Banners válidos encontrados: ${bannersFromExcel.length}`);

    if (bannersFromExcel.length === 0) {
      const mensaje = `No se encontraron banners válidos que cumplan los criterios:\n- Columna B contiene "Alta"\n\nFilas procesadas: ${filasProcesadas}\nFilas con Alta: ${filasConAlta}`;
      console.error(mensaje);
      alert(mensaje);
      return { banners: [], duplicadosEliminados: 0 };
    }

    // ============================================
    // FILTRO ANTI-DUPLICADOS: Eliminar duplicados por patrón SX
    // ============================================
    console.log(`\n🔍 Aplicando filtro anti-duplicados...`);
    console.log(`   Banners antes del filtro: ${bannersFromExcel.length}`);
    
    const { pantallasUnicas, duplicadosEliminados } = removeDuplicatesBySX(bannersFromExcel);
    
    console.log(`   Banners después del filtro: ${pantallasUnicas.length}`);
    console.log(`   Duplicados eliminados: ${duplicadosEliminados.length}`);
    
    if (duplicadosEliminados.length > 0) {
      console.warn(`⚠️ Se eliminaron ${duplicadosEliminados.length} banner(es) duplicado(s) por patrón SX`);
    }
    
    // Listar todos los banners importados
    console.log(`\n✅ Banners importados (${pantallasUnicas.length}):`);
    pantallasUnicas.forEach((b, idx) => {
      console.log(`   ${idx + 1}. ${b.etiquetaPlano} (Modelo: ${b.modelo}, Resolución: ${b.resolucion})`);
    });

    return { 
      banners: pantallasUnicas, 
      duplicadosEliminados: duplicadosEliminados.length
    };
  } catch (error) {
    console.error('Error al procesar el Excel de Banners:', error);
    alert('Error: ' + error.message);
    return { banners: [], duplicadosEliminados: 0 };
  }
};

/**
 * Procesa un archivo Excel de Turnomatic y extrae datos
 * Reglas:
 * - Archivo DEBE contener "TURNOMATIC" en el nombre (obligatorio)
 * - Leer desde la fila 4 (índice 3)
 * - FILTRO 1 (PRIMERO): Columna C (índice 2) "NOMBRE DE LA PANTALLA" debe contener patrón SX (S1, S2, etc.)
 * - FILTRO 2 (SEGUNDO): Columna B (índice 1) "Columna2" debe contener "Alta"
 * - Columnas: Etiqueta de plano (M, índice 12), Modelo (I, índice 8), Resolución (F, índice 5), Tamaño Lineal (G, índice 6)
 */
export const processExcelTurnomatic = async (file) => {
  if (!file) return { turnomatic: [], duplicadosEliminados: 0 };

  try {
    const fileName = file.name;
    const fileNameUpper = fileName.toUpperCase();
    
    const tieneTurnomatic = fileNameUpper.includes('TURNOMATIC');
    
    if (!tieneTurnomatic) {
      alert(`El archivo "${file.name}" no es válido.\n\nSolo se procesan archivos Excel que contengan "TURNOMATIC" en el nombre.`);
      return { turnomatic: [], duplicadosEliminados: 0 };
    }

    const arrayBuffer = await file.arrayBuffer();
    const XLSXLib = await import('xlsx');
    const workbook = XLSXLib.read(arrayBuffer, { type: 'array', defval: '' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const allRows = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (!allRows || allRows.length === 0) {
      alert('El archivo Excel está vacío');
      return { turnomatic: [], duplicadosEliminados: 0 };
    }

    const startRowIndex = 3;
    
    if (allRows.length <= startRowIndex) {
      alert('El archivo no tiene suficientes filas (mínimo 4 filas)');
      return { turnomatic: [], duplicadosEliminados: 0 };
    }

    const turnomaticFromExcel = [];
    let filasProcesadas = 0;
    let filasConAlta = 0;
    
    console.log(`\n📊 Procesando Excel de Turnomatic: ${file.name}`);
    
    for (let i = startRowIndex; i < allRows.length; i++) {
      const row = allRows[i];
      if (!row || row.length === 0) continue;
      
      filasProcesadas++;
      
      // FILTRO: Columna C (índice 2) debe contener "Alta"
      const columnaC = String(row[2] || '').trim();
      if (!columnaC || !columnaC.toUpperCase().includes('ALTA')) {
        continue;
      }
      
      filasConAlta++;
      
      // Validación TURNOMATIC: Etiqueta de plano (U), Hostname (T), MAC (S)
      const etiquetaPlano = String(row[20] || '').trim(); // Columna U (índice 20)
      const hostname = String(row[19] || '').trim(); // Columna T (índice 19)
      const mac = String(row[18] || '').trim(); // Columna S (índice 18)
      
      // Solo agregar si tiene etiqueta de plano
      if (!etiquetaPlano) {
        continue;
      }
      
      turnomaticFromExcel.push({
        etiquetaPlano: etiquetaPlano,
        hostname: hostname,
        mac: mac,
        puertoPatch: '',
        puertoSwitch: '',
        contrato: '',
        termicoPantalla: '',
        termicoPC: ''
      });
    }
    
    if (turnomaticFromExcel.length === 0) {
      const mensaje = `No se encontraron turnomatic válidos que cumplan los criterios:\n- Columna C contiene "Alta"\n- Columna U contiene etiqueta de plano`;
      console.error(mensaje);
      alert(mensaje);
      return { turnomatic: [], duplicadosEliminados: 0 };
    }

    // No aplicar filtro anti-duplicados para Turnomatic, ya que no se filtra por SX
    const duplicadosEliminados = [];
    
    return { 
      turnomatic: turnomaticFromExcel, 
      duplicadosEliminados: duplicadosEliminados.length
    };
  } catch (error) {
    console.error('Error al procesar el Excel de Turnomatic:', error);
    alert('Error: ' + error.message);
    return { turnomatic: [], duplicadosEliminados: 0 };
  }
};

/**
 * Procesa un archivo Excel de Welcomer y extrae datos
 * Reglas:
 * - Archivo DEBE contener "WELCOMER" en el nombre (obligatorio)
 * - Leer desde la fila 2 (índice 1), la fila 1 es encabezado
 * - Columnas: Etiqueta de plano (A, índice 0), Hostname (B, índice 1), MAC (D, índice 3), Sección (G, índice 6), Nº de Probadores (I, índice 8)
 */
export const processExcelWelcomer = async (file) => {
  if (!file) return { welcomer: [], duplicadosEliminados: 0 };

  try {
    const fileName = file.name;
    const fileNameUpper = fileName.toUpperCase();
    
    const tieneWelcomer = fileNameUpper.includes('WELCOMER');
    
    if (!tieneWelcomer) {
      alert(`El archivo "${file.name}" no es válido.\n\nSolo se procesan archivos Excel que contengan "WELCOMER" en el nombre.`);
      return { welcomer: [], duplicadosEliminados: 0 };
    }

    const arrayBuffer = await file.arrayBuffer();
    const XLSXLib = await import('xlsx');
    const workbook = XLSXLib.read(arrayBuffer, { type: 'array', defval: '' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const allRows = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (!allRows || allRows.length === 0) {
      alert('El archivo Excel está vacío');
      return { welcomer: [], duplicadosEliminados: 0 };
    }

    const startRowIndex = 1; // Fila 2 (índice 1), la fila 1 es encabezado
    
    if (allRows.length <= startRowIndex) {
      alert('El archivo no tiene suficientes filas (mínimo 2 filas)');
      return { welcomer: [], duplicadosEliminados: 0 };
    }

    const welcomerFromExcel = [];
    let filasProcesadas = 0;
    
    console.log(`\n📊 Procesando Excel de Welcomer: ${file.name}`);
    
    for (let i = startRowIndex; i < allRows.length; i++) {
      const row = allRows[i];
      if (!row || row.length === 0) continue;
      
      filasProcesadas++;
      
      // Validación WELCOMER: Etiqueta de plano (A), Hostname (B), MAC (D), Sección (G), Nº de Probadores (I)
      const etiquetaPlano = String(row[0] || '').trim(); // Columna A (índice 0)
      const hostname = String(row[1] || '').trim(); // Columna B (índice 1)
      const mac = String(row[3] || '').trim(); // Columna D (índice 3)
      const seccion = String(row[6] || '').trim(); // Columna G (índice 6)
      const numProbadores = String(row[8] || '').trim(); // Columna I (índice 8)
      
      // Si no hay etiqueta de plano, no se muestra
      if (!etiquetaPlano) {
        continue;
      }
      
      welcomerFromExcel.push({
        etiquetaPlano: etiquetaPlano,
        hostname: hostname,
        mac: mac,
        seccion: seccion,
        numProbadores: numProbadores,
        puertoPatch: '',
        puertoSwitch: '',
        contrato: '',
        termicoPantalla: '',
        termicoPC: ''
      });
    }
    
    if (welcomerFromExcel.length === 0) {
      // No mostrar alerta si no hay welcomer, simplemente retornar vacío
      console.log('No se encontraron welcomer con etiquetas de plano');
      return { welcomer: [], duplicadosEliminados: 0 };
    }

    // No aplicar filtro anti-duplicados para Welcomer
    const duplicadosEliminados = [];
    
    return { 
      welcomer: welcomerFromExcel, 
      duplicadosEliminados: duplicadosEliminados.length
    };
  } catch (error) {
    console.error('Error al procesar el Excel de Welcomer:', error);
    alert('Error: ' + error.message);
    return { welcomer: [], duplicadosEliminados: 0 };
  }
};

/**
 * Procesa un archivo Excel de probadores y extrae la tabla completa
 * Reglas:
 * - Archivo DEBE contener "PROBADORES" en el nombre (obligatorio)
 * - Leer desde la fila 1 (índice 0) - tabla completa sin filtros
 * - Importar todas las filas tal como se muestran en el Excel
 */
export const processExcelProbadores = async (file) => {
  if (!file) return { tabla: [] };

  try {
    // Validar nombre del archivo - DEBE contener "PROBADORES"
    const fileName = file.name;
    const fileNameUpper = fileName.toUpperCase();
    
    const tieneProbadores = fileNameUpper.includes('PROBADORES');
    
    if (!tieneProbadores) {
      alert(`El archivo "${file.name}" no es válido.\n\nSolo se procesan archivos Excel que contengan "PROBADORES" en el nombre.`);
      return { tabla: [], encabezados: [] };
    }

    const arrayBuffer = await file.arrayBuffer();
    const XLSXLib = await import('xlsx');
    const workbook = XLSXLib.read(arrayBuffer, { type: 'array', defval: '' });
    
    // Buscar la hoja "MASTER" (case-insensitive)
    const masterSheetName = workbook.SheetNames.find(name => 
      name.toUpperCase().trim() === 'MASTER'
    );
    
    if (!masterSheetName) {
      alert(`El archivo "${file.name}" no contiene una hoja llamada "MASTER".\n\nHojas disponibles: ${workbook.SheetNames.join(', ')}`);
      return { tabla: [], encabezados: [] };
    }
    
    console.log(`📋 Hoja encontrada: "${masterSheetName}"`);
    const worksheet = workbook.Sheets[masterSheetName];
    
    // Obtener todas las filas como arrays
    const allRows = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (!allRows || allRows.length === 0) {
      alert('El archivo Excel está vacío');
      return { tabla: [], encabezados: [] };
    }

    // Los encabezados están en la fila 3 (índice 2)
    // Fila 1: "MASTERS PROVISION"
    // Fila 2: "Tablet"
    // Fila 3: Encabezados reales (Tablet, Master, MAC, Master Location, etc.)
    const headerRowIndex = 2;
    const encabezadosCompletos = allRows[headerRowIndex];
    
    if (!encabezadosCompletos || encabezadosCompletos.length === 0) {
      alert('No se encontraron encabezados en la fila 3');
      return { tabla: [], encabezados: [] };
    }

    // Eliminar columnas "Tablet" (índice 0), 7 (índice 6), y 8 (índice 7)
    const indicesAEliminar = [0, 6, 7]; // Tablet, columna 7, columna 8
    const encabezados = encabezadosCompletos
      .map((enc, idx) => ({ enc, idx }))
      .filter((_, idx) => !indicesAEliminar.includes(idx))
      .map(({ enc }) => String(enc || '').trim());

    console.log(`📋 Encabezados (después de eliminar columnas):`, encabezados);

    // Los datos empiezan desde la fila 4 (índice 3)
    const startDataRowIndex = headerRowIndex + 1;
    const tablaProbadores = [];

    for (let i = startDataRowIndex; i < allRows.length; i++) {
      const row = allRows[i];
      if (!row || row.length === 0) continue;

      // Filtrar por "Fitting" en la columna G (Master Service, índice 5)
      const columnaG = String(row[5] || '').trim();
      if (!columnaG.toUpperCase().includes('FITTING')) {
        continue; // Saltar esta fila si no contiene "Fitting"
      }

      // Eliminar las columnas especificadas (Tablet, 7, 8)
      const filaFiltrada = row
        .map((cell, idx) => ({ cell, idx }))
        .filter((_, idx) => !indicesAEliminar.includes(idx))
        .map(({ cell }) => String(cell || '').trim());

      if (filaFiltrada.length === encabezados.length) {
        // Crear un objeto con los encabezados como claves
        const filaObjeto = {};
        encabezados.forEach((encabezado, idx) => {
          filaObjeto[encabezado] = filaFiltrada[idx] || '';
        });
        // También guardar _rowData para compatibilidad
        filaObjeto._rowData = filaFiltrada;
        tablaProbadores.push(filaObjeto);
      }
    }

    console.log(`✅ Filas importadas: ${tablaProbadores.length}`);

    return { tabla: tablaProbadores, encabezados: encabezados };
  } catch (error) {
    console.error('Error al procesar el Excel de probadores:', error);
    alert('Error: ' + error.message);
    return { tabla: [], encabezados: [] };
  }
};
