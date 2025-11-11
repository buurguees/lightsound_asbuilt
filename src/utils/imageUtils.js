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

      const url = URL.createObjectURL(file);

      // Ruta rápida usando createImageBitmap (más eficiente que <img/>)
      const loadBitmap = async () => {
        try {
          const bitmap = await createImageBitmap(file);
          const w = bitmap.width;
          const h = bitmap.height;
          const scale = Math.min(maxDim / w, maxDim / h, 1);
          const targetW = Math.round(w * scale);
          const targetH = Math.round(h * scale);

          // OffscreenCanvas si está disponible (más rápido en algunos navegadores)
          const CanvasCtor = typeof OffscreenCanvas !== 'undefined' ? OffscreenCanvas : null;
          if (CanvasCtor) {
            const off = new CanvasCtor(targetW, targetH);
            const ctx = off.getContext('2d');
            ctx.drawImage(bitmap, 0, 0, targetW, targetH);
            const mime = preferPNG && file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            off.convertToBlob({ type: mime, quality }).then((blob) => {
              const fr = new FileReader();
              fr.onloadend = () => {
                URL.revokeObjectURL(url);
                resolve(fr.result);
              };
              fr.onerror = (e) => {
                URL.revokeObjectURL(url);
                reject(e);
              };
              fr.readAsDataURL(blob);
            }).catch((e) => {
              URL.revokeObjectURL(url);
              reject(e);
            });
            return;
          }

          // Fallback a canvas DOM
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(bitmap, 0, 0, targetW, targetH);
          const mime = preferPNG && file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mime, quality);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } catch (e) {
          // Fallback a Image si createImageBitmap falla
          const img = new Image();
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
          img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
          };
          img.src = url;
        }
      };

      loadBitmap();
    } catch (e) {
      reject(e);
    }
  });
};

