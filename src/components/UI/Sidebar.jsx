export const Sidebar = ({ activeModule, setActiveModule }) => {
  const modules = [
    { id: 'metadatos', label: 'Metadatos' },
    { id: 'elementos', label: 'Elementos Instalados' },
    { id: 'desglose', label: 'Desglose de Pantallas' },
    { id: 'fotos', label: 'Pantallas' },
    { id: 'probadores', label: 'Probadores' },
    { id: 'audio', label: 'Audio' },
    { id: 'rackVideo', label: 'Rack Video' },
    { id: 'rackAudio', label: 'Rack Audio' },
    { id: 'cuadrosAV', label: 'Cuadro Eléctrico' },
    { id: 'documentacion', label: 'Documentación' },
    { id: 'planos', label: 'Planos de Tienda' },
  ];

  return (
    <div className="w-64 bg-white flex flex-col border-r border-neutral-300">
      <div className="p-4 border-b border-neutral-300 bg-gradient-to-r from-neutral-50 to-neutral-100">
        <h2 className="font-semibold text-neutral-800">Módulos</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={`w-full text-left px-4 py-3 font-medium transition-colors ${
              activeModule === module.id
                ? 'bg-neutral-100 text-neutral-800 border-l-4 border-neutral-800'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {module.label}
          </button>
        ))}
      </div>
    </div>
  );
};

