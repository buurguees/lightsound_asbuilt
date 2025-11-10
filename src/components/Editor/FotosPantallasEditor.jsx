import React, { useEffect, useRef } from 'react';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';
import { extractSXPattern } from '../../utils/excelUtils';

export const FotosPantallasEditor = ({ data, setData, imageInputRefs, fotoFilesFromFolder, onFotosProcessed }) => {
  const processedFilesRef = useRef(new Set());

  // Sincronizar data.fotos con data.pantallas: crear entradas de fotos para pantallas nuevas
  useEffect(() => {
    if (!data.pantallas || data.pantallas.length === 0) return;

    setData((d) => {
      const c = structuredClone(d);
      const etiquetasExistentes = new Set(
        c.fotos.map(f => String(f.etiquetaPlano || '').trim())
      );

      // Crear entradas de fotos para pantallas que no tengan entrada de foto
      let nuevasEntradas = 0;
      data.pantallas.forEach(pantalla => {
        const etiqueta = String(pantalla.etiquetaPlano || '').trim();
        if (etiqueta && !etiquetasExistentes.has(etiqueta)) {
          c.fotos.push({
            etiquetaPlano: etiqueta,
            fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
            fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
            fotoIP: { url: "", fileName: undefined, fileSize: undefined }
          });
          nuevasEntradas++;
        }
      });

      // Eliminar entradas de fotos que no tengan pantalla correspondiente
      const etiquetasPantallas = new Set(
        data.pantallas.map(p => String(p.etiquetaPlano || '').trim())
      );
      c.fotos = c.fotos.filter(f => {
        const etiqueta = String(f.etiquetaPlano || '').trim();
        return !etiqueta || etiquetasPantallas.has(etiqueta);
      });

      if (nuevasEntradas > 0) {
        console.log(`📸 Se crearon ${nuevasEntradas} nuevas entradas de fotos para pantallas`);
        console.log(`   Total de entradas de fotos: ${c.fotos.length}`);
      }

      return c;
    });
  }, [data.pantallas, setData]);

  // Procesar archivos de fotos recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!fotoFilesFromFolder || fotoFilesFromFolder.length === 0) {
      console.log('⚠️ No hay archivos de fotos para procesar');
      return;
    }
    if (!data.pantallas || data.pantallas.length === 0) {
      console.log('⚠️ No hay pantallas importadas. Importa primero el Excel en "Desglose de pantallas"');
      return;
    }
    
    console.log(`\n🔄 Verificando sincronización...`);
    console.log(`   Pantallas: ${data.pantallas.length}`);
    console.log(`   Fotos: ${data.fotos?.length || 0}`);
    
    // Verificar que las fotos estén sincronizadas con las pantallas
    const etiquetasPantallas = new Set(
      data.pantallas.map(p => String(p.etiquetaPlano || '').trim())
    );
    const etiquetasFotos = new Set(
      (data.fotos || []).map(f => String(f.etiquetaPlano || '').trim())
    );
    
    // Verificar que todas las pantallas tengan su entrada de foto
    const todasPantallasTienenFoto = Array.from(etiquetasPantallas).every(etiqueta => 
      etiquetasFotos.has(etiqueta)
    );
    
    if (!todasPantallasTienenFoto || !data.fotos || data.fotos.length === 0) {
      console.log('⚠️ Las entradas de fotos aún no están sincronizadas. Esperando sincronización...');
      const pantallasSinFoto = Array.from(etiquetasPantallas).filter(e => !etiquetasFotos.has(e));
      if (pantallasSinFoto.length > 0) {
        console.log(`   Pantallas sin foto:`, pantallasSinFoto);
      }
      // No procesar hasta que las fotos estén sincronizadas
      return;
    }

    console.log(`✅ Sincronización OK. Iniciando procesamiento de fotos...`);
    console.log(`   Archivos de fotos: ${fotoFilesFromFolder.length}`);
    console.log(`   Pantallas: ${data.pantallas.length}`);
    console.log(`   Entradas de fotos: ${data.fotos.length}`);

    // Resetear archivos procesados cuando cambian las pantallas o los archivos
    processedFilesRef.current.clear();

    const processFotoFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${fotoFilesFromFolder.length} archivo(s) de fotos...`);
      // Agrupar fotos por SX extraído del nombre del archivo
      const fotosPorSX = {};
      
      for (const file of fotoFilesFromFolder) {
        const fileName = file.name.toUpperCase();
        console.log(`\n📷 Procesando archivo: ${file.name}`);
        console.log(`   Nombre normalizado: ${fileName}`);
        
        // Extraer SX del nombre del archivo (ej: "S1" de "BSK_16909_FR_DIJON_LA-TOISON-DOR_CIRCLE_S1_FRONTAL")
        const sxPattern = extractSXPattern(fileName);
        if (!sxPattern) {
          console.log(`  ❌ No se encontró patrón SX (S1, S2, etc.) en: ${file.name}`);
          continue;
        }
        
        console.log(`  ✅ SX extraído: ${sxPattern} → Esta imagen pertenece a la pantalla ${sxPattern}`);
        
        if (!fotosPorSX[sxPattern]) {
          fotosPorSX[sxPattern] = {};
        }
        
        // Determinar tipo de foto según el contenido del nombre del archivo
        // Orden importante: primero PLAYER_SENDING, luego IP, luego FRONTAL
        let tipoFoto = null;
        
        // Detectar PLAYER_SENDING (debe contener PLAYER y SENDING)
        if ((fileName.includes('PLAYER_SENDING') || fileName.includes('PLAYER+SENDING')) || 
            (fileName.includes('PLAYER') && fileName.includes('SENDING'))) {
          tipoFoto = 'fotoPlayer';
        } 
        // Detectar IP (debe contener IP pero NO PLAYER)
        else if ((fileName.includes('_IP') || fileName.endsWith('IP') || fileName.includes('_IP_')) && 
                 !fileName.includes('PLAYER')) {
          tipoFoto = 'fotoIP';
        } 
        // Detectar FRONTAL (puede estar al final o en medio del nombre)
        else if (fileName.includes('FRONTAL')) {
          tipoFoto = 'fotoFrontal';
        }
        
        if (tipoFoto) {
          // Mapear tipo interno a nombre legible
          const tipoNombre = tipoFoto === 'fotoFrontal' ? 'FOTO FRONTAL' : 
                            tipoFoto === 'fotoPlayer' ? 'PLAYER + SENDING' : 
                            'IP';
          console.log(`  ✅ Tipo detectado: ${tipoNombre} → Se asignará al bloque "${sxPattern} ${tipoNombre}"`);
          
          // Si ya existe una foto de este tipo para este SX, mantener la primera encontrada
          if (!fotosPorSX[sxPattern][tipoFoto]) {
            fotosPorSX[sxPattern][tipoFoto] = file;
            console.log(`  ✓ Foto preparada para asignación: ${sxPattern} → ${tipoNombre}`);
          } else {
            console.log(`  ⚠️ Ya existe una foto ${tipoNombre} para ${sxPattern}, se mantiene la primera: ${fotosPorSX[sxPattern][tipoFoto].name}`);
          }
        } else {
          console.log(`  ❌ No se pudo determinar el tipo de foto para: ${file.name}`);
          console.log(`     Buscando: "FRONTAL", "PLAYER_SENDING", o "IP" en el nombre`);
          console.log(`     Ejemplo válido: BSK_16909_FR_DIJON_LA-TOISON-DOR_CIRCLE_S1_FRONTAL`);
        }
      }
      
      console.log('Fotos agrupadas por SX:', fotosPorSX);

      // Asignar fotos a las pantallas según su etiqueta de plano
      let fotosProcesadas = 0;
      const pantallasActualizadasSet = new Set();

      // Crear una copia del estado actual
      const c = structuredClone(data);
      
      console.log(`\n📸 Iniciando asignación de fotos a ${c.fotos.length} pantalla(s)...`);
      
      // Procesar cada entrada de foto (cada bloque de pantalla)
      for (let fotoIndex = 0; fotoIndex < c.fotos.length; fotoIndex++) {
        const fotoEntry = c.fotos[fotoIndex];
        const etiquetaPlano = String(fotoEntry.etiquetaPlano || '').trim();
        if (!etiquetaPlano) {
          console.log(`  ⚠️ Entrada ${fotoIndex} sin etiqueta de plano, se omite`);
          continue;
        }

        console.log(`\n🔍 Procesando bloque de pantalla: "${etiquetaPlano}"`);

        // Extraer SX de la etiqueta de plano (ej: "S1" de "LED_CIRCLE_0F_ENT_S1")
        const sxPattern = extractSXPattern(etiquetaPlano);
        if (!sxPattern) {
          console.log(`  ⚠️ No se encontró patrón SX en etiqueta de plano: ${etiquetaPlano}`);
          continue;
        }

        console.log(`  ✓ SX extraído de la etiqueta: ${sxPattern}`);

        // Buscar fotos para este SX
        const fotosDelSX = fotosPorSX[sxPattern];
        if (!fotosDelSX || Object.keys(fotosDelSX).length === 0) {
          console.log(`  ⚠️ No se encontraron fotos para SX: ${sxPattern} (etiqueta: ${etiquetaPlano})`);
          console.log(`     Buscando imágenes con patrón: ...${sxPattern}_FRONTAL, ...${sxPattern}_PLAYER_SENDING, etc.`);
          continue;
        }

        const tiposEncontrados = Object.keys(fotosDelSX).map(t => {
          if (t === 'fotoFrontal') return 'FOTO FRONTAL';
          if (t === 'fotoPlayer') return 'PLAYER + SENDING';
          return 'IP';
        });
        console.log(`  📁 Fotos encontradas para ${sxPattern}: ${tiposEncontrados.join(', ')}`);

        // Procesar cada tipo de foto encontrado
        for (const [tipoFoto, file] of Object.entries(fotosDelSX)) {
          const tipoNombre = tipoFoto === 'fotoFrontal' ? 'FOTO FRONTAL' : 
                            tipoFoto === 'fotoPlayer' ? 'PLAYER + SENDING' : 
                            'IP';
          
          // Solo actualizar si la foto no está ya asignada
          if (!c.fotos[fotoIndex][tipoFoto]?.url) {
            try {
              console.log(`  📤 Importando imagen al bloque "${sxPattern} ${tipoNombre}":`);
              console.log(`     Archivo: ${file.name}`);
              const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
              c.fotos[fotoIndex][tipoFoto] = {
                url: base64,
                fileName: file.name,
                fileSize: file.size
              };
              fotosProcesadas++;
              pantallasActualizadasSet.add(etiquetaPlano);
              console.log(`  ✅ ✓ Imagen importada correctamente en el bloque "${sxPattern} ${tipoNombre}"`);
            } catch (error) {
              console.error(`  ❌ Error procesando ${file.name}:`, error);
            }
          } else {
            console.log(`  ⏭️  ${tipoNombre} ya está asignada al bloque "${sxPattern} ${tipoNombre}", se omite`);
          }
        }
      }
      
      console.log(`\n✅ Proceso completado: ${fotosProcesadas} foto(s) asignada(s) a ${pantallasActualizadasSet.size} pantalla(s)`);

      // Actualizar el estado una sola vez con todas las fotos procesadas
      if (fotosProcesadas > 0) {
        setData(c);
      }

      // Resumen de asignaciones por tipo
      const resumenPorTipo = {
        fotoFrontal: 0,
        fotoPlayer: 0,
        fotoIP: 0
      };
      
      c.fotos.forEach(foto => {
        if (foto.fotoFrontal?.url) resumenPorTipo.fotoFrontal++;
        if (foto.fotoPlayer?.url) resumenPorTipo.fotoPlayer++;
        if (foto.fotoIP?.url) resumenPorTipo.fotoIP++;
      });

      // Notificar a App.jsx que las fotos fueron procesadas
      if (onFotosProcessed) {
        onFotosProcessed({
          fotosProcesadas,
          totalPantallas: pantallasActualizadasSet.size,
          resumenPorTipo: resumenPorTipo
        });
      }

      if (fotosProcesadas > 0) {
        let mensaje = `✅ Se asignaron ${fotosProcesadas} foto(s) a ${pantallasActualizadasSet.size} pantalla(s)\n\n`;
        mensaje += `📊 Resumen por tipo:\n`;
        mensaje += `  • FRONTAL: ${resumenPorTipo.fotoFrontal}\n`;
        mensaje += `  • PLAYER + SENDING: ${resumenPorTipo.fotoPlayer}\n`;
        mensaje += `  • IP: ${resumenPorTipo.fotoIP}`;
        console.log(mensaje);
        // Nota: La información también se envía a App.jsx a través de onFotosProcessed
      } else {
        console.log('⚠️ No se asignaron fotos. Verifica que:');
        console.log('  1. Los nombres de archivo contengan el patrón SX (S1, S2, etc.)');
        console.log('  2. Los nombres contengan FRONTAL, PLAYER_SENDING, o IP');
        console.log('  3. Las etiquetas de plano en "Desglose de pantallas" contengan el mismo patrón SX');
      }
    };

    processFotoFiles();
  }, [fotoFilesFromFolder, data.pantallas, data.fotos, setData, onFotosProcessed]);

  const addFoto = () => {
    setData((d) => ({
      ...d,
      fotos: [...d.fotos, {
        etiquetaPlano: "",
        fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
        fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
        fotoIP: { url: "", fileName: undefined, fileSize: undefined }
      }]
    }));
  };

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Pantallas</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="mb-2">
          <Button onClick={addFoto}>Añadir foto</Button>
        </div>
        {data.fotos.map((f, i) => (
          <div key={i} className="rounded-lg border-2 border-neutral-300 p-4 bg-neutral-50">
            <div className="flex justify-between items-center mb-3">
              <Field className="flex-grow mr-4" label="Etiqueta de plano">
                <Input
                  value={f.etiquetaPlano}
                  disabled
                  className="bg-neutral-100 cursor-not-allowed"
                  title="La etiqueta de plano se sincroniza automáticamente desde 'Desglose de pantallas'"
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
                <h3 className="font-semibold text-neutral-700 mb-2">FOTO FRONTAL</h3>
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
                    <small className="text-neutral-600 mt-1 block">{f.fotoFrontal.fileName}</small>
                  </div>
                )}
              </div>

              {/* Foto Player + Sending */}
              <div className="bg-white rounded-lg border p-3">
                <h3 className="font-semibold text-neutral-700 mb-2">PLAYER + SENDING</h3>
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
                    <small className="text-neutral-600 mt-1 block">{f.fotoPlayer.fileName}</small>
                  </div>
                )}
              </div>

              {/* Foto IP */}
              <div className="bg-white rounded-lg border p-3">
                <h3 className="font-semibold text-neutral-700 mb-2">IP</h3>
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
                    <small className="text-neutral-600 mt-1 block">{f.fotoIP.fileName}</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

