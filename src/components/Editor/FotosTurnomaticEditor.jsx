import React, { useEffect, useRef } from 'react';
import { extractSXPattern } from '../../utils/excelUtils';
import { compressImage } from '../../utils/imageUtils';

export const FotosTurnomaticEditor = ({ data, setData, imageInputRefs, fotoTurnomaticFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  // Sincronizar data.fotosTurnomatic con data.turnomatic
  useEffect(() => {
    if (!data.turnomatic || data.turnomatic.length === 0) return;

    setData((d) => {
      const c = structuredClone(d);
      if (!c.fotosTurnomatic) {
        c.fotosTurnomatic = [];
      }
      const etiquetasExistentes = new Set(
        c.fotosTurnomatic.map(f => String(f.etiquetaPlano || '').trim())
      );

      let nuevasEntradas = 0;
      data.turnomatic.forEach(turnomatic => {
        const etiqueta = String(turnomatic.etiquetaPlano || '').trim();
        if (etiqueta && !etiquetasExistentes.has(etiqueta)) {
          c.fotosTurnomatic.push({
            etiquetaPlano: etiqueta,
            fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
            fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
            fotoIP: { url: "", fileName: undefined, fileSize: undefined }
          });
          nuevasEntradas++;
        }
      });

      const etiquetasTurnomatic = new Set(
        data.turnomatic.map(t => String(t.etiquetaPlano || '').trim())
      );
      c.fotosTurnomatic = c.fotosTurnomatic.filter(f => {
        const etiqueta = String(f.etiquetaPlano || '').trim();
        return !etiqueta || etiquetasTurnomatic.has(etiqueta);
      });

      return c;
    });
  }, [data.turnomatic, setData]);

  // Procesar archivos de fotos
  useEffect(() => {
    if (!fotoTurnomaticFilesFromFolder || fotoTurnomaticFilesFromFolder.length === 0) return;
    if (!data.turnomatic || data.turnomatic.length === 0) return;
    if (!data.fotosTurnomatic || data.fotosTurnomatic.length === 0) return;

    processedFilesRef.current.clear();

    const processFotoFiles = async () => {
      const fotosPorSX = {};
      
      for (const file of fotoTurnomaticFilesFromFolder) {
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
      
      for (let fotoIndex = 0; fotoIndex < c.fotosTurnomatic.length; fotoIndex++) {
        const fotoEntry = c.fotosTurnomatic[fotoIndex];
        const etiquetaPlano = String(fotoEntry.etiquetaPlano || '').trim();
        if (!etiquetaPlano) continue;

        const sxPattern = extractSXPattern(etiquetaPlano);
        if (!sxPattern) continue;

        const fotosDelSX = fotosPorSX[sxPattern];
        if (!fotosDelSX || Object.keys(fotosDelSX).length === 0) continue;

        for (const [tipoFoto, file] of Object.entries(fotosDelSX)) {
          if (!file || processedFilesRef.current.has(`${file.name}_${file.size}`)) continue;
          if (!c.fotosTurnomatic[fotoIndex][tipoFoto]?.url) {
            try {
              const base64 = await compressImage(file, { maxDim: 1600, quality: 0.85 });
              c.fotosTurnomatic[fotoIndex][tipoFoto] = {
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
  }, [fotoTurnomaticFilesFromFolder, data.turnomatic, data.fotosTurnomatic, setData]);

  return null;
};

