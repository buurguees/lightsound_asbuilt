@echo off
REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js no está instalado
    echo Descargalo desde https://nodejs.org/
    pause
    exit /b 1
)

REM Navegar a la carpeta del proyecto
cd /d "%~dp0"

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

REM Iniciar servidor de desarrollo
echo.
echo ========================================
echo As Built Project
echo ========================================
echo.
echo Iniciando servidor...
echo La aplicación se abrirá en: http://localhost:5173
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
timeout /t 3

start http://localhost:5173
npm run dev
