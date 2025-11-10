import { useEffect } from 'react';

// Lista fija de elementos que se pueden instalar
const ELEMENTOS_POSIBLES = [
  'PANTALLA LED',
  'TURNOMATIC',
  'WELCOMER',
  'ALTAVOZ FULL RANGE',
  'SUBGRAVE',
  'TORRE ACÚSTICA',
  'CLUSTER',
  'MICRÓFONO',
  'BUCLE DE INDUCCIÓN',
  'ALTAVOZ OFFICE',
  'ALTAVOZ ZONA COMÚN',
  'ALTAVOZ KITCHEN OFFICE',
  'ALTAVOZ ALMACÉN',
  'ALTAVOZ ESPECIAL',
  'ALTAVOZ PROBADORES',
  'PROBADORES'
];

export const ElementosInstaladosEditor = ({ data, setData }) => {
  // equipamiento ahora es un objeto: { "nombreElemento": { instalado: true/false, cantidad: N } }
  const equipamiento = data.equipamiento || {};

  // Detectar automáticamente elementos instalados basándose en imágenes y datos
  useEffect(() => {
    setData((d) => {
      const c = structuredClone(d);
      if (!c.equipamiento) c.equipamiento = {};
      
      // Función auxiliar para marcar elemento como instalado automáticamente
      // Si hay imágenes, siempre debe estar marcado como instalado
      const marcarInstalado = (nombreElemento) => {
        const elementoActual = c.equipamiento[nombreElemento];
        // Si ya existe y tiene cantidad > 0, mantener la cantidad; si no, poner 1
        const cantidadActual = elementoActual?.cantidad > 0 ? elementoActual.cantidad : 1;
        c.equipamiento[nombreElemento] = { 
          instalado: true, 
          cantidad: cantidadActual
        };
      };
      
      // PANTALLA LED: detectar si hay pantallas
      if (c.pantallas && Array.isArray(c.pantallas) && c.pantallas.length > 0) {
        marcarInstalado('PANTALLA LED');
      }
      
      // TURNOMATIC: detectar si hay turnomatic
      if (c.turnomatic && Array.isArray(c.turnomatic) && c.turnomatic.length > 0) {
        marcarInstalado('TURNOMATIC');
      }
      
      // WELCOMER: detectar si hay welcomer
      if (c.welcomer && Array.isArray(c.welcomer) && c.welcomer.length > 0) {
        marcarInstalado('WELCOMER');
      }
      
      // PROBADORES: detectar si hay probadores
      if (c.probadores && (
        (c.probadores.pasilloProbadores && c.probadores.pasilloProbadores.length > 0) ||
        (c.probadores.sensorInstalado && c.probadores.sensorInstalado.length > 0) ||
        (c.probadores.probadorOcupado && c.probadores.probadorOcupado.length > 0) ||
        (c.probadores.tablaProbadores && Array.isArray(c.probadores.tablaProbadores) && c.probadores.tablaProbadores.length > 0)
      )) {
        marcarInstalado('PROBADORES');
      }
      
      // Detectar elementos de audio
      if (c.audio) {
        // ALTAVOZ FULL RANGE
        const altavozFullRange = Array.isArray(c.audio.altavozFullRange) 
          ? c.audio.altavozFullRange 
          : (c.audio.altavozFullRange?.url ? [c.audio.altavozFullRange] : []);
        if (altavozFullRange.length > 0) {
          marcarInstalado('ALTAVOZ FULL RANGE');
        }
        
        // SUBGRAVE
        const subGrave = Array.isArray(c.audio.subGrave) 
          ? c.audio.subGrave 
          : (c.audio.subGrave?.url ? [c.audio.subGrave] : []);
        const subGrabe = Array.isArray(c.audio.subGrabe) 
          ? c.audio.subGrabe 
          : (c.audio.subGrabe?.url ? [c.audio.subGrabe] : []);
        if (subGrave.length > 0 || subGrabe.length > 0) {
          marcarInstalado('SUBGRAVE');
        }
        
        // TORRE ACÚSTICA
        const torreAcustica = Array.isArray(c.audio.torreAcustica) 
          ? c.audio.torreAcustica 
          : (c.audio.torreAcustica?.url ? [c.audio.torreAcustica] : []);
        if (torreAcustica.length > 0) {
          marcarInstalado('TORRE ACÚSTICA');
        }
        
        // CLUSTER
        const cluster = Array.isArray(c.audio.cluster) 
          ? c.audio.cluster 
          : (c.audio.cluster?.url ? [c.audio.cluster] : []);
        if (cluster.length > 0) {
          marcarInstalado('CLUSTER');
        }
        
        // MICRÓFONO
        const microfono = Array.isArray(c.audio.microfono) 
          ? c.audio.microfono 
          : (c.audio.microfono?.url ? [c.audio.microfono] : []);
        if (microfono.length > 0) {
          marcarInstalado('MICRÓFONO');
        }
        
        // BUCLE DE INDUCCIÓN
        const bucleInduccion = Array.isArray(c.audio.bucleInduccion) 
          ? c.audio.bucleInduccion 
          : (c.audio.bucleInduccion?.url ? [c.audio.bucleInduccion] : []);
        if (bucleInduccion.length > 0) {
          marcarInstalado('BUCLE DE INDUCCIÓN');
        }
        
        // ALTAVOZ OFFICE
        const altavozOffice = Array.isArray(c.audio.altavozOffice) 
          ? c.audio.altavozOffice 
          : (c.audio.altavozOffice?.url ? [c.audio.altavozOffice] : []);
        if (altavozOffice.length > 0) {
          marcarInstalado('ALTAVOZ OFFICE');
        }
        
        // ALTAVOZ ZONA COMÚN
        const altavozZonaComun = Array.isArray(c.audio.altavozZonaComun) 
          ? c.audio.altavozZonaComun 
          : (c.audio.altavozZonaComun?.url ? [c.audio.altavozZonaComun] : []);
        if (altavozZonaComun.length > 0) {
          marcarInstalado('ALTAVOZ ZONA COMÚN');
        }
        
        // ALTAVOZ KITCHEN OFFICE
        const altavozKitchenOffice = Array.isArray(c.audio.altavozKitchenOffice) 
          ? c.audio.altavozKitchenOffice 
          : (c.audio.altavozKitchenOffice?.url ? [c.audio.altavozKitchenOffice] : []);
        if (altavozKitchenOffice.length > 0) {
          marcarInstalado('ALTAVOZ KITCHEN OFFICE');
        }
        
        // ALTAVOZ ALMACÉN
        const altavozAlmacen = Array.isArray(c.audio.altavozAlmacen) 
          ? c.audio.altavozAlmacen 
          : (c.audio.altavozAlmacen?.url ? [c.audio.altavozAlmacen] : []);
        if (altavozAlmacen.length > 0) {
          marcarInstalado('ALTAVOZ ALMACÉN');
        }
        
        // ALTAVOZ ESPECIAL
        const altavozEspecial = Array.isArray(c.audio.altavozEspecial) 
          ? c.audio.altavozEspecial 
          : (c.audio.altavozEspecial?.url ? [c.audio.altavozEspecial] : []);
        if (altavozEspecial.length > 0) {
          marcarInstalado('ALTAVOZ ESPECIAL');
        }
        
        // ALTAVOZ PROBADORES
        const altavozProbadores = Array.isArray(c.audio.altavozProbadores) 
          ? c.audio.altavozProbadores 
          : (c.audio.altavozProbadores?.url ? [c.audio.altavozProbadores] : []);
        if (altavozProbadores.length > 0) {
          marcarInstalado('ALTAVOZ PROBADORES');
        }
      }
      
      return c;
    });
  }, [
    data.pantallas, 
    data.turnomatic, 
    data.welcomer, 
    data.probadores,
    data.audio,
    setData
  ]);

  // Inicializar equipamiento como objeto vacío si no existe o si es un array (migración)
  useEffect(() => {
    if (!data.equipamiento || Array.isArray(data.equipamiento)) {
      setData((d) => {
        const c = structuredClone(d);
        // Si es un array, convertir a objeto
        if (Array.isArray(d.equipamiento)) {
          const nuevoEquipamiento = {};
          d.equipamiento.forEach(item => {
            if (item.nombre && item.nombre.trim() !== "") {
              nuevoEquipamiento[item.nombre] = { instalado: true, cantidad: 1 };
            }
          });
          c.equipamiento = nuevoEquipamiento;
        } else {
          c.equipamiento = {};
        }
        return c;
      });
    } else {
      // Migrar estructura antigua (true/false) a nueva (objeto con instalado y cantidad)
      setData((d) => {
        const c = structuredClone(d);
        if (c.equipamiento) {
          const nuevoEquipamiento = {};
          Object.keys(c.equipamiento).forEach(nombre => {
            const valor = c.equipamiento[nombre];
            if (typeof valor === 'boolean') {
              nuevoEquipamiento[nombre] = { instalado: valor, cantidad: valor ? 1 : 0 };
            } else if (typeof valor === 'object' && valor !== null) {
              nuevoEquipamiento[nombre] = valor;
            }
          });
          c.equipamiento = nuevoEquipamiento;
        }
        return c;
      });
    }
  }, [data.equipamiento, setData]);

  const toggleElemento = (nombreElemento) => {
    setData((d) => {
      const c = structuredClone(d);
      if (!c.equipamiento) c.equipamiento = {};
      const elemento = c.equipamiento[nombreElemento];
      // Toggle: si está marcado, desmarcarlo; si no, marcarlo con cantidad 1
      if (elemento && elemento.instalado) {
        c.equipamiento[nombreElemento] = { instalado: false, cantidad: 0 };
      } else {
        c.equipamiento[nombreElemento] = { instalado: true, cantidad: 1 };
      }
      return c;
    });
  };

  const actualizarCantidad = (nombreElemento, cantidad) => {
    setData((d) => {
      const c = structuredClone(d);
      if (!c.equipamiento) c.equipamiento = {};
      if (!c.equipamiento[nombreElemento]) {
        c.equipamiento[nombreElemento] = { instalado: true, cantidad: 0 };
      }
      const cantidadNum = Math.max(0, parseInt(cantidad) || 0);
      c.equipamiento[nombreElemento].cantidad = cantidadNum;
      c.equipamiento[nombreElemento].instalado = cantidadNum > 0;
      return c;
    });
  };

  // Contar elementos instalados (marcados)
  const elementosInstalados = ELEMENTOS_POSIBLES.filter(nombre => {
    const elementoData = equipamiento[nombre];
    return elementoData && elementoData.instalado;
  }).length;

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Elementos Instalados</h2>
      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        <strong>Nota:</strong> Los elementos se activan automáticamente cuando se detectan imágenes relacionadas. Puedes marcar/desmarcar manualmente y ajustar la cantidad.
      </div>
      <div className="flex flex-col" style={{ maxHeight: '600px' }}>
        {/* Encabezado con contador */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-neutral-200 bg-neutral-50 flex-shrink-0 mb-0">
          <small className="text-neutral-600 font-medium">
            Marca los elementos que están instalados
          </small>
          <small className="text-neutral-500">
            {elementosInstalados} de {ELEMENTOS_POSIBLES.length} seleccionado{elementosInstalados !== 1 ? 's' : ''}
          </small>
        </div>

        {/* Lista de checkboxes - Scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="p-1">
            {ELEMENTOS_POSIBLES.map((nombre, i) => {
              const elementoData = equipamiento[nombre] || { instalado: false, cantidad: 0 };
              const estaInstalado = elementoData.instalado || false;
              const cantidad = elementoData.cantidad || 0;
              return (
                <div
                  key={i}
                  className="flex items-center px-2 py-1 hover:bg-neutral-50 rounded border border-transparent hover:border-neutral-200 transition-colors"
                >
                  <label className="flex items-center flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={estaInstalado}
                      onChange={() => toggleElemento(nombre)}
                      className="w-3.5 h-3.5 text-blue-600 border-neutral-300 rounded focus:ring-blue-500 focus:ring-1 cursor-pointer"
                    />
                    <span className={`ml-2 flex-1 ${estaInstalado ? 'text-neutral-800 font-medium' : 'text-neutral-600'}`}>
                      {nombre}
                    </span>
                  </label>
                  {estaInstalado && (
                    <div className="ml-2 flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={cantidad}
                        onChange={(e) => actualizarCantidad(nombre, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 px-2 py-0.5 text-xs border border-neutral-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

