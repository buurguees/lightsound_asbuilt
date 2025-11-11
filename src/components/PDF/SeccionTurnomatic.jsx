import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageFooter } from '../Page/PageFooter';
import { PageHeader } from '../Page/PageHeader';

export const SeccionTurnomatic = ({ fotosTurnomatic, meta }) => {
  if (!fotosTurnomatic || fotosTurnomatic.length === 0) {
    return null;
  }
  
  const grupos = [];
  for (let i = 0; i < fotosTurnomatic.length; i += 2) {
    grupos.push(fotosTurnomatic.slice(i, i + 2));
  }
  if (grupos.length === 0) return null;

  return (
    <>
      {grupos.map((grupo, grupoIdx) => (
        <section className={PAGE} key={grupoIdx}>
          <PageHeader title="TURNOMATIC" meta={meta || window?.__ASBUILT_META || null} />

          <div className="page-content space-y-4">
            {grupo.map((f, i) => (
              <div key={i} className="flex flex-col border-2 border-neutral-300 rounded-lg bg-white overflow-hidden">
                <div className="bg-neutral-800 text-white px-3 py-2">
                  <p className="text-sm font-bold">{f.etiquetaPlano}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 p-3">
                  <div>
                    <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">FOTO FRONTAL</div>
                    <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '150px' }}>
                      {f.fotoFrontal?.url ? (
                        <img loading="lazy" src={f.fotoFrontal.url} alt="Foto frontal" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center p-2">
                          <div className="text-neutral-300 text-3xl mb-1">📷</div>
                          <span className="text-neutral-400 text-xs">Sin foto</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">PLAYER + SENDING</div>
                    <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '150px' }}>
                      {f.fotoPlayer?.url ? (
                        <img loading="lazy" src={f.fotoPlayer.url} alt="Player + Sending" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center p-2">
                          <div className="text-neutral-300 text-3xl mb-1">💻</div>
                          <span className="text-neutral-400 text-xs">Sin foto</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">IP</div>
                    <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '150px' }}>
                      {f.fotoIP?.url ? (
                        <img loading="lazy" src={f.fotoIP.url} alt="IP" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center p-2">
                          <div className="text-neutral-300 text-3xl mb-1">🌐</div>
                          <span className="text-neutral-400 text-xs">Sin foto</span>
                        </div>
                      )}
                    </div>
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

