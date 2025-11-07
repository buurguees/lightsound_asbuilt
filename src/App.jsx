import React, { useRef, useState, useEffect } from "react";
import * as XLSX from 'xlsx';
// Componentes PDF
import { PDFUploader } from './components/PDF/PDFUploader';
import { SeccionPlanostienda } from './components/PDF/SeccionPlanostienda';
// Componentes UI
import { Button } from './components/UI/Button';
import { LoadingModal } from './components/UI/LoadingModal';
import { Card } from './components/UI/Card';
// Componentes Page
import { PageHeader } from './components/Page/PageHeader';
import { PageFooter } from './components/Page/PageFooter';
// Componentes Editor
import { MetadatosEditor } from './components/Editor/MetadatosEditor';
import { ObservacionesEditor } from './components/Editor/ObservacionesEditor';
import { EquipamientoEditor } from './components/Editor/EquipamientoEditor';
import { DesglosePantallasEditor } from './components/Editor/DesglosePantallasEditor';
import { FotosPantallasEditor } from './components/Editor/FotosPantallasEditor';
import { ProbadoresEditor } from './components/Editor/ProbadoresEditor';
import { RackVideoEditor } from './components/Editor/RackVideoEditor';
import { RackAudioEditor } from './components/Editor/RackAudioEditor';
import { CuadrosAVEditor } from './components/Editor/CuadrosAVEditor';
import { UnifilarVideoEditor } from './components/Editor/UnifilarVideoEditor';
// Utils
import { PAGE } from './utils/constants';
import { fileToBase64 } from './utils/pdfUtils';
// Nota: processExcelPantallas se usa solo en DesglosePantallasEditor.jsx

