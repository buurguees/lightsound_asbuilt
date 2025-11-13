import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

const TablaBanners = ({ filas }) => {
  if (!filas || filas.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-neutral-700 mb-2">BANNERS</h3>
      <table className="w-full text-xs mb-4 tabla-importadas">
        <thead>
          <tr className="bg-neutral-100 text-[11px]">
            {[
              "Etiqueta de plano", "Modelo", "Resolución", "Tamaño Lineal"
            ].map((h) => (
              <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-neutral-50">
              <td className="border px-2 py-1">{r.etiquetaPlano || ''}</td>
              <td className="border px-2 py-1">{r.modelo || ''}</td>
              <td className="border px-2 py-1">{r.resolucion || ''}</td>
              <td className="border px-2 py-1">{r.tamanoLineal || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TablaTurnomatic = ({ filas }) => {
  if (!filas || filas.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-neutral-700 mb-2">TURNOMATIC</h3>
      <table className="w-full text-xs mb-4 tabla-turnomatic">
        <thead>
          <tr className="bg-neutral-100 text-[11px]">
            {[
              "Etiqueta de plano", "Hostname", "MAC"
            ].map((h) => (
              <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-neutral-50">
              <td className="border px-2 py-1">{r.etiquetaPlano || ''}</td>
              <td className="border px-2 py-1">{r.hostname || ''}</td>
              <td className="border px-2 py-1">{r.mac || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TablaWelcomer = ({ filas }) => {
  if (!filas || filas.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-neutral-700 mb-2">WELCOMER</h3>
      <table className="w-full text-xs mb-4 tabla-welcomer">
        <thead>
          <tr className="bg-neutral-100 text-[11px]">
            {[
              "Etiqueta de plano", "Hostname", "MAC", "Sección", "Nº de Probadores"
            ].map((h) => (
              <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-neutral-50">
              <td className="border px-2 py-1">{r.etiquetaPlano || ''}</td>
              <td className="border px-2 py-1">{r.hostname || ''}</td>
              <td className="border px-2 py-1">{r.mac || ''}</td>
              <td className="border px-2 py-1">{r.seccion || ''}</td>
              <td className="border px-2 py-1">{r.numProbadores || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SeccionTablasBannersTurnomaticWelcomer = ({ banners, turnomatic, welcomer, meta }) => {
  // Verificar que hay al menos una tabla para mostrar
  const tieneBanners = banners && banners.length > 0;
  const tieneTurnomatic = turnomatic && turnomatic.length > 0;
  const tieneWelcomer = welcomer && welcomer.length > 0;
  
  if (!tieneBanners && !tieneTurnomatic && !tieneWelcomer) {
    return null;
  }
  
  return (
    <section className={PAGE}>
      <PageHeader title="BANNERS, TURNOMATIC Y WELCOMER" subtitle="Información técnica de los equipos instalados" meta={meta} />
      <div className="page-content">
        <div className="overflow-auto">
          {tieneBanners && <TablaBanners filas={banners} />}
          {tieneTurnomatic && <TablaTurnomatic filas={turnomatic} />}
          {tieneWelcomer && <TablaWelcomer filas={welcomer} />}
        </div>
      </div>
      <PageFooter />
    </section>
  );
};

