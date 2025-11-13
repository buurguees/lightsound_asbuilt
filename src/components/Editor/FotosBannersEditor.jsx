import React, { useEffect, useRef } from 'react';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';
import { extractSXPattern } from '../../utils/excelUtils';

export const FotosBannersEditor = ({ data, setData, imageInputRefs, fotoBannerFilesFromFolder }) => {
  const processedFilesRef = useRef(new Set());

  // Sincronizar data.fotosBanners con data.banners: crear entradas de fotos para banners nuevos
  useEffect(() => {
    if (!data.banners || data.banners.length === 0) return;

    setData((d) => {
      const c = structuredClone(d);
      if (!c.fotosBanners) {
        c.fotosBanners = [];
      }
      const etiquetasExistentes = new Set(
        c.fotosBanners.map(f => String(f.etiquetaPlano || '').trim())
      );

      // Crear entradas de fotos para banners que no tengan entrada de foto
      let nuevasEntradas = 0;
      data.banners.forEach(banner => {
        const etiqueta = String(banner.etiquetaPlano || '').trim();
        if (etiqueta && !etiquetasExistentes.has(etiqueta)) {
          c.fotosBanners.push({
            etiquetaPlano: etiqueta,
            fotoFrontal: { url: "", fileName: undefined, fileSize: undefined },
            fotoPlayer: { url: "", fileName: undefined, fileSize: undefined },
            fotoIP: { url: "", fileName: undefined, fileSize: undefined }
          });
          nuevasEntradas++;
        }
      });

      // Eliminar entradas de fotos que no tengan banner correspondiente
      const etiquetasBanners = new Set(
        data.banners.map(b => String(b.etiquetaPlano || '').trim())
      );
      c.fotosBanners = c.fotosBanners.filter(f => {
        const etiqueta = String(f.etiquetaPlano || '').trim();
        return !etiqueta || etiquetasBanners.has(etiqueta);
      });

      if (nuevasEntradas > 0) {
        console.log(`📸 Se crearon ${nuevasEntradas} nuevas entradas de fotos para banners`);
        console.log(`   Total de entradas de fotos: ${c.fotosBanners.length}`);
      }

      return c;
    });
  }, [data.banners, setData]);

  // Procesar archivos de fotos recibidos desde App.jsx (importación de carpeta)
  useEffect(() => {
    if (!fotoBannerFilesFromFolder || fotoBannerFilesFromFolder.length === 0) {
      console.log('⚠️ No hay archivos de fotos de banners para procesar');
      return;
    }
    if (!data.banners || data.banners.length === 0) {
      console.log('⚠️ No hay banners importados. Importa primero el Excel en "Banners"');
      return;
    }
    
    console.log(`\n🔄 Verificando sincronización de fotos de banners...`);
    console.log(`   Banners: ${data.banners.length}`);
    console.log(`   Fotos: ${data.fotosBanners?.length || 0}`);
    
    // Verificar que las fotos estén sincronizadas con los banners
    const etiquetasBanners = new Set(
      data.banners.map(b => String(b.etiquetaPlano || '').trim())
    );
    const etiquetasFotos = new Set(
      (data.fotosBanners || []).map(f => String(f.etiquetaPlano || '').trim())
    );
    
    // Verificar que todos los banners tengan su entrada de foto
    const todosBannersTienenFoto = Array.from(etiquetasBanners).every(etiqueta => 
      etiquetasFotos.has(etiqueta)
    );
    
    if (!todosBannersTienenFoto || !data.fotosBanners || data.fotosBanners.length === 0) {
      console.log('⚠️ Las entradas de fotos aún no están sincronizadas. Esperando sincronización...');
      const bannersSinFoto = Array.from(etiquetasBanners).filter(e => !etiquetasFotos.has(e));
      if (bannersSinFoto.length > 0) {
        console.log(`   Banners sin foto:`, bannersSinFoto);
      }
      // No procesar hasta que las fotos estén sincronizadas
      return;
    }

    console.log(`✅ Sincronización OK. Iniciando procesamiento de fotos de banners...`);
    console.log(`   Archivos de fotos: ${fotoBannerFilesFromFolder.length}`);
    console.log(`   Banners: ${data.banners.length}`);
    console.log(`   Entradas de fotos: ${data.fotosBanners.length}`);

    // Resetear archivos procesados cuando cambian los banners o los archivos
    processedFilesRef.current.clear();

    const processFotoFiles = async () => {
      console.log(`\n🚀 Iniciando procesamiento de ${fotoBannerFilesFromFolder.length} archivo(s) de fotos de banners...`);
      // Agrupar fotos por SX extraído del nombre del archivo
      const fotosPorSX = {};
      
      for (const file of fotoBannerFilesFromFolder) {
        const fileKey = `${file.name}_${file.size}`;
        if (processedFilesRef.current.has(fileKey)) {
          console.log(`Archivo ya procesado: ${file.name}`);
          continue;
        }

        const fileName = file.name.toUpperCase();
        console.log(`\n📷 Procesando archivo: ${file.name}`);
        console.log(`   Nombre normalizado: ${fileName}`);
        
        // Extraer SX del nombre del archivo
        const sxPattern = extractSXPattern(fileName);
        if (!sxPattern) {
          console.log(`  ❌ No se encontró patrón SX (S1, S2, etc.) en: ${file.name}`);
          continue;
        }
        
        console.log(`  ✅ SX extraído: ${sxPattern} → Esta imagen pertenece al banner ${sxPattern}`);
        
        if (!fotosPorSX[sxPattern]) {
          fotosPorSX[sxPattern] = {};
        }
        
        // Determinar tipo de foto según el contenido del nombre del archivo
        let tipoFoto = null;
        
        // Detectar PLAYER_SENDING
        if ((fileName.includes('PLAYER_SENDING') || fileName.includes('PLAYER+SENDING')) || 
            (fileName.includes('PLAYER') && fileName.includes('SENDING'))) {
          tipoFoto = 'fotoPlayer';
        } 
        // Detectar IP
        else if ((fileName.includes('_IP') || fileName.endsWith('IP') || fileName.includes('_IP_')) && 
                 !fileName.includes('PLAYER')) {
          tipoFoto = 'fotoIP';
        } 
        // Detectar FRONTAL
        else if (fileName.includes('FRONTAL')) {
          tipoFoto = 'fotoFrontal';
        }
        
        if (tipoFoto) {
          const tipoNombre = tipoFoto === 'fotoFrontal' ? 'FOTO FRONTAL' : 
                            tipoFoto === 'fotoPlayer' ? 'PLAYER + SENDING' : 
                            'IP';
          console.log(`  ✅ Tipo detectado: ${tipoNombre} → Se asignará al bloque "${sxPattern} ${tipoNombre}"`);
          
          if (!fotosPorSX[sxPattern][tipoFoto]) {
            fotosPorSX[sxPattern][tipoFoto] = file;
            console.log(`  ✓ Foto preparada para asignación: ${sxPattern} → ${tipoNombre}`);
          } else {
            console.log(`  ⚠️ Ya existe una foto ${tipoNombre} para ${sxPattern}, se mantiene la primera`);
          }
        } else {
          console.log(`  ❌ No se pudo determinar el tipo de foto para: ${file.name}`);
        }
      }
      
      console.log('Fotos agrupadas por SX:', fotosPorSX);

      // Asignar fotos a los banners según su etiqueta de plano
      let fotosProcesadas = 0;
      const c = structuredClone(data);
      
      console.log(`\n📸 Iniciando asignación de fotos a ${c.fotosBanners.length} banner(es)...`);
      
      for (let fotoIndex = 0; fotoIndex < c.fotosBanners.length; fotoIndex++) {
        const fotoEntry = c.fotosBanners[fotoIndex];
        const etiquetaPlano = String(fotoEntry.etiquetaPlano || '').trim();
        if (!etiquetaPlano) {
          continue;
        }

        console.log(`\n🔍 Procesando bloque de banner: "${etiquetaPlano}"`);

        // Extraer SX de la etiqueta de plano
        const sxPattern = extractSXPattern(etiquetaPlano);
        if (!sxPattern) {
          console.log(`  ⚠️ No se encontró patrón SX en etiqueta de plano: ${etiquetaPlano}`);
          continue;
        }

        console.log(`  ✓ SX extraído de la etiqueta: ${sxPattern}`);

        // Buscar fotos para este SX
        const fotosDelSX = fotosPorSX[sxPattern];
        if (!fotosDelSX || Object.keys(fotosDelSX).length === 0) {
          console.log(`  ⚠️ No se encontraron fotos para SX: ${sxPattern}`);
          continue;
        }

        // Procesar cada tipo de foto encontrado
        for (const [tipoFoto, file] of Object.entries(fotosDelSX)) {
          if (!file || processedFilesRef.current.has(`${file.name}_${file.size}`)) {
            continue;
          }

          // Solo actualizar si la foto no está ya asignada
          if (!c.fotosBanners[fotoIndex][tipoFoto]?.url) {
            try {
              const base64 = await compressImage(file, { maxDim: 1000, quality: 0.65 });
              c.fotosBanners[fotoIndex][tipoFoto] = {
                url: base64,
                fileName: file.name,
                fileSize: file.size
              };
              fotosProcesadas++;
              processedFilesRef.current.add(`${file.name}_${file.size}`);
              
              const tipoNombre = tipoFoto === 'fotoFrontal' ? 'FOTO FRONTAL' : 
                                tipoFoto === 'fotoPlayer' ? 'PLAYER + SENDING' : 
                                'IP';
              console.log(`  ✅ Foto asignada: ${sxPattern} → ${tipoNombre}`);
            } catch (error) {
              console.error(`Error procesando foto ${file.name}:`, error);
            }
          }
        }
      }
      
      console.log(`\n✅ Proceso completado: ${fotosProcesadas} foto(s) asignada(s)`);

      if (fotosProcesadas > 0) {
        setData(c);
      }
    };

    processFotoFiles();
  }, [fotoBannerFilesFromFolder, data.banners, data.fotosBanners, setData]);

  // Este componente solo sincroniza y asigna automáticamente las fotos, no renderiza UI
  return null;
};
