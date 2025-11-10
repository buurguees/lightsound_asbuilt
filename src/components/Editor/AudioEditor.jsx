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
        let tipoFoto = null;
        let tipoNombre = '';
        
        // Detectar ALTAVOZ
        if (fileName.includes('ALTAVOZ')) {
          tipoFoto = 'altavoz';
          tipoNombre = 'ALTAVOZ';
        } 
        // Detectar TORRE
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
        // Detectar SUB-GRABE (puede estar como SUB-GRABE, SUBGRABE, SUB_GRABE)
        else if (fileName.includes('SUB-GRABE') || fileName.includes('SUBGRABE') || fileName.includes('SUB_GRABE')) {
          tipoFoto = 'subGrabe';
          tipoNombre = 'SUB-GRABE';
        }
        
        if (tipoFoto) {
          try {
            console.log(`  📤 Importando imagen al bloque "${tipoNombre}":`);
            console.log(`     Archivo: ${file.name}`);
            const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
            
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
          console.log(`     Buscando: "ALTAVOZ", "TORRE", "CLUSTER", "SUBWOOFER", o "SUB-GRABE" en el nombre`);
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

  // Función para subir imagen manualmente
  const handleImageUpload = async (tipoFoto, tipoNombre, file) => {
    if (!file) return;
    
    try {
      const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
      setData((d) => {
        const c = structuredClone(d);
        if (!c.audio[tipoFoto]) {
          c.audio[tipoFoto] = [];
        }
        
        // Si es un array, añadir la foto
        if (Array.isArray(c.audio[tipoFoto])) {
          c.audio[tipoFoto].push({
            url: base64,
            fileName: file.name,
            fileSize: file.size
          });
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

  const tiposAudio = [
    { key: 'altavoz', label: 'Altavoz' },
    { key: 'torre', label: 'Torre' },
    { key: 'cluster', label: 'Cluster' },
    { key: 'subwoofer', label: 'Subwoofer' },
    { key: 'subGrabe', label: 'Sub-grabe' }
  ];

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Audio</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiposAudio.map((tipo) => {
          const fotos = Array.isArray(data.audio[tipo.key]) 
            ? data.audio[tipo.key] 
            : (data.audio[tipo.key]?.url ? [data.audio[tipo.key]] : []);
          
          return (
            <div key={tipo.key} className="bg-white rounded-lg border p-3">
              <h3 className="font-semibold text-neutral-700 mb-2">{tipo.label.toUpperCase()}</h3>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current[`audio_${tipo.key}`]?.click()}>
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
                      <div className="text-xs font-semibold text-neutral-600 mb-1">
                        Foto {index + 1}
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
                      <Button 
                        onClick={() => handleRemoveImage(tipo.key, index)}
                        className="mt-2 text-xs w-full"
                      >
                        Eliminar
                      </Button>
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

