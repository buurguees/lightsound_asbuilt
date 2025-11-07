import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker';

/**
 * Convierte un archivo a Base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} Base64 del archivo
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Procesa un archivo PDF y obtiene su número de páginas
 * @param {File} file - Archivo PDF
 * @returns {Promise<{ base64: string, numPages: number }>}
 */
export const processPDFFile = async (file) => {
  try {
    const base64 = await fileToBase64(file);
    
    // Obtener número de páginas del PDF
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    let base64Data = base64;
    if (base64.includes(',')) {
      base64Data = base64.split(',')[1];
    }
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      bytes[j] = binaryString.charCodeAt(j);
    }
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const numPages = pdf.numPages;
    
    return { base64, numPages };
  } catch (error) {
    throw new Error(`Error procesando PDF: ${error.message}`);
  }
};

/**
 * Convierte base64 a bytes para PDF.js
 * @param {string} pdfData - Base64 del PDF
 * @returns {Uint8Array} Bytes del PDF
 */
export const base64ToBytes = (pdfData) => {
  let base64Data = pdfData;
  if (pdfData.includes(',')) {
    base64Data = pdfData.split(',')[1];
  }
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

