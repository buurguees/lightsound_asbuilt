import React, { useEffect, useRef } from 'react';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';
import { extractSXPattern } from '../../utils/excelUtils';

export const FotosPantallasEditor = ({ data, setData, imageInputRefs, fotoFilesFromFolder, setFotoFilesFromFolder, onFotosProcessed }) => {
  const processedFilesRef = useRef(new Set());
  const processedBatchKeysRef = useRef(new Set());

  // Sincronizar data.fotos con todas las etiquetas de plano: MKD, Banners, Turnomatic y Welcomer
  useEffect(() => {
    // Recopilar todas las etiquetas de plano de todas las fuentes
    const todasEtiquetas = new Set();
    
    if (data.pantallas && Array.isArray(data.pantallas)) {
      data.pantallas.forEach(p => {
        const etiqueta = String(p.etiquetaPlano || '').trim();
        if (etiqueta) todasEtiquetas.add(etiqueta);
      });
    }
    
    if (data.banners && Array.isArray(data.banners)) {
      data.banners.forEach(b => {
        const etiqueta = String(b.etiquetaPlano || '').trim();
        if (etiqueta) todasEtiquetas.add(etiqueta);
      });
    }
    
    if (data.turnomatic && Array.isArray(data.turnomatic)) {
      data.turnomatic.forEach(t => {
        const etiqueta = String(t.etiquetaPlano || '').trim();
        if (etiqueta) todasEtiquetas.add(etiqueta);
      });
    }
    
    if (data.welcomer && Array.isArray(data.welcomer)) {
      data.welcomer.forEach(w => {
        const etiqueta = String(w.etiquetaPlano || '').trim();
        if (etiqueta) todasEtiquetas.add(etiqueta);
      });
    }

    if (todasEtiquetas.size === 0) return;

    setData((d) => {
      const c = structuredClone(d);
      if (!c.fotos) {
        c.fotos = [];
      }
      
      const etiquetasExistentes = new Set(
        c.fotos.map(f => String(f.etiquetaPlano || '').trim())
      );

      // Crear entradas de fotos para etiquetas que no tengan entrada de foto
      let nuevasEntradas = 0;
      todasEtiquetas.forEach(etiqueta => {
        if (!etiquetasExistentes.has(etiqueta)) {
          c.fotos.push({
            etiquetaPlano: etiqueta,
            nombreBloqueSX: extractSXPattern(etiqueta) || '', // Extraer SX automáticamente si es posible
            fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
            fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
            fotoIP: { url: "", fileName: undefined, fileSize: undefined }
          });
          nuevasEntradas++;
        }
      });

      // Eliminar entradas de fotos que no tengan etiqueta correspondiente (pero mantener las que tienen etiqueta manual)
      c.fotos = c.fotos.filter(f => {
        const etiqueta = String(f.etiquetaPlano || '').trim();
        // Mantener si tiene etiqueta y está en la lista, o si es una entrada manual (sin etiqueta pero con nombre de bloque)
        return !etiqueta || todasEtiquetas.has(etiqueta);
      });

      if (nuevasEntradas > 0) {
        console.log(`📸 Se crearon ${nuevasEntradas} nuevas entradas de fotos desde MKD, Banners, Turnomatic y Welcomer`);
        console.log(`   Total de entradas de fotos: ${c.fotos.length}`);
      }

      return c;
    });
  }, [data.pantallas, data.banners, data.turnomatic, data.welcomer, setData]);

  // Procesar archivos de fotos recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!fotoFilesFromFolder || fotoFilesFromFolder.length === 0) {
      console.log('⚠️ No hay archivos de fotos para procesar');
      return;
    }
    
    // Recopilar todas las etiquetas de plano de todas las fuentes
    const todasEtiquetas = new Set();
    
    if (data.pantallas && Array.isArray(data.pantallas)) {
      data.pantallas.forEach(p => {
        const etiqueta = String(p.etiquetaPlano || '').trim();
        if (etiqueta) todasEtiquetas.add(etiqueta);
      });
    }
    
    if (data.banners && Array.isArray(data.banners)) {
      data.banners.forEach(b => {
        const etiqueta = String(b.etiquetaPlano || '').trim();
        if (etiqueta) todasEtiquetas.add(etiqueta);
      });
    }
    
    if (data.turnomatic && Array.isArray(data.turnomatic)) {
      data.turnomatic.forEach(t => {
        const etiqueta = String(t.etiquetaPlano || '').trim();
        if (etiqueta) todasEtiquetas.add(etiqueta);
      });
    }
    
    if (data.welcomer && Array.isArray(data.welcomer)) {
      data.welcomer.forEach(w => {
        const etiqueta = String(w.etiquetaPlano || '').trim();
        if (etiqueta) todasEtiquetas.add(etiqueta);
      });
    }
    
    if (todasEtiquetas.size === 0) {
      console.log('⚠️ No hay etiquetas de plano importadas. Importa primero el Excel en MKD, Banners, Turnomatic o Welcomer');
      return;
    }
    
    console.log(`\n🔄 Verificando sincronización...`);
    console.log(`   Etiquetas totales: ${todasEtiquetas.size}`);
    console.log(`   Fotos: ${data.fotos?.length || 0}`);
    
    const etiquetasFotos = new Set(
      (data.fotos || []).map(f => String(f.etiquetaPlano || '').trim())
    );
    
    // Verificar que todas las etiquetas tengan su entrada de foto
    const todasTienenFoto = Array.from(todasEtiquetas).every(etiqueta => 
      etiquetasFotos.has(etiqueta)
    );
    
    if (!todasTienenFoto || !data.fotos || data.fotos.length === 0) {
      console.log('⚠️ Las entradas de fotos aún no están sincronizadas. Esperando sincronización...');
      const etiquetasSinFoto = Array.from(todasEtiquetas).filter(e => !etiquetasFotos.has(e));
      if (etiquetasSinFoto.length > 0) {
        console.log(`   Etiquetas sin foto:`, etiquetasSinFoto);
      }
      // No procesar hasta que las fotos estén sincronizadas
      return;
    }

    console.log(`✅ Sincronización OK. Iniciando procesamiento de fotos...`);
    console.log(`   Archivos de fotos: ${fotoFilesFromFolder.length}`);
    console.log(`   Etiquetas totales: ${todasEtiquetas.size}`);
    console.log(`   Entradas de fotos: ${data.fotos.length}`);

    // Evitar reprocesar el mismo lote: clave estable por nombres+tamaños
    const batchKey = fotoFilesFromFolder
      .map(f => `${f.name}#${f.size}`)
      .sort()
      .join('|');
    if (processedBatchKeysRef.current.has(batchKey)) {
      console.log('⏭️ Lote de fotos ya procesado anteriormente. Se omite reprocesado.');
      return;
    }

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
        // Detectar IP CONFIG (prioridad: siempre buscar IP CONFIG o variantes)
        // Acepta variantes: "IP CONFIG", "IP_CONFIG", "IP-CONFIG", "IPCONFIG"
        else if (!fileName.includes('PLAYER')) {
          // Priorizar detección de IP CONFIG (con o sin separadores)
          const isIPConfig = /IP[\s_\-]*CONFIG/i.test(fileName);
          
          // También aceptar variantes básicas de IP si no hay IP CONFIG
          const isIPBasic = !isIPConfig && (
            fileName.includes('_IP') ||
            fileName.endsWith(' IP') ||
            fileName.endsWith('_IP') ||
            fileName.includes('_IP_') ||
            fileName.includes(' IP ') ||
            fileName.includes(' IP_') ||
            fileName.includes('_IP ')
          );
          
          if (isIPConfig || isIPBasic) {
            tipoFoto = 'fotoIP';
            if (isIPConfig) {
              console.log(`  ✅ Detectado IP CONFIG en: ${file.name}`);
            }
          }
        } 
        // Detectar FRONTAL (aceptar FRONT/FRONTAL como token separado)
        else if (/(?:^|[_\s\-])FRONT(?:AL)?(?:$|[_\s\-])/.test(fileName)) {
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

        // Usar el nombre del bloque SX de la entrada de foto, o extraerlo de la etiqueta de plano
        let sxPattern = String(fotoEntry.nombreBloqueSX || '').trim();
        if (!sxPattern) {
          sxPattern = extractSXPattern(etiquetaPlano);
        }
        
        if (!sxPattern) {
          console.log(`  ⚠️ No se encontró patrón SX en etiqueta de plano ni en nombre de bloque: ${etiquetaPlano}`);
          continue;
        }

        console.log(`  ✓ SX usado: ${sxPattern} (${fotoEntry.nombreBloqueSX ? 'desde nombre de bloque' : 'extraído de etiqueta'})`);

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
              const base64 = await compressImage(file, { maxDim: 1000, quality: 0.65 });
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
      // Marcar lote como procesado y limpiar cola en App para no reintentar
      processedBatchKeysRef.current.add(batchKey);
      if (setFotoFilesFromFolder) {
        setFotoFilesFromFolder([]);
      }
    };

    processFotoFiles();
  }, [fotoFilesFromFolder, data.pantallas, data.banners, data.turnomatic, data.welcomer, data.fotos, setData, onFotosProcessed, setFotoFilesFromFolder]);

  const addFoto = () => {
    setData((d) => ({
      ...d,
      fotos: [...(d.fotos || []), {
        etiquetaPlano: "",
        nombreBloqueSX: "",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <Field className="flex-grow" label="Etiqueta de plano">
                <Input
                  value={f.etiquetaPlano || ''}
                  onChange={(e) => {
                    setData((d) => {
                      const c = structuredClone(d);
                      c.fotos[i].etiquetaPlano = e.target.value;
                      // Si no hay nombre de bloque SX, intentar extraerlo automáticamente
                      if (!c.fotos[i].nombreBloqueSX) {
                        const sxAuto = extractSXPattern(e.target.value);
                        if (sxAuto) {
                          c.fotos[i].nombreBloqueSX = sxAuto;
                        }
                      }
                      return c;
                    });
                  }}
                  placeholder="Ej: LED_CIRCLE_0F_ENT_S1"
                  title="Etiqueta de plano (se sincroniza automáticamente desde MKD, Banners, Turnomatic y Welcomer, pero se puede editar manualmente)"
                />
              </Field>
              <Field className="flex-grow" label="Nombre del bloque SX (para asignación de fotos)">
                <Input
                  value={f.nombreBloqueSX || ''}
                  onChange={(e) => {
                    setData((d) => {
                      const c = structuredClone(d);
                      c.fotos[i].nombreBloqueSX = e.target.value;
                      return c;
                    });
                  }}
                  placeholder="Ej: S1, S2, etc."
                  title="Nombre del bloque SX usado para asignar fotos. Se extrae automáticamente de la etiqueta de plano, pero se puede editar manualmente si es necesario."
                />
              </Field>
            </div>
            <div className="mb-3">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              {/* Foto Frontal */}
              <div className="bg-white rounded-lg border p-3">
                <h3 className="font-semibold text-neutral-700 mb-2">FOTO FRONTAL</h3>
                <div className="flex gap-2 mb-2">
                  <Button onClick={() => imageInputRefs.current[`${i}_frontal`]?.click()} className="text-neutral-800">
                    Subir
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`${i}_frontal`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1400, quality: 0.8 });
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
                    }} className="text-neutral-800">
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
                  <Button onClick={() => imageInputRefs.current[`${i}_player`]?.click()} className="text-neutral-800">
                    Subir
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`${i}_player`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1400, quality: 0.8 });
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
                    }} className="text-neutral-800">
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
                  <Button onClick={() => imageInputRefs.current[`${i}_ip`]?.click()} className="text-neutral-800">
                    Subir
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`${i}_ip`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1400, quality: 0.8 });
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
                    }} className="text-neutral-800">
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

