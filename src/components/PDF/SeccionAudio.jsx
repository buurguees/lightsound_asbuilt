import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageFooter } from '../Page/PageFooter';

export const SeccionAudio = ({ audio }) => {
  if (!audio) return null;

  // Tipos de audio ordenados (mismo orden que en el editor)
  const tiposAudioOrdenados = [
    { key: 'altavozEspecial', label: 'Altavoz Especial' },
    { key: 'altavozOffice', label: 'Altavoz Office' },
    { key: 'altavozZonaComun', label: 'Altavoz Zona Común' },
    { key: 'altavozKitchenOffice', label: 'Altavoz Kitchen Office' },
    { key: 'torreAcustica', label: 'Torre Acústica' },
    { key: 'altavozAlmacen', label: 'Altavoz Almacén' },
    { key: 'altavozFullRange', label: 'Altavoz Full Range' },
    { key: 'subGrave', label: 'Sub-grave' },
    { key: 'altavozProbadores', label: 'Altavoz Probadores' },
    { key: 'cluster', label: 'Cluster' },
    { key: 'altavoz', label: 'Altavoz' },
    { key: 'torre', label: 'Torre' },
    { key: 'subwoofer', label: 'Subwoofer' },
    { key: 'subGrabe', label: 'Sub-grabe' }
  ];

  // Recopilar todas las imágenes con sus títulos
  const todasLasImagenes = [];
  tiposAudioOrdenados.forEach(tipo => {
    const fotos = Array.isArray(audio[tipo.key]) 
      ? audio[tipo.key] 
      : (audio[tipo.key]?.url ? [audio[tipo.key]] : []);
    
    fotos.forEach((foto, index) => {
      const titulo = fotos.length > 1 
        ? `${tipo.label}_${index + 1}` 
        : tipo.label;
      todasLasImagenes.push({
        url: foto.url,
        titulo: titulo,
        fileName: foto.fileName
      });
    });
  });

  if (todasLasImagenes.length === 0) return null;

  // Agrupar imágenes de 2 en 2 (máximo 2 bloques por página)
  // Cada bloque tiene 3 imágenes por fila, así que cada bloque puede tener hasta 6 imágenes (2 filas x 3)
  // Pero el usuario quiere 2 bloques por página, así que agrupamos de 2 en 2 bloques
  // Cada bloque puede tener múltiples imágenes (3 por fila)
  
  // Crear bloques: cada bloque puede tener hasta 6 imágenes (2 filas x 3 columnas)
  // Pero para simplificar, vamos a hacer que cada bloque tenga un máximo de 6 imágenes
  // y agrupamos los bloques de 2 en 2 por página
  
  const bloques = [];
  for (let i = 0; i < todasLasImagenes.length; i += 6) {
    bloques.push(todasLasImagenes.slice(i, i + 6));
  }

  // Agrupar bloques de 2 en 2 (2 bloques por página)
  const paginas = [];
  for (let i = 0; i < bloques.length; i += 2) {
    paginas.push(bloques.slice(i, i + 2));
  }

  if (paginas.length === 0) return null;

  return (
    <>
      {paginas.map((pagina, paginaIdx) => (
        <section className={PAGE} key={paginaIdx}>
          <div className="page-header">
            <div className="border-b-2 border-neutral-800 pb-3">
              <h2 className="text-xl font-bold text-neutral-800">AUDIO</h2>
              {paginas.length > 1 && (
                <p className="text-sm text-neutral-600 mt-1">Página {paginaIdx + 1} de {paginas.length}</p>
              )}
            </div>
          </div>

          <div className="page-content space-y-4">
            {pagina.map((bloque, bloqueIdx) => (
              <div key={bloqueIdx} className="flex flex-col border-2 border-neutral-300 rounded-lg bg-white overflow-hidden">
                {/* Dividir el bloque en filas de 3 imágenes */}
                {Array.from({ length: Math.ceil(bloque.length / 3) }).map((_, filaIdx) => {
                  const inicio = filaIdx * 3;
                  const fin = inicio + 3;
                  const filaImagenes = bloque.slice(inicio, fin);
                  
                  return (
                    <div key={filaIdx} className="grid grid-cols-3 gap-3 p-3">
                      {filaImagenes.map((imagen, imgIdx) => (
                        <div key={imgIdx}>
                          <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">
                            {imagen.titulo.toUpperCase()}
                          </div>
                          <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '150px' }}>
                            {imagen.url ? (
                              <img 
                                loading="lazy" 
                                src={imagen.url} 
                                alt={imagen.titulo} 
                                className="w-full h-full object-contain" 
                              />
                            ) : (
                              <div className="text-center p-2">
                                <div className="text-neutral-300 text-3xl mb-1">📷</div>
                                <span className="text-neutral-400 text-xs">Sin foto</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Rellenar espacios vacíos si la última fila no tiene 3 imágenes */}
                      {filaImagenes.length < 3 && Array.from({ length: 3 - filaImagenes.length }).map((_, emptyIdx) => (
                        <div key={`empty-${emptyIdx}`}></div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <PageFooter />
        </section>
      ))}
    </>
  );
};

