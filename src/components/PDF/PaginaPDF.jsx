import React, { useState, useEffect } from 'react';
import { getCachedPDFPageImage } from '../../utils/pdfUtils';

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

        // Obtener imagen de la página desde caché (o renderizar y cachear)
        const imageData = await getCachedPDFPageImage(pdfData, pageNumber, 2, 0.85);
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
        // Asegurar que siempre quepa en el área visible de la página
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        display: 'block',
        objectFit: 'contain',
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

