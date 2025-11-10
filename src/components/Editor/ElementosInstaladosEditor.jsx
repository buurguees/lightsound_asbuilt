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
              nuevoEquipamiento[item.nombre] = true;
            }
          });
          c.equipamiento = nuevoEquipamiento;
        } else {
          c.equipamiento = {};
        }
        return c;
      });
    }
  }, [data.equipamiento, setData]);

  const toggleElemento = (nombreElemento) => {
    setData((d) => {
      const c = structuredClone(d);
      if (!c.equipamiento) c.equipamiento = {};
      // Toggle: si está marcado, desmarcarlo; si no, marcarlo
      c.equipamiento[nombreElemento] = !c.equipamiento[nombreElemento];
      return c;
    });
  };

  // Contar elementos instalados (marcados)
  const elementosInstalados = Object.values(equipamiento).filter(Boolean).length;

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
                const estaInstalado = equipamiento[nombre] || false;
                return (
                  <label
                    key={i}
                    className="flex items-center px-2 py-1 hover:bg-neutral-50 rounded cursor-pointer border border-transparent hover:border-neutral-200 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={estaInstalado}
                      onChange={() => toggleElemento(nombre)}
                      className="w-3.5 h-3.5 text-blue-600 border-neutral-300 rounded focus:ring-blue-500 focus:ring-1 cursor-pointer"
                    />
                    <span className={`ml-2 ${estaInstalado ? 'text-neutral-800 font-medium' : 'text-neutral-600'}`}>
                      {nombre}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

