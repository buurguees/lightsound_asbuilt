import { fileToBase64 } from './pdfUtils';

/**
 * Estima el tamaño en bytes de un dataURL (base64)
 */
const estimateDataUrlSize = (dataUrl) => {
  if (!dataUrl) return 0;
  // Aproximación: longitud base64 * 3/4 (base64 es ~33% más grande que binario)
  return Math.floor(dataUrl.length * 0.75);
};

/**
 * Recompime una imagen desde un dataURL con nuevos parámetros
 */
const recompressImageFromDataUrl = async (dataUrl, { maxDim, quality }) => {
  return new Promise((resolve, reject) => {
    try {
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

        const dataUrlCompressed = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrlCompressed);
      };
      img.onerror = reject;
      img.src = dataUrl;
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Recolecta todas las imágenes del documento y estima su tamaño total
 */
const collectAllImages = (data) => {
  const images = [];
  
  // Foto de entrada
  if (data.meta?.fotoEntrada?.url) {
    images.push({ url: data.meta.fotoEntrada.url, path: 'meta.fotoEntrada.url' });
  }
  
  // Fotos de pantallas
  if (data.fotos && Array.isArray(data.fotos)) {
    data.fotos.forEach((foto, idx) => {
      if (foto.fotoFrontal?.url) images.push({ url: foto.fotoFrontal.url, path: `fotos[${idx}].fotoFrontal.url` });
      if (foto.fotoPlayer?.url) images.push({ url: foto.fotoPlayer.url, path: `fotos[${idx}].fotoPlayer.url` });
      if (foto.fotoIP?.url) images.push({ url: foto.fotoIP.url, path: `fotos[${idx}].fotoIP.url` });
    });
  }
  
  // Fotos de banners
  if (data.fotosBanners && Array.isArray(data.fotosBanners)) {
    data.fotosBanners.forEach((foto, idx) => {
      if (foto.fotoFrontal?.url) images.push({ url: foto.fotoFrontal.url, path: `fotosBanners[${idx}].fotoFrontal.url` });
      if (foto.fotoPlayer?.url) images.push({ url: foto.fotoPlayer.url, path: `fotosBanners[${idx}].fotoPlayer.url` });
      if (foto.fotoIP?.url) images.push({ url: foto.fotoIP.url, path: `fotosBanners[${idx}].fotoIP.url` });
    });
  }
  
  // Fotos de turnomatic
  if (data.fotosTurnomatic && Array.isArray(data.fotosTurnomatic)) {
    data.fotosTurnomatic.forEach((foto, idx) => {
      if (foto.fotoFrontal?.url) images.push({ url: foto.fotoFrontal.url, path: `fotosTurnomatic[${idx}].fotoFrontal.url` });
      if (foto.fotoPlayer?.url) images.push({ url: foto.fotoPlayer.url, path: `fotosTurnomatic[${idx}].fotoPlayer.url` });
      if (foto.fotoIP?.url) images.push({ url: foto.fotoIP.url, path: `fotosTurnomatic[${idx}].fotoIP.url` });
    });
  }
  
  // Fotos de welcomer
  if (data.fotosWelcomer && Array.isArray(data.fotosWelcomer)) {
    data.fotosWelcomer.forEach((foto, idx) => {
      if (foto.fotoFrontal?.url) images.push({ url: foto.fotoFrontal.url, path: `fotosWelcomer[${idx}].fotoFrontal.url` });
      if (foto.fotoPlayer?.url) images.push({ url: foto.fotoPlayer.url, path: `fotosWelcomer[${idx}].fotoPlayer.url` });
      if (foto.fotoIP?.url) images.push({ url: foto.fotoIP.url, path: `fotosWelcomer[${idx}].fotoIP.url` });
    });
  }
  
  // Probadores
  if (data.probadores) {
    if (data.probadores.probadorOcupado?.url) images.push({ url: data.probadores.probadorOcupado.url, path: 'probadores.probadorOcupado.url' });
    if (data.probadores.probadorLiberado?.url) images.push({ url: data.probadores.probadorLiberado.url, path: 'probadores.probadorLiberado.url' });
    if (data.probadores.pasilloProbadores?.url) images.push({ url: data.probadores.pasilloProbadores.url, path: 'probadores.pasilloProbadores.url' });
  }
  
  // Audio
  if (data.audio) {
    const audioTypes = ['altavozEspecial', 'altavozOffice', 'altavozZonaComun', 'altavozKitchenOffice', 
                        'torreAcustica', 'altavozAlmacen', 'altavozFullRange', 'subGrave', 'altavozProbadores',
                        'cluster', 'altavoz', 'torre', 'subwoofer', 'subGrabe'];
    audioTypes.forEach(type => {
      if (data.audio[type] && Array.isArray(data.audio[type])) {
        data.audio[type].forEach((item, idx) => {
          if (item.url) images.push({ url: item.url, path: `audio.${type}[${idx}].url` });
        });
      }
    });
  }
  
  // Rack Video
  if (data.rackVideo) {
    if (data.rackVideo.frontal && Array.isArray(data.rackVideo.frontal)) {
      data.rackVideo.frontal.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `rackVideo.frontal[${idx}].url` });
      });
    }
    if (data.rackVideo.frontalComunicaciones && Array.isArray(data.rackVideo.frontalComunicaciones)) {
      data.rackVideo.frontalComunicaciones.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `rackVideo.frontalComunicaciones[${idx}].url` });
      });
    }
    if (data.rackVideo.trasera && Array.isArray(data.rackVideo.trasera)) {
      data.rackVideo.trasera.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `rackVideo.trasera[${idx}].url` });
      });
    }
    if (data.rackVideo.fotos && Array.isArray(data.rackVideo.fotos)) {
      data.rackVideo.fotos.forEach((foto, idx) => {
        if (foto.url) images.push({ url: foto.url, path: `rackVideo.fotos[${idx}].url` });
      });
    }
  }
  
  // Rack Audio
  if (data.rackAudio) {
    if (data.rackAudio.frontal && Array.isArray(data.rackAudio.frontal)) {
      data.rackAudio.frontal.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `rackAudio.frontal[${idx}].url` });
      });
    }
    if (data.rackAudio.frontalOnTheSpot && Array.isArray(data.rackAudio.frontalOnTheSpot)) {
      data.rackAudio.frontalOnTheSpot.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `rackAudio.frontalOnTheSpot[${idx}].url` });
      });
    }
    if (data.rackAudio.trasera && Array.isArray(data.rackAudio.trasera)) {
      data.rackAudio.trasera.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `rackAudio.trasera[${idx}].url` });
      });
    }
    if (data.rackAudio.fotos && Array.isArray(data.rackAudio.fotos)) {
      data.rackAudio.fotos.forEach((foto, idx) => {
        if (foto.url) images.push({ url: foto.url, path: `rackAudio.fotos[${idx}].url` });
      });
    }
  }
  
  // Cuadros AV
  if (data.cuadrosAV) {
    if (data.cuadrosAV.items && Array.isArray(data.cuadrosAV.items)) {
      data.cuadrosAV.items.forEach((item, itemIdx) => {
        if (item.fotos && Array.isArray(item.fotos)) {
          item.fotos.forEach((foto, fotoIdx) => {
            if (foto.url) images.push({ url: foto.url, path: `cuadrosAV.items[${itemIdx}].fotos[${fotoIdx}].url` });
          });
        }
      });
    }
    // También revisar estructura antigua
    if (data.cuadrosAV.cuadroLSG && Array.isArray(data.cuadrosAV.cuadroLSG)) {
      data.cuadrosAV.cuadroLSG.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `cuadrosAV.cuadroLSG[${idx}].url` });
      });
    }
    if (data.cuadrosAV.cuadroElectricoGeneral && Array.isArray(data.cuadrosAV.cuadroElectricoGeneral)) {
      data.cuadrosAV.cuadroElectricoGeneral.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `cuadrosAV.cuadroElectricoGeneral[${idx}].url` });
      });
    }
    if (data.cuadrosAV.termicosPantalla && Array.isArray(data.cuadrosAV.termicosPantalla)) {
      data.cuadrosAV.termicosPantalla.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `cuadrosAV.termicosPantalla[${idx}].url` });
      });
    }
    if (data.cuadrosAV.termicosRack && Array.isArray(data.cuadrosAV.termicosRack)) {
      data.cuadrosAV.termicosRack.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `cuadrosAV.termicosRack[${idx}].url` });
      });
    }
  }
  
  // Documentación
  if (data.documentacion) {
    if (data.documentacion.docBox && Array.isArray(data.documentacion.docBox)) {
      data.documentacion.docBox.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `documentacion.docBox[${idx}].url` });
      });
    }
    if (data.documentacion.avBox && Array.isArray(data.documentacion.avBox)) {
      data.documentacion.avBox.forEach((img, idx) => {
        if (img.url) images.push({ url: img.url, path: `documentacion.avBox[${idx}].url` });
      });
    }
  }
  
  return images;
};

