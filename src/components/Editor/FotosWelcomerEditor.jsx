import React, { useEffect, useRef } from 'react';
import { extractSXPattern } from '../../utils/excelUtils';
import { compressImage } from '../../utils/imageUtils';

export const FotosWelcomerEditor = ({ data, setData, imageInputRefs, fotoWelcomerFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  useEffect(() => {
    if (!data.welcomer || data.welcomer.length === 0) return;

    setData((d) => {
      const c = structuredClone(d);
      if (!c.fotosWelcomer) {
        c.fotosWelcomer = [];
      }
      const etiquetasExistentes = new Set(
        c.fotosWelcomer.map(f => String(f.etiquetaPlano || '').trim())
      );

      let nuevasEntradas = 0;
      data.welcomer.forEach(welcomer => {
        const etiqueta = String(welcomer.etiquetaPlano || '').trim();
        if (etiqueta && !etiquetasExistentes.has(etiqueta)) {
          c.fotosWelcomer.push({
            etiquetaPlano: etiqueta,
            fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
            fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
            fotoIP: { url: "", fileName: undefined, fileSize: undefined }
          });
          nuevasEntradas++;
        }
      });

      const etiquetasWelcomer = new Set(
        data.welcomer.map(w => String(w.etiquetaPlano || '').trim())
      );
      c.fotosWelcomer = c.fotosWelcomer.filter(f => {
        const etiqueta = String(f.etiquetaPlano || '').trim();
        return !etiqueta || etiquetasWelcomer.has(etiqueta);
      });

      return c;
    });
  }, [data.welcomer, setData]);

  useEffect(() => {
    if (!fotoWelcomerFilesFromFolder || fotoWelcomerFilesFromFolder.length === 0) return;
    if (!data.welcomer || data.welcomer.length === 0) return;
    if (!data.fotosWelcomer || data.fotosWelcomer.length === 0) return;

    processedFilesRef.current.clear();

    const processFotoFiles = async () => {
      const fotosPorSX = {};
      
      for (const file of fotoWelcomerFilesFromFolder) {
        const fileKey = `${file.name}_${file.size}`;
        if (processedFilesRef.current.has(fileKey)) continue;

        const fileName = file.name.toUpperCase();
        const sxPattern = extractSXPattern(fileName);
        if (!sxPattern) continue;
        
        if (!fotosPorSX[sxPattern]) {
          fotosPorSX[sxPattern] = {};
        }
        
        let tipoFoto = null;
        if ((fileName.includes('PLAYER_SENDING') || fileName.includes('PLAYER+SENDING')) || 
            (fileName.includes('PLAYER') && fileName.includes('SENDING'))) {
          tipoFoto = 'fotoPlayer';
        } 
        else if ((fileName.includes('_IP') || fileName.endsWith('IP') || fileName.includes('_IP_')) && 
                 !fileName.includes('PLAYER')) {
          tipoFoto = 'fotoIP';
        } 
        else if (fileName.includes('FRONTAL')) {
          tipoFoto = 'fotoFrontal';
        }
        
        if (tipoFoto && !fotosPorSX[sxPattern][tipoFoto]) {
          fotosPorSX[sxPattern][tipoFoto] = file;
        }
      }

      let fotosProcesadas = 0;
      const c = structuredClone(data);
      
      for (let fotoIndex = 0; fotoIndex < c.fotosWelcomer.length; fotoIndex++) {
        const fotoEntry = c.fotosWelcomer[fotoIndex];
        const etiquetaPlano = String(fotoEntry.etiquetaPlano || '').trim();
        if (!etiquetaPlano) continue;

        const sxPattern = extractSXPattern(etiquetaPlano);
        if (!sxPattern) continue;

        const fotosDelSX = fotosPorSX[sxPattern];
        if (!fotosDelSX || Object.keys(fotosDelSX).length === 0) continue;

        for (const [tipoFoto, file] of Object.entries(fotosDelSX)) {
          if (!file || processedFilesRef.current.has(`${file.name}_${file.size}`)) continue;
          if (!c.fotosWelcomer[fotoIndex][tipoFoto]?.url) {
            try {
              const base64 = await compressImage(file, { maxDim: 1400, quality: 0.8 });
              c.fotosWelcomer[fotoIndex][tipoFoto] = {
                url: base64,
                fileName: file.name,
                fileSize: file.size
              };
              fotosProcesadas++;
              processedFilesRef.current.add(`${file.name}_${file.size}`);
            } catch (error) {
              console.error(`Error procesando foto ${file.name}:`, error);
            }
          }
        }
      }
      
      if (fotosProcesadas > 0) {
        setData(c);
      }
    };

    processFotoFiles();
  }, [fotoWelcomerFilesFromFolder, data.welcomer, data.fotosWelcomer, setData]);

  return null;
};

