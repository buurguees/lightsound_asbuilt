import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionRack = ({ titulo, data }) => (
  <section className={PAGE}>
    <PageHeader title={titulo} />
    <div className="page-content">
      {data.descripcion && (
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-sm font-bold mb-2 text-neutral-700">DESCRIPCIÓN</h3>
          <div className="whitespace-pre-wrap rounded-lg border border-neutral-300 bg-white p-4 text-sm leading-relaxed">
            {data.descripcion}
          </div>
        </div>
      )}
      {data.fotos && data.fotos.some(f => f.url) && (
        <div className="mb-4 flex-1">
          <h3 className="text-sm font-bold mb-2 text-neutral-700">FOTOGRAFÍAS</h3>
          <div className="grid grid-cols-2 gap-3 h-full">
            {data.fotos.filter(f => f.url).map((foto, i) => (
              <div key={i} className="rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden flex flex-col">
                <img loading="lazy" src={foto.url} alt={foto.descripcion || `Foto ${i+1}`} className="w-full h-full object-contain" />
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
);


