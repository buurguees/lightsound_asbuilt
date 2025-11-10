import React, { useEffect, useRef } from 'react';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { processExcelTurnomatic } from '../../utils/excelUtils';
import { FotosTurnomaticEditor } from './FotosTurnomaticEditor';

export const TurnomaticEditor = ({ data, setData, imageInputRefs, turnomaticExcelFilesFromFolder, fotoTurnomaticFilesFromFolder }) => {
  const lastImportedFileRef = useRef(null);
  const processedFilesRef = useRef(new Set());

  // Procesar archivos Excel recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!turnomaticExcelFilesFromFolder || turnomaticExcelFilesFromFolder.length === 0) return;
    
    if (data.turnomatic && data.turnomatic.length > 0) {
      console.log('⚠️ Ya hay turnomatic importados. No se volverá a procesar el Excel automáticamente.');
      return;
    }

    const processExcelFiles = async () => {
      let todosTurnomatic = [];
      let archivosProcesados = 0;

      for (const file of turnomaticExcelFilesFromFolder) {
        const fileKey = `${file.name}_${file.size}`;
        if (processedFilesRef.current.has(fileKey)) {
          continue;
        }

        try {
          const { turnomatic } = await processExcelTurnomatic(file);
          
          if (turnomatic.length > 0) {
            todosTurnomatic = todosTurnomatic.concat(turnomatic);
            archivosProcesados++;
            processedFilesRef.current.add(fileKey);
          }
        } catch (error) {
          console.error(`Error procesando archivo Excel ${file.name}:`, error);
        }
      }

      if (todosTurnomatic.length > 0) {
        setData((d) => ({
          ...d,
          turnomatic: todosTurnomatic
        }));

        if (archivosProcesados > 0) {
          let mensaje = `✅ Se procesaron ${archivosProcesados} archivo(s) Excel desde la carpeta\n`;
          mensaje += `✅ Se importaron ${todosTurnomatic.length} turnomatic\n`;
          mensaje += `📸 Las entradas de fotos se sincronizarán automáticamente`;
          
          console.log(mensaje);
          alert(mensaje);
        }
      }
    };

    processExcelFiles();
  }, [turnomaticExcelFilesFromFolder, setData, data.turnomatic]);

  const handleExcelUpload = async (file) => {
    if (lastImportedFileRef.current === file.name) {
      alert(`⚠️ Este archivo ya fue importado: "${file.name}"`);
      return;
    }

    const { turnomatic, duplicadosEliminados } = await processExcelTurnomatic(file);
    
    if (turnomatic.length > 0) {
      if (duplicadosEliminados > 0) {
        alert(`⚠️ Se eliminaron ${duplicadosEliminados} turnomatic duplicado(s) por patrón SX`);
      }

      lastImportedFileRef.current = file.name;

      setData((d) => ({
        ...d,
        turnomatic: turnomatic
      }));
      
      if (turnomatic.length > 0) {
        alert(`✅ Se han cargado ${turnomatic.length} turnomatic correctamente\n\nLas entradas de fotos se sincronizarán automáticamente`);
      }
    }
  };

  return (
    <div>
      <FotosTurnomaticEditor 
        data={data} 
        setData={setData} 
        imageInputRefs={imageInputRefs}
        fotoTurnomaticFilesFromFolder={fotoTurnomaticFilesFromFolder}
      />
      
      <h2 className="font-semibold text-neutral-800 mb-4">Turnomatic</h2>
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">Cargar desde Excel</h3>
            <p className="text-blue-700">Sube el archivo Excel con terminación "TURNOMATIC"</p>
            <small className="text-blue-600 mt-1 block">Se importarán solo las filas con Columna C que contenga "Alta"</small>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => imageInputRefs.current['turnomatic_excel']?.click()}>
              Cargar Excel
            </Button>
            <input
              ref={el => imageInputRefs.current['turnomatic_excel'] = el}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await handleExcelUpload(file);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-neutral-700 mb-2">Información de los Turnomatic</h3>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-100 text-[11px]">
                {[
                  "Etiqueta de plano", "Hostname", "MAC", ""
                ].map((h) => (
                  <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.turnomatic?.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-neutral-50">
                  <td className="border px-1 py-1">
                    <Input
                      value={r.etiquetaPlano || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          if (!c.turnomatic[i]) c.turnomatic[i] = {};
                          c.turnomatic[i].etiquetaPlano = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.hostname || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          if (!c.turnomatic[i]) c.turnomatic[i] = {};
                          c.turnomatic[i].hostname = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.mac || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          if (!c.turnomatic[i]) c.turnomatic[i] = {};
                          c.turnomatic[i].mac = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1 text-right">
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.turnomatic.splice(i, 1);
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
    </div>
  );
};

