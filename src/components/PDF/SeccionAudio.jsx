import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageFooter } from '../Page/PageFooter';
import { PageHeader } from '../Page/PageHeader';

export const SeccionAudio = ({ audio, meta }) => {
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
    { key: 'microfono', label: 'Micrófono' },
    { key: 'bucleInduccion', label: 'Bucle de Inducción' },
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

  // Calcular cuántas imágenes caben por página de forma segura
  // Considerando: header (~60px), footer (~40px), espacio entre bloques (16px), padding (24px)
  // Altura disponible aproximada: ~650px
  // Cada imagen con título: ~180px (título ~20px + imagen 150px + padding)
  // Por fila: 3 imágenes
  // Filas por bloque: máximo 2 filas (6 imágenes) para asegurar que quepa bien
  // Bloques por página: máximo 2 bloques (12 imágenes máximo por página)
  // Pero para ser más conservadores y evitar cortes, usaremos máximo 9 imágenes por página (3 filas x 3 columnas)
  
  const MAX_IMAGENES_POR_PAGINA = 9; // 3 filas x 3 columnas = 9 imágenes máximo por página
  const IMAGENES_POR_FILA = 3;
  
  // Crear páginas asegurándonos de que nunca se corten imágenes
  const paginas = [];
  let imagenActual = 0;
  
  while (imagenActual < todasLasImagenes.length) {
    const imagenesEnPagina = [];
    let imagenesEnPaginaActual = 0;
    
    // Agregar imágenes hasta alcanzar el máximo por página
    while (imagenActual < todasLasImagenes.length && imagenesEnPaginaActual < MAX_IMAGENES_POR_PAGINA) {
      imagenesEnPagina.push(todasLasImagenes[imagenActual]);
      imagenActual++;
      imagenesEnPaginaActual++;
    }
    
    if (imagenesEnPagina.length > 0) {
      // Dividir las imágenes de la página en bloques de máximo 6 imágenes (2 filas x 3)
      // Esto asegura que cada bloque quepa bien y no se corte
      const bloquesEnPagina = [];
      for (let i = 0; i < imagenesEnPagina.length; i += 6) {
        bloquesEnPagina.push(imagenesEnPagina.slice(i, i + 6));
      }
      paginas.push(bloquesEnPagina);
    }
  }

  if (paginas.length === 0) return null;

  return (
    <>
      {paginas.map((pagina, paginaIdx) => (
        <section className={PAGE} key={paginaIdx}>
          <PageHeader title="AUDIO" meta={meta || window?.__ASBUILT_META || null} />

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
                                <span className="text-neutral-400 text-xs">Imagen no necesaria</span>
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

