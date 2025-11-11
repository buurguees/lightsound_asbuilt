import React from 'react';
import { usePDFPages } from '../../hooks/usePDFPages';
import { PaginaPDFConZoom } from './PaginaPDFConZoom';
import { PaginaPDF } from './PaginaPDF';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

const PAGE = "page";

/**
 * Componente que renderiza un documento PDF completo
 */
export const PDFDocument = ({ pdf, pdfIdx, onPageRendered, forPrint = false, meta }) => {
  const { numPages, loading } = usePDFPages(pdf.url);

  // Mientras se está cargando el PDF
  if (loading) {
    return (
      <section className={PAGE} style={{ pageBreakInside: 'avoid' }}>
        <style>{`
          @keyframes spin-pdf {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <PageHeader 
          title={`PLANOS DE TIENDA`} 
          subtitle={`${pdf.fileName} - Analizando documento...`}
          meta={meta || window?.__ASBUILT_META || null}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            display: 'inline-block',
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #0ea5e9',
            borderRight: '4px solid #0ea5e9',
            borderRadius: '50%',
            animation: 'spin-pdf 1s linear infinite'
          }}></div>
          <p style={{ color: '#666', fontWeight: '500', fontSize: '16px' }}>Cargando documento PDF...</p>
        </div>
        <PageFooter />
      </section>
    );
  }

  // Si no tiene páginas
  if (numPages === 0) {
    return (
      <section className={PAGE} style={{ pageBreakInside: 'avoid' }}>
        <PageHeader 
          title={`PLANOS DE TIENDA`} 
          subtitle={`${pdf.fileName}`}
          meta={meta || window?.__ASBUILT_META || null}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#dc2626' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</p>
            <p style={{ fontWeight: '500' }}>Error cargando el PDF</p>
          </div>
        </div>
        <PageFooter />
      </section>
    );
  }

  return (
    <React.Fragment key={pdfIdx}>
      {Array.from({ length: numPages }).map((_, pageIdx) => (
        <section className={PAGE} key={`${pdfIdx}-${pageIdx}`} style={{ pageBreakInside: 'avoid' }}>
          <PageHeader 
            title={`PLANOS DE TIENDA`} 
            subtitle={undefined}
            meta={meta || window?.__ASBUILT_META || null}
          />
          <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {forPrint ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PaginaPDF 
                  pdfData={pdf.url} 
                  pageNumber={pageIdx + 1} 
                  onPageRendered={(success) => onPageRendered && onPageRendered(pdf.fileName, success)} 
                  lazy={false}
                />
              </div>
            ) : (
              <PaginaPDFConZoom 
                pdfData={pdf.url} 
                pageNumber={pageIdx + 1} 
                onPageRendered={(success) => onPageRendered && onPageRendered(pdf.fileName, success)} 
              />
            )}
          </div>
          <PageFooter />
        </section>
      ))}
    </React.Fragment>
  );
};

