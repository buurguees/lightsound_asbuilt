import React, { useEffect, useRef } from 'react';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const BannersEditor = ({ data, setData, imageInputRefs, bannerFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  // Procesar archivos de banners recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!bannerFilesFromFolder || bannerFilesFromFolder.length === 0) {
      return;
    }

    // Si ya hay banners importados, no volver a procesar automáticamente
    if (data.banners && data.banners.length > 0) {
      console.log('⚠️ Ya hay banners importados. No se volverá a procesar automáticamente.');
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

