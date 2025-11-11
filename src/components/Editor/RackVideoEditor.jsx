import { useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const RackVideoEditor = ({ data, setData, imageInputRefs, rackVideoFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  // Procesar archivos de rack video recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!rackVideoFilesFromFolder || rackVideoFilesFromFolder.length === 0) {
      return;
    }

    // Resetear archivos procesados cuando cambian los archivos
    processedFilesRef.current.clear();

    const processRackVideoFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${rackVideoFilesFromFolder.length} archivo(s) de rack video...`);
      
      const c = structuredClone(data);
      let fotosProcesadas = 0;

      for (const file of rackVideoFilesFromFolder) {
        const fileName = file.name.toUpperCase();
        console.log(`\n📷 Procesando archivo: ${file.name}`);
        console.log(`   Nombre normalizado: ${fileName}`);
        
        // Determinar tipo de foto según el contenido del nombre del archivo
        // Orden importante: detectar nomenclaturas más específicas primero
        let tipoFoto = null;
        let tipoNombre = '';
        
        // Detectar FRONTAL_RACK_COMUNICACIONES (más específico, debe ir primero)
        if (fileName.includes('FRONTAL_RACK_COMUNICACIONES') || fileName.includes('FRONTAL RACK COMUNICACIONES') || fileName.includes('FRONTAL_RACK_COMUNICACION')) {
          tipoFoto = 'frontalComunicaciones';
          tipoNombre = 'FRONTAL RACK COMUNICACIONES';
        }
        // Detectar FRONTAL_RACK_VIDEO
        else if (fileName.includes('FRONTAL_RACK_VIDEO') || fileName.includes('FRONTAL RACK VIDEO')) {
          tipoFoto = 'frontal';
          tipoNombre = 'FRONTAL RACK VIDEO';
        } 
        // Detectar TRASERA_RACK_VIDEO
        else if (fileName.includes('TRASERA_RACK_VIDEO') || fileName.includes('TRASERA RACK VIDEO')) {
          tipoFoto = 'trasera';
          tipoNombre = 'TRASERA RACK VIDEO';
        }
        
        if (tipoFoto) {
          try {
            console.log(`  📤 Importando imagen al bloque "${tipoNombre}":`);
            console.log(`     Archivo: ${file.name}`);
            const base64 = await compressImage(file, { maxDim: 1400, quality: 0.8 });
            
            // Si no existe el array de fotos para este tipo, crearlo
            if (!c.rackVideo[tipoFoto]) {
              c.rackVideo[tipoFoto] = [];
            }
            
            // Si es un array, añadir la foto
            if (Array.isArray(c.rackVideo[tipoFoto])) {
              // Verificar si ya existe esta imagen (por nombre de archivo)
              const yaExiste = c.rackVideo[tipoFoto].some(f => f.fileName === file.name);
              if (!yaExiste) {
                c.rackVideo[tipoFoto].push({
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
              const fotoExistente = c.rackVideo[tipoFoto]?.url ? [c.rackVideo[tipoFoto]] : [];
              c.rackVideo[tipoFoto] = [...fotoExistente, {
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
          console.log(`     Buscando: "FRONTAL_RACK_VIDEO" o "TRASERA_RACK_VIDEO" en el nombre`);
        }
      }
      
      console.log(`\n✅ Proceso completado: ${fotosProcesadas} foto(s) asignada(s)`);

      // Actualizar el estado con todas las fotos procesadas
      if (fotosProcesadas > 0) {
        // Activar automáticamente la sección si hay imágenes
        c.secciones.rackVideo = true;
        setData(c);
      }
    };

    processRackVideoFiles();
  }, [rackVideoFilesFromFolder, data, setData]);

  // Función para detectar el tipo de rack video basándose en el nombre del archivo
  const detectarTipoRackVideo = (fileName) => {
    const nombreUpper = fileName.toUpperCase();
    
    // Orden importante: detectar nomenclaturas más específicas primero
    if (nombreUpper.includes('FRONTAL_RACK_COMUNICACIONES') || nombreUpper.includes('FRONTAL RACK COMUNICACIONES') || nombreUpper.includes('FRONTAL_RACK_COMUNICACION')) {
      return { key: 'frontalComunicaciones', label: 'Frontal Rack Comunicaciones' };
    }
    else if (nombreUpper.includes('FRONTAL_RACK_VIDEO') || nombreUpper.includes('FRONTAL RACK VIDEO')) {
      return { key: 'frontal', label: 'Frontal Rack Video' };
    }
    else if (nombreUpper.includes('TRASERA_RACK_VIDEO') || nombreUpper.includes('TRASERA RACK VIDEO')) {
      return { key: 'trasera', label: 'Trasera Rack Video' };
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
        if (!c.rackVideo[tipoFoto]) {
          c.rackVideo[tipoFoto] = [];
        }
        
        if (Array.isArray(c.rackVideo[tipoFoto])) {
          const yaExiste = c.rackVideo[tipoFoto].some(f => f.fileName === file.name);
          if (!yaExiste) {
            c.rackVideo[tipoFoto].push({
              url: base64,
              fileName: file.name,
              fileSize: file.size
            });
          }
        } else {
          const fotoExistente = c.rackVideo[tipoFoto]?.url ? [c.rackVideo[tipoFoto]] : [];
          c.rackVideo[tipoFoto] = [...fotoExistente, {
            url: base64,
            fileName: file.name,
            fileSize: file.size
          }];
        }
        
        c.secciones.rackVideo = true;
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
      const tipoDetectado = detectarTipoRackVideo(file.name);
      
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
      if (Array.isArray(c.rackVideo[tipoFoto])) {
        c.rackVideo[tipoFoto].splice(index, 1);
      } else {
        c.rackVideo[tipoFoto] = { url: "", fileName: undefined, fileSize: undefined };
      }
      
      // Si no hay imágenes, desactivar la sección
      const tieneImagenes = (c.rackVideo.frontal && c.rackVideo.frontal.length > 0) ||
                            (c.rackVideo.frontalComunicaciones && c.rackVideo.frontalComunicaciones.length > 0) ||
                            (c.rackVideo.trasera && c.rackVideo.trasera.length > 0);
      
      if (!tieneImagenes) {
        c.secciones.rackVideo = false;
      }
      
      return c;
    });
  };

  const tiposRackVideo = [
    { key: 'frontal', label: 'Frontal Rack Video' },
    { key: 'frontalComunicaciones', label: 'Frontal Rack Comunicaciones' },
    { key: 'trasera', label: 'Trasera Rack Video' }
  ];

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Rack de vídeo</h2>

      {/* Botón general para subir múltiples imágenes */}
      <div className="mt-4 mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-300">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => imageInputRefs.current['rackVideo_general']?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Subir Imágenes (Detección Automática)
          </Button>
          <input
            ref={el => imageInputRefs.current['rackVideo_general'] = el}
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
        {tiposRackVideo.map((tipo) => {
          const fotos = Array.isArray(data.rackVideo[tipo.key]) 
            ? data.rackVideo[tipo.key] 
            : (data.rackVideo[tipo.key]?.url ? [data.rackVideo[tipo.key]] : []);
          
          return (
            <div key={tipo.key} className="bg-white rounded-lg border p-3">
              <h3 className="font-semibold text-neutral-700 mb-2">{tipo.label.toUpperCase()}</h3>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current[`rackVideo_${tipo.key}`]?.click()}>
                  Subir {fotos.length > 0 && `(${fotos.length})`}
                </Button>
                <input
                  ref={el => imageInputRefs.current[`rackVideo_${tipo.key}`] = el}
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

