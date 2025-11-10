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
      filasProcesadas++;
      
      // Validar que la fila tenga suficientes columnas (necesitamos al menos columna U = índice 20)
      if (!row || row.length < 21) {
        console.log(`   Fila ${i + 1}: Insuficientes columnas (${row?.length || 0} columnas, se necesitan al menos 21)`);
        continue; // Saltar filas sin suficientes columnas
      }
      
      // ============================================
      // FILTRO 1 (PRIMERO Y OBLIGATORIO): Columna U (índice 20) debe contener "LED"
      // ============================================
      const columnaU = String(row[20] || '').trim();
      
      // Validar que la columna U tenga contenido
      if (!columnaU || columnaU.length === 0) {
        console.log(`   Fila ${i + 1}: Columna U vacía`);
        continue; // Saltar si está vacía
      }
      
      // Validación OBLIGATORIA: debe contener "LED" en cualquier parte del texto (case insensitive)
      const columnaUUpper = columnaU.toUpperCase();
      if (!columnaUUpper.includes('LED')) {
        console.log(`   Fila ${i + 1}: Columna U no contiene "LED" → "${columnaU}"`);
        continue; // Saltar esta fila si no contiene "LED" - ESTE ES EL PRIMER FILTRO
      }
      
      filasConLED++;
      
      // ============================================
      // FILTRO 2 (SEGUNDO): Columna C (índice 2) debe contener "Alta"
      // ============================================
      const columnaC = String(row[2] || '').trim();
      if (!columnaC || !columnaC.toUpperCase().includes('ALTA')) {
        console.log(`   Fila ${i + 1}: Columna C no contiene "Alta" → "${columnaC}" (Columna U: "${columnaU}")`);
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
      return { tabla: [] };
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
      return { tabla: [] };
    }
    
    console.log(`📋 Hoja encontrada: "${masterSheetName}"`);
    const worksheet = workbook.Sheets[masterSheetName];
    
    // Obtener todas las filas como arrays
    const allRows = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (!allRows || allRows.length === 0) {
      alert('El archivo Excel está vacío');
      return { tabla: [] };
    }

    // Procesar todas las filas desde la primera (índice 0)
    const tablaProbadores = [];
    
    console.log(`\n📊 Procesando Excel de Probadores: ${file.name}`);
    console.log(`   Total de filas en el archivo: ${allRows.length}`);
    console.log(`   Importando tabla completa desde la fila 1`);
    
    // La primera fila son los encabezados
    const encabezados = allRows[0] || [];
    
    // Procesar todas las filas de datos (desde la fila 2, índice 1)
    for (let i = 1; i < allRows.length; i++) {
      const row = allRows[i];
      
      // Si la fila está completamente vacía, saltarla
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        continue;
      }
      
      // Crear un objeto con los datos de la fila
      // Usar los encabezados como claves si están disponibles
      const filaData = {};
      
      if (encabezados.length > 0) {
        // Si hay encabezados, crear objeto con claves
        encabezados.forEach((header, idx) => {
          const key = String(header || `Columna${idx + 1}`).trim();
          filaData[key] = String(row[idx] || '').trim();
        });
      } else {
        // Si no hay encabezados, usar índices de columna
        row.forEach((cell, idx) => {
          filaData[`Columna${idx + 1}`] = String(cell || '').trim();
        });
      }
      
      // También guardar la fila como array para mantener el orden
      filaData._rowData = row.map(cell => String(cell || '').trim());
      
      tablaProbadores.push(filaData);
    }
    
    console.log(`\n📊 Resumen del procesamiento:`);
    console.log(`   Filas procesadas: ${tablaProbadores.length}`);
    console.log(`   Columnas detectadas: ${encabezados.length || (tablaProbadores[0]?._rowData?.length || 0)}`);

    if (tablaProbadores.length === 0) {
      const mensaje = `No se encontraron datos en el archivo Excel.\n\nFilas procesadas: ${allRows.length - 1}`;
      console.error(mensaje);
      alert(mensaje);
      return { tabla: [] };
    }

    // Listar las primeras filas importadas
    console.log(`\n✅ Tabla de probadores importada (${tablaProbadores.length} filas):`);
    tablaProbadores.slice(0, 5).forEach((fila, idx) => {
      console.log(`   Fila ${idx + 1}:`, fila._rowData || Object.values(fila));
    });
    if (tablaProbadores.length > 5) {
      console.log(`   ... y ${tablaProbadores.length - 5} filas más`);
    }

    return { 
      tabla: tablaProbadores,
      encabezados: encabezados.map(h => String(h || '').trim())
    };
  } catch (error) {
    console.error('Error al procesar el Excel de probadores:', error);
    alert('Error: ' + error.message);
    return { tabla: [] };
  }
};

