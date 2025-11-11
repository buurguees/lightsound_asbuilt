import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionAltavocesInstalacion = ({ equipamiento, meta }) => {
  // Filtrar elementos instalados (compatibilidad con estructura antigua y nueva)
  const elementosInstalados = Object.keys(equipamiento || {}).filter(nombre => {
    const elemento = equipamiento[nombre];
    // Compatibilidad con estructura antigua (true/false) y nueva (objeto)
    if (typeof elemento === 'boolean') {
      return elemento === true;
    }
    if (typeof elemento === 'object' && elemento !== null) {
      return elemento.instalado === true;
    }
    return false;
  });
  
  if (elementosInstalados.length === 0) return null;

  return (
    <section className={PAGE}>
      <PageHeader title="ELEMENTOS INSTALADOS" subtitle="Recuento de elementos instalados en la tienda" meta={meta} />
      <div className="page-content">
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-100 text-[11px]">
                <th className="border px-3 py-2 text-left font-semibold">Tipo de equipo</th>
              </tr>
            </thead>
            <tbody>
              {elementosInstalados.map((nombre, i) => (
                <tr key={i} className="odd:bg-white even:bg-neutral-50">
                  <td className="border px-3 py-2 font-medium">{nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PageFooter />
    </section>
  );
};


