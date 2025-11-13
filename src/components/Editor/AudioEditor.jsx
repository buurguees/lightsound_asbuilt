import { useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const AudioEditor = ({ data, setData, imageInputRefs, audioFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  // Procesar archivos de audio recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!audioFilesFromFolder || audioFilesFromFolder.length === 0) {
      return;
    }

    // Resetear archivos procesados cuando cambian los archivos
    processedFilesRef.current.clear();

    const processAudioFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${audioFilesFromFolder.length} archivo(s) de audio...`);
      
      const c = structuredClone(data);
      let fotosProcesadas = 0;

      for (const file of audioFilesFromFolder) {
        const fileName = file.name.toUpperCase();
        console.log(`\n📷 Procesando archivo: ${file.name}`);
        console.log(`   Nombre normalizado: ${fileName}`);
        
        // Determinar tipo de foto según el contenido del nombre del archivo
        // Orden importante: detectar nomenclaturas más específicas primero
        let tipoFoto = null;
        let tipoNombre = '';
        
        // Detectar tipos específicos de ALTAVOZ (orden específico primero)
        if (fileName.includes('ALTAVOZ ESPECIAL')) {
          tipoFoto = 'altavozEspecial';
          tipoNombre = 'ALTAVOZ ESPECIAL';
        }
        else if (fileName.includes('ALTAVOZ KITCHEN OFFICE')) {
          tipoFoto = 'altavozKitchenOffice';
          tipoNombre = 'ALTAVOZ KITCHEN OFFICE';
        }
        else if (fileName.includes('ALTAVOZ ZONA COMÚN') || fileName.includes('ALTAVOZ ZONA COMUN')) {
          tipoFoto = 'altavozZonaComun';
          tipoNombre = 'ALTAVOZ ZONA COMÚN';
        }
        else if (fileName.includes('ALTAVOZ FULL RANGE')) {
          tipoFoto = 'altavozFullRange';
          tipoNombre = 'ALTAVOZ FULL RANGE';
        }
        else if (fileName.includes('ALTAVOZ ALMACÉN') || fileName.includes('ALTAVOZ ALMACEN')) {
          tipoFoto = 'altavozAlmacen';
          tipoNombre = 'ALTAVOZ ALMACÉN';
        }
        else if (fileName.includes('ALTAVOZ PROBADORES')) {
          tipoFoto = 'altavozProbadores';
          tipoNombre = 'ALTAVOZ PROBADORES';
        }
        else if (fileName.includes('ALTAVOZ OFFICE')) {
          tipoFoto = 'altavozOffice';
          tipoNombre = 'ALTAVOZ OFFICE';
        }
        else if (fileName.includes('ALTAVOZ')) {
          tipoFoto = 'altavoz';
          tipoNombre = 'ALTAVOZ';
        }
        // Detectar TORRE ACÚSTICA
        else if (fileName.includes('TORRE ACÚSTICA') || fileName.includes('TORRE ACUSTICA')) {
          tipoFoto = 'torreAcustica';
          tipoNombre = 'TORRE ACÚSTICA';
        }
        else if (fileName.includes('TORRE')) {
          tipoFoto = 'torre';
          tipoNombre = 'TORRE';
        }
        // Detectar CLUSTER
        else if (fileName.includes('CLUSTER')) {
          tipoFoto = 'cluster';
          tipoNombre = 'CLUSTER';
        }
        // Detectar SUBWOOFER
        else if (fileName.includes('SUBWOOFER')) {
          tipoFoto = 'subwoofer';
          tipoNombre = 'SUBWOOFER';
        }
        // Detectar SUB-GRAVE o SUB-GRABE (puede estar como SUB-GRAVE, SUB-GRABE, SUBGRAVE, SUBGRABE, SUB_GRAVE, SUB_GRABE)
        else if (fileName.includes('SUB-GRAVE') || fileName.includes('SUBGRAVE') || fileName.includes('SUB_GRAVE')) {
          tipoFoto = 'subGrave';
          tipoNombre = 'SUB-GRAVE';
        }
        else if (fileName.includes('SUB-GRABE') || fileName.includes('SUBGRABE') || fileName.includes('SUB_GRABE')) {
          tipoFoto = 'subGrabe';
          tipoNombre = 'SUB-GRABE';
        }
        // Detectar MICRO (renombrar a MICRÓFONO)
        else if (fileName.includes('MICRO')) {
          tipoFoto = 'microfono';
          tipoNombre = 'MICRÓFONO';
        }
        // Detectar BUCLE (renombrar a BUCLE DE INDUCCIÓN)
        else if (fileName.includes('BUCLE')) {
          tipoFoto = 'bucleInduccion';
          tipoNombre = 'BUCLE DE INDUCCIÓN';
        }
        
        if (tipoFoto) {
          try {
            console.log(`  📤 Importando imagen al bloque "${tipoNombre}":`);
            console.log(`     Archivo: ${file.name}`);
            const base64 = await compressImage(file, { maxDim: 1000, quality: 0.65 });
            
            // Si no existe el array de fotos para este tipo, crearlo
            if (!c.audio[tipoFoto]) {
              c.audio[tipoFoto] = [];
            }
            
            // Si es un array, añadir la foto
            if (Array.isArray(c.audio[tipoFoto])) {
              // Verificar si ya existe esta imagen (por nombre de archivo)
              const yaExiste = c.audio[tipoFoto].some(f => f.fileName === file.name);
              if (!yaExiste) {
                c.audio[tipoFoto].push({
                  url: base64,
                  fileName: file.name,
                  fileSize: file.size
                });
                fotosProcesadas++;
                console.log(`  ✅ ✓ Imagen importada correctamente en el bloque "${tipoNombre}"`);
              } else {
                console.log(`  ⏭️  Imagen "${file.name}" ya existe en "${tipoNombre}", se omite`);
              }
            } else {
              // Si no es array, convertir a array y añadir la foto
              const fotoExistente = c.audio[tipoFoto]?.url ? [c.audio[tipoFoto]] : [];
              c.audio[tipoFoto] = [...fotoExistente, {
                url: base64,
                fileName: file.name,
                fileSize: file.size
              }];
              fotosProcesadas++;
              console.log(`  ✅ ✓ Imagen importada correctamente en el bloque "${tipoNombre}"`);
            }
          } catch (error) {
            console.error(`  ❌ Error procesando ${file.name}:`, error);
          }
        } else {
          console.log(`  ❌ No se pudo determinar el tipo de foto para: ${file.name}`);
          console.log(`     Buscando nomenclaturas de audio en el nombre`);
        }
      }
      
      console.log(`\n✅ Proceso completado: ${fotosProcesadas} foto(s) asignada(s)`);

      // Actualizar el estado con todas las fotos procesadas
      if (fotosProcesadas > 0) {
        // Activar automáticamente la sección si hay imágenes
        c.secciones.audio = true;
        c.audio.activo = true;
        setData(c);
      }
    };

    processAudioFiles();
  }, [audioFilesFromFolder, data, setData]);

  // Función para detectar el tipo de audio basándose en el nombre del archivo
  const detectarTipoAudio = (fileName) => {
    const nombreUpper = fileName.toUpperCase();
    
    // Detectar tipos específicos de ALTAVOZ (orden específico primero)
    if (nombreUpper.includes('ALTAVOZ ESPECIAL')) {
      return { key: 'altavozEspecial', label: 'Altavoz Especial' };
    }
    else if (nombreUpper.includes('ALTAVOZ KITCHEN OFFICE')) {
      return { key: 'altavozKitchenOffice', label: 'Altavoz Kitchen Office' };
    }
    else if (nombreUpper.includes('ALTAVOZ ZONA COMÚN') || nombreUpper.includes('ALTAVOZ ZONA COMUN')) {
      return { key: 'altavozZonaComun', label: 'Altavoz Zona Común' };
    }
    else if (nombreUpper.includes('ALTAVOZ FULL RANGE')) {
      return { key: 'altavozFullRange', label: 'Altavoz Full Range' };
    }
    else if (nombreUpper.includes('ALTAVOZ ALMACÉN') || nombreUpper.includes('ALTAVOZ ALMACEN')) {
      return { key: 'altavozAlmacen', label: 'Altavoz Almacén' };
    }
    else if (nombreUpper.includes('ALTAVOZ PROBADORES')) {
      return { key: 'altavozProbadores', label: 'Altavoz Probadores' };
    }
    else if (nombreUpper.includes('ALTAVOZ OFFICE')) {
      return { key: 'altavozOffice', label: 'Altavoz Office' };
    }
    else if (nombreUpper.includes('ALTAVOZ')) {
      return { key: 'altavoz', label: 'Altavoz' };
    }
    // Detectar TORRE ACÚSTICA
    else if (nombreUpper.includes('TORRE ACÚSTICA') || nombreUpper.includes('TORRE ACUSTICA')) {
      return { key: 'torreAcustica', label: 'Torre Acústica' };
    }
    else if (nombreUpper.includes('TORRE')) {
      return { key: 'torre', label: 'Torre' };
    }
    // Detectar CLUSTER
    else if (nombreUpper.includes('CLUSTER')) {
      return { key: 'cluster', label: 'Cluster' };
    }
    // Detectar SUBWOOFER
    else if (nombreUpper.includes('SUBWOOFER')) {
      return { key: 'subwoofer', label: 'Subwoofer' };
    }
    // Detectar SUB-GRAVE o SUB-GRABE
    else if (nombreUpper.includes('SUB-GRAVE') || nombreUpper.includes('SUBGRAVE') || nombreUpper.includes('SUB_GRAVE')) {
      return { key: 'subGrave', label: 'Sub-grave' };
    }
    else if (nombreUpper.includes('SUB-GRABE') || nombreUpper.includes('SUBGRABE') || nombreUpper.includes('SUB_GRABE')) {
      return { key: 'subGrabe', label: 'Sub-grabe' };
    }
    // Detectar MICRO (renombrar a MICRÓFONO)
    else if (nombreUpper.includes('MICRO')) {
      return { key: 'microfono', label: 'Micrófono' };
    }
    // Detectar BUCLE (renombrar a BUCLE DE INDUCCIÓN)
    else if (nombreUpper.includes('BUCLE')) {
      return { key: 'bucleInduccion', label: 'Bucle de Inducción' };
    }
    
    return null;
  };

  // Función para subir imagen manualmente (con tipo específico)
  const handleImageUpload = async (tipoFoto, tipoNombre, file) => {
    if (!file) return;
    
    try {
      const base64 = await compressImage(file, { maxDim: 1400, quality: 0.8 });
      setData((d) => {
        const c = structuredClone(d);
        if (!c.audio[tipoFoto]) {
          c.audio[tipoFoto] = [];
        }
        
        // Si es un array, añadir la foto
        if (Array.isArray(c.audio[tipoFoto])) {
          // Verificar si ya existe esta imagen (por nombre de archivo)
          const yaExiste = c.audio[tipoFoto].some(f => f.fileName === file.name);
          if (!yaExiste) {
            c.audio[tipoFoto].push({
              url: base64,
              fileName: file.name,
              fileSize: file.size
            });
          }
        } else {
          // Si no es array, convertir a objeto simple
          c.audio[tipoFoto] = {
            url: base64,
            fileName: file.name,
            fileSize: file.size
          };
        }
        
        c.secciones.audio = true;
        c.audio.activo = true;
        return c;
      });
    } catch (error) {
      console.error(`Error procesando imagen ${file.name}:`, error);
    }
  };

  // Función para subir múltiples imágenes y asignarlas automáticamente
  const handleMultipleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    const resultados = {
      exitosas: 0,
      sinTipo: [],
      errores: []
    };
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tipoDetectado = detectarTipoAudio(file.name);
      
      if (tipoDetectado) {
        try {
          await handleImageUpload(tipoDetectado.key, tipoDetectado.label, file);
          resultados.exitosas++;
        } catch (error) {
          resultados.errores.push({ file: file.name, error: error.message });
        }
      } else {
        resultados.sinTipo.push(file.name);
      }
    }
    
    // Mostrar resumen
    if (resultados.sinTipo.length > 0 || resultados.errores.length > 0) {
      let mensaje = `✅ ${resultados.exitosas} imagen(es) subida(s) correctamente.\n\n`;
      if (resultados.sinTipo.length > 0) {
        mensaje += `⚠️ ${resultados.sinTipo.length} imagen(es) no se pudo(n) clasificar (no se encontró nomenclatura reconocida):\n${resultados.sinTipo.join('\n')}\n\n`;
      }
      if (resultados.errores.length > 0) {
        mensaje += `❌ ${resultados.errores.length} error(es) al procesar:\n${resultados.errores.map(e => `${e.file}: ${e.error}`).join('\n')}`;
      }
      alert(mensaje);
    } else if (resultados.exitosas > 0) {
      alert(`✅ ${resultados.exitosas} imagen(es) subida(s) correctamente y asignada(s) automáticamente.`);
    }
  };

  // Función para eliminar imagen
  const handleRemoveImage = (tipoFoto, index = null) => {
    setData((d) => {
      const c = structuredClone(d);
      if (Array.isArray(c.audio[tipoFoto])) {
        if (index !== null) {
          c.audio[tipoFoto].splice(index, 1);
        } else {
          c.audio[tipoFoto] = [];
        }
      } else {
        c.audio[tipoFoto] = { url: "", fileName: undefined, fileSize: undefined };
      }
      
      // Si no hay imágenes, desactivar la sección
      const tieneImagenes = Object.keys(c.audio).some(key => {
        const valor = c.audio[key];
        if (Array.isArray(valor)) {
          return valor.length > 0;
        }
        return valor?.url;
      });
      
      if (!tieneImagenes) {
        c.secciones.audio = false;
        c.audio.activo = false;
      }
      
      return c;
    });
  };

  // Obtener todos los tipos de audio específicos que se deben mostrar siempre
  const tiposAudioOrdenados = [
    { key: 'altavozOffice', label: 'ALTAVOZ OFFICE' },
    { key: 'altavozZonaComun', label: 'ALTAVOZ ZONA COMÚN' },
    { key: 'altavozKitchenOffice', label: 'ALTAVOZ KITCHEN OFFICE' },
    { key: 'torreAcustica', label: 'TORRE ACÚSTICA' },
    { key: 'altavozAlmacen', label: 'ALTAVOZ ALMACÉN' },
    { key: 'altavozEspecial', label: 'ALTAVOZ ESPECIAL' },
    { key: 'altavozFullRange', label: 'ALTAVOZ FULL RANGE' },
    { key: 'subGrave', label: 'SUB-GRAVE' },
    { key: 'altavozProbadores', label: 'ALTAVOZ PROBADORES' },
    { key: 'cluster', label: 'CLUSTER' },
    { key: 'microfono', label: 'MICRÓFONO' },
    { key: 'bucleInduccion', label: 'BUCLE DE INDUCCIÓN' }
  ];

  // Mostrar todos los tipos específicos, no solo los que tienen fotos
  const tiposAudio = tiposAudioOrdenados;

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Audio</h2>

      {/* Botón general para subir múltiples imágenes */}
      <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-300">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => imageInputRefs.current['audio_general']?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Subir Imágenes (Detección Automática)
          </Button>
          <input
            ref={el => imageInputRefs.current['audio_general'] = el}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                await handleMultipleImageUpload(Array.from(e.target.files));
                // Limpiar el input para permitir seleccionar las mismas imágenes de nuevo
                e.target.value = '';
              }
            }}
          />
          <p className="text-xs text-neutral-600">
            Selecciona múltiples imágenes y se asignarán automáticamente según su nombre
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiposAudio.map((tipo) => {
          const fotos = Array.isArray(data.audio[tipo.key]) 
            ? data.audio[tipo.key] 
            : (data.audio[tipo.key]?.url ? [data.audio[tipo.key]] : []);
          
          return (
            <div key={tipo.key} className="bg-white rounded-lg border p-3">
              <h3 className="font-semibold text-neutral-700 mb-2">{tipo.label}</h3>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current[`audio_${tipo.key}`]?.click()} className="text-neutral-800">
                  Subir {fotos.length > 0 && `(${fotos.length})`}
                </Button>
                <input
                  ref={el => imageInputRefs.current[`audio_${tipo.key}`] = el}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      // Procesar todas las imágenes seleccionadas
                      for (let i = 0; i < e.target.files.length; i++) {
                        await handleImageUpload(tipo.key, tipo.label, e.target.files[i]);
                      }
                      // Limpiar el input para permitir seleccionar las mismas imágenes de nuevo
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              
              {fotos.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs text-neutral-500 mb-2">
                    {fotos.length} foto{fotos.length !== 1 ? 's' : ''} subida{fotos.length !== 1 ? 's' : ''}
                  </div>
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative border rounded p-2 bg-neutral-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-semibold text-neutral-600">
                          {tipo.label} {fotos.length > 1 ? `_${index + 1}` : ''}
                        </div>
                        <Button 
                          onClick={() => handleRemoveImage(tipo.key, index)}
                          className="text-base px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold min-w-[28px] min-h-[28px] flex items-center justify-center"
                          title="Eliminar esta imagen"
                        >
                          ✕
                        </Button>
                      </div>
                      <img 
                        loading="lazy" 
                        src={foto.url} 
                        alt={`${tipo.label} ${index + 1}`} 
                        className="max-h-40 w-full object-contain rounded border bg-white" 
                      />
                      <small className="text-neutral-600 mt-1 block text-xs truncate" title={foto.fileName}>
                        {foto.fileName}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