/**
 * Estima el tamaño aproximado de los planos PDF renderizados
 */
const estimatePlanosSize = async (pdfs) => {
  if (!pdfs || pdfs.length === 0) return 0;
  
  // Estimar basándose en el número de páginas y un tamaño promedio por página
  // Una página de plano renderizada a escala 1.5 y calidad 0.75 suele ser ~200-500KB
  let totalPages = 0;
  try {
    const { getCachedPDFDocument } = await import('./pdfUtils');
    for (const pdf of pdfs) {
      try {
        const pdfDoc = await getCachedPDFDocument(pdf.url);
        totalPages += pdfDoc.numPages || 0;
      } catch (e) {
        console.warn('Error estimando páginas de plano:', e);
      }
    }
  } catch (e) {
    console.warn('Error importando pdfUtils:', e);
  }
  
  // Estimación conservadora: 400KB por página
  return totalPages * 400 * 1024;
};

/**
 * Optimiza todas las imágenes del documento para cumplir un presupuesto de tamaño
 * Aplica reducción exponencial de calidad si es necesario
 * También considera el tamaño estimado de los planos PDF
 */
export const optimizeAllImagesForBudget = async (data, budgetBytes = 14 * 1024 * 1024) => {
  const images = collectAllImages(data);
  
  // Si no hay imágenes, no hacer nada
  if (images.length === 0) {
    console.log('No hay imágenes para optimizar');
    return data;
  }
  
  // Estimar tamaño de imágenes
  let imagesSize = images.reduce((sum, img) => sum + estimateDataUrlSize(img.url), 0);
  
  // Estimar tamaño de planos PDF
  const planosSize = await estimatePlanosSize(data.planostienda?.pdfs || []);
  
  // Tamaño total estimado
  let totalSize = imagesSize + planosSize;
  
  // Si ya está bajo el presupuesto, no hacer nada
  if (totalSize <= budgetBytes) {
    console.log(`Tamaño estimado total: ${(totalSize / 1024 / 1024).toFixed(2)}MB (imágenes: ${(imagesSize / 1024 / 1024).toFixed(2)}MB, planos: ${(planosSize / 1024 / 1024).toFixed(2)}MB) - No se requiere optimización`);
    return data;
  }
  
  console.log(`Tamaño inicial estimado: ${(totalSize / 1024 / 1024).toFixed(2)}MB (imágenes: ${(imagesSize / 1024 / 1024).toFixed(2)}MB, planos: ${(planosSize / 1024 / 1024).toFixed(2)}MB) - Iniciando optimización...`);
  
  // Presupuesto para imágenes (dejando espacio para planos y estructura del PDF)
  // Si los planos son grandes, reducimos el presupuesto de imágenes proporcionalmente
  const planosBudget = Math.min(planosSize * 1.2, budgetBytes * 0.3); // Máximo 30% del presupuesto para planos
  const imagesBudget = budgetBytes - planosBudget - (0.5 * 1024 * 1024); // 0.5MB para estructura del PDF
  
  // Configuraciones de calidad (reducción exponencial, empezando más bajo)
  const qualityLevels = [
    { maxDim: 1200, quality: 0.70 },
    { maxDim: 1000, quality: 0.65 },
    { maxDim: 900, quality: 0.60 },
    { maxDim: 800, quality: 0.55 },
    { maxDim: 700, quality: 0.50 },
    { maxDim: 600, quality: 0.45 },
    { maxDim: 500, quality: 0.40 },
    { maxDim: 400, quality: 0.35 }
  ];
  
  let optimizedData = structuredClone(data);
  
  // Probar cada nivel de calidad hasta cumplir el presupuesto de imágenes
  for (const level of qualityLevels) {
    let newImagesSize = 0;
    const optimizedImages = [];
    
    // Recompimir todas las imágenes con este nivel
    for (const img of images) {
      try {
        const compressed = await recompressImageFromDataUrl(img.url, level);
        optimizedImages.push({ ...img, compressed });
        newImagesSize += estimateDataUrlSize(compressed);
      } catch (error) {
        console.warn(`Error recompimiendo imagen ${img.path}:`, error);
        // Si falla, mantener la original
        optimizedImages.push({ ...img, compressed: img.url });
        newImagesSize += estimateDataUrlSize(img.url);
      }
    }
    
    // Verificar si el tamaño total (imágenes optimizadas + planos estimados) cumple el presupuesto
    const newTotalSize = newImagesSize + planosSize;
    if (newTotalSize <= budgetBytes && newImagesSize <= imagesBudget) {
      // Aplicar las imágenes optimizadas al documento
      optimizedImages.forEach(({ path, compressed }) => {
        const pathParts = path.split('.');
        let target = optimizedData;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          // Manejar arrays: "fotos[0]" -> ["fotos", "0"]
          const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
          if (arrayMatch) {
            const [, key, idx] = arrayMatch;
            if (!target[key]) target[key] = [];
            target = target[key][parseInt(idx)];
          } else {
            if (!target[part]) target[part] = {};
            target = target[part];
          }
        }
        const lastKey = pathParts[pathParts.length - 1];
        target[lastKey] = compressed;
      });
      
      const finalTotalSize = newImagesSize + planosSize;
      console.log(`Optimización completada: ${(finalTotalSize / 1024 / 1024).toFixed(2)}MB total (imágenes: ${(newImagesSize / 1024 / 1024).toFixed(2)}MB, planos estimados: ${(planosSize / 1024 / 1024).toFixed(2)}MB) usando maxDim=${level.maxDim}, quality=${level.quality}`);
      return optimizedData;
    }
  }
  
  // Si ninguna configuración cumple, usar la más baja
  const lastLevel = qualityLevels[qualityLevels.length - 1];
  const optimizedImages = [];
  for (const img of images) {
    try {
      const compressed = await recompressImageFromDataUrl(img.url, lastLevel);
      optimizedImages.push({ ...img, compressed });
    } catch (error) {
      optimizedImages.push({ ...img, compressed: img.url });
    }
  }
  
  optimizedImages.forEach(({ path, compressed }) => {
    const pathParts = path.split('.');
    let target = optimizedData;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, key, idx] = arrayMatch;
        if (!target[key]) target[key] = [];
        target = target[key][parseInt(idx)];
      } else {
        if (!target[part]) target[part] = {};
        target = target[part];
      }
    }
    const lastKey = pathParts[pathParts.length - 1];
    target[lastKey] = compressed;
  });
  
  const finalImagesSize = optimizedImages.reduce((sum, img) => sum + estimateDataUrlSize(img.compressed), 0);
  const finalTotalSize = finalImagesSize + planosSize;
  console.log(`Optimización final: ${(finalTotalSize / 1024 / 1024).toFixed(2)}MB total (imágenes: ${(finalImagesSize / 1024 / 1024).toFixed(2)}MB, planos estimados: ${(planosSize / 1024 / 1024).toFixed(2)}MB) usando maxDim=${lastLevel.maxDim}, quality=${lastLevel.quality}`);
  return optimizedData;
};

/**
 * Comprimir imagen: redimensiona y convierte a JPEG (o mantiene PNG si se pide)
 */
export const compressImage = (file, { maxDim = 1200, quality = 0.70, preferPNG = false } = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Si la imagen es suficientemente pequeña, devolver base64 original
      // Reducido el umbral para forzar más compresión
      if (file.size <= 1 * 1024 * 1024) {
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

