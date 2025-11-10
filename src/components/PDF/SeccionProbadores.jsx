import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionProbadores = ({ probadores }) => {
  const tieneImagenes = probadores.probadorOcupado?.url || 
                        probadores.probadorLiberado?.url || 
                        probadores.pasilloProbadores?.url;
  const tieneTabla = probadores.tablaProbadores && probadores.tablaProbadores.length > 0;
  
  if (!tieneImagenes && !tieneTabla) return null;

  const numFilas = probadores.tablaProbadores?.length || 0;
  const debeSeparar = numFilas > 10;

  // Componente para renderizar las imágenes (siempre en la primera página)
  const ImagenesProbadores = () => (
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
  );

  // Componente para renderizar la tabla
  const TablaProbadores = ({ filas }) => (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-neutral-700 mb-2">Tabla de Probadores</h3>
      <div className="overflow-auto border rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-neutral-100 text-[11px]">
              {probadores.encabezados && probadores.encabezados.length > 0 ? (
                probadores.encabezados.map((h, i) => (
                  <th key={i} className="border px-2 py-1 text-left font-semibold">{h || `Columna ${i + 1}`}</th>
                ))
              ) : (
                probadores.tablaProbadores[0]?._rowData?.map((_, i) => (
                  <th key={i} className="border px-2 py-1 text-left font-semibold">Columna {i + 1}</th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={i} className="odd:bg-white even:bg-neutral-50">
                {fila._rowData ? (
                  fila._rowData.map((cell, j) => (
                    <td key={j} className="border px-2 py-1">{cell}</td>
                  ))
                ) : (
                  probadores.encabezados?.map((header, j) => (
                    <td key={j} className="border px-2 py-1">{fila[header] || ''}</td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Si hay 10 o menos filas, mostrar todo en una sola página
  if (!debeSeparar) {
    return (
      <section className={PAGE}>
        <div className="page-header">
          <div className="border-b-2 border-neutral-800 pb-3">
            <h2 className="text-xl font-bold text-neutral-800">PROBADORES</h2>
          </div>
        </div>
        <div className="page-content">
          {tieneImagenes && <ImagenesProbadores />}
          {tieneTabla && <TablaProbadores filas={probadores.tablaProbadores} />}
        </div>
        <PageFooter />
      </section>
    );
  }

  // Si hay más de 10 filas, dividir en páginas
  const filasPorPagina = 10;
  const paginas = [];
  for (let i = 0; i < probadores.tablaProbadores.length; i += filasPorPagina) {
    paginas.push(probadores.tablaProbadores.slice(i, i + filasPorPagina));
  }

  return (
    <>
      {/* Primera página: imágenes + primeras 10 filas */}
      <section className={PAGE}>
        <div className="page-header">
          <div className="border-b-2 border-neutral-800 pb-3">
            <h2 className="text-xl font-bold text-neutral-800">PROBADORES</h2>
          </div>
        </div>
        <div className="page-content">
          {tieneImagenes && <ImagenesProbadores />}
          {tieneTabla && <TablaProbadores filas={paginas[0]} />}
        </div>
        <PageFooter />
      </section>

      {/* Páginas adicionales: resto de filas con encabezado */}
      {paginas.slice(1).map((pagina, paginaIdx) => (
        <section key={paginaIdx + 1} className={PAGE}>
          <div className="page-header">
            <div className="border-b-2 border-neutral-800 pb-3">
              <h2 className="text-xl font-bold text-neutral-800">PROBADORES</h2>
            </div>
          </div>
          <div className="page-content">
            <TablaProbadores filas={pagina} />
          </div>
          <PageFooter />
        </section>
      ))}
    </>
  );
};


