import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker';

// Cachés en memoria para PDFs y páginas renderizadas
const pdfDocumentCache = new Map(); // key -> Promise<pdfjsLib.PDFDocumentProxy>
const pdfPageImageCache = new Map(); // `${key}|${page}|${scale}|${quality}` -> dataURL

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

/**
 * Genera una clave estable para identificar un PDF en caché
 */
const getPDFCacheKey = (pdfData) => {
  const base = pdfData.includes(',') ? pdfData.split(',')[1] : pdfData;
  // Hash djb2 sencillo para no guardar cadenas larguísimas como clave
  let hash = 5381;
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) + hash) ^ base.charCodeAt(i);
  }
  // Mezclar con longitud para reducir colisiones
  return `${base.length}:${hash >>> 0}`;
};

/**
 * Obtiene un PDFDocumentProxy cacheado por datos base64
 * @param {string} pdfData
 * @returns {Promise<pdfjsLib.PDFDocumentProxy>}
 */
export const getCachedPDFDocument = (pdfData) => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  const key = getPDFCacheKey(pdfData);
  if (pdfDocumentCache.has(key)) {
    return pdfDocumentCache.get(key);
  }
  const bytes = base64ToBytes(pdfData);
  const promise = pdfjsLib.getDocument({ data: bytes }).promise;
  pdfDocumentCache.set(key, promise);
  return promise;
};

/**
 * Renderiza una página del PDF a imagen usando caché en memoria.
 * @param {string} pdfData - Base64 del PDF
 * @param {number} pageNumber - 1-indexed
 * @param {number} scale - Escala de render (por defecto 2)
 * @param {number} quality - Calidad JPEG (0-1, por defecto 0.85)
 * @returns {Promise<string>} dataURL de la imagen renderizada
 */
export const getCachedPDFPageImage = async (pdfData, pageNumber, scale = 2, quality = 0.85) => {
  const key = getPDFCacheKey(pdfData);
  const pageKey = `${key}|${pageNumber}|${scale}|${quality}`;
  if (pdfPageImageCache.has(pageKey)) {
    return pdfPageImageCache.get(pageKey);
  }
  const pdf = await getCachedPDFDocument(pdfData);
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');
  await page.render({ canvasContext: context, viewport }).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  pdfPageImageCache.set(pageKey, dataUrl);
  return dataUrl;
};

