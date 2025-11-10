import { useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';
import { processExcelProbadores } from '../../utils/excelUtils';

export const ProbadoresEditor = ({ data, setData, imageInputRefs, probadorFilesFromFolder, probadorExcelFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());
  const processedExcelFilesRef = useRef(new Set());

  // Procesar archivos de probadores recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!probadorFilesFromFolder || probadorFilesFromFolder.length === 0) {
      return;
    }

    // Resetear archivos procesados cuando cambian los archivos
    processedFilesRef.current.clear();

    const processProbadorFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${probadorFilesFromFolder.length} archivo(s) de probadores...`);
      
      const c = structuredClone(data);
      let fotosProcesadas = 0;

      for (const file of probadorFilesFromFolder) {
        const fileName = file.name.toUpperCase();
        console.log(`\n📷 Procesando archivo: ${file.name}`);
        console.log(`   Nombre normalizado: ${fileName}`);
        
        // Determinar tipo de foto según el contenido del nombre del archivo
        let tipoFoto = null;
        let tipoNombre = '';
        
        // Detectar PROBADORES_GENERAL → pasilloProbadores
        if (fileName.includes('PROBADORES_GENERAL')) {
          tipoFoto = 'pasilloProbadores';
          tipoNombre = 'PASILLO PROBADORES';
        } 
        // Detectar DEVICE_SENSOR → probadorLiberado (Sensor Instalado)
        else if (fileName.includes('DEVICE_SENSOR')) {
          tipoFoto = 'probadorLiberado';
          tipoNombre = 'SENSOR INSTALADO';
        } 
        // Detectar CABINA_OCUPADA → probadorOcupado
        else if (fileName.includes('CABINA_OCUPADA')) {
          tipoFoto = 'probadorOcupado';
          tipoNombre = 'PROBADOR OCUPADO';
        }
        
        if (tipoFoto) {
          // Solo actualizar si la foto no está ya asignada
          if (!c.probadores[tipoFoto]?.url) {
            try {
              console.log(`  📤 Importando imagen al bloque "${tipoNombre}":`);
              console.log(`     Archivo: ${file.name}`);
              const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
              c.probadores[tipoFoto] = {
                url: base64,
                fileName: file.name,
                fileSize: file.size
              };
              fotosProcesadas++;
              console.log(`  ✅ ✓ Imagen importada correctamente en el bloque "${tipoNombre}"`);
            } catch (error) {
              console.error(`  ❌ Error procesando ${file.name}:`, error);
            }
          } else {
            console.log(`  ⏭️  ${tipoNombre} ya está asignada, se omite`);
          }
        } else {
          console.log(`  ❌ No se pudo determinar el tipo de foto para: ${file.name}`);
          console.log(`     Buscando: "PROBADORES_GENERAL", "DEVICE_SENSOR", o "CABINA_OCUPADA" en el nombre`);
        }
      }
      
      console.log(`\n✅ Proceso completado: ${fotosProcesadas} foto(s) asignada(s)`);

      // Actualizar el estado con todas las fotos procesadas
      if (fotosProcesadas > 0) {
        // Activar automáticamente la sección si hay imágenes
        c.secciones.probadores = true;
        c.probadores.activo = true;
        setData(c);
      }
    };

    processProbadorFiles();
  }, [probadorFilesFromFolder, data, setData]);

  // Procesar archivos Excel de probadores recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!probadorExcelFilesFromFolder || probadorExcelFilesFromFolder.length === 0) {
      return;
    }

    const processExcelFiles = async () => {
      let todasTablas = [];
      let encabezados = [];
      let archivosProcesados = 0;

      for (const file of probadorExcelFilesFromFolder) {
        // Evitar procesar el mismo archivo dos veces
        const fileKey = `${file.name}_${file.size}`;
        if (processedExcelFilesRef.current.has(fileKey)) {
          console.log(`Archivo Excel ya procesado: ${file.name}`);
          continue;
        }

        try {
          console.log('Procesando archivo Excel de probadores desde carpeta:', file.name);
          const { tabla, encabezados: enc } = await processExcelProbadores(file);
          
          if (tabla.length > 0) {
            todasTablas = todasTablas.concat(tabla);
            if (enc.length > 0 && encabezados.length === 0) {
              encabezados = enc; // Usar los encabezados del primer archivo
            }
            
            archivosProcesados++;
            processedExcelFilesRef.current.add(fileKey);
          }
        } catch (error) {
          console.error(`Error procesando archivo Excel ${file.name}:`, error);
        }
      }

      if (todasTablas.length > 0) {
        setData((d) => {
          const c = structuredClone(d);
          c.probadores.tablaProbadores = todasTablas;
          c.probadores.encabezados = encabezados;
          
          // Activar automáticamente la sección si hay datos
          c.secciones.probadores = true;
          c.probadores.activo = true;
          return c;
        });

        if (archivosProcesados > 0) {
          let mensaje = `✅ Se procesaron ${archivosProcesados} archivo(s) Excel de probadores desde la carpeta\n`;
          if (todasTablas.length > 0) {
            mensaje += `✅ Se importaron ${todasTablas.length} fila(s) de la tabla (solo filas con "Fitting" en Master Service)`;
          }
          alert(mensaje);
        }
      }
    };

    processExcelFiles();
  }, [probadorExcelFilesFromFolder, setData]);

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Probadores</h2>

      {/* Imágenes de probadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Probador Ocupado */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-neutral-700 mb-2">PROBADOR OCUPADO</h3>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['probadorOcupado']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['probadorOcupado'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.probadorOcupado = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.probadorOcupado?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.probadorOcupado = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.probadorOcupado?.url && (
            <div>
              <img loading="lazy" src={data.probadores.probadorOcupado.url} alt="Probador ocupado" className="max-h-32 w-full object-contain rounded border" />
              <small className="text-neutral-600 mt-1 block">{data.probadores.probadorOcupado.fileName}</small>
            </div>
          )}
        </div>

        {/* Sensor Instalado */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-neutral-700 mb-2">SENSOR INSTALADO</h3>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['probadorLiberado']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['probadorLiberado'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.probadorLiberado = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.probadorLiberado?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.probadorLiberado = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.probadorLiberado?.url && (
            <div>
              <img loading="lazy" src={data.probadores.probadorLiberado.url} alt="Probador liberado" className="max-h-32 w-full object-contain rounded border" />
              <small className="text-neutral-600 mt-1 block">{data.probadores.probadorLiberado.fileName}</small>
            </div>
          )}
        </div>

        {/* Pasillo Probadores */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-neutral-700 mb-2">PASILLO PROBADORES</h3>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['pasilloProbadores']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['pasilloProbadores'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.pasilloProbadores = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.pasilloProbadores?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.pasilloProbadores = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.pasilloProbadores?.url && (
            <div>
              <img loading="lazy" src={data.probadores.pasilloProbadores.url} alt="Pasillo probadores" className="max-h-32 w-full object-contain rounded border" />
              <small className="text-neutral-600 mt-1 block">{data.probadores.pasilloProbadores.fileName}</small>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de probadores importada del Excel */}
      {data.probadores.tablaProbadores && data.probadores.tablaProbadores.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-neutral-700 mb-2">Tabla de Probadores</h3>
          <div className="overflow-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-100 text-[11px]">
                  {data.probadores.encabezados && data.probadores.encabezados.length > 0 ? (
                    data.probadores.encabezados.map((h, i) => (
                      <th key={i} className="border px-2 py-1 text-left font-semibold">{h || `Columna ${i + 1}`}</th>
                    ))
                  ) : (
                    data.probadores.tablaProbadores[0]?._rowData?.map((_, i) => (
                      <th key={i} className="border px-2 py-1 text-left font-semibold">Columna {i + 1}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {data.probadores.tablaProbadores.map((fila, i) => (
                  <tr key={i} className="odd:bg-white even:bg-neutral-50">
                    {fila._rowData ? (
                      fila._rowData.map((cell, j) => (
                        <td key={j} className="border px-2 py-1">{cell}</td>
                      ))
                    ) : (
                      data.probadores.encabezados?.map((header, j) => (
                        <td key={j} className="border px-2 py-1">{fila[header] || ''}</td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

