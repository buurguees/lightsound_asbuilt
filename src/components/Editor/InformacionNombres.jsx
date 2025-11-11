import React from 'react';

export const InformacionNombres = () => {
  return (
    <div className="p-4">
      <h2 className="font-semibold text-neutral-800 mb-4">Guía de nombrado de archivos</h2>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h3 className="font-semibold text-neutral-700 mb-2">Estructura de carpetas esperada</h3>
          <pre className="bg-neutral-50 border rounded p-3 overflow-auto">
As Built/
├─ Fotos/
│  ├─ &lt;IMÁGENES DE PANTALLAS / AUDIO / RACKS / CUADROS / DOC&gt;
├─ Documentación/
│  └─ Validaciones/
│     ├─ &lt;Excel MKD&gt;
│     ├─ &lt;Excel BANNERS&gt;
│     ├─ &lt;Excel TURNOMATIC&gt;
│     └─ &lt;Excel WELCOMER&gt;
          </pre>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-700 mb-2">Pantallas (Fotos)</h3>
          <p>Los nombres de archivo deben incluir el patrón SX para identificar la pantalla (S1, S2, ...):</p>
          <ul className="list-disc ml-5 mt-2">
            <li>Frontal: ..._S1_FRONTAL.jpg</li>
            <li>Player + Sending: ..._S1_PLAYER_SENDING.jpg (admite PLAYER+SENDING)</li>
            <li>IP: ..._S1_IP.jpg, ..._S1_IP_CONFIG.jpg, ..._S1_IP CONFIG.jpg</li>
          </ul>
          <p className="text-neutral-600 mt-1">Ejemplo: BSK_16909_FR_DIJON_..._CIRCLE_S1_FRONTAL.jpg</p>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-700 mb-2">Banners / Turnomatic / Welcomer (Fotos)</h3>
          <p>Igual que pantallas: patrón SX y tipo de foto.</p>
          <ul className="list-disc ml-5 mt-2">
            <li>Tipos admitidos: FRONTAL, PLAYER_SENDING, IP</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-700 mb-2">Audio (Fotos)</h3>
          <p>El nombre debe contener el tipo de elemento (ej.: ALTAVOZ, TORRE, CLUSTER, SUBWOOFER, ...). La plataforma agrupa por palabras clave.</p>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-700 mb-2">Racks</h3>
          <ul className="list-disc ml-5 mt-2">
            <li>Vídeo: FRONTAL_RACK_VIDEO, TRASERA_RACK_VIDEO, FRONTAL_RACK_COMUNICACIONES</li>
            <li>Audio: FRONTAL_RACK_AUDIO, TRASERA_RACK_AUDIO, FRONTAL_ON_THE_SPOT</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-700 mb-2">Cuadros / Documentación</h3>
          <ul className="list-disc ml-5 mt-2">
            <li>CUADRO_LSG, CUADRO_ELECTRICO_GENERAL</li>
            <li>DOC_BOX, AV_BOX</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-700 mb-2">Excel necesarios (Documentación/Validaciones)</h3>
          <ul className="list-disc ml-5 mt-2">
            <li>MKD: archivo que contenga “Validación_MKD” o “Validacion_MKD”</li>
            <li>BANNERS: “Validación_INTERNA_BANNERS” o “Validacion_INTERNA_BANNERS”</li>
            <li>TURNOMATIC: contenga “TURNOMATIC”</li>
            <li>WELCOMER: contenga “WELCOMER”</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-700 mb-2">Recomendaciones generales</h3>
          <ul className="list-disc ml-5 mt-2">
            <li>Evitar espacios dobles y caracteres especiales. Usar guiones bajos o simples.</li>
            <li>Mantener el patrón SX (S1, S2, ...) tal cual, sin variantes como S-1.</li>
            <li>Las fotos grandes se comprimen automáticamente al importar; no hace falta precomprimir.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};


