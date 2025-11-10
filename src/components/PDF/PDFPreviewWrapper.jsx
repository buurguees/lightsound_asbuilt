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
      const containerHeight = container.clientHeight - 40; // 20px padding arriba y abajo

      // Dimensiones del contenido (A4 horizontal: 1123px x 794px)
      const contentWidth = 1123;
      const contentHeight = 794;

      // Calcular escala para que quepa tanto en ancho como en alto
      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;

      // Usar la escala más pequeña para asegurar que quepa completamente
      // Permitir escalar hasta el 100% si el contenedor es más grande
      const newScale = Math.min(scaleX, scaleY);
      
      // Asegurar que la escala sea al menos 0.1 para evitar que sea demasiado pequeña
      const finalScale = Math.max(0.1, newScale);

      setScale(newScale);
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