// --- Utilidades simples ---
const cls = (...c) => c.filter(Boolean).join(" ");
const download = (filename, text) => {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// (LoadingModal ahora está en components/UI/LoadingModal.jsx)

const defaultReport = {
  meta: {
    titulo: "Informe Fin de Obra",
    cliente: "",
    proyecto: "",
    codigo: "",
    pm: "",
    direccion: "",
    versionPlano: "",
    fecha: new Date().toISOString().slice(0,10),
    logo: { url: "/logo.svg", fileName: "logo.svg", fileSize: undefined },
    fotoEntrada: { url: "", fileName: undefined, fileSize: undefined },
  },
  secciones: {
    portada: true,
    equipamiento: true,
    observaciones: true,
    desglosePantallas: true,
    fotosPantallas: true,
    probadores: false,
    altavocesInstalacion: true,
    rackVideo: true,
    rackAudio: true,
    cuadrosAV: true,
    unifilarVideo: true,
    planostienda: true,
    medicionPartidas: false,
  },
  observaciones: "",
  planostienda: {
    pdfs: []
  },
  equipamiento: [
    { nombre: "Altavoces tienda", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
    { nombre: "Subwoofers", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
    { nombre: "Micrófonos", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
    { nombre: "Altavoces almacén", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
    { nombre: "Columnas acústicas", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
  ],
  tipoInstalacionVideo: "",
  almacenExterno: "No",
  pantallas: [],
  fotos: [],
  probadores: {
    activo: false,
    probadorOcupado: { url: "", fileName: undefined, fileSize: undefined },
    probadorLiberado: { url: "", fileName: undefined, fileSize: undefined },
    pasilloProbadores: { url: "", fileName: undefined, fileSize: undefined },
  },
  rackVideo: {
    descripcion: "",
    observaciones: "",
    fotos: [
      { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
    ]
  },
  rackAudio: { 
    descripcion: "", 
    observaciones: "",
    fotos: [
      { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
    ]
  },
  cuadrosAV: {
    items: [
      { 
        titulo: "CUADRO ELÉCTRICO", 
        detalle: "",
        observaciones: "",
        fotos: [
          { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
        ]
      },
      { 
        titulo: "AV BOX", 
        detalle: "",
        observaciones: "",
        fotos: [
          { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
        ]
      },
      { 
        titulo: "DOC BOX", 
        detalle: "",
        observaciones: "",
        fotos: [
          { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
        ]
      },
    ],
  },
  unifilarVideo: { 
    detalle: "",
    observaciones: "",
    fotos: [
      { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
    ]
  },
};

// --- Estilos de impresión ---
const PrintStyles = () => (
  <style>{`
    @media print {
      @page { 
        size: A4 landscape; 
        margin: 0; 
      }
      .no-print { display: none !important; }
      .page { 
        page-break-after: always;
        page-break-inside: avoid;
        width: 297mm;
        height: 210mm;
        display: flex;
        flex-direction: column;
        padding: 12mm 15mm;
        box-sizing: border-box;
      }
      .page:last-child { page-break-after: auto; }
      .page-header {
        flex-shrink: 0;
        margin-bottom: 8mm;
      }
      .page-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .page-footer {
        flex-shrink: 0;
        margin-top: 4mm;
        padding-top: 3mm;
        border-top: 1px solid #e5e5e5;
      }
      body { 
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        margin: 0;
        padding: 0;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      img {
        max-width: 100%;
        page-break-inside: avoid;
      }
    }
    
    @media screen {
      body {
        background: #f5f5f5;
      }
      .page {
        width: 100%;
        max-width: 1000px;
        min-height: auto;
        margin: 0 auto 20px;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        padding: 30px;
        box-sizing: border-box;
        border-radius: 8px;
      }
      .page-header {
        flex-shrink: 0;
        margin-bottom: 20px;
      }
      .page-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .page-footer {
        flex-shrink: 0;
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #e5e5e5;
      }
    }
  `}</style>
);

// --- Componentes UI básicos ---
// (Card, Field, Input, Textarea ahora están en components/UI/)

// --- Componentes de página ---
// (PageHeader y PageFooter ahora están en components/Page/)

// --- Secciones del informe ---
const Portada = ({ meta, equipamiento, tipoInstalacionVideo, almacenExterno }) => (
  <section className={PAGE}>
    {/* Header */}
    <div className="page-header">
      {/* Logo de Light Sound Group arriba a la izquierda */}
      <div className="flex items-start justify-between mb-3 pb-2 border-b-2 border-neutral-800">
        {/* Logo Light Sound Group (izquierda) */}
        <div>
          <div className="bg-neutral-900 px-2 py-1 inline-block rounded mb-1 flex items-center justify-center" style={{ height: '40px', maxWidth: '150px' }}>
            <img src="/logo.svg" alt="Logo" className="h-full w-auto object-contain" />
          </div>
          <p className="uppercase tracking-widest text-xs text-neutral-500 mt-0.5">PV_P00</p>
        </div>
        
        {/* Cliente/Código arriba a la derecha */}
        <div className="text-right">
          <p className="text-2xl font-bold text-neutral-800">{meta.cliente}</p>
          <p className="text-xs text-neutral-600 mt-0.5">Código: {meta.codigo}</p>
        </div>
      </div>

      {/* Contenido principal: info proyecto + foto entrada */}
      <div className="flex items-center justify-between gap-8">
        {/* Información del proyecto (izquierda) */}
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

        {/* Foto de entrada (centrada y más grande) */}
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

    {/* Content */}
    <div className="page-content">
      {/* Título principal */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">{meta.titulo}</h1>
        <div className="h-0.5 w-16 bg-neutral-800"></div>
      </div>

      {/* Equipamiento instalado */}
      <div className="mb-2">
        <h2 className="text-base font-bold mb-2 text-neutral-800">EQUIPAMIENTO INSTALADO</h2>
        <div className="grid grid-cols-2 gap-2">
          {equipamiento.filter(item => item.cantidad && item.cantidad !== "0").map((item, i) => (
            <div key={i} className="rounded-lg border border-neutral-300 bg-white px-3 py-2">
              <div className="text-xs font-semibold text-neutral-600 mb-0.5">{item.nombre}</div>
              <div className="text-xs font-medium">
                {item.cantidad || "N/A"}
                {item.modelo && ` - ${item.modelo}`}
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-neutral-300 bg-white px-3 py-2">
            <div className="text-xs font-semibold text-neutral-600 mb-0.5">Tipo de instalación</div>
            <div className="text-xs font-medium">{tipoInstalacionVideo || "N/A"}</div>
          </div>
          <div className="rounded-lg border border-neutral-300 bg-white px-3 py-2">
            <div className="text-xs font-semibold text-neutral-600 mb-0.5">Almacén externo</div>
            <div className="text-xs font-medium">{almacenExterno || "No"}</div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      {meta.observaciones && (
        <div className="flex-1 min-h-0">
          <h2 className="text-xs font-bold mb-1 text-neutral-800">OBSERVACIONES:</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-xs h-full min-h-[40px] overflow-hidden">
            {meta.observaciones}
          </div>
        </div>
      )}
    </div>

    {/* Footer */}
    <PageFooter />
  </section>
);

const TablaPantallasImportadas = ({ filas }) => (
  <table className="w-full text-xs mb-4">
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

const TablaPantallasManuales = ({ filas }) => (
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

const SeccionDesglosePantallas = ({ pantallas }) => (
  <section className={PAGE}>
    <PageHeader title="DESGLOSE DE PANTALLAS" subtitle="Información técnica de todas las pantallas instaladas" />
    
    <div className="page-content">
      <div className="overflow-auto">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Datos importados del Excel</h3>
          <TablaPantallasImportadas filas={pantallas} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Datos manuales</h3>
          <TablaPantallasManuales filas={pantallas} />
        </div>
      </div>
    </div>
    
    <PageFooter />
  </section>
);

const SeccionFotosPantallas = ({ fotos }) => {
  const grupos = [];
  for (let i = 0; i < fotos.length; i += 2) {
    grupos.push(fotos.slice(i, i + 2));
  }
  
  if (grupos.length === 0) return null;
  
  return (
    <>
      {grupos.map((grupo, grupoIdx) => (
        <section className={PAGE} key={grupoIdx}>
          <div className="page-header">
            <div className="border-b-2 border-neutral-800 pb-3">
              <h2 className="text-xl font-bold text-neutral-800">FOTOS DE LAS PANTALLAS DE TIENDA</h2>
              <p className="text-sm text-neutral-600 mt-1">Página {grupoIdx + 1} de {grupos.length}</p>
            </div>
          </div>
          
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
                
                {f.nota && (
                  <div className="mx-3 mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800 mb-1">NOTA:</p>
                    <p className="text-xs text-amber-900">{f.nota}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <PageFooter />
        </section>
      ))}
    </>
  );
};

const SeccionProbadores = ({ probadores }) => {
  // Verificar si hay al menos una imagen
  const tieneImagenes = probadores.probadorOcupado?.url || 
                        probadores.probadorLiberado?.url || 
                        probadores.pasilloProbadores?.url;
  
  if (!tieneImagenes) return null;
  
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
            {/* Probador Ocupado */}
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

            {/* Probador Liberado */}
            <div>
              <div className="text-xs font-semibold text-neutral-700 mb-2 text-center">PROBADOR LIBERADO</div>
              <div className="flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden" style={{ height: '200px' }}>
                {probadores.probadorLiberado?.url ? (
                  <img loading="lazy" src={probadores.probadorLiberado.url} alt="Probador liberado" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-2">
                    <div className="text-neutral-300 text-3xl mb-1">📷</div>
                    <span className="text-neutral-400 text-xs">Sin foto</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pasillo Probadores */}
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
      
      <PageFooter />
    </section>
  );
};

const SeccionAltavocesInstalacion = ({ equipamiento }) => {
  // Filtrar equipamientos que tengan nombre y cantidad diferente de "0"
  const todosEquipamientos = equipamiento.filter(a => 
    a.nombre && a.cantidad && a.cantidad !== "0"
  );
  const grupos = [];
  
  for (let i = 0; i < todosEquipamientos.length; i += 4) {
    grupos.push(todosEquipamientos.slice(i, i + 4));
  }
  
  if (grupos.length === 0) return null;
  
  return (
    <>
      {grupos.map((grupo, grupoIdx) => (
        <section className={PAGE} key={grupoIdx}>
          <div className="page-header">
            <div className="border-b-2 border-neutral-800 pb-3">
              <h2 className="text-xl font-bold text-neutral-800">EQUIPAMIENTO INSTALADO</h2>
              <p className="text-sm text-neutral-600 mt-1">Página {grupoIdx + 1} de {grupos.length}</p>
            </div>
          </div>
          
          <div className="page-content">
            <div className="grid grid-cols-2 gap-4 h-full">
              {grupo.map((alt, i) => (
                <div key={i} className="flex flex-col border-2 border-neutral-300 rounded-lg bg-white overflow-hidden">
                  {/* Cabecera con tipo de equipo */}
                  <div className="bg-neutral-800 text-white px-3 py-2">
                    <p className="text-sm font-bold truncate">{alt.nombre}</p>
                  </div>
                  
                  {/* Imagen del equipo */}
                  <div className="flex items-center justify-center bg-neutral-50 p-3" style={{ height: '200px' }}>
                    {alt.url ? (
                      <img loading="lazy" src={alt.url} alt={alt.nombre} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        <div className="text-neutral-300 text-4xl mb-2">🔊</div>
                        <span className="text-neutral-400 text-xs">(Sin imagen)</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Información del equipo */}
                  <div className="bg-white p-3 border-t border-neutral-300 space-y-2 min-h-[100px]">
                    {alt.modelo && (
                      <div>
                        <p className="text-xs font-bold text-neutral-600 mb-1">MODELO</p>
                        <p className="text-base font-medium text-neutral-900">{alt.modelo}</p>
                      </div>
                    )}
                    {alt.cantidad && (
                      <div>
                        <p className="text-xs font-bold text-neutral-600 mb-1">CANTIDAD</p>
                        <p className="text-base font-medium text-neutral-900">{alt.cantidad}</p>
                      </div>
                    )}
                    {alt.ubicacion && (
                      <div>
                        <p className="text-xs font-bold text-neutral-600 mb-1">UBICACIÓN</p>
                        <p className="text-sm text-neutral-800">{alt.ubicacion}</p>
                      </div>
                    )}
                    {alt.nota && (
                      <div className="pt-2 mt-2 border-t border-neutral-200">
                        <p className="text-xs font-bold text-blue-700 mb-1">NOTA</p>
                        <p className="text-xs text-blue-900">{alt.nota}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <PageFooter />
        </section>
      ))}
    </>
  );
};

const SeccionTexto = ({ titulo, contenido }) => {
  if (!contenido) return null;
  
  return (
    <section className={PAGE}>
      <PageHeader title={titulo} />
      
      <div className="page-content">
        <div className="flex-1 whitespace-pre-wrap rounded-xl border-2 border-neutral-300 bg-white p-6 text-sm leading-relaxed overflow-auto">
          {contenido}
        </div>
      </div>
      
      <PageFooter />
    </section>
  );
};

const SeccionRack = ({ titulo, data }) => (
  <section className={PAGE}>
    <PageHeader title={titulo} />
    
    <div className="page-content">
      {/* Descripción - solo si hay contenido */}
      {data.descripcion && (
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-sm font-bold mb-2 text-neutral-700">DESCRIPCIÓN</h3>
          <div className="whitespace-pre-wrap rounded-lg border border-neutral-300 bg-white p-4 text-sm leading-relaxed">
            {data.descripcion}
          </div>
        </div>
      )}

      {/* Grid de fotos */}
      {data.fotos && data.fotos.some(f => f.url) && (
        <div className="mb-4 flex-1">
          <h3 className="text-sm font-bold mb-2 text-neutral-700">FOTOGRAFÍAS</h3>
          <div className="grid grid-cols-2 gap-3 h-full">
            {data.fotos.filter(f => f.url).map((foto, i) => (
              <div key={i} className="rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden flex flex-col">
                <img loading="lazy" src={foto.url} alt={foto.descripcion || `Foto ${i+1}`} className="w-full h-full object-contain" />
                {foto.descripcion && (
                  <div className="p-2 bg-white border-t text-xs text-neutral-600">{foto.descripcion}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observaciones */}
      {data.observaciones && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
          <p className="text-xs font-semibold text-blue-800 mb-1">OBSERVACIONES:</p>
          <p className="text-sm text-blue-900 whitespace-pre-wrap">{data.observaciones}</p>
        </div>
      )}
    </div>
    
    <PageFooter />
  </section>
);

const SeccionCuadros = ({ cuadros }) => (
  <>
    {cuadros.items.map((c, i) => (
      <section className={PAGE} key={i}>
        <PageHeader title={`CUADRO ELÉCTRICO / AV BOX / DOC BOX - ${c.titulo}`} />
        
        <div className="page-content">
          {/* Detalle - solo si hay contenido */}
          {c.detalle && (
            <div className="mb-4 flex-shrink-0">
              <h3 className="text-sm font-bold mb-2 text-neutral-700">DETALLES</h3>
              <div className="whitespace-pre-wrap rounded-lg border border-neutral-300 bg-white p-4 text-sm leading-relaxed">
                {c.detalle}
              </div>
            </div>
          )}

          {/* Grid de fotos */}
          {c.fotos && c.fotos.some(f => f.url) && (
            <div className="mb-4 flex-1">
              <h3 className="text-sm font-bold mb-2 text-neutral-700">FOTOGRAFÍAS</h3>
              <div className="grid grid-cols-2 gap-3 h-full">
                {c.fotos.filter(f => f.url).map((foto, idx) => (
                  <div key={idx} className="rounded-lg border-2 border-neutral-300 bg-neutral-50 overflow-hidden flex flex-col">
                    <img loading="lazy" src={foto.url} alt={foto.descripcion || `Foto ${idx+1}`} className="w-full h-full object-contain" />
                    {foto.descripcion && (
                      <div className="p-2 bg-white border-t text-xs text-neutral-600">{foto.descripcion}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {c.observaciones && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex-shrink-0">
              <p className="text-xs font-semibold text-green-800 mb-1">OBSERVACIONES:</p>
              <p className="text-sm text-green-900 whitespace-pre-wrap">{c.observaciones}</p>
            </div>
          )}
        </div>
        
        <PageFooter />
      </section>
    ))}
  </>
);

// --- Editor ---
const Editor = ({
  data,
  setData,
  onPageRendered,
  pdfPagesRendering,
  setPdfPagesRendering,
  loadingPDFs,
  setLoadingPDFs,
  currentLoadingPDF,
  setCurrentLoadingPDF,
  excelFilesFromFolder,
  fotoFilesFromFolder,
  onFotosProcessed
}) => {
  const imageInputRefs = useRef({});

  return (
    <>
      <LoadingModal isVisible={!!currentLoadingPDF} fileName={currentLoadingPDF} />
      <div className="grid grid-cols-1 gap-3 p-3">
        <MetadatosEditor data={data} setData={setData} imageInputRefs={imageInputRefs} />
        <ObservacionesEditor data={data} setData={setData} />
        <EquipamientoEditor data={data} setData={setData} imageInputRefs={imageInputRefs} />
        <DesglosePantallasEditor 
          data={data} 
          setData={setData} 
          imageInputRefs={imageInputRefs}
          excelFilesFromFolder={excelFilesFromFolder}
        />
        <FotosPantallasEditor 
          data={data} 
          setData={setData} 
          imageInputRefs={imageInputRefs}
          fotoFilesFromFolder={fotoFilesFromFolder}
          onFotosProcessed={onFotosProcessed}
        />
        <ProbadoresEditor data={data} setData={setData} imageInputRefs={imageInputRefs} />
        <RackVideoEditor data={data} setData={setData} imageInputRefs={imageInputRefs} />
        <RackAudioEditor data={data} setData={setData} imageInputRefs={imageInputRefs} />
        <CuadrosAVEditor data={data} setData={setData} imageInputRefs={imageInputRefs} />
        <UnifilarVideoEditor data={data} setData={setData} imageInputRefs={imageInputRefs} />
        <Card title="Planos de tienda">
          <PDFUploader
            data={data}
            setData={setData}
            imageInputRefs={imageInputRefs}
            loadingPDFs={loadingPDFs}
            setLoadingPDFs={setLoadingPDFs}
            setCurrentLoadingPDF={setCurrentLoadingPDF}
            setPdfPagesRendering={setPdfPagesRendering}
          />
        </Card>
      </div>
    </>
  );
};

// --- Vista imprimible basada en los toggles ---
// (Componentes PDF ahora están en components/PDF/)

const Printable = React.memo(({ data, onPageRendered }) => (
  <div>
    {data.secciones.portada && (
      <Portada 
        meta={{ ...data.meta, observaciones: data.observaciones }} 
        equipamiento={data.equipamiento}
        tipoInstalacionVideo={data.tipoInstalacionVideo}
        almacenExterno={data.almacenExterno}
      />
    )}
    {data.secciones.desglosePantallas && (
      <SeccionDesglosePantallas pantallas={data.pantallas} />
    )}
    {data.secciones.fotosPantallas && (
      <SeccionFotosPantallas fotos={data.fotos} />
    )}
    {data.secciones.probadores && (
      <SeccionProbadores probadores={data.probadores} />
    )}
    {data.secciones.altavocesInstalacion && (
      <SeccionAltavocesInstalacion equipamiento={data.equipamiento} />
    )}
    {data.secciones.rackVideo && (
      <SeccionRack titulo="RACK DE VÍDEO" data={data.rackVideo} />
    )}
    {data.secciones.rackAudio && (
      <SeccionRack titulo="RACK DE AUDIO" data={data.rackAudio} />
    )}
    {data.secciones.cuadrosAV && (
      <SeccionCuadros cuadros={data.cuadrosAV} />
    )}
    {data.secciones.unifilarVideo && (
      <SeccionRack titulo="UNIFILAR VIDEO" data={data.unifilarVideo} />
    )}
    {data.secciones.planostienda && (
      <SeccionPlanostienda planostienda={data.planostienda} onPageRendered={onPageRendered} />
    )}
    {data.secciones.medicionPartidas && (
      <SeccionTexto titulo="INFORME MEDICIÓN - DESGLOSE POR PARTIDAS" contenido={""} />
    )}
  </div>
));

export default function App() {
  const [data, setData] = useState(defaultReport);
  const [pdfPagesRendering, setPdfPagesRendering] = useState({}); // Rastrear páginas en renderizado
  const [loadingPDFs, setLoadingPDFs] = useState({});
  const [currentLoadingPDF, setCurrentLoadingPDF] = useState(null);
  const [excelFilesFromFolder, setExcelFilesFromFolder] = useState([]);
  const [fotoFilesFromFolder, setFotoFilesFromFolder] = useState([]);
  const [fotosProcessedInfo, setFotosProcessedInfo] = useState(null);
  const inputFolder = useRef(null);
  

  // Función para comprimir imagen
  const compressImage = (file, { maxDim = 1600, quality = 0.85 } = {}) => {
    return new Promise((resolve, reject) => {
      try {
        if (file.size <= 2 * 1024 * 1024) {
          return fileToBase64(file).then(resolve).catch(reject);
        }
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const { naturalWidth: w, naturalHeight: h } = img;
          const scale = Math.min(maxDim / w, maxDim / h, 1);
          const targetW = Math.round(w * scale);
          const targetH = Math.round(h * scale);
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(e);
        };
        img.src = url;
      } catch (e) {
        reject(e);
      }
    });
  };

  // Función para importar carpeta y cargar fotos automáticamente
  // NOTA: El procesamiento de Excel se hace exclusivamente desde DesglosePantallasEditor.jsx
  const importFolder = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    console.log('Total de archivos seleccionados:', files.length);
    
    // Filtrar archivos que estén en As Built/Fotos/ y enviarlos a FotosPantallasEditor.jsx
    const fotoFiles = files.filter(file => {
      const path = file.webkitRelativePath || file.path || '';
      console.log('Archivo:', file.name, 'Ruta:', path);
      return path.includes('As Built/Fotos/') || path.includes('As Built\\Fotos\\') || 
             path.includes('As Built/Fotos') || path.includes('As Built\\Fotos');
    });

    console.log('Archivos filtrados en As Built/Fotos:', fotoFiles.length);
    
    // Enviar archivos de fotos a FotosPantallasEditor.jsx para procesamiento
    if (fotoFiles.length > 0) {
      setFotoFilesFromFolder(fotoFiles);
    }
    
    // Buscar y cargar foto de entrada de la tienda (se procesa en App.jsx)
    const fotoEntradaFile = fotoFiles.find(file => {
      const fileName = file.name.toUpperCase();
      return fileName.includes('ENTRADA_TIENDA');
    });
    
    let fotoEntradaProcesada = false;
    let fotoEntradaBase64 = null;
    let fotoEntradaFileName = null;
    let fotoEntradaFileSize = null;
    let clienteExtraido = "";
    let proyectoExtraido = "";
    let codigoExtraido = "";
    
    if (fotoEntradaFile) {
      try {
        console.log('Procesando foto de entrada:', fotoEntradaFile.name);
        fotoEntradaBase64 = await compressImage(fotoEntradaFile, { maxDim: 1600, quality: 0.85 });
        fotoEntradaFileName = fotoEntradaFile.name;
        fotoEntradaFileSize = fotoEntradaFile.size;
        fotoEntradaProcesada = true;
        console.log('✓ Foto de entrada procesada correctamente');
        
        // Extraer información del nombre del archivo
        const nombreArchivo = fotoEntradaFile.name.toUpperCase();
        
        // Extraer Cliente
        if (nombreArchivo.includes('BSK')) {
          clienteExtraido = "BERSHKA";
        } else if (nombreArchivo.includes('LFT')) {
          clienteExtraido = "LEFTIES";
        }
        
        // Extraer Código (números del nombre)
        const codigoMatch = nombreArchivo.match(/\d+/);
        if (codigoMatch) {
          codigoExtraido = codigoMatch[0];
        }
        
        // Extraer Proyecto: nombre completo sin prefijo (BSK/LFT) y sin "_ENTRADA_TIENDA" y extensión
        let proyecto = nombreArchivo;
        // Eliminar prefijo BSK_ o LFT_
        proyecto = proyecto.replace(/^(BSK|LFT)_/, '');
        // Eliminar _ENTRADA_TIENDA y extensión
        proyecto = proyecto.replace(/_ENTRADA_TIENDA.*$/i, '');
        proyectoExtraido = proyecto;
        
        console.log('Información extraída:', { clienteExtraido, proyectoExtraido, codigoExtraido });
      } catch (error) {
        console.error(`Error procesando foto de entrada ${fotoEntradaFile.name}:`, error);
      }
    } else {
      console.log('No se encontró foto de entrada (ENTRADA_TIENDA)');
    }
    
    // Filtrar y enviar archivos Excel de Documentación/Validaciones/ a DesglosePantallasEditor.jsx
    const validacionMKDFiles = files.filter(file => {
      const path = file.webkitRelativePath || file.path || '';
      const fileName = file.name.toUpperCase();
      const isExcel = fileName.endsWith('.XLSX') || fileName.endsWith('.XLS');
      const isInValidaciones = path.includes('Documentación/Validaciones/') || 
                                path.includes('Documentación\\Validaciones\\') ||
                                path.includes('Documentacion/Validaciones/') ||
                                path.includes('Documentacion\\Validaciones\\');
      const hasMKD = fileName.includes('VALIDACION_MKD') || 
                     file.name.includes('Validación_MKD') || 
                     file.name.includes('Validacion_MKD');
      return isExcel && isInValidaciones && hasMKD;
    });

    console.log('Archivos Excel de validación MKD encontrados para procesar:', validacionMKDFiles.length);
    
    // Enviar archivos Excel a DesglosePantallasEditor.jsx para procesamiento
    if (validacionMKDFiles.length > 0) {
      setExcelFilesFromFolder(validacionMKDFiles);
    }

    // Actualizar el estado con la foto de entrada
    // NOTA: Las fotos de pantallas se procesan en FotosPantallasEditor.jsx
    setData((d) => {
      const c = structuredClone(d);
      
      // Actualizar foto de entrada y metadatos si se encontró
      if (fotoEntradaProcesada) {
        c.meta.fotoEntrada = {
          url: fotoEntradaBase64,
          fileName: fotoEntradaFileName,
          fileSize: fotoEntradaFileSize
        };
        // Actualizar metadatos extraídos del nombre del archivo
        c.meta.titulo = "Informe Fin de Obra";
        if (clienteExtraido) {
          c.meta.cliente = clienteExtraido;
        }
        if (proyectoExtraido) {
          c.meta.proyecto = proyectoExtraido;
        }
        if (codigoExtraido) {
          c.meta.codigo = codigoExtraido;
        }
      }
      
      console.log('Estado actualizado' + (fotoEntradaProcesada ? ' con foto de entrada' : ''));
      return c;
    });
    
    // Construir mensaje inicial (las fotos se procesan de forma asíncrona en FotosPantallasEditor.jsx)
    let mensajeFinal = '';
    
    if (fotoFiles.length > 0) {
      mensajeFinal += `✅ Se encontraron ${fotoFiles.length} archivo(s) de fotos\n   Los archivos se están procesando automáticamente...`;
    }
    
    if (fotoEntradaProcesada) {
      if (mensajeFinal) mensajeFinal += '\n';
      mensajeFinal += '✅ Foto de entrada cargada';
    }
    
    if (validacionMKDFiles.length > 0) {
      if (mensajeFinal) mensajeFinal += '\n';
      mensajeFinal += `✅ Se encontraron ${validacionMKDFiles.length} archivo(s) Excel de Validación_MKD\n   Los archivos se están procesando automáticamente...`;
    }
    
    if (!mensajeFinal) {
      mensajeFinal = '⚠️ No se encontraron archivos para procesar. Verifica que:\n- Las fotos estén en As Built/Fotos/\n- Los Excel estén en Documentación/Validaciones/ con nombre que contenga "Validación_MKD" o "Validacion_MKD"';
    }
    
    alert(`Importación iniciada:\n\n${mensajeFinal}`);
  };

  // Función para generar un reporte completamente limpio
  const generarReporteLimpio = () => {
    return {
      meta: {
        titulo: "Informe Fin de Obra",
        cliente: "",
        proyecto: "",
        codigo: "",
        pm: "",
        direccion: "",
        versionPlano: "",
        fecha: new Date().toISOString().slice(0,10),
        logo: { url: "/logo.svg", fileName: "logo.svg", fileSize: undefined },
        fotoEntrada: { url: "", fileName: undefined, fileSize: undefined },
      },
      secciones: {
        portada: true,
        equipamiento: true,
        observaciones: true,
        desglosePantallas: true,
        fotosPantallas: true,
        probadores: false,
        altavocesInstalacion: true,
        rackVideo: true,
        rackAudio: true,
        cuadrosAV: true,
        unifilarVideo: true,
        planostienda: true,
        medicionPartidas: false,
      },
      observaciones: "",
      planostienda: {
        pdfs: []
      },
      equipamiento: [
        { nombre: "Altavoces tienda", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
        { nombre: "Subwoofers", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
        { nombre: "Micrófonos", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
        { nombre: "Altavoces almacén", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
        { nombre: "Columnas acústicas", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" },
      ],
      tipoInstalacionVideo: "",
      almacenExterno: "No",
      pantallas: [],
      fotos: [],
      probadores: {
        activo: false,
        probadorOcupado: { url: "", fileName: undefined, fileSize: undefined },
        probadorLiberado: { url: "", fileName: undefined, fileSize: undefined },
        pasilloProbadores: { url: "", fileName: undefined, fileSize: undefined },
      },
      rackVideo: {
        descripcion: "",
        observaciones: "",
        fotos: [
          { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
        ]
      },
      rackAudio: { 
        descripcion: "", 
        observaciones: "",
        fotos: [
          { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
        ]
      },
      cuadrosAV: {
        items: [
          { 
            titulo: "CUADRO ELÉCTRICO", 
            detalle: "",
            observaciones: "",
            fotos: [
              { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
            ]
          },
          { 
            titulo: "AV BOX", 
            detalle: "",
            observaciones: "",
            fotos: [
              { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
            ]
          },
          { 
            titulo: "DOC BOX", 
            detalle: "",
            observaciones: "",
            fotos: [
              { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
            ]
          },
        ],
      },
      unifilarVideo: { 
        detalle: "",
        observaciones: "",
        fotos: [
          { url: "", fileName: undefined, fileSize: undefined, descripcion: "" }
        ]
      },
    };
  };

  // Función para limpiar la plantilla y resetear al estado inicial
  const limpiarPlantilla = () => {
    const confirmar = window.confirm(
      '¿Estás seguro de que quieres limpiar toda la plantilla?\n\nEsto eliminará TODOS los datos actuales:\n- Metadatos del informe\n- Observaciones\n- Pantallas y fotos\n- Equipamiento\n- Todos los bloques de texto\n\nLa aplicación será reseteada completamente al estado inicial vacío.\n\nEsta acción no se puede deshacer.'
    );
    
    if (confirmar) {
      const reporteLimpio = generarReporteLimpio();
      setData(reporteLimpio);
      setPdfPagesRendering({});
      setLoadingPDFs({});
      setCurrentLoadingPDF(null);
      alert('Plantilla limpiada correctamente. Todos los datos han sido eliminados y la aplicación ha sido reseteada al estado inicial vacío.');
    }
  };
  
  // Función para manejar cuando una página PDF se termina de renderizar
  const handlePageRendered = React.useCallback((fileName, success) => {
    if (!success) return;
    
    setPdfPagesRendering(prev => {
      const newState = { ...prev };
      if (newState[fileName] > 0) {
        newState[fileName]--;
      }
      
      // Si todas las páginas se han renderizado, ocultar el loading
      if (newState[fileName] === 0) {
        setCurrentLoadingPDF(null);
        setLoadingPDFs(prevLoading => {
          const newLoading = { ...prevLoading };
          delete newLoading[fileName];
          return newLoading;
        });
        delete newState[fileName];
      }
      
      return newState;
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <PrintStyles />

      <div className="no-print bg-white border-b shadow-sm sticky top-0 z-20 flex-shrink-0">
        <div className="mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-neutral-800">Generador de Informe As Built</h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => inputFolder.current?.click()}>📁 Importar Carpeta</Button>
              <Button onClick={limpiarPlantilla} className="bg-red-500 hover:bg-red-600 text-white">🗑️ Limpiar Plantilla</Button>
              <Button onClick={() => window.print()}>Imprimir / Exportar PDF</Button>
              <input ref={inputFolder} type="file" className="hidden" webkitdirectory="true" directory="true"
                     onChange={importFolder} />
            </div>
          </div>
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div className="no-print flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Columna izquierda: Formulario */}
        <div className="w-1/2 border-r border-neutral-300 bg-white overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="p-4">
            <Editor 
              data={data} 
              setData={setData} 
              onPageRendered={handlePageRendered} 
              pdfPagesRendering={pdfPagesRendering} 
              setPdfPagesRendering={setPdfPagesRendering}
              loadingPDFs={loadingPDFs}
              setLoadingPDFs={setLoadingPDFs}
              currentLoadingPDF={currentLoadingPDF}
              setCurrentLoadingPDF={setCurrentLoadingPDF}
              excelFilesFromFolder={excelFilesFromFolder}
              fotoFilesFromFolder={fotoFilesFromFolder}
              onFotosProcessed={setFotosProcessedInfo}
            />
          </div>
        </div>

        {/* Columna derecha: Vista Previa */}
        <div className="w-1/2 bg-neutral-50 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="flex-shrink-0 bg-neutral-100 border-b border-neutral-300 px-4 py-3 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-700">Vista Previa del Informe</h2>
            <p className="text-sm text-neutral-600">Esto es cómo se verá al imprimir</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Printable data={data} onPageRendered={handlePageRendered} />
          </div>
        </div>
      </div>

      {/* Vista imprimible oculta pero disponible para impresión */}
      <div className="hidden print:block">
        <Printable data={data} onPageRendered={handlePageRendered} />
      </div>
    </div>
  );
}
