# As Built Project - Instrucciones de Distribución

## Opción 1: Ejecutar directamente (Recomendado - Más sencillo)

### Requisitos:
- Node.js instalado (descargar desde https://nodejs.org/)
- Puerto 5173 disponible

### Pasos:
1. Descargar la carpeta completa del proyecto
2. Abrir PowerShell en la carpeta del proyecto
3. Ejecutar:
```bash
npm install
npm run dev
```
4. Abrir navegador en: `http://localhost:5173`

---

## Opción 2: Usar archivo compilado (Más portátil)

### Requisitos:
- Servidor HTTP simple (Live Server, Python, etc.)

### Pasos:
1. Copiar la carpeta `dist` a otra ubicación
2. Iniciar un servidor HTTP en esa carpeta
3. Acceder por el navegador

**Usando Python (Windows):**
```bash
cd carpeta_dist
python -m http.server 8000
```
Luego abrir: `http://localhost:8000`

**Usando Node.js (http-server):**
```bash
npm install -g http-server
http-server ./dist
```

---

## Opción 3: Crear ejecutable Electron (Más profesional)

### Requisitos:
- Node.js instalado
- Electron configurado

### Pasos:
```bash
npm install
npm run electron-build
```

Se creará un ejecutable en la carpeta `dist/` listo para distribuir.

---

## Archivos a distribuir

**Opción 1 y 2:**
- Carpeta completa del proyecto O solo la carpeta `dist/`

**Opción 3:**
- Archivo `.exe` generado en `dist/`

---

## Solución de problemas

**Puertos ocupados:**
```bash
npm run dev -- --port 3000
```

**Limpiar instalación:**
```bash
rm -r node_modules package-lock.json
npm install
```

---

## Notas importantes

- Los datos se guardan en LocalStorage (navegador)
- Los JSONs se pueden exportar y compartir
- La app es completamente offline después de la carga inicial
- Recomendamos usar Chrome, Firefox o Edge para mejor compatibilidad

