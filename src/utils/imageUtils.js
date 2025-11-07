import { fileToBase64 } from './pdfUtils';

/**
 * Comprimir imagen: redimensiona y convierte a JPEG (o mantiene PNG si se pide)
 */
export const compressImage = (file, { maxDim = 1600, quality = 0.85, preferPNG = false } = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Si la imagen es suficientemente pequeña, devolver base64 original
      if (file.size <= 2 * 1024 * 1024) {
        return fileToBase64(file).then(resolve).catch(reject);
      }

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        const scale = Math.min(maxDim / w, maxDim / h, 1);
        const targetW = Math.round(w * scale);
        const targetH = Math.round(h * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const mime = preferPNG && file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    } catch (e) {
      reject(e);
    }
  });
};

