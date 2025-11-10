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
import { SeccionAltavocesInstalacion } from './SeccionAltavocesInstalacion';
import { SeccionRack } from './SeccionRack';
import { SeccionRacksCombinados } from './SeccionRacksCombinados';
import { SeccionCuadros } from './SeccionCuadros';
import { SeccionCuadrosAV } from './SeccionCuadrosAV';
import { SeccionDocumentacion } from './SeccionDocumentacion';
import { SeccionPlanostienda } from './SeccionPlanostienda';
import { SeccionTexto } from './SeccionTexto';

export const Printable = React.memo(({ data, onPageRendered }) => (
  <div>
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
      <SeccionDesglosePantallas pantallas={data.pantallas} />
    )}
    {/* Banners */}
    {data.secciones.banners && (
      <SeccionBanners fotosBanners={data.fotosBanners} />
    )}
    {/* Turnomatic */}
    {data.secciones.turnomatic && (
      <SeccionTurnomatic fotosTurnomatic={data.fotosTurnomatic} />
    )}
    {/* Welcomer */}
    {data.secciones.welcomer && (
      <SeccionWelcomer fotosWelcomer={data.fotosWelcomer} />
    )}
    {/* Pantallas */}
    {data.secciones.fotosPantallas && (
      <SeccionFotosPantallas fotos={data.fotos} />
    )}
    {/* Audio */}
    {data.secciones.audio && (
      <SeccionAudio audio={data.audio} />
    )}
    {/* Probadores */}
    {data.secciones.probadores && (
      <SeccionProbadores probadores={data.probadores} />
    )}
    {/* Rack de Video */}
    {data.secciones.rackVideo && (
      <SeccionRacksCombinados rackVideo={data.rackVideo} rackAudio={data.rackAudio} />
    )}
    {/* Rack de Audio - se muestra junto con Rack Video en SeccionRacksCombinados */}
    {/* Cuadro Eléctrico */}
    {data.secciones.cuadrosAV && (
      <SeccionCuadrosAV cuadrosAV={data.cuadrosAV} />
    )}
    {/* Documentación */}
    {data.secciones.documentacion && (
      <SeccionDocumentacion documentacion={data.documentacion} pantallas={data.pantallas} banners={data.banners} turnomatic={data.turnomatic} welcomer={data.welcomer} />
    )}
    {/* Planos de Tienda */}
    {data.secciones.planostienda && (
      <SeccionPlanostienda planostienda={data.planostienda} onPageRendered={onPageRendered} />
    )}
    {/* Elementos Instalados - se mantiene en la portada, no se muestra aquí */}
    {data.secciones.medicionPartidas && (
      <SeccionTexto titulo="INFORME MEDICIÓN - DESGLOSE POR PARTIDAS" contenido={""} />
    )}
  </div>
));


