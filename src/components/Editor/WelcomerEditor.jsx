import React, { useEffect, useRef } from 'react';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { processExcelWelcomer } from '../../utils/excelUtils';
import { FotosWelcomerEditor } from './FotosWelcomerEditor';

export const WelcomerEditor = ({ data, setData, imageInputRefs, welcomerExcelFilesFromFolder, fotoWelcomerFilesFromFolder }) => {
  const lastImportedFileRef = useRef(null);
  const processedFilesRef = useRef(new Set());

  useEffect(() => {
    if (!welcomerExcelFilesFromFolder || welcomerExcelFilesFromFolder.length === 0) return;
    
    if (data.welcomer && data.welcomer.length > 0) {
      console.log('⚠️ Ya hay welcomer importados. No se volverá a procesar el Excel automáticamente.');
      return;
    }

    const processExcelFiles = async () => {
      let todosWelcomer = [];
      let archivosProcesados = 0;

      for (const file of welcomerExcelFilesFromFolder) {
        const fileKey = `${file.name}_${file.size}`;
        if (processedFilesRef.current.has(fileKey)) {
          continue;
        }

        try {
          const { welcomer } = await processExcelWelcomer(file);
          
          if (welcomer.length > 0) {
            todosWelcomer = todosWelcomer.concat(welcomer);
            archivosProcesados++;
            processedFilesRef.current.add(fileKey);
          }
        } catch (error) {
          console.error(`Error procesando archivo Excel ${file.name}:`, error);
        }
      }

      if (todosWelcomer.length > 0) {
        setData((d) => ({
          ...d,
          welcomer: todosWelcomer
        }));

        if (archivosProcesados > 0) {
          let mensaje = `✅ Se procesaron ${archivosProcesados} archivo(s) Excel desde la carpeta\n`;
          mensaje += `✅ Se importaron ${todosWelcomer.length} welcomer\n`;
          mensaje += `📸 Las entradas de fotos se sincronizarán automáticamente`;
          
          console.log(mensaje);
          alert(mensaje);
        }
      }
    };

    processExcelFiles();
  }, [welcomerExcelFilesFromFolder, setData, data.welcomer]);

  const handleExcelUpload = async (file) => {
    if (lastImportedFileRef.current === file.name) {
      alert(`⚠️ Este archivo ya fue importado: "${file.name}"`);
      return;
    }

    const { welcomer, duplicadosEliminados } = await processExcelWelcomer(file);
    
    if (welcomer.length > 0) {
      if (duplicadosEliminados > 0) {
        alert(`⚠️ Se eliminaron ${duplicadosEliminados} welcomer duplicado(s) por patrón SX`);
      }

      lastImportedFileRef.current = file.name;

      setData((d) => ({
        ...d,
        welcomer: welcomer
      }));
      
      if (welcomer.length > 0) {
        alert(`✅ Se han cargado ${welcomer.length} welcomer correctamente\n\nLas entradas de fotos se sincronizarán automáticamente`);
      }
    }
  };

  return (
    <div>
      <FotosWelcomerEditor 
        data={data} 
        setData={setData} 
        imageInputRefs={imageInputRefs}
        fotoWelcomerFilesFromFolder={fotoWelcomerFilesFromFolder}
      />
      
      <h2 className="font-semibold text-neutral-800 mb-4">Welcomer</h2>
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">Cargar desde Excel</h3>
            <p className="text-blue-700">Sube el archivo Excel con terminación "WELCOMER"</p>
            <small className="text-blue-600 mt-1 block">Se importarán todas las filas que tengan etiqueta de plano (sin filtro de "Alta")</small>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => imageInputRefs.current['welcomer_excel']?.click()}>
              Cargar Excel
            </Button>
            <input
              ref={el => imageInputRefs.current['welcomer_excel'] = el}
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
        <h3 className="font-semibold text-neutral-700 mb-2">Información de los Welcomer</h3>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-100 text-[11px]">
                {[
                  "Etiqueta de plano", "Hostname", "MAC", "Sección", "Nº de Probadores", ""
                ].map((h) => (
                  <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.welcomer?.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-neutral-50">
                  <td className="border px-1 py-1">
                    <Input
                      value={r.etiquetaPlano || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          if (!c.welcomer[i]) c.welcomer[i] = {};
                          c.welcomer[i].etiquetaPlano = v;
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
                          if (!c.welcomer[i]) c.welcomer[i] = {};
                          c.welcomer[i].hostname = v;
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
                          if (!c.welcomer[i]) c.welcomer[i] = {};
                          c.welcomer[i].mac = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.seccion || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          if (!c.welcomer[i]) c.welcomer[i] = {};
                          c.welcomer[i].seccion = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.numProbadores || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          if (!c.welcomer[i]) c.welcomer[i] = {};
                          c.welcomer[i].numProbadores = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1 text-right">
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.welcomer.splice(i, 1);
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
        <div className="mt-2">
          <Button onClick={() => {
            setData((d) => {
              const c = structuredClone(d);
              if (!c.welcomer) c.welcomer = [];
              c.welcomer.push({
                etiquetaPlano: '',
                hostname: '',
                mac: '',
                seccion: '',
                numProbadores: '',
                puertoPatch: '',
                puertoSwitch: '',
                contrato: '',
                termicoPantalla: '',
                termicoPC: ''
              });
              return c;
            });
          }}>
            + Añadir línea
          </Button>
        </div>
      </div>
    </div>
  );
};

