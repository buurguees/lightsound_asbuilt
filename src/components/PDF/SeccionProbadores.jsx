import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionProbadores = ({ probadores }) => {
  const tieneImagenes = probadores.probadorOcupado?.url || 
                        probadores.probadorLiberado?.url || 
                        probadores.pasilloProbadores?.url;
  const tieneMasters = probadores.masters && probadores.masters.length > 0;
  const tieneProbadores = probadores.probadores && probadores.probadores.length > 0;
  
  if (!tieneImagenes && !tieneMasters && !tieneProbadores) return null;

  return (
    <section className={PAGE}>
      <div className="page-header">
        <div className="border-b-2 border-neutral-800 pb-3">
          <h2 className="text-xl font-bold text-neutral-800">PROBADORES</h2>
        </div>
      </div>
      <div className="page-content">
        <div className="flex flex-col border-2 border-neutral-300 rounded-lg bg-white overflow-hidden">
          <div className="grid grid-cols-3 gap-3 p-3">
            <div>
              <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">PROBADOR OCUPADO</div>
              <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '200px' }}>
                {probadores.probadorOcupado?.url ? (
                  <img loading="lazy" src={probadores.probadorOcupado.url} alt="Probador ocupado" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-2">
                    <div className="text-neutral-300 text-3xl mb-1">📷</div>
                    <span className="text-neutral-400 text-xs">Sin foto</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">SENSOR INSTALADO</div>
              <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '200px' }}>
                {probadores.probadorLiberado?.url ? (
                  <img loading="lazy" src={probadores.probadorLiberado.url} alt="Sensor instalado" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-2">
                    <div className="text-neutral-300 text-3xl mb-1">📷</div>
                    <span className="text-neutral-400 text-xs">Sin foto</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">PASILLO PROBADORES</div>
              <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '200px' }}>
                {probadores.pasilloProbadores?.url ? (
                  <img loading="lazy" src={probadores.pasilloProbadores.url} alt="Pasillo probadores" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-2">
                    <div className="text-neutral-300 text-3xl mb-1">📷</div>
                    <span className="text-neutral-400 text-xs">Sin foto</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Masters (sin duplicados) */}
      {tieneMasters && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Master</h3>
          <div className="overflow-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-100 text-[11px]">
                  <th className="border px-2 py-1 text-left font-semibold">Master</th>
                  <th className="border px-2 py-1 text-left font-semibold">MAC</th>
                  <th className="border px-2 py-1 text-left font-semibold">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {probadores.masters.map((master, i) => (
                  <tr key={i} className="odd:bg-white even:bg-neutral-50">
                    <td className="border px-2 py-1">{master.master}</td>
                    <td className="border px-2 py-1">{master.mac}</td>
                    <td className="border px-2 py-1">{master.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de Probadores/Sensores */}
      {tieneProbadores && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Sensores</h3>
          <div className="overflow-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-100 text-[11px]">
                  <th className="border px-2 py-1 text-left font-semibold">Probador</th>
                  <th className="border px-2 py-1 text-left font-semibold">S/N</th>
                  <th className="border px-2 py-1 text-left font-semibold">Master</th>
                </tr>
              </thead>
              <tbody>
                {probadores.probadores.map((item, i) => {
                  // Manejar tanto objetos como strings (compatibilidad)
                  const probador = typeof item === 'object' ? item.probador : item;
                  const sn = typeof item === 'object' ? item.sn : '0';
                  const master = typeof item === 'object' ? item.master : '';
                  return (
                    <tr key={i} className="odd:bg-white even:bg-neutral-50">
                      <td className="border px-2 py-1">{probador}</td>
                      <td className="border px-2 py-1">{sn}</td>
                      <td className="border px-2 py-1">{master}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PageFooter />
    </section>
  );
};


