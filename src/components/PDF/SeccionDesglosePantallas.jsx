import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

const TablaPantallasImportadas = ({ filas }) => (
  <table className="w-full text-xs mb-4 tabla-importadas">
    <thead>
      <tr className="bg-neutral-100 text-[11px]">
        {[
          "Etiqueta de plano","Hostname","Mac","Resolución"
        ].map((h) => (
          <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {filas.map((r, i) => (
        <tr key={i} className="odd:bg-white even:bg-neutral-50">
          <td className="border px-2 py-1">{r.etiquetaPlano}</td>
          <td className="border px-2 py-1">{r.hostname}</td>
          <td className="border px-2 py-1">{r.mac}</td>
          <td className="border px-2 py-1">{r.resolucion}</td>
        </tr>
      ))}
    </tbody>
  </table>
);


export const SeccionDesglosePantallas = ({ pantallas, meta }) => {
  // Verificar que hay pantallas para mostrar
  if (!pantallas || pantallas.length === 0) {
    return null;
  }
  
  // Mostrar solo la tabla de Información de los Players
  return (
    <section className={PAGE}>
      <PageHeader title="MKD" subtitle="Información técnica de todas las pantallas instaladas" meta={meta} />
      <div className="page-content">
        <div className="overflow-auto">
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Información de los Players</h3>
            <TablaPantallasImportadas filas={pantallas} />
          </div>
        </div>
      </div>
      <PageFooter />
    </section>
  );
};


