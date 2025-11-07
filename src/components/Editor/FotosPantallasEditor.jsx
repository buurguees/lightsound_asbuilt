import React, { useEffect, useRef } from 'react';
import { Card } from '../UI/Card';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const FotosPantallasEditor = ({ data, setData, imageInputRefs, fotoFilesFromFolder, onFotosProcessed }) => {
  const processedFilesRef = useRef(new Set());
  // Procesar archivos de fotos recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!fotoFilesFromFolder || fotoFilesFromFolder.length === 0) return;

    const processFotoFiles = async () => {
      // Parsear nombres de archivo y agrupar por pantalla
      const fotosPorPantalla = {};
      
      for (const file of fotoFilesFromFolder) {
        // Evitar procesar el mismo archivo dos veces
        const fileKey = `${file.name}_${file.size}`;
        if (processedFilesRef.current.has(fileKey)) {
          console.log(`Archivo ya procesado: ${file.name}`);
          continue;
        }

        const fileName = file.name.toUpperCase();
        console.log('Procesando archivo de foto:', file.name, '->', fileName);
        
        // Buscar patrón S[0-9]+ (número de pantalla)
        const pantallaMatch = fileName.match(/S(\d+)/);
        if (!pantallaMatch) {
          console.log('  No se encontró patrón S[0-9] en:', fileName);
          processedFilesRef.current.add(fileKey);
          continue;
        }
        
        const numeroPantalla = pantallaMatch[1];
        const pantallaKey = `S${numeroPantalla}`;
        console.log('  Pantalla encontrada:', pantallaKey);
        
        if (!fotosPorPantalla[pantallaKey]) {
          fotosPorPantalla[pantallaKey] = {};
        }
        
        // Determinar tipo de foto
        let tipoFoto = null;
        if (fileName.includes('FRONTAL')) {
          tipoFoto = 'fotoFrontal';
        } else if (fileName.includes('PLAYER_SENDING') || fileName.includes('PLAYER+SENDING') || fileName.includes('PLAYER')) {
          tipoFoto = 'fotoPlayer';
        } else if (fileName.includes('_IP') || fileName.endsWith('IP') || (fileName.includes('IP') && !fileName.includes('PLAYER'))) {
          tipoFoto = 'fotoIP';
        }
        
        if (tipoFoto) {
          console.log('  Tipo de foto:', tipoFoto);
          fotosPorPantalla[pantallaKey][tipoFoto] = file;
        } else {
          console.log('  No se pudo determinar el tipo de foto');
        }
        
        processedFilesRef.current.add(fileKey);
      }
      
      console.log('Fotos agrupadas por pantalla:', fotosPorPantalla);

      // Solo crear entradas para pantallas que tengan foto FRONTAL
      // Ordenar por número de pantalla
      const pantallasConFrontal = Object.entries(fotosPorPantalla)
        .filter(([_, fotos]) => fotos.fotoFrontal) // Solo pantallas con foto frontal
        .sort(([a], [b]) => {
          const numA = parseInt(a.replace('S', ''));
          const numB = parseInt(b.replace('S', ''));
          return numA - numB;
        });

      if (pantallasConFrontal.length > 0) {
        // Procesar y asignar fotos a las pantallas
        console.log('Pantallas con frontal encontradas:', pantallasConFrontal.length);
        
        const nuevasFotos = [];
        let fotosProcesadas = 0;
        
        for (const [pantallaKey, fotos] of pantallasConFrontal) {
          // Usar "SX" como etiqueta de plano
          const etiquetaPlano = pantallaKey; // S1, S2, S3, etc.
          console.log(`Procesando pantalla ${pantallaKey} con fotos:`, Object.keys(fotos));
          
          const fotoData = {
            etiquetaPlano: etiquetaPlano,
            fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
            fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
            fotoIP: { url: "", fileName: undefined, fileSize: undefined },
            nota: ""
          };
          
          // Procesar cada tipo de foto
          for (const [tipoFoto, file] of Object.entries(fotos)) {
            try {
              console.log(`  Comprimiendo ${tipoFoto}:`, file.name);
              const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
              fotoData[tipoFoto] = {
                url: base64,
                fileName: file.name,
                fileSize: file.size
              };
              fotosProcesadas++;
              console.log(`  ✓ ${tipoFoto} procesada correctamente`);
            } catch (error) {
              console.error(`Error procesando ${file.name}:`, error);
            }
          }
          
          nuevasFotos.push(fotoData);
        }

        // Actualizar el estado con las nuevas fotos
        setData((d) => ({
          ...d,
          fotos: nuevasFotos
        }));

        // Notificar a App.jsx que las fotos fueron procesadas
        if (onFotosProcessed) {
          onFotosProcessed({
            fotosProcesadas,
            totalPantallas: nuevasFotos.length
          });
        }
      } else {
        console.log('No se encontraron fotos FRONTAL en la carpeta.');
        if (onFotosProcessed) {
          onFotosProcessed({
            fotosProcesadas: 0,
            totalPantallas: 0
          });
        }
      }
    };

    processFotoFiles();
  }, [fotoFilesFromFolder, setData, onFotosProcessed]);

  const addFoto = () => {
    setData((d) => ({
      ...d,
      fotos: [...d.fotos, {
        etiquetaPlano: "",
        fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
        fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
        fotoIP: { url: "", fileName: undefined, fileSize: undefined },
        nota: ""
      }]
    }));
  };

  return (
    <Card title="Fotos de pantallas" right={<Button onClick={addFoto}>Añadir foto</Button>}>
      <div className="grid grid-cols-1 gap-4">
        {data.fotos.map((f, i) => (
          <div key={i} className="rounded-lg border-2 border-neutral-300 p-4 bg-neutral-50">
            <div className="flex justify-between items-center mb-3">
              <Field className="flex-grow mr-4" label="Etiqueta de plano">
                <Input
                  value={f.etiquetaPlano}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const c = structuredClone(d);
                      c.fotos[i].etiquetaPlano = v;
                      return c;
                    });
                  }}
                />
              </Field>
              <div className="pt-6">
                <Button onClick={() => {
                  setData((d) => {
                    const c = structuredClone(d);
                    c.fotos.splice(i, 1);
                    return c;
                  });
                }}>
                  Borrar pantalla
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              {/* Foto Frontal */}
              <div className="bg-white rounded-lg border p-3">
                <div className="text-xs font-semibold text-neutral-700 mb-2">FOTO FRONTAL</div>
                <div className="flex gap-2 mb-2">
                  <Button onClick={() => imageInputRefs.current[`${i}_frontal`]?.click()}>
                    Subir
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`${i}_frontal`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                        setData((d) => {
                          const c = structuredClone(d);
                          c.fotos[i].fotoFrontal = {
                            url: base64,
                            fileName: e.target.files[0].name,
                            fileSize: e.target.files[0].size
                          };
                          return c;
                        });
                      }
                    }}
                  />
                  {f.fotoFrontal?.url && (
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.fotos[i].fotoFrontal = { url: '' };
                        return c;
                      });
                    }}>
                      Limpiar
                    </Button>
                  )}
                </div>
                {f.fotoFrontal?.url && (
                  <div>
                    <img loading="lazy" src={f.fotoFrontal.url} alt="Frontal" className="max-h-32 w-full object-contain rounded border" />
                    <p className="text-xs text-neutral-600 mt-1">{f.fotoFrontal.fileName}</p>
                  </div>
                )}
              </div>

              {/* Foto Player + Sending */}
              <div className="bg-white rounded-lg border p-3">
                <div className="text-xs font-semibold text-neutral-700 mb-2">PLAYER + SENDING</div>
                <div className="flex gap-2 mb-2">
                  <Button onClick={() => imageInputRefs.current[`${i}_player`]?.click()}>
                    Subir
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`${i}_player`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                        setData((d) => {
                          const c = structuredClone(d);
                          c.fotos[i].fotoPlayer = {
                            url: base64,
                            fileName: e.target.files[0].name,
                            fileSize: e.target.files[0].size
                          };
                          return c;
                        });
                      }
                    }}
                  />
                  {f.fotoPlayer?.url && (
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.fotos[i].fotoPlayer = { url: '' };
                        return c;
                      });
                    }}>
                      Limpiar
                    </Button>
                  )}
                </div>
                {f.fotoPlayer?.url && (
                  <div>
                    <img loading="lazy" src={f.fotoPlayer.url} alt="Player" className="max-h-32 w-full object-contain rounded border" />
                    <p className="text-xs text-neutral-600 mt-1">{f.fotoPlayer.fileName}</p>
                  </div>
                )}
              </div>

              {/* Foto IP */}
              <div className="bg-white rounded-lg border p-3">
                <div className="text-xs font-semibold text-neutral-700 mb-2">IP</div>
                <div className="flex gap-2 mb-2">
                  <Button onClick={() => imageInputRefs.current[`${i}_ip`]?.click()}>
                    Subir
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`${i}_ip`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                        setData((d) => {
                          const c = structuredClone(d);
                          c.fotos[i].fotoIP = {
                            url: base64,
                            fileName: e.target.files[0].name,
                            fileSize: e.target.files[0].size
                          };
                          return c;
                        });
                      }
                    }}
                  />
                  {f.fotoIP?.url && (
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.fotos[i].fotoIP = { url: '' };
                        return c;
                      });
                    }}>
                      Limpiar
                    </Button>
                  )}
                </div>
                {f.fotoIP?.url && (
                  <div>
                    <img loading="lazy" src={f.fotoIP.url} alt="IP" className="max-h-32 w-full object-contain rounded border" />
                    <p className="text-xs text-neutral-600 mt-1">{f.fotoIP.fileName}</p>
                  </div>
                )}
              </div>
            </div>

            <Field label="Nota (opcional)">
              <Textarea
                rows={2}
                value={f.nota}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const c = structuredClone(d);
                    c.fotos[i].nota = v;
                    return c;
                  });
                }}
              />
            </Field>
          </div>
        ))}
      </div>
    </Card>
  );
};

