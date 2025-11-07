import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker';

/**
 * Hook para obtener el número de páginas de un PDF
 * @param {string} pdfData - Base64 del PDF
 * @returns {{ numPages: number, loading: boolean }}
 */
export const usePDFPages = (pdfData) => {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getPDFPages = async () => {
      try {
        if (!pdfData) {
          setNumPages(0);
          setLoading(false);
          return;
        }

        // Configurar worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
        
        let base64Data = pdfData;
        if (pdfData.includes(',')) {
          base64Data = pdfData.split(',')[1];
        }
        
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        console.log('Contando páginas del PDF...');
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        
        if (mounted) {
          console.log('PDF tiene', pdf.numPages, 'páginas');
          setNumPages(pdf.numPages);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error obteniendo páginas del PDF:', error);
        if (mounted) {
          setNumPages(0);
          setLoading(false);
        }
      }
    };

    setLoading(true);
    getPDFPages();

    return () => {
      mounted = false;
    };
  }, [pdfData]);

  return { numPages, loading };
};

