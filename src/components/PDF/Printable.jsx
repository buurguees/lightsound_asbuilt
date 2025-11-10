import React from 'react';
import './pdf.css';
import { Portada } from './Portada';
import { SeccionDesglosePantallas } from './SeccionDesglosePantallas';
import { SeccionFotosPantallas } from './SeccionFotosPantallas';
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
    {data.secciones.portada && (
      <Portada 
        meta={data.meta} 
        equipamiento={data.equipamiento}
        tipoInstalacionVideo={data.tipoInstalacionVideo}
        almacenExterno={data.almacenExterno}
      />
    )}
    {data.secciones.desglosePantallas && (
      <SeccionDesglosePantallas pantallas={data.pantallas} />
    )}
    {data.secciones.fotosPantallas && (
      <SeccionFotosPantallas fotos={data.fotos} />
    )}
    {data.secciones.probadores && (
      <SeccionProbadores probadores={data.probadores} />
    )}
    {data.secciones.audio && (
      <SeccionAudio audio={data.audio} />
    )}
    {data.secciones.altavocesInstalacion && (
      <SeccionAltavocesInstalacion equipamiento={data.equipamiento} />
    )}
    {(data.secciones.rackVideo || data.secciones.rackAudio) && (
      <SeccionRacksCombinados rackVideo={data.rackVideo} rackAudio={data.rackAudio} />
    )}
    {data.secciones.cuadrosAV && (
      <SeccionCuadrosAV cuadrosAV={data.cuadrosAV} />
    )}
    {data.secciones.documentacion && (
      <SeccionDocumentacion documentacion={data.documentacion} />
    )}
    {data.secciones.unifilarVideo && (
      <SeccionRack titulo="UNIFILAR VIDEO" data={data.unifilarVideo} />
    )}
    {data.secciones.planostienda && (
      <SeccionPlanostienda planostienda={data.planostienda} onPageRendered={onPageRendered} />
    )}
    {data.secciones.medicionPartidas && (
      <SeccionTexto titulo="INFORME MEDICIÓN - DESGLOSE POR PARTIDAS" contenido={""} />
    )}
  </div>
));


