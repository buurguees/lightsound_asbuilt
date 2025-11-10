import { Card } from '../UI/Card';
import { Button } from '../UI/Button';

export const ElementosInstaladosEditor = ({ data, setData }) => {
  const elementosConfig = data.configuracion?.elementos || [];
  const equipamiento = data.equipamiento || [];

  const agregarElemento = () => {
    setData((d) => {
      const c = structuredClone(d);
      if (!c.equipamiento) c.equipamiento = [];
      c.equipamiento.push({ nombre: "", nota: "" });
      return c;
    });
  };

  const actualizarElemento = (index, campo, valor) => {
    setData((d) => {
      const c = structuredClone(d);
      c.equipamiento[index][campo] = valor;
      return c;
    });
  };

  const eliminarElemento = (index) => {
    setData((d) => {
      const c = structuredClone(d);
      c.equipamiento.splice(index, 1);
      return c;
    });
  };

  return (
    <Card title="Elementos Instalados">
      <div className="flex flex-col" style={{ maxHeight: '600px' }}>
        {/* Encabezado fijo con botón */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-neutral-200 bg-neutral-50 flex-shrink-0 mb-0">
          <button
            onClick={agregarElemento}
            className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded border-0"
          >
            + Añadir elemento
          </button>
          <span className="text-xs text-neutral-500">
            {equipamiento.length} elemento{equipamiento.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tabla compacta estilo Excel - Scrollable */}
        <div className="flex-1 overflow-auto">
          {equipamiento.length === 0 ? (
            <div className="text-center py-4 text-neutral-400 text-xs">
              No hay elementos instalados. Haz clic en "Añadir elemento" para comenzar.
            </div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-neutral-100 z-10">
                <tr>
                  <th className="border border-neutral-300 px-2 py-1 text-left font-semibold bg-neutral-100" style={{ width: '40px' }}>#</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left font-semibold bg-neutral-100">Tipo de equipo</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left font-semibold bg-neutral-100">Nota</th>
                  <th className="border border-neutral-300 px-1 py-1 text-center font-semibold bg-neutral-100" style={{ width: '60px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {equipamiento.map((equipo, i) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="border border-neutral-300 px-2 py-0.5 text-neutral-500 text-center">
                      {i + 1}
                    </td>
                    <td className="border border-neutral-300 px-2 py-0.5">
                      <select
                        value={equipo.nombre}
                        onChange={(e) => actualizarElemento(i, 'nombre', e.target.value)}
                        className="w-full border-0 bg-transparent px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-300 text-xs"
                        style={{ minHeight: '24px' }}
                      >
                        <option value="">Seleccionar tipo...</option>
                        {elementosConfig.map((elem, idx) => (
                          <option key={idx} value={elem.nombre}>
                            {elem.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-neutral-300 px-2 py-0.5">
                      <input
                        type="text"
                        value={equipo.nota}
                        onChange={(e) => actualizarElemento(i, 'nota', e.target.value)}
                        placeholder="Nota opcional..."
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
    </Card>
  );
};

