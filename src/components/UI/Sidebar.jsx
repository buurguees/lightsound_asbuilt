export const Sidebar = ({ activeModule, setActiveModule }) => {
  // Módulos del As Built (sin Información)
  const asBuiltModules = [
    { id: 'metadatos', label: 'Metadatos' },
    { id: 'desglose', label: 'MKD' },
    { id: 'banners', label: 'Banners' },
    { id: 'turnomatic', label: 'Turnomatic' },
    { id: 'welcomer', label: 'Welcomer' },
    { id: 'fotos', label: 'Pantallas' },
    { id: 'audio', label: 'Audio' },
    { id: 'probadores', label: 'Probadores' },
    { id: 'rackVideo', label: 'Rack de Video' },
    { id: 'rackAudio', label: 'Rack de Audio' },
    { id: 'cuadrosAV', label: 'Cuadro Eléctrico' },
    { id: 'documentacion', label: 'Documentación' },
    { id: 'planos', label: 'Planos de Tienda' },
    { id: 'elementos', label: 'Elementos Instalados' },
  ];

  // Módulos adicionales (al final, separados)
  const additionalModules = [
    { id: 'informacion', label: 'Información' },
  ];

  return (
    <div className="w-64 bg-white flex flex-col border-r border-neutral-300">
      <div className="p-4 border-b border-neutral-300 bg-gradient-to-r from-neutral-50 to-neutral-100">
        <h2 className="font-semibold text-neutral-800">Módulos</h2>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Módulos del As Built */}
        <div className="flex-1">
          {asBuiltModules.map((module) => (
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
        
        {/* Separador visual */}
        <div className="border-t border-neutral-300 my-2"></div>
        
        {/* Módulos adicionales al final */}
        <div>
          {additionalModules.map((module) => (
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
    </div>
  );
};

