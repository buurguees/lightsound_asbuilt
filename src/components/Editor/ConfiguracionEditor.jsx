import { useState, useEffect, useRef } from 'react';
import { saveConfigTab, loadConfigTab, initFileAccess } from '../../utils/configUtils';

export const ConfiguracionEditor = ({ data, setData }) => {
  const [activeTab, setActiveTab] = useState('elementos');

  const tabs = [
    { id: 'elementos', label: 'Elementos' }
    // Más pestañas se añadirán aquí
  ];

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: '70vh' }}>
      {/* Sistema de pestañas - Fijo */}
      <div className="flex border-b border-neutral-200 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-neutral-800 text-neutral-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de las pestañas */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'elementos' && (
          <PestanaElementos data={data} setData={setData} />
        )}
      </div>
    </div>
  );
};

// Pestaña de Elementos - Plantilla de elementos instalados
const PestanaElementos = ({ data, setData }) => {
  const elementos = data.configuracion?.elementos || [];
  const [loading, setLoading] = useState(true);
  const [fileInitialized, setFileInitialized] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Cargar configuración al montar el componente desde public/config/elementos.json
  useEffect(() => {
    const cargarConfiguracion = async () => {
      setLoading(true);
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
        console.error('Error cargando configuración:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarConfiguracion();
  }, [setData]);

  // No inicializar automáticamente - el usuario debe seleccionar el archivo manualmente
  // Esto evita mostrar el diálogo automáticamente al abrir el modal

  // Función para guardar automáticamente con debounce
  const guardarAutomaticamente = (nuevosElementos) => {
    // Limpiar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Guardar después de 500ms de inactividad
    saveTimeoutRef.current = setTimeout(async () => {
      const configData = {
        elementos: nuevosElementos
      };
      await saveConfigTab('elementos', configData);
    }, 500);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const agregarElemento = () => {
    setData((d) => {
      const c = structuredClone(d);
      if (!c.configuracion) c.configuracion = {};
      if (!c.configuracion.elementos) c.configuracion.elementos = [];
      c.configuracion.elementos.push({ nombre: "" });
      guardarAutomaticamente(c.configuracion.elementos);
      return c;
    });
  };

  const actualizarElemento = (index, nombre) => {
    setData((d) => {
      const c = structuredClone(d);
      c.configuracion.elementos[index].nombre = nombre;
      guardarAutomaticamente(c.configuracion.elementos);
      return c;
    });
  };

  const eliminarElemento = (index) => {
    setData((d) => {
      const c = structuredClone(d);
      c.configuracion.elementos.splice(index, 1);
      guardarAutomaticamente(c.configuracion.elementos);
      return c;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado fijo con botones */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-neutral-200 bg-neutral-50 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={agregarElemento}
            className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded border-0"
          >
            + Añadir
          </button>
          {!fileInitialized && 'showOpenFilePicker' in window && (
            <button
              onClick={async () => {
                const handle = await initFileAccess('elementos');
                if (handle) {
                  setFileInitialized(true);
                  // Guardar inmediatamente después de inicializar
                  const configData = { elementos: elementos };
                  await saveConfigTab('elementos', configData);
                }
              }}
              className="px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded border-0"
              title="Seleccionar archivo elementos.json para guardado automático"
            >
              📁 Seleccionar archivo
            </button>
          )}
        </div>
        <span className="text-xs text-neutral-500">
          {elementos.length} elemento{elementos.length !== 1 ? 's' : ''}
          {fileInitialized && ' • Guardado automático'}
        </span>
      </div>

      {/* Tabla compacta - Scrollable */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-4 text-neutral-400 text-xs">
            Cargando...
          </div>
        ) : elementos.length === 0 ? (
          <div className="text-center py-4 text-neutral-400 text-xs">
            No hay elementos. Haz clic en "Añadir" para comenzar.
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-neutral-100 z-10">
              <tr>
                <th className="border border-neutral-300 px-2 py-1 text-left font-semibold bg-neutral-100" style={{ width: '40px' }}>#</th>
                <th className="border border-neutral-300 px-2 py-1 text-left font-semibold bg-neutral-100">Nombre del elemento</th>
                <th className="border border-neutral-300 px-1 py-1 text-center font-semibold bg-neutral-100" style={{ width: '60px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {elementos.map((elemento, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="border border-neutral-300 px-2 py-0.5 text-neutral-500 text-center">
                    {i + 1}
                  </td>
                  <td className="border border-neutral-300 px-2 py-0.5">
                    <input
                      type="text"
                      value={elemento.nombre}
                      onChange={(e) => actualizarElemento(i, e.target.value)}
                      placeholder="Nombre del elemento..."
                      className="w-full border-0 bg-transparent px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-300 text-xs"
                      style={{ minHeight: '24px' }}
                    />
                  </td>
                  <td className="border border-neutral-300 px-1 py-0.5 text-center">
                    <button
                      onClick={() => eliminarElemento(i)}
                      className="px-1.5 py-0.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

