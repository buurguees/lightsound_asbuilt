import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionDocumentacion = ({ documentacion }) => {
  // Recopilar todas las imágenes de documentación
  const imagenes = [];
  if (documentacion.docBox && Array.isArray(documentacion.docBox) && documentacion.docBox.length > 0) {
    imagenes.push(...documentacion.docBox.map(img => ({ ...img, tipo: 'DOC BOX' })));
  }
  if (documentacion.avBox && Array.isArray(documentacion.avBox) && documentacion.avBox.length > 0) {
    imagenes.push(...documentacion.avBox.map(img => ({ ...img, tipo: 'AV BOX' })));
  }

  if (imagenes.length === 0) {
    return null;
  }

  return (
    <section className={PAGE}>
      <PageHeader title="DOCUMENTACIÓN" />
      <div className="page-content">
        <div className="grid grid-cols-3 gap-3">
          {imagenes.map((imagen, i) => (
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
                    <div className="text-neutral-300 text-3xl mb-1">📷</div>
                    <span className="text-neutral-400 text-xs">Sin foto</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <PageFooter />
    </section>
  );
};

