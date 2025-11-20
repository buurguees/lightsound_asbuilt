import React, { useEffect, useRef } from 'react';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { processExcelBanners, removeDuplicatesBySX } from '../../utils/excelUtils';
import { FotosBannersEditor } from './FotosBannersEditor';

export const BannersEditor = ({ data, setData, imageInputRefs, bannerExcelFilesFromFolder, fotoBannerFilesFromFolder }) => {
  const lastImportedFileRef = useRef(null);
  const processedFilesRef = useRef(new Set());
  const hasProcessedFolderFilesRef = useRef(false);

  // Procesar archivos Excel recibidos desde App.jsx (importación de carpeta)
  // IMPORTANTE: Solo procesar una vez, no volver a procesar si ya hay banners importados
  useEffect(() => {
    if (!bannerExcelFilesFromFolder || bannerExcelFilesFromFolder.length === 0) return;
    
    // Solo procesar una vez, incluso si el componente se desmonta y vuelve a montar
    if (hasProcessedFolderFilesRef.current) {
      return;
    }
    
    // Si ya hay banners importados, no volver a procesar el Excel
    // Esto permite al usuario modificar/eliminar banners sin que se regeneren
    if (data.banners && data.banners.length > 0) {
      console.log('⚠️ Ya hay banners importados. No se volverá a procesar el Excel automáticamente.');
      console.log(`   Banners actuales: ${data.banners.length}`);
      console.log(`   Para reimportar, usa el botón "Cargar Excel" manualmente.`);
      hasProcessedFolderFilesRef.current = true;
      return;
    }

    const processExcelFiles = async () => {
      let todosBanners = [];
      let totalDuplicados = 0;
      let archivosProcesados = 0;

      for (const file of bannerExcelFilesFromFolder) {
        // Evitar procesar el mismo archivo dos veces
        const fileKey = `${file.name}_${file.size}`;
        if (processedFilesRef.current.has(fileKey)) {
          console.log(`Archivo ya procesado: ${file.name}`);
          continue;
        }

        try {
          console.log('Procesando archivo Excel desde carpeta:', file.name);
          const { banners, duplicadosEliminados } = await processExcelBanners(file);
          
          if (banners.length > 0) {
            todosBanners = todosBanners.concat(banners);
            totalDuplicados += duplicadosEliminados;
            archivosProcesados++;
            processedFilesRef.current.add(fileKey);
          }
        } catch (error) {
          console.error(`Error procesando archivo Excel ${file.name}:`, error);
        }
      }

      // Aplicar filtro anti-duplicados después de concatenar todos los archivos
      if (todosBanners.length > 0) {
        const { pantallasUnicas, duplicadosEliminados: duplicadosAdicionales } = removeDuplicatesBySX(todosBanners);
        totalDuplicados += duplicadosAdicionales;

        setData((d) => ({
          ...d,
          banners: pantallasUnicas
          // NOTA: Las fotos se sincronizan automáticamente en FotosBannersEditor.jsx
        }));

        if (archivosProcesados > 0) {
          let mensaje = `✅ Se procesaron ${archivosProcesados} archivo(s) Excel desde la carpeta\n`;
          mensaje += `✅ Se importaron ${pantallasUnicas.length} banner(es) únicos\n`;
          mensaje += `📸 Las entradas de fotos se sincronizarán automáticamente`;
          if (totalDuplicados > 0) {
            mensaje += `\n⚠️ Se eliminaron ${totalDuplicados} banner(es) duplicado(s) por patrón SX`;
          }
          alert(mensaje);
          hasProcessedFolderFilesRef.current = true;
        }
      }
    };

    processExcelFiles();
  }, [bannerExcelFilesFromFolder, setData]);

  const handleExcelUpload = async (file) => {
    // FILTRO DE SEGURIDAD: Evitar doble importación del mismo archivo
    if (lastImportedFileRef.current === file.name) {
      alert(`⚠️ Este archivo ya fue importado: "${file.name}"\n\nPara importar un archivo diferente, selecciona otro archivo Excel.`);
      return;
    }

    const { banners, duplicadosEliminados } = await processExcelBanners(file);
    
    if (banners.length > 0) {
      // El filtro anti-duplicados ya se aplicó en processExcelBanners
      if (duplicadosEliminados > 0) {
        alert(`⚠️ Se eliminaron ${duplicadosEliminados} banner(es) duplicado(s) por patrón SX (S1, S2, etc.)\n\nSolo se mantiene una entrada por cada número SX único.`);
      }

      // Marcar este archivo como importado
      lastImportedFileRef.current = file.name;

      setData((d) => ({
        ...d,
        banners: banners // Ya están filtradas y sin duplicados
        // NOTA: Las fotos se sincronizan automáticamente en FotosBannersEditor.jsx
      }));
      
      if (banners.length > 0) {
        alert(`✅ Se han cargado ${banners.length} banner(es) correctamente\n\nLas entradas de fotos se sincronizarán automáticamente`);
      }
    }
  };

  return (
    <div>
      <FotosBannersEditor 
        data={data} 
        setData={setData} 
        imageInputRefs={imageInputRefs}
        fotoBannerFilesFromFolder={fotoBannerFilesFromFolder}
      />
      
      <h2 className="font-semibold text-neutral-800 mb-4">Banners</h2>
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">Cargar desde Excel</h3>
            <p className="text-blue-700">Sube el archivo Excel con terminación "Validación_INTERNA_BANNERS" o "Validacion_INTERNA_BANNERS"</p>
            <small className="text-blue-600 mt-1 block">Se importarán solo las filas con Columna C que contenga patrón SX y Columna B que contenga "Alta"</small>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => imageInputRefs.current['banner_excel']?.click()}>
              Cargar Excel
            </Button>
            <input
              ref={el => imageInputRefs.current['banner_excel'] = el}
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
      
      {/* Tabla: Información de los Banners */}
      <div className="mb-4">
        <h3 className="font-semibold text-neutral-700 mb-2">Información de los Banners</h3>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-100 text-[11px]">
                {[
                  "Etiqueta de plano", "Modelo", "Resolución", "Resolución Lineal", ""
                ].map((h) => (
                  <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.banners?.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-neutral-50">
                  <td className="border px-1 py-1">
                    <Input
                      value={r.etiquetaPlano}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.banners[i].etiquetaPlano = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.modelo}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.banners[i].modelo = v;
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
                          c.banners[i].resolucion = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <Input
                      value={r.tamanoLineal || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          if (!c.banners[i]) c.banners[i] = {};
                          c.banners[i].tamanoLineal = v;
                          return c;
                        });
                      }}
                    />
                  </td>
                  <td className="border px-1 py-1 text-right">
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.banners.splice(i, 1);
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
              if (!c.banners) c.banners = [];
              c.banners.push({
                etiquetaPlano: '',
                modelo: '',
                resolucion: '',
                tamanoLineal: '',
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

