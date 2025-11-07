import React from 'react';
import { Button } from '../UI/Button';
import { processPDFFile } from '../../utils/pdfUtils';

/**
 * Componente para subir y gestionar PDFs de planos
 */
export const PDFUploader = ({ 
  data, 
  setData, 
  imageInputRefs,
  loadingPDFs,
  setLoadingPDFs,
  setCurrentLoadingPDF,
  setPdfPagesRendering
}) => {
  const handlePDFUpload = async (e) => {
    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.type === 'application/pdf') {
          try {
            // Mostrar indicador de carga global
            setCurrentLoadingPDF(file.name);
            setLoadingPDFs(prev => ({ ...prev, [file.name]: true }));
            
            const { base64, numPages } = await processPDFFile(file);
            
            // Inicializar contador de páginas a renderizar
            setPdfPagesRendering(prev => ({
              ...prev,
              [file.name]: numPages
            }));
            
            setData((d) => {
              const c = structuredClone(d);
              c.planostienda.pdfs.push({
                url: base64,
                fileName: file.name,
                fileSize: file.size
              });
              return c;
            });
          } catch (error) {
            alert(`Error al procesar ${file.name}: ${error.message}`);
            setCurrentLoadingPDF(null);
            setLoadingPDFs(prev => {
              const newState = { ...prev };
              delete newState[file.name];
              return newState;
            });
            setPdfPagesRendering(prev => {
              const newState = { ...prev };
              delete newState[file.name];
              return newState;
            });
          }
        } else {
          alert(`${file.name} no es un PDF válido`);
        }
      }
      // Limpiar el input
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm font-semibold text-purple-800 mb-1">Subir archivos PDF de planos</p>
        <p className="text-xs text-purple-700 mb-3">Los archivos PDF se incluirán como páginas en el informe final</p>
        <Button onClick={() => imageInputRefs.current['pdf_upload']?.click()}>
          📄 Subir PDF de planos
        </Button>
        <input
          ref={el => imageInputRefs.current['pdf_upload'] = el}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handlePDFUpload}
        />
      </div>

      {Object.keys(loadingPDFs).length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <style>{`
            @keyframes spin-mini {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p className="text-sm font-semibold text-blue-800 mb-2">Cargando PDFs...</p>
          <div className="space-y-2">
            {Object.entries(loadingPDFs).map(([fileName, isLoading]) => (
              <div key={fileName} className="flex items-center gap-2">
                <div style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #dbeafe',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin-mini 0.8s linear infinite'
                }}></div>
                <span className="text-sm text-blue-700">{fileName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.planostienda.pdfs && data.planostienda.pdfs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-neutral-700">PDFs cargados ({data.planostienda.pdfs.length})</h3>
          <div className="space-y-2">
            {data.planostienda.pdfs.map((pdf, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{pdf.fileName}</p>
                    <p className="text-xs text-neutral-500">{(pdf.fileSize / 1024 / 1024).toFixed(2)}MB</p>
                  </div>
                </div>
                <Button onClick={() => {
                  setData((d) => {
                    const c = structuredClone(d);
                    c.planostienda.pdfs.splice(idx, 1);
                    return c;
                  });
                }}>
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

