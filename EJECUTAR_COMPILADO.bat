@echo off
REM Script para ejecutar la aplicación compilada
REM Requiere Node.js instalado

echo ========================================
echo As Built Project - Servidor Compilado
echo ========================================
echo.

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

REM Instalar http-server si no existe
where http-server >nul 2>&1
if errorlevel 1 (
    echo Instalando servidor HTTP...
    call npm install -g http-server
)

REM Iniciar servidor en la carpeta dist
echo.
echo Iniciando servidor en puerto 8080...
echo La aplicación estará disponible en: http://localhost:8080
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
timeout /t 2

start http://localhost:8080
http-server ./dist -p 8080 -c-1
