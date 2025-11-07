import React, { useRef, useState, useEffect } from "react";
import * as XLSX from 'xlsx';
// Componentes PDF
import { PDFUploader } from './components/PDF/PDFUploader';
import { SeccionPlanostienda } from './components/PDF/SeccionPlanostienda';
// Componentes UI
import { Button } from './components/UI/Button';
// Componentes Page
import { PageHeader } from './components/Page/PageHeader';
import { PageFooter } from './components/Page/PageFooter';
// Utils
import { PAGE } from './utils/constants';
import { fileToBase64 } from './utils/pdfUtils';

// --- Utilidades simples ---
const cls = (...c) => c.filter(Boolean).join(" ");
const download = (filename, text) => {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// Componente de Loading Modal
const LoadingModal = ({ isVisible, fileName }) => {
  if (!isVisible) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        minWidth: '300px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '60px',
          height: '60px',
          border: '5px solid #e5e7eb',
          borderTop: '5px solid #0ea5e9',
          borderRight: '5px solid #0ea5e9',
          borderRadius: '50%',
          marginBottom: '20px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
          Procesando PDF...
        </p>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          {fileName}
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};
const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-150 border-b transition-colors"
      >
        <h3 className="font-semibold text-neutral-800">{title}</h3>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

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

// --- Componentes UI básicos (sin dependencias externas) ---

const Card = ({ title, children, right }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-150 border-b transition-colors"
      >
        <h3 className="font-semibold text-neutral-800">{title}</h3>
        <div className="flex items-center gap-3">
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} text-lg`}>
            ▼
          </span>
          {right}
        </div>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

const Field = ({ label, children, className }) => (
  <label className={cls("flex flex-col gap-1", className)}>
    <span className="text-xs font-medium text-neutral-600">{label}</span>
    {children}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={cls(
      "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm",
      "focus:outline-none focus:ring-2 focus:ring-neutral-300"
    )}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={cls(
      "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm",
      "focus:outline-none focus:ring-2 focus:ring-neutral-300"
    )}
  />
);

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

const TablaPantallas = ({ filas }) => (
  <table className="w-full text-xs">
    <thead>
      <tr className="bg-neutral-100 text-[11px]">
        {[
          "Etiqueta de plano","Hostname","Mac","S/N","Resolución","Fondo","Puerto patch","Puerto switch","Contrato","Térmico pantalla","Térmico PC","24H"
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
          <td className="border px-2 py-1">{r.series || r.serie || ""}</td>
          <td className="border px-2 py-1">{r.resolucion}</td>
          <td className="border px-2 py-1">{r.fondo}</td>
          <td className="border px-2 py-1">{r.puertoPatch}</td>
          <td className="border px-2 py-1">{r.puertoSwitch}</td>
          <td className="border px-2 py-1">{r.contrato}</td>
          <td className="border px-2 py-1">{r.termicoPantalla}</td>
          <td className="border px-2 py-1">{r.termicoPC}</td>
          <td className="border px-2 py-1">{r.horas24}</td>
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
        <TablaPantallas filas={pantallas} />
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
  setCurrentLoadingPDF
}) => {
  const imageInputRefs = useRef({});

  const upd = (path, value) => {
    setData((d) => {
      const copy = structuredClone(d);
      const seg = path.split(".");
      let ptr = copy;
      for (let i = 0; i < seg.length - 1; i++) ptr = ptr[seg[i]];
      ptr[seg.at(-1)] = value;
      return copy;
    });
  };

  // Comprimir imagen: redimensiona y convierte a JPEG (o mantiene PNG si se pide)
  const compressImage = (file, { maxDim = 1600, quality = 0.85, preferPNG = false } = {}) => {
    return new Promise((resolve, reject) => {
      try {
        // Si la imagen es suficientemente pequeña, devolver base64 original
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

          const mime = preferPNG && file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mime, quality);
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

  // Función para manejar la subida de imágenes
  const handleImageUpload = async (index, file) => {
    if (!file) return;
    
    // Validar que es una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB.');
      return;
    }

    try {
      const base64 = await compressImage(file);
      setData((d) => {
        const copy = structuredClone(d);
        copy.fotos[index].url = base64;
        copy.fotos[index].fileName = file.name;
        copy.fotos[index].fileSize = file.size;
        return copy;
      });
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Error al procesar la imagen.');
    }
  };

  // Función para procesar archivo Excel y cargar pantallas
  const handleExcelUpload = async (file) => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const XLSXLib = await import('xlsx');
      const workbook = XLSXLib.read(arrayBuffer, { type: 'array', defval: '' });
      
      // Obtener la primera hoja
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Obtener todas las filas como arrays para encontrar la fila de encabezados
      const allRows = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (!allRows || allRows.length === 0) {
        alert('El archivo Excel está vacío');
        return;
      }

      // Buscar la fila que contiene "Etiqueta de plano"
      let headerRowIndex = -1;
      for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i];
        const rowStr = row.join('|').toUpperCase();
        if (rowStr.includes('ETIQUETA') || rowStr.includes('PLANO')) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        alert('No se encontró la fila de encabezados con "Etiqueta de plano"');
        return;
      }

      // Crear el objeto de encabezados desde esa fila
      const headers = allRows[headerRowIndex];
      
      // Procesar las filas siguientes
      const pantallasFromExcel = [];
      for (let i = headerRowIndex + 1; i < allRows.length; i++) {
        const row = allRows[i];
        
        // Crear objeto con los datos de esta fila
        const rowData = {};
        headers.forEach((header, idx) => {
          if (header) {
            rowData[header.toString().trim()] = row[idx] ? String(row[idx]).trim() : '';
          }
        });

        // Buscar el valor de "Etiqueta de plano"
        let etiquetaPlano = '';
        for (let key in rowData) {
          if (key.toUpperCase().includes('ETIQUETA') && key.toUpperCase().includes('PLANO')) {
            etiquetaPlano = rowData[key];
            break;
          }
        }

        // Si tiene etiqueta de plano, agrégalo
        if (etiquetaPlano && String(etiquetaPlano).trim() !== '') {
          const getVal = (keySearch) => {
            for (let key in rowData) {
              if (key.toUpperCase().includes(keySearch.toUpperCase())) {
                return rowData[key];
              }
            }
            return '';
          };

          pantallasFromExcel.push({
            etiquetaPlano: etiquetaPlano,
            hostname: getVal('HOSTNAME') || getVal('HOST') || '',
            mac: getVal('MAC') || '',
            serie: getVal('S/N') || getVal('SERIE') || '',
            resolucion: getVal('RESOLUCIÓN') || getVal('RESOLUCION') || '',
            fondo: getVal('FONDO') || '',
            puertoPatch: getVal('PUERTO PATCH') || '',
            puertoSwitch: getVal('PUERTO SWITCH') || '',
            contrato: getVal('CONTRATO') || '',
            termicoPantalla: getVal('TÉRMICO PANTALLA') || getVal('TERMICO PANTALLA') || '',
            termicoPC: getVal('TÉRMICO PC') || getVal('TERMICO PC') || '',
            horas24: getVal('24H') || '',
          });
        }
      }

      if (pantallasFromExcel.length === 0) {
        alert('No se encontraron pantallas válidas con "Etiqueta de plano" relleno.');
        return;
      }

      // Crear entradas de fotos para cada pantalla del desglose
      const fotosFromExcel = pantallasFromExcel.map((pantalla) => ({
        etiquetaPlano: pantalla.etiquetaPlano,
        fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
        fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
        fotoIP: { url: "", fileName: undefined, fileSize: undefined },
        nota: ""
      }));

      setData((d) => ({
        ...d,
        pantallas: pantallasFromExcel,
        fotos: fotosFromExcel
      }));

      alert(`✅ Se han cargado ${pantallasFromExcel.length} pantallas correctamente\n\nSe han creado ${fotosFromExcel.length} entradas de fotos`);
    } catch (error) {
      console.error('Error al procesar el Excel:', error);
      alert('Error: ' + error.message);
    }
  };

  const addPantalla = () => {
    setData((d) => ({ ...d, pantallas: [...d.pantallas, {
      etiquetaPlano: "",
      hostname: "",
      mac: "",
      serie: "",
      resolucion: "",
      fondo: "",
      puertoPatch: "",
      puertoSwitch: "",
      contrato: "",
      termicoPantalla: "",
      termicoPC: "",
      horas24: "",
    }] }));
  };

  const addFoto = () => {
    setData((d) => ({ 
      ...d, 
      fotos: [...d.fotos, { 
        etiquetaPlano: "", 
        fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
        fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
        fotoIP: { url: "", fileName: undefined, fileSize: undefined },
        nota: "" 
      }] 
    }));
  };


  return (
    <>
      <LoadingModal isVisible={!!currentLoadingPDF} fileName={currentLoadingPDF} />
      <div className="grid grid-cols-1 gap-3 p-3">
        <Card title="Metadatos del informe">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Título">
              <Input value="Informe Fin de Obra" disabled className="bg-neutral-100 cursor-not-allowed" />
            </Field>
            <Field label="Cliente"><Input value={data.meta.cliente} onChange={(e)=>upd("meta.cliente", e.target.value)} /></Field>
            <Field label="Proyecto"><Input value={data.meta.proyecto} onChange={(e)=>upd("meta.proyecto", e.target.value)} /></Field>
            <Field label="Código"><Input value={data.meta.codigo} onChange={(e)=>upd("meta.codigo", e.target.value)} /></Field>
            <Field label="Project Manager"><Input value={data.meta.pm} onChange={(e)=>upd("meta.pm", e.target.value)} /></Field>
            <Field label="Dirección"><Input value={data.meta.direccion} onChange={(e)=>upd("meta.direccion", e.target.value)} /></Field>
            <Field label="Versión de plano"><Input value={data.meta.versionPlano} onChange={(e)=>upd("meta.versionPlano", e.target.value)} /></Field>
            <Field label="Fecha"><Input value={data.meta.fecha} onChange={(e)=>upd("meta.fecha", e.target.value)} /></Field>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Field label="Foto de entrada de la tienda">
              <div className="flex gap-2">
                <Button onClick={() => imageInputRefs.current['fotoEntrada']?.click()}>
                  Subir foto
                </Button>
                <input
                  ref={el => imageInputRefs.current['fotoEntrada'] = el}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                      setData((d)=>{
                        const c=structuredClone(d); 
                        c.meta.fotoEntrada = {
                          url: base64,
                          fileName: e.target.files[0].name,
                          fileSize: e.target.files[0].size
                        };
                        return c;
                      });
                    }
                  }}
                />
                {data.meta.fotoEntrada?.url && (
                  <Button onClick={() => {
                    setData((d)=>{const c=structuredClone(d); c.meta.fotoEntrada={url:''}; return c;});
                  }}>
                    Limpiar
                  </Button>
                )}
              </div>
              {data.meta.fotoEntrada?.url && (
                <div className="mt-3">
                  <div className="text-xs text-neutral-600 mb-2">Vista previa</div>
                  <div className="flex justify-center">
                    <img 
                      loading="lazy"
                      src={data.meta.fotoEntrada.url} 
                      alt="Foto entrada" 
                      className="max-h-32 max-w-full rounded-lg border shadow-sm"
                    />
                  </div>
                </div>
              )}
            </Field>
          </div>
        </Card>

        <Card title="Observaciones">
          <Textarea rows={3} value={data.observaciones} onChange={(e)=>upd("observaciones", e.target.value)} />
        </Card>

        <Card title="Equipamiento instalado" right={<Button onClick={() => {
          setData((d) => {
            const c = structuredClone(d);
            c.equipamiento.push({ nombre: "", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" });
            return c;
          });
        }}>+ Añadir</Button>}>
          <div className="space-y-4">
            {data.equipamiento.map((equipo, i) => (
              <div key={i} className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
                {/* Cabecera con nombre del equipo */}
                <div className="mb-4 pb-3 border-b border-neutral-300">
                  <Field label="Tipo de equipo" className="mb-2">
                    <Input 
                      value={equipo.nombre} 
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.equipamiento[i].nombre = v;
                          return c;
                        });
                      }}
                      placeholder="Ej: Altavoces tienda"
                      className="font-semibold"
                    />
                  </Field>
                </div>

                {/* Grid con todos los campos */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-6 mb-4">
                  <Field className="md:col-span-2" label="Modelo">
                    <Input 
                      value={equipo.modelo} 
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.equipamiento[i].modelo = v;
                          return c;
                        });
                      }}
                    />
                  </Field>
                  <Field className="md:col-span-1" label="Cantidad">
                    <Input 
                      value={equipo.cantidad} 
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.equipamiento[i].cantidad = v;
                          return c;
                        });
                      }}
                    />
                  </Field>
                  <Field className="md:col-span-2" label="Ubicación">
                    <Input 
                      value={equipo.ubicacion} 
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.equipamiento[i].ubicacion = v;
                          return c;
                        });
                      }}
                    />
                  </Field>
                  <Field className="md:col-span-1 flex items-end" label=" ">
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.equipamiento.splice(i, 1);
                        return c;
                      });
                    }} className="w-full bg-red-50 border-red-200 hover:bg-red-100 text-red-700">Borrar</Button>
                  </Field>
                </div>

                {/* Foto y nota */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field className="md:col-span-2" label="Subir imagen del equipo">
                    <div className="flex gap-2">
                      <Button onClick={() => imageInputRefs.current[`equip_${i}`]?.click()}>
                        Subir foto
                      </Button>
                      <input
                        ref={el => imageInputRefs.current[`equip_${i}`] = el}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 }).then(base64 => {
                              setData((d)=>{const c=structuredClone(d); c.equipamiento[i].url=base64; return c;});
                            });
                          }
                        }}
                      />
                      {equipo.url && (
                        <Button onClick={() => {
                          setData((d)=>{const c=structuredClone(d); c.equipamiento[i].url=''; return c;});
                        }}>
                          Limpiar
                        </Button>
                      )}
                    </div>
                  </Field>
                  <Field label="Nota (opcional)">
                    <Textarea rows={2} value={equipo.nota} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.equipamiento[i].nota=v; return c;});
                    }} placeholder="Ej: Ubicación específica o detalles adicionales" />
                  </Field>
                </div>

                {/* Vista previa */}
                {equipo.url && (
                  <div className="mt-4 pt-4 border-t border-neutral-300">
                    <div className="text-xs text-neutral-600 mb-2 font-semibold">Vista previa de imagen</div>
                    <div className="flex justify-start">
                      <img 
                        loading="lazy"
                        src={equipo.url} 
                        alt={equipo.nombre || 'Vista previa'} 
                        className="max-h-40 max-w-xs rounded-lg border shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Desglose de pantallas">
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800 mb-1">Cargar desde Excel</p>
                <p className="text-xs text-blue-700">Sube el archivo de validación Excel para cargar automáticamente los datos de pantallas</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => imageInputRefs.current['excel']?.click()}>
                  📊 Cargar Excel
                </Button>
                <input
                  ref={el => imageInputRefs.current['excel'] = el}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleExcelUpload(e.target.files[0]);
                      // Limpiar el input para permitir subir el mismo archivo de nuevo
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-100 text-[11px]">
                  {[
                    "Etiqueta de plano","Hostname","MAC","S/N","Resolución","Fondo","Puerto patch","Puerto switch","Contrato","Térmico pantalla","Térmico PC","24H",""
                  ].map((h) => (
                    <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.pantallas.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-neutral-50">
                    <td className="border px-1 py-1"><Input value={r.etiquetaPlano} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].etiquetaPlano=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.hostname} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].hostname=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.mac} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].mac=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.serie||""} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].serie=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.resolucion} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].resolucion=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.fondo} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].fondo=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.puertoPatch} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].puertoPatch=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.puertoSwitch} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].puertoSwitch=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.contrato} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].contrato=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.termicoPantalla} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].termicoPantalla=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={r.termicoPC} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].termicoPC=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1"><Input value={typeof r.horas24 === 'boolean' ? (r.horas24 ? 'Sí' : '') : r.horas24} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.pantallas[i].horas24=v; return c;});
                    }} /></td>
                    <td className="border px-1 py-1 text-right">
                      <Button onClick={()=>{
                        setData((d)=>{const c=structuredClone(d); c.pantallas.splice(i,1); return c;});
                      }}>Borrar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        </Card>

        <Card title="Fotos de pantallas" right={<Button onClick={addFoto}>Añadir foto</Button>}>
          <div className="grid grid-cols-1 gap-4">
            {data.fotos.map((f, i) => (
              <div key={i} className="rounded-lg border-2 border-neutral-300 p-4 bg-neutral-50">
                <div className="flex justify-between items-center mb-3">
                  <Field className="flex-grow mr-4" label="Etiqueta de plano">
                    <Input value={f.etiquetaPlano} onChange={(e)=>{
                      const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.fotos[i].etiquetaPlano=v; return c;});
                    }} />
                  </Field>
                  <div className="pt-6">
                    <Button onClick={()=>{
                      setData((d)=>{const c=structuredClone(d); c.fotos.splice(i,1); return c;});
                    }}>Borrar pantalla</Button>
                  </div>
                </div>

                {/* Grid de 3 fotos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  {/* Foto Frontal */}
                  <div className="bg-white rounded-lg border p-3">
                    <div className="text-xs font-semibold text-neutral-700 mb-2">FOTO FRONTAL</div>
                    <div className="flex gap-2 mb-2">
                      <Button onClick={() => imageInputRefs.current[`${i}_frontal`]?.click()}>
                        Subir
                      </Button>
                      <input
                        ref={el => imageInputRefs.current[`${i}_frontal`] = el}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                      const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                            setData((d)=>{
                              const c=structuredClone(d); 
                              c.fotos[i].fotoFrontal = {
                                url: base64,
                                fileName: e.target.files[0].name,
                                fileSize: e.target.files[0].size
                              };
                              return c;
                            });
                          }
                        }}
                      />
                      {f.fotoFrontal?.url && (
                        <Button onClick={() => {
                          setData((d)=>{const c=structuredClone(d); c.fotos[i].fotoFrontal={url:''}; return c;});
                        }}>
                          Limpiar
                        </Button>
                      )}
                    </div>
                    {f.fotoFrontal?.url && (
                      <div>
                        <img loading="lazy" src={f.fotoFrontal.url} alt="Frontal" className="max-h-32 w-full object-contain rounded border" />
                        <p className="text-xs text-neutral-600 mt-1">{f.fotoFrontal.fileName}</p>
                      </div>
                    )}
                  </div>

                  {/* Foto Player + Sending */}
                  <div className="bg-white rounded-lg border p-3">
                    <div className="text-xs font-semibold text-neutral-700 mb-2">PLAYER + SENDING</div>
                    <div className="flex gap-2 mb-2">
                      <Button onClick={() => imageInputRefs.current[`${i}_player`]?.click()}>
                        Subir
                      </Button>
                      <input
                        ref={el => imageInputRefs.current[`${i}_player`] = el}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                      const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                            setData((d)=>{
                              const c=structuredClone(d); 
                              c.fotos[i].fotoPlayer = {
                                url: base64,
                                fileName: e.target.files[0].name,
                                fileSize: e.target.files[0].size
                              };
                              return c;
                            });
                          }
                        }}
                      />
                      {f.fotoPlayer?.url && (
                        <Button onClick={() => {
                          setData((d)=>{const c=structuredClone(d); c.fotos[i].fotoPlayer={url:''}; return c;});
                        }}>
                          Limpiar
                        </Button>
                      )}
                    </div>
                    {f.fotoPlayer?.url && (
                      <div>
                        <img loading="lazy" src={f.fotoPlayer.url} alt="Player" className="max-h-32 w-full object-contain rounded border" />
                        <p className="text-xs text-neutral-600 mt-1">{f.fotoPlayer.fileName}</p>
                      </div>
                    )}
                  </div>

                  {/* Foto IP */}
                  <div className="bg-white rounded-lg border p-3">
                    <div className="text-xs font-semibold text-neutral-700 mb-2">IP</div>
                    <div className="flex gap-2 mb-2">
                      <Button onClick={() => imageInputRefs.current[`${i}_ip`]?.click()}>
                        Subir
                      </Button>
                      <input
                        ref={el => imageInputRefs.current[`${i}_ip`] = el}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                      const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                            setData((d)=>{
                              const c=structuredClone(d); 
                              c.fotos[i].fotoIP = {
                                url: base64,
                                fileName: e.target.files[0].name,
                                fileSize: e.target.files[0].size
                              };
                              return c;
                            });
                          }
                        }}
                      />
                      {f.fotoIP?.url && (
                        <Button onClick={() => {
                          setData((d)=>{const c=structuredClone(d); c.fotos[i].fotoIP={url:''}; return c;});
                        }}>
                          Limpiar
                        </Button>
                      )}
                    </div>
                    {f.fotoIP?.url && (
                      <div>
                        <img loading="lazy" src={f.fotoIP.url} alt="IP" className="max-h-32 w-full object-contain rounded border" />
                        <p className="text-xs text-neutral-600 mt-1">{f.fotoIP.fileName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nota */}
                <Field label="Nota (opcional)">
                  <Textarea rows={2} value={f.nota} onChange={(e)=>{
                    const v=e.target.value; setData((d)=>{const c=structuredClone(d); c.fotos[i].nota=v; return c;});
                  }} />
                </Field>
              </div>
            ))}
          </div>
        </Card>

        {/* Probadores */}
        <Card title="Probadores">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={data.secciones.probadores} 
                onChange={(e) => {
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.activo = e.target.checked;
                    c.secciones.probadores = e.target.checked;
                    return c;
                  });
                }}
                className="w-4 h-4"
              />
              <label className="text-sm font-semibold text-neutral-700">
                Incluir en PDF exportado
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Probador Ocupado */}
            <div className="bg-white rounded-lg border p-3">
              <div className="text-xs font-semibold text-neutral-700 mb-2">PROBADOR OCUPADO</div>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current['probadorOcupado']?.click()}>
                  Subir
                </Button>
                <input
                  ref={el => imageInputRefs.current['probadorOcupado'] = el}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                      setData((d)=>{
                        const c=structuredClone(d); 
                        c.probadores.probadorOcupado = {
                          url: base64,
                          fileName: e.target.files[0].name,
                          fileSize: e.target.files[0].size
                        };
                        return c;
                      });
                    }
                  }}
                />
                {data.probadores.probadorOcupado?.url && (
                  <Button onClick={() => {
                    setData((d)=>{const c=structuredClone(d); c.probadores.probadorOcupado={url:'', fileName: undefined, fileSize: undefined}; return c;});
                  }}>
                    Limpiar
                  </Button>
                )}
              </div>
              {data.probadores.probadorOcupado?.url && (
                <div>
                  <img loading="lazy" src={data.probadores.probadorOcupado.url} alt="Probador ocupado" className="max-h-32 w-full object-contain rounded border" />
                  <p className="text-xs text-neutral-600 mt-1">{data.probadores.probadorOcupado.fileName}</p>
                </div>
              )}
            </div>

            {/* Probador Liberado */}
            <div className="bg-white rounded-lg border p-3">
              <div className="text-xs font-semibold text-neutral-700 mb-2">PROBADOR LIBERADO</div>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current['probadorLiberado']?.click()}>
                  Subir
                </Button>
                <input
                  ref={el => imageInputRefs.current['probadorLiberado'] = el}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                      setData((d)=>{
                        const c=structuredClone(d); 
                        c.probadores.probadorLiberado = {
                          url: base64,
                          fileName: e.target.files[0].name,
                          fileSize: e.target.files[0].size
                        };
                        return c;
                      });
                    }
                  }}
                />
                {data.probadores.probadorLiberado?.url && (
                  <Button onClick={() => {
                    setData((d)=>{const c=structuredClone(d); c.probadores.probadorLiberado={url:'', fileName: undefined, fileSize: undefined}; return c;});
                  }}>
                    Limpiar
                  </Button>
                )}
              </div>
              {data.probadores.probadorLiberado?.url && (
                <div>
                  <img loading="lazy" src={data.probadores.probadorLiberado.url} alt="Probador liberado" className="max-h-32 w-full object-contain rounded border" />
                  <p className="text-xs text-neutral-600 mt-1">{data.probadores.probadorLiberado.fileName}</p>
                </div>
              )}
            </div>

            {/* Pasillo Probadores */}
            <div className="bg-white rounded-lg border p-3">
              <div className="text-xs font-semibold text-neutral-700 mb-2">PASILLO PROBADORES</div>
              <div className="flex gap-2 mb-2">
                <Button onClick={() => imageInputRefs.current['pasilloProbadores']?.click()}>
                  Subir
                </Button>
                <input
                  ref={el => imageInputRefs.current['pasilloProbadores'] = el}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                      setData((d)=>{
                        const c=structuredClone(d); 
                        c.probadores.pasilloProbadores = {
                          url: base64,
                          fileName: e.target.files[0].name,
                          fileSize: e.target.files[0].size
                        };
                        return c;
                      });
                    }
                  }}
                />
                {data.probadores.pasilloProbadores?.url && (
                  <Button onClick={() => {
                    setData((d)=>{const c=structuredClone(d); c.probadores.pasilloProbadores={url:'', fileName: undefined, fileSize: undefined}; return c;});
                  }}>
                    Limpiar
                  </Button>
                )}
              </div>
              {data.probadores.pasilloProbadores?.url && (
                <div>
                  <img loading="lazy" src={data.probadores.pasilloProbadores.url} alt="Pasillo probadores" className="max-h-32 w-full object-contain rounded border" />
                  <p className="text-xs text-neutral-600 mt-1">{data.probadores.pasilloProbadores.fileName}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Rack de Vídeo */}
        <Card title="Rack de vídeo">
          <Field label="Descripción">
            <Textarea rows={4} value={data.rackVideo.descripcion} onChange={(e)=>upd("rackVideo.descripcion", e.target.value)} />
          </Field>
          <Field label="Observaciones (opcional)" className="mt-3">
            <Textarea rows={2} value={data.rackVideo.observaciones} onChange={(e)=>upd("rackVideo.observaciones", e.target.value)} />
          </Field>
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Fotografías</div>
            {data.rackVideo.fotos.map((foto, idx) => (
              <div key={idx} className="mb-3 p-3 bg-neutral-50 rounded-lg border">
                <div className="flex gap-2 mb-2">
                  <Button onClick={() => imageInputRefs.current[`rackVideo_${idx}`]?.click()}>
                    Subir foto {idx + 1}
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`rackVideo_${idx}`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                        setData((d)=>{
                          const c=structuredClone(d); 
                          if (!c.rackVideo.fotos[idx]) c.rackVideo.fotos[idx] = {};
                          c.rackVideo.fotos[idx].url = base64;
                          c.rackVideo.fotos[idx].fileName = e.target.files[0].name;
                          c.rackVideo.fotos[idx].fileSize = e.target.files[0].size;
                          return c;
                        });
                      }
                    }}
                  />
                  {foto.url && (
                    <Button onClick={() => {
                      setData((d)=>{const c=structuredClone(d); c.rackVideo.fotos[idx]={url:''}; return c;});
                    }}>Limpiar</Button>
                  )}
                  <Button onClick={() => {
                    setData((d)=>{const c=structuredClone(d); c.rackVideo.fotos.push({url:'', descripcion:''}); return c;});
                  }}>+ Añadir foto</Button>
                </div>
                {foto.url && (
                  <div className="mb-2">
                    <img src={foto.url} alt="Vista previa" className="max-h-32 rounded border" />
                  </div>
                )}
                <Input 
                  placeholder="Descripción de la foto (opcional)" 
                  value={foto.descripcion || ''} 
                  onChange={(e)=>{
                    const v=e.target.value; 
                    setData((d)=>{const c=structuredClone(d); c.rackVideo.fotos[idx].descripcion=v; return c;});
                  }} 
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Rack de Audio */}
        <Card title="Rack de audio">
          <Field label="Descripción">
            <Textarea rows={4} value={data.rackAudio.descripcion} onChange={(e)=>upd("rackAudio.descripcion", e.target.value)} />
          </Field>
          <Field label="Observaciones (opcional)" className="mt-3">
            <Textarea rows={2} value={data.rackAudio.observaciones} onChange={(e)=>upd("rackAudio.observaciones", e.target.value)} />
          </Field>
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Fotografías</div>
            {data.rackAudio.fotos.map((foto, idx) => (
              <div key={idx} className="mb-3 p-3 bg-neutral-50 rounded-lg border">
                <div className="flex gap-2 mb-2">
                  <Button onClick={() => imageInputRefs.current[`rackAudio_${idx}`]?.click()}>
                    Subir foto {idx + 1}
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`rackAudio_${idx}`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                        setData((d)=>{
                          const c=structuredClone(d); 
                          if (!c.rackAudio.fotos[idx]) c.rackAudio.fotos[idx] = {};
                          c.rackAudio.fotos[idx].url = base64;
                          c.rackAudio.fotos[idx].fileName = e.target.files[0].name;
                          c.rackAudio.fotos[idx].fileSize = e.target.files[0].size;
                          return c;
                        });
                      }
                    }}
                  />
                  {foto.url && (
                    <Button onClick={() => {
                      setData((d)=>{const c=structuredClone(d); c.rackAudio.fotos[idx]={url:''}; return c;});
                    }}>Limpiar</Button>
                  )}
                  <Button onClick={() => {
                    setData((d)=>{const c=structuredClone(d); c.rackAudio.fotos.push({url:'', descripcion:''}); return c;});
                  }}>+ Añadir foto</Button>
                </div>
                {foto.url && (
                  <div className="mb-2">
                    <img src={foto.url} alt="Vista previa" className="max-h-32 rounded border" />
                  </div>
                )}
                <Input 
                  placeholder="Descripción de la foto (opcional)" 
                  value={foto.descripcion || ''} 
                  onChange={(e)=>{
                    const v=e.target.value; 
                    setData((d)=>{const c=structuredClone(d); c.rackAudio.fotos[idx].descripcion=v; return c;});
                  }} 
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cuadros (Eléctrico / AV / Doc)">
          <div className="grid grid-cols-1 gap-3">
            {data.cuadrosAV.items.map((c, i) => (
              <div key={i} className="p-4 bg-neutral-50 rounded-lg border">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-6 mb-3">
                  <Field className="md:col-span-2" label="Título"><Input value={c.titulo} onChange={(e)=>{
                    const v=e.target.value; setData((d)=>{const copy=structuredClone(d); copy.cuadrosAV.items[i].titulo=v; return copy;});
                  }} /></Field>
                  <Field className="md:col-span-3" label="Detalle"><Textarea rows={3} value={c.detalle} onChange={(e)=>{
                    const v=e.target.value; setData((d)=>{const copy=structuredClone(d); copy.cuadrosAV.items[i].detalle=v; return copy;});
                  }} /></Field>
                  <div className="md:col-span-1 flex items-end">
                    <Button onClick={()=>{
                      setData((d)=>{const copy=structuredClone(d); copy.cuadrosAV.items.splice(i,1); return copy;});
                    }}>Borrar</Button>
                  </div>
                </div>
                <Field label="Observaciones (opcional)" className="mb-3">
                  <Textarea rows={2} value={c.observaciones || ''} onChange={(e)=>{
                    const v=e.target.value; setData((d)=>{const copy=structuredClone(d); copy.cuadrosAV.items[i].observaciones=v; return copy;});
                  }} />
                </Field>
                <div className="mt-3">
                  <div className="text-sm font-semibold mb-2">Fotografías</div>
                  {(c.fotos || []).map((foto, idx) => (
                    <div key={idx} className="mb-3 p-3 bg-white rounded border">
                      <div className="flex gap-2 mb-2">
                        <Button onClick={() => imageInputRefs.current[`cuadro_${i}_${idx}`]?.click()}>
                          Subir foto {idx + 1}
                        </Button>
                        <input
                          ref={el => imageInputRefs.current[`cuadro_${i}_${idx}`] = el}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                              setData((d)=>{
                                const copy=structuredClone(d); 
                                if (!copy.cuadrosAV.items[i].fotos) copy.cuadrosAV.items[i].fotos = [];
                                if (!copy.cuadrosAV.items[i].fotos[idx]) copy.cuadrosAV.items[i].fotos[idx] = {};
                                copy.cuadrosAV.items[i].fotos[idx].url = base64;
                                copy.cuadrosAV.items[i].fotos[idx].fileName = e.target.files[0].name;
                                copy.cuadrosAV.items[i].fotos[idx].fileSize = e.target.files[0].size;
                                return copy;
                              });
                            }
                          }}
                        />
                        {foto.url && (
                          <Button onClick={() => {
                            setData((d)=>{const copy=structuredClone(d); copy.cuadrosAV.items[i].fotos[idx]={url:''}; return copy;});
                          }}>Limpiar</Button>
                        )}
                        <Button onClick={() => {
                          setData((d)=>{const copy=structuredClone(d); if(!copy.cuadrosAV.items[i].fotos) copy.cuadrosAV.items[i].fotos=[]; copy.cuadrosAV.items[i].fotos.push({url:'', descripcion:''}); return copy;});
                        }}>+ Añadir foto</Button>
                      </div>
                      {foto.url && (
                        <div className="mb-2">
                          <img loading="lazy" src={foto.url} alt="Vista previa" className="max-h-32 rounded border" />
                        </div>
                      )}
                      <Input 
                        placeholder="Descripción de la foto (opcional)" 
                        value={foto.descripcion || ''} 
                        onChange={(e)=>{
                          const v=e.target.value; 
                          setData((d)=>{const copy=structuredClone(d); copy.cuadrosAV.items[i].fotos[idx].descripcion=v; return copy;});
                        }} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <Button onClick={()=>{
                setData((d)=>{const copy=structuredClone(d); copy.cuadrosAV.items.push({ titulo: "", detalle: "", fotos: [{url:'', descripcion:''}], observaciones: "" }); return copy;});
              }}>Añadir cuadro</Button>
            </div>
          </div>
        </Card>

        <Card title="Unifilar vídeo">
          <Field label="Detalle">
            <Textarea rows={4} value={data.unifilarVideo.detalle} onChange={(e)=>upd("unifilarVideo.detalle", e.target.value)} />
          </Field>
          <Field label="Observaciones (opcional)" className="mt-3">
            <Textarea rows={2} value={data.unifilarVideo.observaciones} onChange={(e)=>upd("unifilarVideo.observaciones", e.target.value)} />
          </Field>
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Fotografías</div>
            {data.unifilarVideo.fotos.map((foto, idx) => (
              <div key={idx} className="mb-3 p-3 bg-neutral-50 rounded-lg border">
                <div className="flex gap-2 mb-2">
                  <Button onClick={() => imageInputRefs.current[`unifilar_${idx}`]?.click()}>
                    Subir foto {idx + 1}
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`unifilar_${idx}`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                        setData((d)=>{
                          const c=structuredClone(d); 
                          if (!c.unifilarVideo.fotos[idx]) c.unifilarVideo.fotos[idx] = {};
                          c.unifilarVideo.fotos[idx].url = base64;
                          c.unifilarVideo.fotos[idx].fileName = e.target.files[0].name;
                          c.unifilarVideo.fotos[idx].fileSize = e.target.files[0].size;
                          return c;
                        });
                      }
                    }}
                  />
                  {foto.url && (
                    <Button onClick={() => {
                      setData((d)=>{const c=structuredClone(d); c.unifilarVideo.fotos[idx]={url:''}; return c;});
                    }}>Limpiar</Button>
                  )}
                  <Button onClick={() => {
                    setData((d)=>{const c=structuredClone(d); c.unifilarVideo.fotos.push({url:'', descripcion:''}); return c;});
                  }}>+ Añadir foto</Button>
                </div>
                {foto.url && (
                  <div className="mb-2">
                    <img loading="lazy" src={foto.url} alt="Vista previa" className="max-h-32 rounded border" />
                  </div>
                )}
                <Input 
                  placeholder="Descripción de la foto (opcional)" 
                  value={foto.descripcion || ''} 
                  onChange={(e)=>{
                    const v=e.target.value; 
                    setData((d)=>{const c=structuredClone(d); c.unifilarVideo.fotos[idx].descripcion=v; return c;});
                  }} 
                />
              </div>
            ))}
          </div>
        </Card>

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

  // Función auxiliar para procesar Excel y extraer pantallas
  const procesarExcelPantallas = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const XLSXLib = await import('xlsx');
      const workbook = XLSXLib.read(arrayBuffer, { type: 'array', defval: '' });
      
      // Obtener la primera hoja
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Obtener todas las filas como arrays para encontrar la fila de encabezados
      const allRows = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (!allRows || allRows.length === 0) {
        console.log('El archivo Excel está vacío');
        return [];
      }

      // Buscar la fila que contiene "Etiqueta de plano"
      let headerRowIndex = -1;
      for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i];
        const rowStr = row.join('|').toUpperCase();
        if (rowStr.includes('ETIQUETA') || rowStr.includes('PLANO')) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.log('No se encontró la fila de encabezados con "Etiqueta de plano"');
        return [];
      }

      // Crear el objeto de encabezados desde esa fila
      const headers = allRows[headerRowIndex];
      
      // Procesar las filas siguientes
      const pantallasFromExcel = [];
      for (let i = headerRowIndex + 1; i < allRows.length; i++) {
        const row = allRows[i];
        
        // Crear objeto con los datos de esta fila
        const rowData = {};
        headers.forEach((header, idx) => {
          if (header) {
            rowData[header.toString().trim()] = row[idx] ? String(row[idx]).trim() : '';
          }
        });

        // Buscar el valor de "Etiqueta de plano"
        let etiquetaPlano = '';
        for (let key in rowData) {
          if (key.toUpperCase().includes('ETIQUETA') && key.toUpperCase().includes('PLANO')) {
            etiquetaPlano = rowData[key];
            break;
          }
        }

        // Si tiene etiqueta de plano, agrégalo
        if (etiquetaPlano && String(etiquetaPlano).trim() !== '') {
          const getVal = (keySearch) => {
            for (let key in rowData) {
              if (key.toUpperCase().includes(keySearch.toUpperCase())) {
                return rowData[key];
              }
            }
            return '';
          };

          pantallasFromExcel.push({
            etiquetaPlano: etiquetaPlano,
            hostname: getVal('HOSTNAME') || getVal('HOST') || '',
            mac: getVal('MAC') || '',
            serie: getVal('S/N') || getVal('SERIE') || '',
            resolucion: getVal('RESOLUCIÓN') || getVal('RESOLUCION') || '',
            fondo: getVal('FONDO') || '',
            puertoPatch: getVal('PUERTO PATCH') || '',
            puertoSwitch: getVal('PUERTO SWITCH') || '',
            contrato: getVal('CONTRATO') || '',
            termicoPantalla: getVal('TÉRMICO PANTALLA') || getVal('TERMICO PANTALLA') || '',
            termicoPC: getVal('TÉRMICO PC') || getVal('TERMICO PC') || '',
            horas24: getVal('24H') || '',
          });
        }
      }

      return pantallasFromExcel;
    } catch (error) {
      console.error('Error al procesar el Excel:', error);
      return [];
    }
  };

  // Función para importar carpeta y cargar fotos automáticamente
  const importFolder = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    console.log('Total de archivos seleccionados:', files.length);
    
    // Filtrar archivos que estén en As Built/Fotos/
    const fotoFiles = files.filter(file => {
      const path = file.webkitRelativePath || file.path || '';
      console.log('Archivo:', file.name, 'Ruta:', path);
      return path.includes('As Built/Fotos/') || path.includes('As Built\\Fotos\\') || 
             path.includes('As Built/Fotos') || path.includes('As Built\\Fotos');
    });

    console.log('Archivos filtrados en As Built/Fotos:', fotoFiles.length);
    
    // Parsear nombres de archivo y agrupar por pantalla (solo si hay fotos)
    const fotosPorPantalla = {};
    let nuevasFotos = [];
    let fotosProcesadas = 0;
    
    if (fotoFiles.length > 0) {
      for (const file of fotoFiles) {
        const fileName = file.name.toUpperCase();
        console.log('Procesando archivo:', file.name, '->', fileName);
        
        // Buscar patrón S[0-9]+ (número de pantalla)
        const pantallaMatch = fileName.match(/S(\d+)/);
        if (!pantallaMatch) {
          console.log('  No se encontró patrón S[0-9] en:', fileName);
          continue;
        }
        
        const numeroPantalla = pantallaMatch[1];
        const pantallaKey = `S${numeroPantalla}`;
        console.log('  Pantalla encontrada:', pantallaKey);
        
        if (!fotosPorPantalla[pantallaKey]) {
          fotosPorPantalla[pantallaKey] = {};
        }
        
        // Determinar tipo de foto
        let tipoFoto = null;
        if (fileName.includes('FRONTAL')) {
          tipoFoto = 'fotoFrontal';
        } else if (fileName.includes('PLAYER_SENDING') || fileName.includes('PLAYER+SENDING') || fileName.includes('PLAYER')) {
          tipoFoto = 'fotoPlayer';
        } else if (fileName.includes('_IP') || fileName.endsWith('IP') || (fileName.includes('IP') && !fileName.includes('PLAYER'))) {
          tipoFoto = 'fotoIP';
        }
        
        if (tipoFoto) {
          console.log('  Tipo de foto:', tipoFoto);
          fotosPorPantalla[pantallaKey][tipoFoto] = file;
        } else {
          console.log('  No se pudo determinar el tipo de foto');
        }
      }
      
      console.log('Fotos agrupadas por pantalla:', fotosPorPantalla);

      // Solo crear entradas para pantallas que tengan foto FRONTAL
      // Ordenar por número de pantalla
      const pantallasConFrontal = Object.entries(fotosPorPantalla)
        .filter(([_, fotos]) => fotos.fotoFrontal) // Solo pantallas con foto frontal
        .sort(([a], [b]) => {
          const numA = parseInt(a.replace('S', ''));
          const numB = parseInt(b.replace('S', ''));
          return numA - numB;
        });

      if (pantallasConFrontal.length > 0) {
        // Procesar y asignar fotos a las pantallas
        console.log('Pantallas con frontal encontradas:', pantallasConFrontal.length);
        
        for (const [pantallaKey, fotos] of pantallasConFrontal) {
          // Usar "SX" como etiqueta de plano
          const etiquetaPlano = pantallaKey; // S1, S2, S3, etc.
          console.log(`Procesando pantalla ${pantallaKey} con fotos:`, Object.keys(fotos));
          
          const fotoData = {
            etiquetaPlano: etiquetaPlano,
            fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
            fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
            fotoIP: { url: "", fileName: undefined, fileSize: undefined },
            nota: ""
          };
          
          // Procesar cada tipo de foto
          for (const [tipoFoto, file] of Object.entries(fotos)) {
            try {
              console.log(`  Comprimiendo ${tipoFoto}:`, file.name);
              const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
              fotoData[tipoFoto] = {
                url: base64,
                fileName: file.name,
                fileSize: file.size
              };
              fotosProcesadas++;
              console.log(`  ✓ ${tipoFoto} procesada correctamente`);
            } catch (error) {
              console.error(`Error procesando ${file.name}:`, error);
            }
          }
          
          nuevasFotos.push(fotoData);
        }
      } else {
        console.log('No se encontraron fotos FRONTAL en la carpeta. Continuando con procesamiento de Excel...');
      }
    } else {
      console.log('No se encontraron fotos en As Built/Fotos/. Continuando con procesamiento de Excel...');
    }
    
    console.log('Total de fotos a guardar:', nuevasFotos.length);
    console.log('Fotos procesadas:', fotosProcesadas);
    
    // Buscar y cargar foto de entrada de la tienda
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
    
    // Buscar y procesar archivos Excel de validación MKD
    const validacionMKDFiles = files.filter(file => {
      const path = file.webkitRelativePath || file.path || '';
      const fileName = file.name.toUpperCase();
      const isExcel = fileName.endsWith('.XLSX') || fileName.endsWith('.XLS');
      const isInValidaciones = path.includes('Documentación/Validaciones/') || 
                                path.includes('Documentación\\Validaciones\\') ||
                                path.includes('Documentacion/Validaciones/') ||
                                path.includes('Documentacion\\Validaciones\\');
      const hasMKD = fileName.includes('VALIDACIÓN_MKD') || fileName.includes('VALIDACION_MKD');
      return isExcel && isInValidaciones && hasMKD;
    });

    console.log('Archivos Excel de validación MKD encontrados:', validacionMKDFiles.length);
    
    let pantallasActualizadasMKD = 0;
    let datosValidacionMKD = [];

    // Procesar cada archivo Excel de validación MKD
    for (const excelFile of validacionMKDFiles) {
      try {
        console.log('Procesando archivo Excel de validación MKD:', excelFile.name);
        const pantallasFromMKD = await procesarExcelPantallas(excelFile);
        
        if (pantallasFromMKD.length > 0) {
          datosValidacionMKD = datosValidacionMKD.concat(pantallasFromMKD);
          console.log(`✓ Se extrajeron ${pantallasFromMKD.length} pantallas del archivo ${excelFile.name}`);
        }
      } catch (error) {
        console.error(`Error procesando archivo Excel de validación MKD ${excelFile.name}:`, error);
      }
    }

    // Actualizar el estado con las nuevas fotos, foto de entrada y datos de validación MKD
    setData((d) => {
      const c = structuredClone(d);
      // Reemplazar todas las fotos existentes con las nuevas importadas (solo si hay fotos nuevas)
      if (nuevasFotos.length > 0) {
        c.fotos = nuevasFotos;
      }
      
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

      // Actualizar pantallas existentes con datos de validación MKD
      if (datosValidacionMKD.length > 0) {
        console.log('Actualizando pantallas con datos de validación MKD...');
        
        // Crear un mapa de datos MKD por etiqueta de plano
        const mkdMap = {};
        datosValidacionMKD.forEach(pantallaMKD => {
          const etiqueta = String(pantallaMKD.etiquetaPlano || '').trim().toUpperCase();
          if (etiqueta) {
            mkdMap[etiqueta] = pantallaMKD;
          }
        });

        // Actualizar pantallas existentes que coincidan
        c.pantallas = c.pantallas.map(pantalla => {
          const etiqueta = String(pantalla.etiquetaPlano || '').trim().toUpperCase();
          if (mkdMap[etiqueta]) {
            const datosMKD = mkdMap[etiqueta];
            pantallasActualizadasMKD++;
            console.log(`  Actualizando pantalla ${pantalla.etiquetaPlano} con datos MKD`);
            
            // Actualizar campos que estén vacíos en la pantalla pero tengan valor en MKD
            return {
              ...pantalla,
              hostname: pantalla.hostname || datosMKD.hostname || '',
              mac: pantalla.mac || datosMKD.mac || '',
              serie: pantalla.serie || datosMKD.serie || '',
              resolucion: pantalla.resolucion || datosMKD.resolucion || '',
              fondo: pantalla.fondo || datosMKD.fondo || '',
              puertoPatch: pantalla.puertoPatch || datosMKD.puertoPatch || '',
              puertoSwitch: pantalla.puertoSwitch || datosMKD.puertoSwitch || '',
              contrato: pantalla.contrato || datosMKD.contrato || '',
              termicoPantalla: pantalla.termicoPantalla || datosMKD.termicoPantalla || '',
              termicoPC: pantalla.termicoPC || datosMKD.termicoPC || '',
              horas24: pantalla.horas24 || datosMKD.horas24 || '',
            };
          }
          return pantalla;
        });

        // Agregar nuevas pantallas de MKD que no existan
        const etiquetasExistentes = new Set(
          c.pantallas.map(p => String(p.etiquetaPlano || '').trim().toUpperCase())
        );
        
        let pantallasAgregadasMKD = 0;
        datosValidacionMKD.forEach(pantallaMKD => {
          const etiqueta = String(pantallaMKD.etiquetaPlano || '').trim().toUpperCase();
          if (etiqueta && !etiquetasExistentes.has(etiqueta)) {
            console.log(`  Agregando nueva pantalla desde MKD: ${pantallaMKD.etiquetaPlano}`);
            c.pantallas.push(pantallaMKD);
            pantallasAgregadasMKD++;
            // Crear entrada de foto para la nueva pantalla
            c.fotos.push({
              etiquetaPlano: pantallaMKD.etiquetaPlano,
              fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
              fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
              fotoIP: { url: "", fileName: undefined, fileSize: undefined },
              nota: ""
            });
          }
        });
        
        // Guardar contador para el mensaje final
        c._pantallasAgregadasMKD = pantallasAgregadasMKD;
      }
      
      const pantallasAgregadasMKDCount = c._pantallasAgregadasMKD || 0;
      console.log('Estado actualizado con', nuevasFotos.length, 'fotos' + 
                  (fotoEntradaProcesada ? ', foto de entrada' : '') +
                  (pantallasActualizadasMKD > 0 ? `, ${pantallasActualizadasMKD} pantalla(s) actualizada(s)` : '') +
                  (pantallasAgregadasMKDCount > 0 ? `, ${pantallasAgregadasMKDCount} pantalla(s) nueva(s) agregada(s)` : ''));
      // Eliminar propiedad temporal
      delete c._pantallasAgregadasMKD;
      return c;
    });
    
    // Construir mensaje final
    let mensajeFinal = '';
    
    if (fotosProcesadas > 0) {
      mensajeFinal += `✅ ${fotosProcesadas} foto(s) procesada(s) de ${nuevasFotos.length} pantalla(s)`;
    }
    
    if (fotoEntradaProcesada) {
      if (mensajeFinal) mensajeFinal += '\n';
      mensajeFinal += '✅ Foto de entrada cargada';
    }
    
    if (validacionMKDFiles.length > 0) {
      if (mensajeFinal) mensajeFinal += '\n';
      if (pantallasActualizadasMKD > 0 || datosValidacionMKD.length > 0) {
        // Calcular pantallas agregadas: total de pantallas MKD menos las actualizadas
        const pantallasAgregadas = datosValidacionMKD.length - pantallasActualizadasMKD;
        mensajeFinal += `✅ Se procesaron ${validacionMKDFiles.length} archivo(s) de validación MKD`;
        if (pantallasActualizadasMKD > 0) {
          mensajeFinal += `\n   - ${pantallasActualizadasMKD} pantalla(s) actualizada(s)`;
        }
        if (pantallasAgregadas > 0) {
          mensajeFinal += `\n   - ${pantallasAgregadas} pantalla(s) nueva(s) agregada(s)`;
        }
        if (datosValidacionMKD.length > 0 && pantallasActualizadasMKD === 0 && pantallasAgregadas === 0) {
          mensajeFinal += `\n   - ${datosValidacionMKD.length} pantalla(s) encontrada(s) en el Excel`;
        }
      } else {
        mensajeFinal += `⚠️ Se encontraron ${validacionMKDFiles.length} archivo(s) de validación MKD pero no se pudieron procesar`;
      }
    }
    
    if (!mensajeFinal) {
      mensajeFinal = '⚠️ No se encontraron archivos para procesar. Verifica que:\n- Las fotos estén en As Built/Fotos/\n- Los Excel estén en Documentación/Validaciones/ con nombre que contenga "Validación_MKD"';
    }
    
    alert(`Importación completada:\n\n${mensajeFinal}`);
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
