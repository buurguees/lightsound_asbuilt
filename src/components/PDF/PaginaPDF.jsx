import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker';
import { base64ToBytes } from '../../utils/pdfUtils';

/**
 * Componente para renderizar una página del PDF
 */
export const PaginaPDF = React.memo(({ pdfData, pageNumber, onPageRendered }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const renderPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!pdfData) {
          setError('Sin datos PDF');
          setLoading(false);
          if (onPageRendered) onPageRendered(false);
          return;
        }

        // Configurar worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
        
        // Convertir base64 a bytes
        const bytes = base64ToBytes(pdfData);

        // Cargar PDF
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        
        if (pageNumber > pdf.numPages) {
          setError(`Página ${pageNumber} no existe`);
          setLoading(false);
          if (onPageRendered) onPageRendered(false);
          return;
        }

        const page = await pdf.getPage(pageNumber);
        
        // Renderizar a canvas con mayor escala para mejor calidad
        const canvas = document.createElement('canvas');
        const viewport = page.getViewport({ scale: 2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const context = canvas.getContext('2d');
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Convertir canvas a imagen JPEG comprimida para reducir tamaño
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        setImageSrc(imageData);
        setLoading(false);
        if (onPageRendered) onPageRendered(true);
      } catch (error) {
        console.error('Error renderizando PDF:', error);
        setError(error.message);
        setLoading(false);
        if (onPageRendered) onPageRendered(false);
      }
    };

    renderPDF();
  }, [pdfData, pageNumber, onPageRendered]);

  if (error) {
    return <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>❌ Error: {error}</div>;
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <style>{`
          @keyframes spin-loader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin-loader 1s linear infinite'
        }}>
        </div>
        <p style={{ marginTop: '15px', color: '#666', fontWeight: '500' }}>
          Cargando página {pageNumber}...
        </p>
      </div>
    );
  }

  if (!imageSrc) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No hay imagen</div>;
  }

  return (
    <img
      loading="lazy"
      src={imageSrc}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        imageRendering: 'crisp-edges',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      alt={`Página ${pageNumber}`}
      draggable="false"
    />
  );
});

PaginaPDF.displayName = 'PaginaPDF';

