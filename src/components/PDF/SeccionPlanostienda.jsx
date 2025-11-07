import React from 'react';
import { PDFDocument } from './PDFDocument';

/**
 * Componente que renderiza la sección de planos de tienda
 */
export const SeccionPlanostienda = ({ planostienda, onPageRendered }) => {
  if (!planostienda.pdfs || planostienda.pdfs.length === 0) return null;

  return (
    <>
      {planostienda.pdfs.map((pdf, pdfIdx) => (
        <PDFDocument key={pdfIdx} pdf={pdf} pdfIdx={pdfIdx} onPageRendered={onPageRendered} />
      ))}
    </>
  );
};

