import { useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const RackAudioEditor = ({ data, setData, imageInputRefs, rackAudioFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  // Procesar archivos de rack audio recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!rackAudioFilesFromFolder || rackAudioFilesFromFolder.length === 0) {
      return;
    }

    // Resetear archivos procesados cuando cambian los archivos
    processedFilesRef.current.clear();

    const processRackAudioFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${rackAudioFilesFromFolder.length} archivo(s) de rack audio...`);
      
      const c = structuredClone(data);
      let fotosProcesadas = 0;

      for (const file of rackAudioFilesFromFolder) {
        const fileName = file.name.toUpperCase();
        console.log(`\n📷 Procesando archivo: ${file.name}`);
        console.log(`   Nombre normalizado: ${fileName}`);
        
        // Determinar tipo de foto según el contenido del nombre del archivo
        let tipoFoto = null;
        let tipoNombre = '';
        
        // Detectar FRONTAL_RACK_AUDIO
        if (fileName.includes('FRONTAL_RACK_AUDIO') || fileName.includes('FRONTAL RACK AUDIO')) {
          tipoFoto = 'frontal';
          tipoNombre = 'FRONTAL RACK AUDIO';
        } 
        // Detectar FRONTAL_ON_THE_SPOT
        else if (fileName.includes('FRONTAL_ON_THE_SPOT') || fileName.includes('FRONTAL ON THE SPOT')) {
          tipoFoto = 'frontalOnTheSpot';
          tipoNombre = 'FRONTAL ON THE SPOT';
        }
        // Detectar TRASERA_RACK_AUDIO
        else if (fileName.includes('TRASERA_RACK_AUDIO') || fileName.includes('TRASERA RACK AUDIO')) {
          tipoFoto = 'trasera';
          tipoNombre = 'TRASERA RACK AUDIO';
        }
        
        if (tipoFoto) {
          try {
            console.log(`  📤 Importando imagen al bloque "${tipoNombre}":`);
            console.log(`     Archivo: ${file.name}`);
            const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
            
            // Si no existe el array de fotos para este tipo, crearlo
            if (!c.rackAudio[tipoFoto]) {
              c.rackAudio[tipoFoto] = [];
            }
            
            // Si es un array, añadir la foto
            if (Array.isArray(c.rackAudio[tipoFoto])) {
              // Verificar si ya existe esta imagen (por nombre de archivo)
              const yaExiste = c.rackAudio[tipoFoto].some(f => f.fileName === file.name);
              if (!yaExiste) {
                c.rackAudio[tipoFoto].push({
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
              const fotoExistente = c.rackAudio[tipoFoto]?.url ? [c.rackAudio[tipoFoto]] : [];
              c.rackAudio[tipoFoto] = [...fotoExistente, {
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
          console.log(`     Buscando: "FRONTAL_RACK_AUDIO" o "TRASERA_RACK_AUDIO" en el nombre`);
        }
      }
      
      console.log(`\n✅ Proceso completado: ${fotosProcesadas} foto(s) asignada(s)`);

      // Actualizar el estado con todas las fotos procesadas
      if (fotosProcesadas > 0) {
        // Activar automáticamente la sección si hay imágenes
        c.secciones.rackAudio = true;
        setData(c);
      }
    };

    processRackAudioFiles();
  }, [rackAudioFilesFromFolder, data, setData]);

  // Función para detectar el tipo de rack audio basándose en el nombre del archivo
  const detectarTipoRackAudio = (fileName) => {
    const nombreUpper = fileName.toUpperCase();
    
    if (nombreUpper.includes('FRONTAL_RACK_AUDIO') || nombreUpper.includes('FRONTAL RACK AUDIO')) {
      return { key: 'frontal', label: 'Frontal Rack Audio' };
    }
    else if (nombreUpper.includes('FRONTAL_ON_THE_SPOT') || nombreUpper.includes('FRONTAL ON THE SPOT')) {
      return { key: 'frontalOnTheSpot', label: 'Frontal On The Spot' };
    }
    else if (nombreUpper.includes('TRASERA_RACK_AUDIO') || nombreUpper.includes('TRASERA RACK AUDIO')) {
      return { key: 'trasera', label: 'Trasera Rack Audio' };
    }
    
    return null;
  };

  // Función para subir imagen manualmente (con tipo específico)
  const handleImageUpload = async (tipoFoto, tipoNombre, file) => {
    if (!file) return;
    
    try {
      const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
      setData((d) => {
        const c = structuredClone(d);
        if (!c.rackAudio[tipoFoto]) {
          c.rackAudio[tipoFoto] = [];
        }
        
        if (Array.isArray(c.rackAudio[tipoFoto])) {
          const yaExiste = c.rackAudio[tipoFoto].some(f => f.fileName === file.name);
          if (!yaExiste) {
            c.rackAudio[tipoFoto].push({
              url: base64,
              fileName: file.name,
              fileSize: file.size
            });
          }
        } else {
          const fotoExistente = c.rackAudio[tipoFoto]?.url ? [c.rackAudio[tipoFoto]] : [];
          c.rackAudio[tipoFoto] = [...fotoExistente, {
            url: base64,
            fileName: file.name,
            fileSize: file.size
          }];
        }
        
        c.secciones.rackAudio = true;
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
      const tipoDetectado = detectarTipoRackAudio(file.name);
      
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
  const handleRemoveImage = (tipoFoto, index) => {
    setData((d) => {
      const c = structuredClone(d);
      if (Array.isArray(c.rackAudio[tipoFoto])) {
        c.rackAudio[tipoFoto].splice(index, 1);
      } else {
        c.rackAudio[tipoFoto] = { url: "", fileName: undefined, fileSize: undefined };
      }
      
      // Si no hay imágenes, desactivar la sección
      const tieneImagenes = (c.rackAudio.frontal && c.rackAudio.frontal.length > 0) ||
                            (c.rackAudio.frontalOnTheSpot && c.rackAudio.frontalOnTheSpot.length > 0) ||
                            (c.rackAudio.trasera && c.rackAudio.trasera.length > 0);
      
      if (!tieneImagenes) {
        c.secciones.rackAudio = false;
      }
      
      return c;
    });
  };

  const tiposRackAudio = [
    { key: 'frontal', label: 'Frontal Rack Audio' },
    { key: 'frontalOnTheSpot', label: 'Frontal On The Spot' },
    { key: 'trasera', label: 'Trasera Rack Audio' }
  ];

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Rack de audio</h2>

      {/* Botón general para subir múltiples imágenes */}
      <div className="mt-4 mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-300">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => imageInputRefs.current['rackAudio_general']?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Subir Imágenes (Detección Automática)
          </Button>
          <input
            ref={el => imageInputRefs.current['rackAudio_general'] = el}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                await handleMultipleImageUpload(Array.from(e.target.files));
                e.target.value = '';
              }
            }}
          />
          <p className="text-xs text-neutral-600">
            Selecciona múltiples imágenes y se asignarán automáticamente según su nombre
          </p>
        </div>
      </div>

      {/* Bloques de imágenes por tipo */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiposRackAudio.map((tipo) => {
          const fotos = Array.isArray(data.rackAudio[tipo.key]) 
            ? data.rackAudio[tipo.key] 
            : (data.rackAudio[tipo.key]?.url ? [data.rackAudio[tipo.key]] : []);
          
          return (
            <div key={tipo.key} className="bg-white rounded-lg border p-3">
              <h3 className="font-semibold text-neutral-700 mb-2">{tipo.label.toUpperCase()}</h3>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current[`rackAudio_${tipo.key}`]?.click()}>
                  Subir {fotos.length > 0 && `(${fotos.length})`}
                </Button>
                <input
                  ref={el => imageInputRefs.current[`rackAudio_${tipo.key}`] = el}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      for (let i = 0; i < e.target.files.length; i++) {
                        await handleImageUpload(tipo.key, tipo.label, e.target.files[i]);
                      }
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
                          className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white"
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

