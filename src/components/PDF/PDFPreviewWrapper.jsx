import React, { useEffect, useRef, useState } from 'react';

/**
 * Componente wrapper que ajusta automáticamente el zoom del PDF para que quepa completo
 */
export const PDFPreviewWrapper = ({ children }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current || !contentRef.current) return;

      const container = containerRef.current;
      const content = contentRef.current;

      // Dimensiones del contenedor disponible (con padding)
      const containerWidth = container.clientWidth - 40; // 20px padding a cada lado

      // Dimensiones del contenido (A4 horizontal: 1123px x 794px)
      const contentWidth = 1123;

      // Calcular escala SOLO por ancho para que cada página ocupe el ancho disponible
      const newScale = containerWidth / contentWidth;

      // Limitar entre 0.3 y 1 para evitar escalas extremas
      const finalScale = Math.max(0.3, Math.min(1, newScale));

      setScale(finalScale);
    };

    calculateScale();

    // Recalcular cuando cambie el tamaño de la ventana
    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pdf-preview-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        ref={contentRef}
        className="pdf-preview"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};

