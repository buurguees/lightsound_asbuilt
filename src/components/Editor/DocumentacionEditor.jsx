import { useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { compressImage } from '../../utils/imageUtils';

export const DocumentacionEditor = ({ data, setData, imageInputRefs, documentacionFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  // Sincronizar data.documentacion.conexionado con todas las etiquetas de planos
  useEffect(() => {
    const todasEtiquetas = [];
    
    if (data.pantallas && Array.isArray(data.pantallas)) {
      data.pantallas.forEach(p => {
        if (p.etiquetaPlano) {
          todasEtiquetas.push({
            etiquetaPlano: p.etiquetaPlano,
            puertoPatch: p.puertoPatch || '',
            puertoSwitch: p.puertoSwitch || '',
            contrato: p.contrato || '',
            termicoPantalla: p.termicoPantalla || '',
            termicoPC: p.termicoPC || ''
          });
        }
      });
    }
    
    if (data.banners && Array.isArray(data.banners)) {
      data.banners.forEach(b => {
        if (b.etiquetaPlano) {
          todasEtiquetas.push({
            etiquetaPlano: b.etiquetaPlano,
            puertoPatch: b.puertoPatch || '',
            puertoSwitch: b.puertoSwitch || '',
            contrato: b.contrato || '',
            termicoPantalla: b.termicoPantalla || '',
            termicoPC: b.termicoPC || ''
          });
        }
      });
    }
    
    if (data.turnomatic && Array.isArray(data.turnomatic)) {
      data.turnomatic.forEach(t => {
        if (t.etiquetaPlano) {
          todasEtiquetas.push({
            etiquetaPlano: t.etiquetaPlano,
            puertoPatch: t.puertoPatch || '',
            puertoSwitch: t.puertoSwitch || '',
            contrato: t.contrato || '',
            termicoPantalla: t.termicoPantalla || '',
            termicoPC: t.termicoPC || ''
          });
        }
      });
    }
    
    if (data.welcomer && Array.isArray(data.welcomer)) {
      data.welcomer.forEach(w => {
        if (w.etiquetaPlano) {
          todasEtiquetas.push({
            etiquetaPlano: w.etiquetaPlano,
            puertoPatch: w.puertoPatch || '',
            puertoSwitch: w.puertoSwitch || '',
            contrato: w.contrato || '',
            termicoPantalla: w.termicoPantalla || '',
            termicoPC: w.termicoPC || ''
          });
        }
      });
    }
    
    if (todasEtiquetas.length > 0) {
      setData((d) => {
        const c = structuredClone(d);
        if (!c.documentacion) {
          c.documentacion = { docBox: [], avBox: [], conexionado: [] };
        }
        if (!c.documentacion.conexionado) {
          c.documentacion.conexionado = [];
        }
        
        const etiquetasExistentes = new Set(
          c.documentacion.conexionado.map(item => String(item.etiquetaPlano || '').trim())
        );
        
        todasEtiquetas.forEach(etiqueta => {
          const etiquetaStr = String(etiqueta.etiquetaPlano || '').trim();
          if (etiquetaStr && !etiquetasExistentes.has(etiquetaStr)) {
            c.documentacion.conexionado.push({
              etiquetaPlano: etiquetaStr,
              puertoPatch: etiqueta.puertoPatch || '',
              puertoSwitch: etiqueta.puertoSwitch || '',
              contrato: etiqueta.contrato || '',
              termicoPantalla: etiqueta.termicoPantalla || '',
              termicoPC: etiqueta.termicoPC || ''
            });
          } else if (etiquetasExistentes.has(etiquetaStr)) {
            // Actualizar campos desde los módulos si están vacíos en conexionado
            const index = c.documentacion.conexionado.findIndex(item => 
              String(item.etiquetaPlano || '').trim() === etiquetaStr
            );
            if (index >= 0) {
              const item = c.documentacion.conexionado[index];
              if (!item.puertoPatch && etiqueta.puertoPatch) item.puertoPatch = etiqueta.puertoPatch;
              if (!item.puertoSwitch && etiqueta.puertoSwitch) item.puertoSwitch = etiqueta.puertoSwitch;
              if (!item.contrato && etiqueta.contrato) item.contrato = etiqueta.contrato;
              if (!item.termicoPantalla && etiqueta.termicoPantalla) item.termicoPantalla = etiqueta.termicoPantalla;
              if (!item.termicoPC && etiqueta.termicoPC) item.termicoPC = etiqueta.termicoPC;
            }
          }
        });
        
        const etiquetasValidas = new Set(
          todasEtiquetas.map(e => String(e.etiquetaPlano || '').trim())
        );
        c.documentacion.conexionado = c.documentacion.conexionado.filter(item => {
          const etiquetaStr = String(item.etiquetaPlano || '').trim();
          return !etiquetaStr || etiquetasValidas.has(etiquetaStr);
        });
        
        return c;
      });
    }
  }, [data.pantallas, data.banners, data.turnomatic, data.welcomer, setData]);

  // Procesar archivos de documentación recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!documentacionFilesFromFolder || documentacionFilesFromFolder.length === 0) {
      return;
    }

    // Resetear archivos procesados cuando cambian los archivos
    processedFilesRef.current.clear();

    const processDocumentacionFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${documentacionFilesFromFolder.length} archivo(s) de documentación...`);
      
      const c = structuredClone(data);
      let fotosProcesadas = 0;

      for (const file of documentacionFilesFromFolder) {
        const fileName = file.name.toUpperCase();
        console.log(`\n📷 Procesando archivo: ${file.name}`);
        console.log(`   Nombre normalizado: ${fileName}`);
        
        // Determinar tipo de foto según el contenido del nombre del archivo
        let tipoFoto = null;
        let tipoNombre = '';
        
        // Detectar DOC_BOX
        if (fileName.includes('DOC_BOX') || fileName.includes('DOC BOX')) {
          tipoFoto = 'docBox';
          tipoNombre = 'DOC BOX';
        } 
        // Detectar AV_BOX
        else if (fileName.includes('AV_BOX') || fileName.includes('AV BOX')) {
          tipoFoto = 'avBox';
          tipoNombre = 'AV BOX';
        }
        
        if (tipoFoto) {
          try {
            console.log(`  📤 Importando imagen al bloque "${tipoNombre}":`);
            console.log(`     Archivo: ${file.name}`);
            const base64 = await compressImage(file, { maxDim: 1400, quality: 0.8 });
            
            // Asegurar que documentacion existe
            if (!c.documentacion) {
              c.documentacion = { docBox: [], avBox: [] };
            }
            // Si no existe el array de fotos para este tipo, crearlo
            if (!c.documentacion[tipoFoto]) {
              c.documentacion[tipoFoto] = [];
            }
            
            // Si es un array, añadir la foto
            if (Array.isArray(c.documentacion[tipoFoto])) {
              // Verificar si ya existe esta imagen (por nombre de archivo)
              const yaExiste = c.documentacion[tipoFoto].some(f => f.fileName === file.name);
              if (!yaExiste) {
                c.documentacion[tipoFoto].push({
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
              const fotoExistente = c.documentacion[tipoFoto]?.url ? [c.documentacion[tipoFoto]] : [];
              c.documentacion[tipoFoto] = [...fotoExistente, {
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
          console.log(`     Buscando: "DOC_BOX" o "AV_BOX" en el nombre`);
        }
      }
      
      console.log(`\n✅ Proceso completado: ${fotosProcesadas} foto(s) asignada(s)`);

      // Actualizar el estado con todas las fotos procesadas
      if (fotosProcesadas > 0) {
        // Activar automáticamente la sección si hay imágenes
        c.secciones.documentacion = true;
        setData(c);
      }
    };

    processDocumentacionFiles();
  }, [documentacionFilesFromFolder, data, setData]);

  // Función para detectar el tipo de documentación basándose en el nombre del archivo
  const detectarTipoDocumentacion = (fileName) => {
    const nombreUpper = fileName.toUpperCase();
    
    if (nombreUpper.includes('DOC_BOX') || nombreUpper.includes('DOC BOX')) {
      return { key: 'docBox', label: 'DOC BOX' };
    }
    else if (nombreUpper.includes('AV_BOX') || nombreUpper.includes('AV BOX')) {
      return { key: 'avBox', label: 'AV BOX' };
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
        // Asegurar que documentacion existe
        if (!c.documentacion) {
          c.documentacion = { docBox: [], avBox: [] };
        }
        if (!c.documentacion[tipoFoto]) {
          c.documentacion[tipoFoto] = [];
        }
        
        if (Array.isArray(c.documentacion[tipoFoto])) {
          const yaExiste = c.documentacion[tipoFoto].some(f => f.fileName === file.name);
          if (!yaExiste) {
            c.documentacion[tipoFoto].push({
              url: base64,
              fileName: file.name,
              fileSize: file.size
            });
          }
        } else {
          const fotoExistente = c.documentacion[tipoFoto]?.url ? [c.documentacion[tipoFoto]] : [];
          c.documentacion[tipoFoto] = [...fotoExistente, {
            url: base64,
            fileName: file.name,
            fileSize: file.size
          }];
        }
        
        c.secciones.documentacion = true;
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
      const tipoDetectado = detectarTipoDocumentacion(file.name);
      
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
      // Asegurar que documentacion existe
      if (!c.documentacion) {
        c.documentacion = { docBox: [], avBox: [] };
      }
      if (Array.isArray(c.documentacion[tipoFoto])) {
        c.documentacion[tipoFoto].splice(index, 1);
      } else {
        c.documentacion[tipoFoto] = { url: "", fileName: undefined, fileSize: undefined };
      }
      
      // Si no hay imágenes, desactivar la sección
      const tieneImagenes = (c.documentacion.docBox && c.documentacion.docBox.length > 0) ||
                            (c.documentacion.avBox && c.documentacion.avBox.length > 0);
      
      if (!tieneImagenes) {
        c.secciones.documentacion = false;
      }
      
      return c;
    });
  };

  const tiposDocumentacion = [
    { key: 'docBox', label: 'DOC BOX' },
    { key: 'avBox', label: 'AV BOX' }
  ];

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Documentación</h2>

      {/* Botón general para subir múltiples imágenes */}
      <div className="mt-4 mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-300">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => imageInputRefs.current['documentacion_general']?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Subir Imágenes (Detección Automática)
          </Button>
          <input
            ref={el => imageInputRefs.current['documentacion_general'] = el}
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
        {tiposDocumentacion.map((tipo) => {
          const fotos = data.documentacion && Array.isArray(data.documentacion[tipo.key]) 
            ? data.documentacion[tipo.key] 
            : (data.documentacion?.[tipo.key]?.url ? [data.documentacion[tipo.key]] : []);
          
          return (
            <div key={tipo.key} className="bg-white rounded-lg border p-3">
              <h3 className="font-semibold text-neutral-700 mb-2">{tipo.label.toUpperCase()}</h3>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current[`documentacion_${tipo.key}`]?.click()}>
                  Subir {fotos.length > 0 && `(${fotos.length})`}
                </Button>
                <input
                  ref={el => imageInputRefs.current[`documentacion_${tipo.key}`] = el}
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

      {/* Tabla: Conexionado e información relevante */}
      <div className="mt-6">
        <h3 className="font-semibold text-neutral-700 mb-2">Conexionado e información relevante</h3>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-100 text-[11px]">
                {[
                  "Etiqueta de plano", "Puerto patch", "Puerto switch", "Contrato", "Térmico pantalla", "Térmico PC", ""
                ].map((h) => (
                  <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.documentacion && data.documentacion.conexionado && data.documentacion.conexionado.length > 0
                ? data.documentacion.conexionado
                : []
              ).map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-neutral-50">
                    <td className="border px-1 py-1">
                      <Input
                        value={r.etiquetaPlano}
                        disabled
                        className="bg-neutral-100 cursor-not-allowed"
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <Input
                        value={r.puertoPatch}
                        onChange={(e) => {
                          const v = e.target.value;
                          setData((d) => {
                            const c = structuredClone(d);
                            if (!c.documentacion) c.documentacion = { docBox: [], avBox: [], conexionado: [] };
                            if (!c.documentacion.conexionado) c.documentacion.conexionado = [];
                            if (c.documentacion.conexionado[i]) {
                              c.documentacion.conexionado[i].puertoPatch = v;
                            }
                            return c;
                          });
                        }}
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <Input
                        value={r.puertoSwitch}
                        onChange={(e) => {
                          const v = e.target.value;
                          setData((d) => {
                            const c = structuredClone(d);
                            if (!c.documentacion) c.documentacion = { docBox: [], avBox: [], conexionado: [] };
                            if (!c.documentacion.conexionado) c.documentacion.conexionado = [];
                            if (c.documentacion.conexionado[i]) {
                              c.documentacion.conexionado[i].puertoSwitch = v;
                            }
                            return c;
                          });
                        }}
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <Input
                        value={r.contrato}
                        onChange={(e) => {
                          const v = e.target.value;
                          setData((d) => {
                            const c = structuredClone(d);
                            if (!c.documentacion) c.documentacion = { docBox: [], avBox: [], conexionado: [] };
                            if (!c.documentacion.conexionado) c.documentacion.conexionado = [];
                            if (c.documentacion.conexionado[i]) {
                              c.documentacion.conexionado[i].contrato = v;
                            }
                            return c;
                          });
                        }}
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <Input
                        value={r.termicoPantalla}
                        onChange={(e) => {
                          const v = e.target.value;
                          setData((d) => {
                            const c = structuredClone(d);
                            if (!c.documentacion) c.documentacion = { docBox: [], avBox: [], conexionado: [] };
                            if (!c.documentacion.conexionado) c.documentacion.conexionado = [];
                            if (c.documentacion.conexionado[i]) {
                              c.documentacion.conexionado[i].termicoPantalla = v;
                            }
                            return c;
                          });
                        }}
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <Input
                        value={r.termicoPC}
                        onChange={(e) => {
                          const v = e.target.value;
                          setData((d) => {
                            const c = structuredClone(d);
                            if (!c.documentacion) c.documentacion = { docBox: [], avBox: [], conexionado: [] };
                            if (!c.documentacion.conexionado) c.documentacion.conexionado = [];
                            if (c.documentacion.conexionado[i]) {
                              c.documentacion.conexionado[i].termicoPC = v;
                            }
                            return c;
                          });
                        }}
                      />
                    </td>
                    <td className="border px-1 py-1 text-right">
                      <Button onClick={() => {
                        setData((d) => {
                          const c = structuredClone(d);
                          if (c.documentacion && c.documentacion.conexionado) {
                            c.documentacion.conexionado.splice(i, 1);
                          }
                          return c;
                        });
                      }}>
                        Borrar
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

