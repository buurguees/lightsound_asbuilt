import React, { useRef, useEffect } from 'react';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { processExcelPantallas, removeDuplicatesBySX } from '../../utils/excelUtils';

export const DesglosePantallasEditor = ({ data, setData, imageInputRefs, excelFilesFromFolder }) => {
  const lastImportedFileRef = useRef(null);
  const processedFilesRef = useRef(new Set());

  const handleExcelUpload = async (file) => {
    // FILTRO DE SEGURIDAD: Evitar doble importación del mismo archivo
    if (lastImportedFileRef.current === file.name) {
      alert(`⚠️ Este archivo ya fue importado: "${file.name}"\n\nPara importar un archivo diferente, selecciona otro archivo Excel.`);
      return;
    }

    const { pantallas, duplicadosEliminados } = await processExcelPantallas(file);
    
    if (pantallas.length > 0) {
      // El filtro anti-duplicados ya se aplicó en processExcelPantallas
      if (duplicadosEliminados > 0) {
        alert(`⚠️ Se eliminaron ${duplicadosEliminados} pantalla(s) duplicada(s) por patrón SX (S1, S2, etc.)\n\nSolo se mantiene una entrada por cada número SX único.`);
      }

      // Marcar este archivo como importado
      lastImportedFileRef.current = file.name;

      setData((d) => ({
        ...d,
        pantallas: pantallas // Ya están filtradas y sin duplicados
        // NOTA: Las fotos se sincronizan automáticamente en FotosPantallasEditor.jsx
      }));
      
      if (pantallas.length > 0) {
        alert(`✅ Se han cargado ${pantallas.length} pantallas correctamente\n\nLas entradas de fotos se sincronizarán automáticamente`);
      }
    }
  };

  // Procesar archivos Excel recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!excelFilesFromFolder || excelFilesFromFolder.length === 0) return;

    const processExcelFiles = async () => {
      let todasPantallas = [];
      let totalDuplicados = 0;
      let archivosProcesados = 0;

      for (const file of excelFilesFromFolder) {
        // Evitar procesar el mismo archivo dos veces
        const fileKey = `${file.name}_${file.size}`;
        if (processedFilesRef.current.has(fileKey)) {
          console.log(`Archivo ya procesado: ${file.name}`);
          continue;
        }

        try {
          console.log('Procesando archivo Excel desde carpeta:', file.name);
          const { pantallas, duplicadosEliminados } = await processExcelPantallas(file);
          
          if (pantallas.length > 0) {
            todasPantallas = todasPantallas.concat(pantallas);
            totalDuplicados += duplicadosEliminados;
            archivosProcesados++;
            processedFilesRef.current.add(fileKey);
          }
        } catch (error) {
          console.error(`Error procesando archivo Excel ${file.name}:`, error);
        }
      }

      // Aplicar filtro anti-duplicados después de concatenar todos los archivos
      if (todasPantallas.length > 0) {
        const { pantallasUnicas, duplicadosEliminados: duplicadosAdicionales } = removeDuplicatesBySX(todasPantallas);
        totalDuplicados += duplicadosAdicionales;

        setData((d) => ({
          ...d,
          pantallas: pantallasUnicas
          // NOTA: Las fotos se sincronizan automáticamente en FotosPantallasEditor.jsx
        }));

        if (archivosProcesados > 0) {
          let mensaje = `✅ Se procesaron ${archivosProcesados} archivo(s) Excel desde la carpeta\n`;
          mensaje += `✅ Se importaron ${pantallasUnicas.length} pantalla(s) únicas\n`;
          mensaje += `📸 Las entradas de fotos se sincronizarán automáticamente`;
          if (totalDuplicados > 0) {
            mensaje += `\n⚠️ Se eliminaron ${totalDuplicados} pantalla(s) duplicada(s) por patrón SX`;
          }
          alert(mensaje);
        }
      }
    };

    processExcelFiles();
  }, [excelFilesFromFolder, setData]);

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Desglose de pantallas</h2>
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">Cargar desde Excel</h3>
            <p className="text-blue-700">Sube el archivo Excel con terminación "Validación_MKD" o "Validacion_MKD"</p>
            <small className="text-blue-600 mt-1 block">Se importarán solo las filas con Columna U que contenga "LED" y Columna C que contenga "Alta"</small>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => imageInputRefs.current['excel']?.click()}>
              Cargar Excel
            </Button>
            <input
              ref={el => imageInputRefs.current['excel'] = el}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await handleExcelUpload(file);
                  // Resetear el input para permitir seleccionar el mismo archivo de nuevo si es necesario
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
      {/* Tabla 1: Datos importados del Excel */}
      <div className="mb-4">
        <h3 className="font-semibold text-neutral-700 mb-2">Datos importados del Excel</h3>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-100 text-[11px]">
                {[
                  "Nombre de pantalla", "Hostname", "Resolución", ""
                ].map((h) => (
                  <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.pantallas.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-neutral-50">
                  <td className="border px-1 py-1">
                    <Input
                      value={r.etiquetaPlano}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.pantallas[i].etiquetaPlano = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.hostname}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.pantallas[i].hostname = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.resolucion}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.pantallas[i].resolucion = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1 text-right">
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.pantallas.splice(i, 1);
                        return c;
                      });
                    }}>
                      Borrar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla 2: Datos manuales */}
      <div>
        <h3 className="font-semibold text-neutral-700 mb-2">Datos manuales</h3>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-100 text-[11px]">
                {[
                  "Etiqueta de plano", "Puerto patch", "Puerto switch", "Contrato", "Térmico pantalla", "Térmico PC"
                ].map((h) => (
                  <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.pantallas.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-neutral-50">
                  <td className="border px-1 py-1">
                    <Input
                      value={r.etiquetaPlano}
                      disabled
                      className="bg-neutral-100 cursor-not-allowed"
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.puertoPatch}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.pantallas[i].puertoPatch = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.puertoSwitch}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.pantallas[i].puertoSwitch = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.contrato}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.pantallas[i].contrato = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.termicoPantalla}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.pantallas[i].termicoPantalla = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.termicoPC}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.pantallas[i].termicoPC = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

