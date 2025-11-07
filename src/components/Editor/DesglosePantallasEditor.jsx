import React, { useRef } from 'react';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { processExcelPantallas } from '../../utils/excelUtils';

export const DesglosePantallasEditor = ({ data, setData, imageInputRefs }) => {
  const lastImportedFileRef = useRef(null);

  /**
   * Extrae el patrón SX (S1, S2, S3, etc.) de una etiqueta de plano
   * Ejemplo: "LED_CIRCLE_0F_ENT_S1" → "S1"
   */
  const extractSXPattern = (etiquetaPlano) => {
    const nombre = String(etiquetaPlano || '').trim().toUpperCase();
    // Buscar patrón S seguido de uno o más dígitos
    const match = nombre.match(/S(\d+)/);
    return match ? match[0] : null; // Retorna "S1", "S2", etc. o null
  };

  /**
   * Elimina duplicados basados en el patrón SX
   * Solo mantiene la primera ocurrencia de cada SX único
   */
  const removeDuplicatesBySX = (pantallas) => {
    const seenSX = new Set();
    const pantallasUnicas = [];
    const duplicadosEliminados = [];

    for (const pantalla of pantallas) {
      const sxPattern = extractSXPattern(pantalla.etiquetaPlano);
      
      if (sxPattern) {
        // Si ya existe un SX con este patrón, es un duplicado
        if (seenSX.has(sxPattern)) {
          duplicadosEliminados.push(pantalla.etiquetaPlano);
          continue; // Saltar este duplicado
        }
        seenSX.add(sxPattern);
      }
      
      pantallasUnicas.push(pantalla);
    }

    if (duplicadosEliminados.length > 0) {
      console.warn(`Se eliminaron ${duplicadosEliminados.length} duplicados por patrón SX:`, duplicadosEliminados);
    }

    return { pantallasUnicas, duplicadosEliminados };
  };

  const handleExcelUpload = async (file) => {
    // FILTRO DE SEGURIDAD: Evitar doble importación del mismo archivo
    if (lastImportedFileRef.current === file.name) {
      alert(`⚠️ Este archivo ya fue importado: "${file.name}"\n\nPara importar un archivo diferente, selecciona otro archivo Excel.`);
      return;
    }

    const { pantallas, fotos } = await processExcelPantallas(file);
    
    if (pantallas.length > 0) {
      // Validación adicional: asegurarse de que todas las pantallas contengan "LED"
      const pantallasFiltradas = pantallas.filter(p => {
        const nombre = String(p.etiquetaPlano || '').trim().toUpperCase();
        return nombre.includes('LED');
      });

      if (pantallasFiltradas.length !== pantallas.length) {
        console.warn(`Se filtraron ${pantallas.length - pantallasFiltradas.length} pantallas que no cumplían el criterio "LED"`);
        alert(`⚠️ Se importaron ${pantallasFiltradas.length} pantallas válidas (se filtraron ${pantallas.length - pantallasFiltradas.length} que no cumplían los criterios)`);
      }

      // FILTRO ANTI-DUPLICADOS: Eliminar duplicados por patrón SX
      const { pantallasUnicas, duplicadosEliminados } = removeDuplicatesBySX(pantallasFiltradas);

      if (duplicadosEliminados.length > 0) {
        alert(`⚠️ Se eliminaron ${duplicadosEliminados.length} pantalla(s) duplicada(s) por patrón SX (S1, S2, etc.)\n\nSolo se mantiene una entrada por cada número SX único.`);
      }

      // Crear fotos solo para las pantallas únicas
      const fotosFiltradas = pantallasUnicas.map((pantalla) => ({
        etiquetaPlano: pantalla.etiquetaPlano,
        fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
        fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
        fotoIP: { url: "", fileName: undefined, fileSize: undefined },
        nota: ""
      }));

      // Marcar este archivo como importado
      lastImportedFileRef.current = file.name;

      setData((d) => ({
        ...d,
        pantallas: pantallasUnicas, // Reemplazar completamente, no combinar
        fotos: fotosFiltradas
      }));
      
      if (pantallasUnicas.length > 0) {
        alert(`✅ Se han cargado ${pantallasUnicas.length} pantallas correctamente\n\nSe han creado ${fotosFiltradas.length} entradas de fotos`);
      }
    }
  };

  return (
    <Card title="Desglose de pantallas">
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800 mb-1">Cargar desde Excel</p>
            <p className="text-xs text-blue-700">Sube el archivo Excel con terminación "Validación_MKD" o "Validacion_MKD"</p>
            <p className="text-xs text-blue-600 mt-1">Se importarán solo las filas con Columna U que contenga "LED" y Columna C que contenga "Alta"</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => imageInputRefs.current['excel']?.click()}>
              📊 Cargar Excel
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
        <h3 className="text-sm font-semibold text-neutral-700 mb-2">Datos importados del Excel</h3>
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
        <h3 className="text-sm font-semibold text-neutral-700 mb-2">Datos manuales</h3>
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
    </Card>
  );
};

