import React, { useState, useRef } from 'react';
import { PaginaPDF } from './PaginaPDF';

/**
 * Componente wrapper para PaginaPDF con zoom interactivo
 */
export const PaginaPDFConZoom = React.memo(({ pdfData, pageNumber, onPageRendered }) => {
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom(prev => Math.max(50, Math.min(300, prev + delta)));
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      style={{
        // Evitar scroll interno; la imagen se ajusta con object-fit en PaginaPDF
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab'
      }}
    >
      <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.1s', maxWidth: '100%', maxHeight: '100%' }}>
        <PaginaPDF pdfData={pdfData} pageNumber={pageNumber} onPageRendered={onPageRendered} />
      </div>
      {zoom !== 100 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          {zoom}%
        </div>
      )}
    </div>
  );
});

PaginaPDFConZoom.displayName = 'PaginaPDFConZoom';

