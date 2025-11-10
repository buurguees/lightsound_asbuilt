import { useEffect } from 'react';
import { loadConfigTab } from '../../utils/configUtils';

export const ElementosInstaladosEditor = ({ data, setData }) => {
  const elementosConfig = data.configuracion?.elementos || [];
  // equipamiento ahora es un objeto: { "nombreElemento": true/false }
  const equipamiento = data.equipamiento || {};

  // Cargar configuración de elementos al montar el componente
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const savedConfig = await loadConfigTab('elementos');
        if (savedConfig && savedConfig.elementos) {
          setData((d) => {
            const c = structuredClone(d);
            if (!c.configuracion) c.configuracion = {};
            c.configuracion.elementos = savedConfig.elementos;
            return c;
          });
        }
      } catch (error) {
        console.error('Error cargando configuración de elementos:', error);
      }
    };
    cargarConfiguracion();
  }, [setData]);

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
  const elementosInstalados = Object.values(equipamiento).filter(e => e && e.instalado).length;

  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Elementos Instalados</h2>
      <div className="flex flex-col" style={{ maxHeight: '600px' }}>
        {/* Encabezado con contador */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-neutral-200 bg-neutral-50 flex-shrink-0 mb-0">
          <small className="text-neutral-600 font-medium">
            Marca los elementos que están instalados
          </small>
          <small className="text-neutral-500">
            {elementosInstalados} de {elementosConfig.length} seleccionado{elementosInstalados !== 1 ? 's' : ''}
          </small>
        </div>

        {/* Lista de checkboxes - Scrollable */}
        <div className="flex-1 overflow-auto">
          {elementosConfig.length === 0 ? (
            <div className="text-center py-4 text-neutral-400">
              <small>No hay elementos configurados. Configura los elementos en el menú de configuración.</small>
            </div>
          ) : (
            <div className="p-1">
              {elementosConfig.map((elemento, i) => {
                const nombre = elemento.nombre;
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
                          value={cantidad}
                          onChange={(e) => actualizarCantidad(nombre, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-12 px-1 py-0.5 text-xs border border-neutral-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ fontSize: '11px' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

