import React from 'react';
import './pdf.css';
import { Portada } from './Portada';
import { SeccionDesglosePantallas } from './SeccionDesglosePantallas';
import { SeccionFotosPantallas } from './SeccionFotosPantallas';
import { SeccionProbadores } from './SeccionProbadores';
import { SeccionAudio } from './SeccionAudio';
import { SeccionAltavocesInstalacion } from './SeccionAltavocesInstalacion';
import { SeccionRack } from './SeccionRack';
import { SeccionCuadros } from './SeccionCuadros';
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
    {data.secciones.rackVideo && (
      <SeccionRack titulo="RACK DE VÍDEO" data={data.rackVideo} />
    )}
    {data.secciones.rackAudio && (
      <SeccionRack titulo="RACK DE AUDIO" data={data.rackAudio} />
    )}
    {data.secciones.cuadrosAV && (
      <SeccionCuadros cuadros={data.cuadrosAV} />
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


