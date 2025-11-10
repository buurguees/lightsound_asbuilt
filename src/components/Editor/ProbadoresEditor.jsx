import { useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const ProbadoresEditor = ({ data, setData, imageInputRefs, probadorFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  // Procesar archivos de probadores recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!probadorFilesFromFolder || probadorFilesFromFolder.length === 0) {
      return;
    }

    // Resetear archivos procesados cuando cambian los archivos
    processedFilesRef.current.clear();

    const processProbadorFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${probadorFilesFromFolder.length} archivo(s) de probadores...`);
      
      const c = structuredClone(data);
      let fotosProcesadas = 0;

      for (const file of probadorFilesFromFolder) {
        const fileName = file.name.toUpperCase();
        console.log(`\n📷 Procesando archivo: ${file.name}`);
        console.log(`   Nombre normalizado: ${fileName}`);
        
        // Determinar tipo de foto según el contenido del nombre del archivo
        let tipoFoto = null;
        let tipoNombre = '';
        
        // Detectar PROBADORES_GENERAL → pasilloProbadores
        if (fileName.includes('PROBADORES_GENERAL')) {
          tipoFoto = 'pasilloProbadores';
          tipoNombre = 'PASILLO PROBADORES';
        } 
        // Detectar DEVICE_SENSOR → probadorLiberado (Sensor Instalado)
        else if (fileName.includes('DEVICE_SENSOR')) {
          tipoFoto = 'probadorLiberado';
          tipoNombre = 'SENSOR INSTALADO';
        } 
        // Detectar CABINA_OCUPADA → probadorOcupado
        else if (fileName.includes('CABINA_OCUPADA')) {
          tipoFoto = 'probadorOcupado';
          tipoNombre = 'PROBADOR OCUPADO';
        }
        
        if (tipoFoto) {
          // Solo actualizar si la foto no está ya asignada
          if (!c.probadores[tipoFoto]?.url) {
            try {
              console.log(`  📤 Importando imagen al bloque "${tipoNombre}":`);
              console.log(`     Archivo: ${file.name}`);
              const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
              c.probadores[tipoFoto] = {
                url: base64,
                fileName: file.name,
                fileSize: file.size
              };
              fotosProcesadas++;
              console.log(`  ✅ ✓ Imagen importada correctamente en el bloque "${tipoNombre}"`);
            } catch (error) {
              console.error(`  ❌ Error procesando ${file.name}:`, error);
            }
          } else {
            console.log(`  ⏭️  ${tipoNombre} ya está asignada, se omite`);
          }
        } else {
          console.log(`  ❌ No se pudo determinar el tipo de foto para: ${file.name}`);
          console.log(`     Buscando: "PROBADORES_GENERAL", "DEVICE_SENSOR", o "CABINA_OCUPADA" en el nombre`);
        }
      }
      
      console.log(`\n✅ Proceso completado: ${fotosProcesadas} foto(s) asignada(s)`);

      // Actualizar el estado con todas las fotos procesadas
      if (fotosProcesadas > 0) {
        // Activar automáticamente la sección si hay imágenes
        c.secciones.probadores = true;
        c.probadores.activo = true;
        setData(c);
      }
    };

    processProbadorFiles();
  }, [probadorFilesFromFolder, data, setData]);

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Probadores</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Probador Ocupado */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-neutral-700 mb-2">PROBADOR OCUPADO</h3>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['probadorOcupado']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['probadorOcupado'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.probadorOcupado = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.probadorOcupado?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.probadorOcupado = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.probadorOcupado?.url && (
            <div>
              <img loading="lazy" src={data.probadores.probadorOcupado.url} alt="Probador ocupado" className="max-h-32 w-full object-contain rounded border" />
              <small className="text-neutral-600 mt-1 block">{data.probadores.probadorOcupado.fileName}</small>
            </div>
          )}
        </div>

        {/* Sensor Instalado */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-neutral-700 mb-2">SENSOR INSTALADO</h3>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['probadorLiberado']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['probadorLiberado'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.probadorLiberado = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.probadorLiberado?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.probadorLiberado = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.probadorLiberado?.url && (
            <div>
              <img loading="lazy" src={data.probadores.probadorLiberado.url} alt="Probador liberado" className="max-h-32 w-full object-contain rounded border" />
              <small className="text-neutral-600 mt-1 block">{data.probadores.probadorLiberado.fileName}</small>
            </div>
          )}
        </div>

        {/* Pasillo Probadores */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-neutral-700 mb-2">PASILLO PROBADORES</h3>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['pasilloProbadores']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['pasilloProbadores'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.pasilloProbadores = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.pasilloProbadores?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.pasilloProbadores = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.pasilloProbadores?.url && (
            <div>
              <img loading="lazy" src={data.probadores.pasilloProbadores.url} alt="Pasillo probadores" className="max-h-32 w-full object-contain rounded border" />
              <small className="text-neutral-600 mt-1 block">{data.probadores.pasilloProbadores.fileName}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

