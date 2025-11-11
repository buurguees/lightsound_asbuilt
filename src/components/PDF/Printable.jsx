import React from 'react';
import './pdf.css';
import { Portada } from './Portada';
import { SeccionDesglosePantallas } from './SeccionDesglosePantallas';
import { SeccionFotosPantallas } from './SeccionFotosPantallas';
import { SeccionBanners } from './SeccionBanners';
import { SeccionTurnomatic } from './SeccionTurnomatic';
import { SeccionWelcomer } from './SeccionWelcomer';
import { SeccionProbadores } from './SeccionProbadores';
import { SeccionAudio } from './SeccionAudio';
import { SeccionRack } from './SeccionRack';
import { SeccionRacksCombinados } from './SeccionRacksCombinados';
import { SeccionCuadros } from './SeccionCuadros';
import { SeccionCuadrosAV } from './SeccionCuadrosAV';
import { SeccionDocumentacion } from './SeccionDocumentacion';
import { SeccionPlanostienda } from './SeccionPlanostienda';
import { SeccionTexto } from './SeccionTexto';

export const Printable = React.memo(({ data, onPageRendered }) => (
  <div>
    {/* Exponer metadatos globales para headers (sin cargar App.jsx) */}
    <script dangerouslySetInnerHTML={{__html:`window.__ASBUILT_META=${JSON.stringify(data.meta||{})}`}} />
    {/* Portada (incluye Elementos Instalados) */}
    {data.secciones.portada && (
      <Portada 
        meta={data.meta} 
        equipamiento={data.equipamiento}
        tipoInstalacionVideo={data.tipoInstalacionVideo}
        almacenExterno={data.almacenExterno}
      />
    )}
    {/* MKD */}
    {data.secciones.desglosePantallas && (
      <SeccionDesglosePantallas pantallas={data.pantallas} meta={data.meta} />
    )}
    {/* Banners */}
    {data.secciones.banners && (
      <SeccionBanners fotosBanners={data.fotosBanners} meta={data.meta} />
    )}
    {/* Turnomatic */}
    {data.secciones.turnomatic && (
      <SeccionTurnomatic fotosTurnomatic={data.fotosTurnomatic} meta={data.meta} />
    )}
    {/* Welcomer */}
    {data.secciones.welcomer && (
      <SeccionWelcomer fotosWelcomer={data.fotosWelcomer} meta={data.meta} />
    )}
    {/* Pantallas */}
    {data.secciones.fotosPantallas && (
      <SeccionFotosPantallas fotos={data.fotos} meta={data.meta} />
    )}
    {/* Audio */}
    {data.secciones.audio && (
      <SeccionAudio audio={data.audio} meta={data.meta} />
    )}
    {/* Probadores */}
    {data.secciones.probadores && (
      <SeccionProbadores probadores={data.probadores} meta={data.meta} />
    )}
    {/* Rack de Video */}
    {data.secciones.rackVideo && (
      <SeccionRacksCombinados rackVideo={data.rackVideo} rackAudio={data.rackAudio} meta={data.meta} />
    )}
    {/* Cuadro Eléctrico */}
    {data.secciones.cuadrosAV && (
      <SeccionCuadrosAV cuadrosAV={data.cuadrosAV} meta={data.meta} />
    )}
    {/* Documentación */}
    {data.secciones.documentacion && (
      <SeccionDocumentacion documentacion={data.documentacion} pantallas={data.pantallas} banners={data.banners} turnomatic={data.turnomatic} welcomer={data.welcomer} meta={data.meta} />
    )}
    {/* Planos de Tienda */}
    {data.secciones.planostienda && (
      <SeccionPlanostienda planostienda={data.planostienda} onPageRendered={onPageRendered} forPrint={true} meta={data.meta} />
    )}
    {/* Elementos Instalados - se mantiene en la portada, no se muestra aquí */}
    {data.secciones.medicionPartidas && (
      <SeccionTexto titulo="INFORME MEDICIÓN - DESGLOSE POR PARTIDAS" contenido={""} meta={data.meta} />
    )}
  </div>
));


