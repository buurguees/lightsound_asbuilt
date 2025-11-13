import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

const TablaConexionado = ({ filas }) => (
  <table className="w-full text-xs">
    <thead>
      <tr className="bg-neutral-100 text-[11px]">
        {[
          "Etiqueta de plano","Puerto patch","Puerto switch","Contrato","Térmico pantalla","Térmico PC"
        ].map((h) => (
          <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {filas.map((r, i) => (
        <tr key={i} className="odd:bg-white even:bg-neutral-50">
          <td className="border px-2 py-1">{r.etiquetaPlano}</td>
          <td className="border px-2 py-1">{r.puertoPatch}</td>
          <td className="border px-2 py-1">{r.puertoSwitch}</td>
          <td className="border px-2 py-1">{r.contrato}</td>
          <td className="border px-2 py-1">{r.termicoPantalla}</td>
          <td className="border px-2 py-1">{r.termicoPC}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const SeccionDocumentacion = ({ documentacion, pantallas, banners, turnomatic, welcomer, meta }) => {
  // Verificar que documentacion existe
  if (!documentacion) {
    return null;
  }
  
  // Recopilar todas las imágenes de documentación
  const imagenes = [];
  if (documentacion.docBox && Array.isArray(documentacion.docBox) && documentacion.docBox.length > 0) {
    imagenes.push(...documentacion.docBox.map(img => ({ ...img, tipo: 'DOC BOX' })));
  }
  if (documentacion.avBox && Array.isArray(documentacion.avBox) && documentacion.avBox.length > 0) {
    imagenes.push(...documentacion.avBox.map(img => ({ ...img, tipo: 'AV BOX' })));
  }

  const tieneImagenes = imagenes.length > 0;
  const mostrarTabla = documentacion.mostrarTablaConexionado !== false; // Por defecto true si no está definido
  const tieneConexionado = mostrarTabla && documentacion.conexionado && Array.isArray(documentacion.conexionado) && documentacion.conexionado.length > 0;

  if (!tieneImagenes && !tieneConexionado) {
    return null;
  }

  // Determinar si combinar en una sola página (solo si la tabla está habilitada)
  const totalPantallas = (pantallas && Array.isArray(pantallas)) ? pantallas.length : 0;
  const combinarEnUna = totalPantallas > 0 && totalPantallas <= 10 && tieneImagenes && tieneConexionado;

  if (combinarEnUna) {
    // Reunir conexionado
    const todasEtiquetas = [];
    (pantallas || []).forEach(p => {
      if (p.etiquetaPlano) {
        todasEtiquetas.push({
          etiquetaPlano: p.etiquetaPlano,
          puertoPatch: p.puertoPatch || '',
          puertoSwitch: p.puertoSwitch || '',
          contrato: p.contrato || '',
          termicoPantalla: p.termicoPantalla || '',
          termicoPC: p.termicoPC || ''
        });
      }
    });
    const conexionado = (documentacion.conexionado && documentacion.conexionado.length > 0)
      ? documentacion.conexionado
      : todasEtiquetas;

    return (
      <section className={PAGE}>
        <PageHeader title="DOCUMENTACIÓN" meta={meta} />
        <div className="page-content">
          {tieneConexionado && (
            <div className="overflow-auto">
              <TablaConexionado filas={conexionado} />
            </div>
          )}
          <div className={`grid grid-cols-3 gap-3 ${tieneConexionado ? 'mt-3' : ''}`}>
            {imagenes.map((imagen, i) => (
              <div key={i} className="flex flex-col">
                <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">
                  {imagen.tipo}
                </div>
                <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '150px' }}>
                  {imagen.url ? (
                    <img loading="lazy" src={imagen.url} alt={imagen.tipo} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-neutral-400 text-xs">Imagen no requerida</span>
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
  }

  return (
    <>
      {/* Página de tabla primero */}
      {tieneConexionado && (() => {
        // Recopilar todas las etiquetas de planos de MKD, Banners, Turnomatic y Welcomers
        const todasEtiquetas = [];
        
        if (pantallas && Array.isArray(pantallas)) {
          pantallas.forEach(p => {
            if (p.etiquetaPlano) {
              todasEtiquetas.push({
                etiquetaPlano: p.etiquetaPlano,
                puertoPatch: p.puertoPatch || '',
                puertoSwitch: p.puertoSwitch || '',
                contrato: p.contrato || '',
                termicoPantalla: p.termicoPantalla || '',
                termicoPC: p.termicoPC || ''
              });
            }
          });
        }
        
        if (banners && Array.isArray(banners)) {
          banners.forEach(b => {
            if (b.etiquetaPlano) {
              todasEtiquetas.push({
                etiquetaPlano: b.etiquetaPlano,
                puertoPatch: b.puertoPatch || '',
                puertoSwitch: b.puertoSwitch || '',
                contrato: b.contrato || '',
                termicoPantalla: b.termicoPantalla || '',
                termicoPC: b.termicoPC || ''
              });
            }
          });
        }
        
        if (turnomatic && Array.isArray(turnomatic)) {
          turnomatic.forEach(t => {
            if (t.etiquetaPlano) {
              todasEtiquetas.push({
                etiquetaPlano: t.etiquetaPlano,
                puertoPatch: t.puertoPatch || '',
                puertoSwitch: t.puertoSwitch || '',
                contrato: t.contrato || '',
                termicoPantalla: t.termicoPantalla || '',
                termicoPC: t.termicoPC || ''
              });
            }
          });
        }
        
        if (welcomer && Array.isArray(welcomer)) {
          welcomer.forEach(w => {
            if (w.etiquetaPlano) {
              todasEtiquetas.push({
                etiquetaPlano: w.etiquetaPlano,
                puertoPatch: w.puertoPatch || '',
                puertoSwitch: w.puertoSwitch || '',
                contrato: w.contrato || '',
                termicoPantalla: w.termicoPantalla || '',
                termicoPC: w.termicoPC || ''
              });
            }
          });
        }
        
        // Usar documentacion.conexionado si existe y tiene datos, sino usar todasEtiquetas
        const conexionado = (documentacion.conexionado && documentacion.conexionado.length > 0)
          ? documentacion.conexionado
          : todasEtiquetas;
        
        if (conexionado.length === 0) return null;
        
        return (
          <section className={PAGE}>
            <PageHeader title="DOCUMENTACIÓN" subtitle={undefined} />
            <div className="page-content">
              <div className="overflow-auto">
                <TablaConexionado filas={conexionado} />
              </div>
            </div>
            <PageFooter />
          </section>
        );
      })()}

      {/* Página de imágenes después */}
      {tieneImagenes && (
        <section className={PAGE}>
          <PageHeader title="DOCUMENTACIÓN" meta={meta} />
          <div className="page-content">
            <div className="grid grid-cols-3 gap-3">
              {imagenes.map((imagen, i) => (
                <div key={i} className="flex flex-col">
                  <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">
                    {imagen.tipo}
                  </div>
                  <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '150px' }}>
                    {imagen.url ? (
                      <img loading="lazy" src={imagen.url} alt={imagen.tipo} className="w-full h-full object-contain" />
                    ) : (
                    <div className="text-center p-2">
                      <span className="text-neutral-400 text-xs">Imagen no requerida</span>
                    </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <PageFooter />
        </section>
      )}
    </>
  );
};

