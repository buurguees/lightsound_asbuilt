import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageFooter } from '../Page/PageFooter';

export const SeccionBanners = ({ banners }) => {
  // Verificar que hay banners para mostrar
  if (!banners || banners.length === 0) {
    return null;
  }
  
  // Agrupar banners de 2 en 2 (máximo 2 bloques por página)
  const grupos = [];
  for (let i = 0; i < banners.length; i += 2) {
    grupos.push(banners.slice(i, i + 2));
  }
  if (grupos.length === 0) return null;

  return (
    <>
      {grupos.map((grupo, grupoIdx) => (
        <section className={PAGE} key={grupoIdx}>
          <div className="page-header">
            <div className="border-b-2 border-neutral-800 pb-3">
              <h2 className="text-xl font-bold text-neutral-800">BANNERS</h2>
              <p className="text-sm text-neutral-600 mt-1">Página {grupoIdx + 1} de {grupos.length}</p>
            </div>
          </div>

          <div className="page-content space-y-4">
            {grupo.map((b, i) => (
              <div key={i} className="flex flex-col border-2 border-neutral-300 rounded-lg bg-white overflow-hidden">
                {b.etiqueta && (
                  <div className="bg-neutral-800 text-white px-3 py-2">
                    <p className="text-sm font-bold">{b.etiqueta}</p>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ minHeight: '200px' }}>
                    {b.imagen?.url ? (
                      <img loading="lazy" src={b.imagen.url} alt={b.etiqueta || "Banner"} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-2">
                        <div className="text-neutral-300 text-3xl mb-1">📷</div>
                        <span className="text-neutral-400 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PageFooter />
        </section>
      ))}
    </>
  );
};

