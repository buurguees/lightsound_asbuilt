import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionCuadros = ({ cuadros, meta }) => (
  <>
    {cuadros.items.map((c, i) => (
      <section className={PAGE} key={i}>
        <PageHeader title={`CUADRO ELÉCTRICO / AV BOX / DOC BOX - ${c.titulo}`} meta={meta} />
        <div className="page-content">
          {c.detalle && (
            <div className="mb-4 flex-shrink-0">
              <h3 className="text-sm font-bold mb-2 text-neutral-700">DETALLES</h3>
              <div className="whitespace-pre-wrap rounded-lg border border-neutral-300 bg-white p-4 text-sm leading-relaxed">
                {c.detalle}
              </div>
            </div>
          )}
          {c.fotos && c.fotos.some(f => f.url) && (
            <div className="mb-4 flex-1">
              <h3 className="text-sm font-bold mb-2 text-neutral-700">FOTOGRAFÍAS</h3>
              <div className="grid grid-cols-2 gap-3 h-full">
                {c.fotos.filter(f => f.url).map((foto, idx) => (
                  <div key={idx} className="rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden flex flex-col">
                    <img loading="lazy" src={foto.url} alt={foto.descripcion || `Foto ${idx+1}`} className="w-full h-full object-contain" />
                    {foto.descripcion && (
                      <div className="p-2 bg-white border-t text-xs text-neutral-600">{foto.descripcion}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <PageFooter />
      </section>
    ))}
  </>
);


