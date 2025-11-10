import React, { useEffect, useRef } from 'react';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';
import { processExcelBanners } from '../../utils/excelUtils';

export const BannersEditor = ({ data, setData, imageInputRefs, bannerFilesFromFolder, bannerExcelFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());
  const processedExcelFilesRef = useRef(new Set());
  const lastImportedFileRef = useRef(null);

  // Procesar archivos Excel de banners recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!bannerExcelFilesFromFolder || bannerExcelFilesFromFolder.length === 0) {
      return;
    }
    
    // Si ya hay banners importados, no volver a procesar el Excel automáticamente
    if (data.banners && data.banners.length > 0) {
      console.log('⚠️ Ya hay banners importados. No se volverá a procesar el Excel automáticamente.');
      return;
    }

    const processExcelFiles = async () => {
      let todosBanners = [];
      let archivosProcesados = 0;

      for (const file of bannerExcelFilesFromFolder) {
        // Evitar procesar el mismo archivo dos veces
        const fileKey = `${file.name}_${file.size}`;
        if (processedExcelFilesRef.current.has(fileKey)) {
          console.log(`Archivo Excel ya procesado: ${file.name}`);
          continue;
        }

        try {
          console.log('Procesando archivo Excel de banners desde carpeta:', file.name);
          const { banners } = await processExcelBanners(file);
          
          if (banners.length > 0) {
            todosBanners = todosBanners.concat(banners);
            archivosProcesados++;
            processedExcelFilesRef.current.add(fileKey);
          }
        } catch (error) {
          console.error(`Error procesando archivo Excel ${file.name}:`, error);
        }
      }

      if (todosBanners.length > 0) {
        setData((d) => {
          const c = structuredClone(d);
          if (!c.banners) {
            c.banners = [];
          }
          c.banners = todosBanners;
          c.secciones.banners = true;
          return c;
        });

        if (archivosProcesados > 0) {
          alert(`✅ Se procesaron ${archivosProcesados} archivo(s) Excel de banners desde la carpeta\n✅ Se importaron ${todosBanners.length} banner(es)`);
        }
      }
    };

    processExcelFiles();
  }, [bannerExcelFilesFromFolder, data.banners, setData]);

  // Procesar archivos de imágenes de banners recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!bannerFilesFromFolder || bannerFilesFromFolder.length === 0) {
      return;
    }

    // Si ya hay banners importados, no volver a procesar automáticamente
    if (data.banners && data.banners.length > 0) {
      console.log('⚠️ Ya hay banners importados. No se volverá a procesar las imágenes automáticamente.');
      return;
    }

    const processBannerFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${bannerFilesFromFolder.length} archivo(s) de banners...`);
      
      const c = structuredClone(data);
      if (!c.banners) {
        c.banners = [];
      }
      
      let bannersProcesados = 0;

      for (const file of bannerFilesFromFolder) {
        const fileKey = `${file.name}_${file.size}`;
        if (processedFilesRef.current.has(fileKey)) {
          console.log(`Archivo ya procesado: ${file.name}`);
          continue;
        }

        try {
          const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
          
          // Crear una nueva entrada de banner
          c.banners.push({
            etiqueta: file.name.replace(/\.[^/.]+$/, ""), // Nombre sin extensión
            imagen: {
              url: base64,
              fileName: file.name,
              fileSize: file.size
            }
          });
          
          bannersProcesados++;
          processedFilesRef.current.add(fileKey);
        } catch (error) {
          console.error(`Error procesando archivo ${file.name}:`, error);
        }
      }

      if (bannersProcesados > 0) {
        c.secciones.banners = true;
        setData(c);
        console.log(`✅ Se procesaron ${bannersProcesados} banner(es)`);
      }
    };

    processBannerFiles();
  }, [bannerFilesFromFolder, data.banners, setData]);

  const handleExcelUpload = async (file) => {
    // FILTRO DE SEGURIDAD: Evitar doble importación del mismo archivo
    if (lastImportedFileRef.current === file.name) {
      alert(`⚠️ Este archivo ya fue importado: "${file.name}"\n\nPara importar un archivo diferente, selecciona otro archivo Excel.`);
      return;
    }

    const { banners } = await processExcelBanners(file);
    
    if (banners.length > 0) {
      // Marcar este archivo como importado
      lastImportedFileRef.current = file.name;

      setData((d) => {
        const c = structuredClone(d);
        if (!c.banners) {
          c.banners = [];
        }
        c.banners = banners;
        c.secciones.banners = true;
        return c;
      });
      
      if (banners.length > 0) {
        alert(`✅ Se han cargado ${banners.length} banner(es) correctamente`);
      }
    }
  };

  const addBanner = () => {
    setData((d) => {
      const c = structuredClone(d);
      if (!c.banners) {
        c.banners = [];
      }
      c.banners.push({
        etiqueta: "",
        imagen: { url: "", fileName: undefined, fileSize: undefined }
      });
      return c;
    });
  };

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Banners</h2>
      
      {/* Cargar desde Excel */}
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">Cargar desde Excel</h3>
            <p className="text-blue-700">Sube el archivo Excel con terminación "BANNERS"</p>
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

      <div className="grid grid-cols-1 gap-4">
        <div className="mb-2">
          <Button onClick={addBanner}>Añadir banner</Button>
        </div>
        {data.banners?.map((b, i) => (
          <div key={i} className="rounded-lg border-2 border-neutral-300 p-4 bg-neutral-50">
            <div className="flex justify-between items-center mb-3">
              <Field className="flex-grow mr-4" label="Etiqueta/Nombre">
                <Input
                  value={b.etiqueta || ""}
                  onChange={(e) => {
                    setData((d) => {
                      const c = structuredClone(d);
                      c.banners[i].etiqueta = e.target.value;
                      return c;
                    });
                  }}
                  placeholder="Nombre del banner"
                />
              </Field>
              <div className="pt-6">
                <Button onClick={() => {
                  setData((d) => {
                    const c = structuredClone(d);
                    c.banners.splice(i, 1);
                    if (c.banners.length === 0) {
                      c.secciones.banners = false;
                    }
                    return c;
                  });
                }}>
                  Borrar banner
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-3">
              <h3 className="font-semibold text-neutral-700 mb-2">IMAGEN</h3>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current[`banner_${i}`]?.click()}>
                  Subir
                </Button>
                <input
                  ref={el => imageInputRefs.current[`banner_${i}`] = el}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                      setData((d) => {
                        const c = structuredClone(d);
                        c.banners[i].imagen = {
                          url: base64,
                          fileName: e.target.files[0].name,
                          fileSize: e.target.files[0].size
                        };
                        return c;
                      });
                    }
                  }}
                />
                {b.imagen?.url && (
                  <Button onClick={() => {
                    setData((d) => {
                      const c = structuredClone(d);
                      c.banners[i].imagen = { url: "" };
                      return c;
                    });
                  }}>
                    Limpiar
                  </Button>
                )}
              </div>
              {b.imagen?.url && (
                <div>
                  <img loading="lazy" src={b.imagen.url} alt="Banner" className="max-h-64 w-full object-contain rounded border" />
                  <small className="text-neutral-600 mt-1 block">{b.imagen.fileName}</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
