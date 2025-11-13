import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionRacksCombinados = ({ rackVideo, rackAudio, meta }) => {
  // Recopilar todas las imágenes de rack video
  const imagenesRackVideo = [];
  if (rackVideo.frontal && Array.isArray(rackVideo.frontal) && rackVideo.frontal.length > 0) {
    imagenesRackVideo.push(...rackVideo.frontal.map(img => ({ ...img, tipo: 'FRONTAL RACK VIDEO' })));
  }
  if (rackVideo.frontalComunicaciones && Array.isArray(rackVideo.frontalComunicaciones) && rackVideo.frontalComunicaciones.length > 0) {
    imagenesRackVideo.push(...rackVideo.frontalComunicaciones.map(img => ({ ...img, tipo: 'FRONTAL RACK COMUNICACIONES' })));
  }
  if (rackVideo.trasera && Array.isArray(rackVideo.trasera) && rackVideo.trasera.length > 0) {
    imagenesRackVideo.push(...rackVideo.trasera.map(img => ({ ...img, tipo: 'TRASERA RACK VIDEO' })));
  }

  // Recopilar todas las imágenes de rack audio
  const imagenesRackAudio = [];
  if (rackAudio.frontal && Array.isArray(rackAudio.frontal) && rackAudio.frontal.length > 0) {
    imagenesRackAudio.push(...rackAudio.frontal.map(img => ({ ...img, tipo: 'FRONTAL RACK AUDIO' })));
  }
  if (rackAudio.frontalOnTheSpot && Array.isArray(rackAudio.frontalOnTheSpot) && rackAudio.frontalOnTheSpot.length > 0) {
    imagenesRackAudio.push(...rackAudio.frontalOnTheSpot.map(img => ({ ...img, tipo: 'FRONTAL ON THE SPOT' })));
  }
  if (rackAudio.trasera && Array.isArray(rackAudio.trasera) && rackAudio.trasera.length > 0) {
    imagenesRackAudio.push(...rackAudio.trasera.map(img => ({ ...img, tipo: 'TRASERA RACK AUDIO' })));
  }

  const tieneRackVideo = imagenesRackVideo.length > 0;
  const tieneRackAudio = imagenesRackAudio.length > 0;

  // Si no hay imágenes, no mostrar nada
  if (!tieneRackVideo && !tieneRackAudio) {
    return null;
  }

  return (
    <section className={PAGE}>
      <PageHeader title="RACKS" meta={meta} />
      <div className="page-content">
        {/* Rack Video */}
        {tieneRackVideo && (
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 text-neutral-700">RACK DE VÍDEO</h3>
            <div className="grid grid-cols-3 gap-3">
              {imagenesRackVideo.map((imagen, i) => (
                <div key={i} className="flex flex-col">
                  <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">
                    {imagen.tipo}
                  </div>
                  <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '150px' }}>
                    {imagen.url ? (
                      <img 
                        loading="lazy" 
                        src={imagen.url} 
                        alt={imagen.tipo} 
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
            </div>
          </div>
        )}

        {/* Rack Audio */}
        {tieneRackAudio && (
          <div>
            <h3 className="text-sm font-bold mb-3 text-neutral-700">RACK DE AUDIO</h3>
            <div className="grid grid-cols-3 gap-3">
              {imagenesRackAudio.map((imagen, i) => (
                <div key={i} className="flex flex-col">
                  <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">
                    {imagen.tipo}
                  </div>
                  <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '150px' }}>
                    {imagen.url ? (
                      <img 
                        loading="lazy" 
                        src={imagen.url} 
                        alt={imagen.tipo} 
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
            </div>
          </div>
        )}
      </div>
      <PageFooter />
    </section>
  );
};

