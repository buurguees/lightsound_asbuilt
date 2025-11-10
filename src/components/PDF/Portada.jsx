import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageFooter } from '../Page/PageFooter';

export const Portada = ({ meta, equipamiento, tipoInstalacionVideo, almacenExterno }) => (
  <section className={PAGE}>
    <div className="page-header">
      <div className="flex items-start justify-between mb-3 pb-2 border-b-2 border-neutral-800">
        <div>
          <div className="bg-neutral-900 px-2 py-1 inline-block rounded mb-1 flex items-center justify-center" style={{ height: '40px', maxWidth: '150px' }}>
            <img src="/logo.svg" alt="Logo" className="h-full w-auto object-contain" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-neutral-800">{meta.cliente}</p>
          <p className="text-xs text-neutral-600 mt-0.5">Código: {meta.codigo}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-neutral-500 text-[10px] mb-0.5">PROYECTO</p>
              <p className="text-neutral-800 font-medium">{meta.proyecto}</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-500 text-[10px] mb-0.5">PROJECT MANAGER</p>
              <p className="text-neutral-800 font-medium">{meta.pm}</p>
            </div>
            <div className="col-span-2">
              <p className="font-semibold text-neutral-500 text-[10px] mb-0.5">DIRECCIÓN</p>
              <p className="text-neutral-800 font-medium">{meta.direccion}</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-500 text-[10px] mb-0.5">VERSIÓN PLANO</p>
              <p className="text-neutral-800 font-medium">{meta.versionPlano}</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-500 text-[10px] mb-0.5">FECHA</p>
              <p className="text-neutral-800 font-medium">{meta.fecha}</p>
            </div>
          </div>
        </div>

        {meta.fotoEntrada?.url && (
          <div className="flex-1 flex items-center justify-center">
            <div className="rounded-lg border-2 border-neutral-800 shadow-md bg-neutral-50 flex items-center justify-center" style={{ height: '180px', width: '240px' }}>
              <img 
                src={meta.fotoEntrada.url} 
                alt="Foto entrada" 
                className="rounded object-contain"
                style={{ maxHeight: '175px', maxWidth: '235px' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="page-content">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">{meta.titulo}</h1>
        <div className="h-0.5 w-16 bg-neutral-800"></div>
      </div>

      {Object.keys(equipamiento || {}).filter(nombre => equipamiento[nombre] === true).length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold mb-2 text-neutral-800">ELEMENTOS INSTALADOS</h2>
          <ul className="lista-elementos-instalados">
            {Object.keys(equipamiento)
              .filter(nombre => equipamiento[nombre] === true)
              .map((nombre, i) => (
                <li key={i}>{nombre}</li>
              ))}
          </ul>
        </div>
      )}
    </div>

    <PageFooter />
  </section>
);


