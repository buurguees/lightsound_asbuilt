import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageFooter } from '../Page/PageFooter';
import { PageHeader } from '../Page/PageHeader';

export const Portada = ({ meta, equipamiento, tipoInstalacionVideo, almacenExterno }) => (
  <section className={PAGE}>
    <PageHeader
      meta={meta}
      left={(
        <div>
          <div className="bg-neutral-900 px-2 py-1 inline-block rounded mb-1 flex items-center justify-center" style={{ height: '40px', maxWidth: '150px' }}>
            <img src="/logo.svg" alt="Logo" className="h-full w-auto object-contain" />
          </div>
        </div>
      )}
    />

    <div className="page-content portada-layout">
      {/* Columna izquierda: Metadatos */}
      <div className="portada-columna-izquierda">
        <div className="metadatos-container">
          {/* Título del informe como encabezado de metadatos */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">{meta.titulo}</h1>
            <div className="h-1 w-16 bg-neutral-800"></div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h2 className="text-neutral-500 mb-1">PROYECTO</h2>
              <h1 className="text-neutral-800">{meta.proyecto}</h1>
            </div>
            <div>
              <h2 className="text-neutral-500 mb-1">PROJECT MANAGER</h2>
              <h1 className="text-neutral-800">{meta.pm}</h1>
            </div>
            <div>
              <h2 className="text-neutral-500 mb-1">DIRECCIÓN</h2>
              <h1 className="text-neutral-800">{meta.direccion}</h1>
            </div>
            <div>
              <h2 className="text-neutral-500 mb-1">VERSIÓN PLANO</h2>
              <h1 className="text-neutral-800">{meta.versionPlano}</h1>
            </div>
            <div>
              <h2 className="text-neutral-500 mb-1">FECHA DE APERTURA</h2>
              <h1 className="text-neutral-800">{meta.fecha}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha: Título, Imagen y Elementos Instalados */}
      <div className="portada-columna-derecha">
        {/* Imagen de entrada - más grande */}
        {meta.fotoEntrada?.url && (
          <div className="foto-entrada-container mb-4">
            <div className="rounded-lg border-2 border-neutral-800 shadow-lg bg-neutral-50 flex items-center justify-center overflow-hidden">
              <img 
                src={meta.fotoEntrada.url} 
                alt="Foto entrada" 
                className="rounded object-cover w-full h-full"
                style={{ maxHeight: '280px', width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Elementos Instalados */}
        {Object.keys(equipamiento || {}).filter(nombre => {
          const elemento = equipamiento[nombre];
          // Compatibilidad con estructura antigua (true/false) y nueva (objeto)
          if (typeof elemento === 'boolean') {
            return elemento === true;
          }
          if (typeof elemento === 'object' && elemento !== null) {
            return elemento.instalado === true;
          }
          return false;
        }).length > 0 && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Elementos Instalados</h1>
            <div className="h-1 w-16 bg-neutral-800 mb-3"></div>
            <ul className="lista-elementos-instalados">
              {Object.keys(equipamiento)
                .filter(nombre => {
                  const elemento = equipamiento[nombre];
                  // Compatibilidad con estructura antigua (true/false) y nueva (objeto)
                  if (typeof elemento === 'boolean') {
                    return elemento === true;
                  }
                  if (typeof elemento === 'object' && elemento !== null) {
                    return elemento.instalado === true;
                  }
                  return false;
                })
                .map((nombre, i) => {
                  const elemento = equipamiento[nombre];
                  // Obtener cantidad: si es objeto nuevo, usar cantidad; si es boolean antiguo, usar 1
                  let cantidad = 1;
                  if (typeof elemento === 'object' && elemento !== null && elemento.cantidad) {
                    cantidad = elemento.cantidad || 1;
                  }
                  const texto = cantidad > 0 ? `${nombre} - ${cantidad} Unidad${cantidad !== 1 ? 'es' : ''}` : nombre;
                  return <li key={i}>{texto}</li>;
                })}
            </ul>
          </div>
        )}
      </div>
    </div>

    <PageFooter />
  </section>
);


