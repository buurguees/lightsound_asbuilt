import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionCuadrosAV = ({ cuadrosAV }) => {
  // Recopilar todas las imágenes de cuadros AV
  const imagenes = [];
  if (cuadrosAV.cuadroLSG && Array.isArray(cuadrosAV.cuadroLSG) && cuadrosAV.cuadroLSG.length > 0) {
    imagenes.push(...cuadrosAV.cuadroLSG.map(img => ({ ...img, tipo: 'CUADRO LSG' })));
  }
  if (cuadrosAV.cuadroElectricoGeneral && Array.isArray(cuadrosAV.cuadroElectricoGeneral) && cuadrosAV.cuadroElectricoGeneral.length > 0) {
    imagenes.push(...cuadrosAV.cuadroElectricoGeneral.map(img => ({ ...img, tipo: 'CUADRO ELÉCTRICO GENERAL' })));
  }
  if (cuadrosAV.termicosPantalla && Array.isArray(cuadrosAV.termicosPantalla) && cuadrosAV.termicosPantalla.length > 0) {
    imagenes.push(...cuadrosAV.termicosPantalla.map(img => ({ ...img, tipo: 'TÉRMICOS PANTALLA' })));
  }
  if (cuadrosAV.termicosRack && Array.isArray(cuadrosAV.termicosRack) && cuadrosAV.termicosRack.length > 0) {
    imagenes.push(...cuadrosAV.termicosRack.map(img => ({ ...img, tipo: 'TÉRMICOS RACK' })));
  }

  if (imagenes.length === 0) {
    return null;
  }

  return (
    <section className={PAGE}>
      <PageHeader title="CUADROS AV" />
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

