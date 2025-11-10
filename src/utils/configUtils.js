/**
 * Utilidades para gestionar la configuración en archivos JSON
 * Los archivos se guardan en public/config/
 */

const CONFIG_PREFIX = 'asbuilt_config_';
const CONFIG_PATH = '/config/';

/**
 * Carga la configuración de una pestaña desde public/config/
 * @param {string} tabName - Nombre de la pestaña (ej: 'elementos')
 * @returns {Promise<object|null>} - Datos cargados o null si no existe
 */
export const loadConfigTab = async (tabName) => {
  try {
    // Primero intentar cargar desde el archivo JSON en public/config/
    const response = await fetch(`${CONFIG_PATH}${tabName}.json`);
    if (response.ok) {
      const data = await response.json();
      // También guardar en localStorage como caché
      const key = `${CONFIG_PREFIX}${tabName}`;
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    }
    
    // Si no existe el archivo, intentar cargar desde localStorage (fallback)
    const key = `${CONFIG_PREFIX}${tabName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return null;
  } catch (error) {
    console.error(`Error cargando configuración de ${tabName}:`, error);
    // Fallback a localStorage
    try {
      const key = `${CONFIG_PREFIX}${tabName}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error en fallback localStorage:', e);
    }
    return null;
  }
};

// Almacenar referencias a los archivos abiertos
const fileHandles = {};

/**
 * Inicializa el acceso al archivo JSON usando File System Access API
 * @param {string} tabName - Nombre de la pestaña
 * @returns {Promise<FileSystemFileHandle|null>} - Handle del archivo o null
 */
export const initFileAccess = async (tabName) => {
  if (!('showOpenFilePicker' in window)) {
    console.warn('File System Access API no está disponible en este navegador');
    return null;
  }

  try {
    // Pedir al usuario que seleccione el archivo la primera vez
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON files',
        accept: { 'application/json': ['.json'] }
      }],
      suggestedName: `${tabName}.json`,
      multiple: false
    });
    
    fileHandles[tabName] = fileHandle;
    return fileHandle;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Usuario canceló la selección del archivo');
    } else {
      console.error('Error inicializando acceso al archivo:', error);
    }
    return null;
  }
};

/**
 * Guarda la configuración de una pestaña directamente en el archivo JSON
 * @param {string} tabName - Nombre de la pestaña (ej: 'elementos')
 * @param {object} data - Datos a guardar
 * @returns {Promise<boolean>} - true si se guardó correctamente
 */
export const saveConfigTab = async (tabName, data) => {
  try {
    // Guardar en localStorage como caché
    const key = `${CONFIG_PREFIX}${tabName}`;
    localStorage.setItem(key, JSON.stringify(data));
    
    // Intentar escribir directamente en el archivo si tenemos el handle
    if (fileHandles[tabName]) {
      try {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const writable = await fileHandles[tabName].createWritable();
        await writable.write(blob);
        await writable.close();
        console.log(`✅ Configuración guardada directamente en ${tabName}.json`);
        return true;
      } catch (error) {
        console.error('Error escribiendo en el archivo:', error);
        // Si falla, intentar obtener el handle de nuevo
        delete fileHandles[tabName];
      }
    }
    
    // Si no tenemos el handle, intentar obtenerlo automáticamente
    // Nota: Esto requiere que el usuario haya seleccionado el archivo al menos una vez
    // Por ahora, solo guardamos en localStorage
    console.log(`💾 Configuración guardada en localStorage (${tabName})`);
    return true;
  } catch (error) {
    console.error(`Error guardando configuración de ${tabName}:`, error);
    return false;
  }
};

/**
 * Importa configuración desde un archivo JSON
 * @param {File} file - Archivo JSON a importar
 * @returns {Promise<object>} - Datos importados
 */
export const importConfigTab = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('El archivo no es un JSON válido'));
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsText(file);
  });
};

/**
 * Carga todas las configuraciones guardadas
 * @returns {object} - Objeto con todas las configuraciones
 */
export const loadAllConfigs = () => {
  const configs = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CONFIG_PREFIX)) {
        const tabName = key.replace(CONFIG_PREFIX, '');
        configs[tabName] = JSON.parse(localStorage.getItem(key));
      }
    }
  } catch (error) {
    console.error('Error cargando todas las configuraciones:', error);
  }
  return configs;
};

