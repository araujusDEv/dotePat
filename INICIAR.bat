@echo off
setlocal
chcp 65001 >nul
title Appet
cd /d "%~dp0"
if not exist server.js goto :incomplete
if not exist package.json goto :incomplete
if not exist package-lock.json goto :incomplete
if not exist index.html goto :incomplete
if not exist js\store.js goto :incomplete
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale o Node.js 22.23.1 ou mais recente e tente novamente.
  pause
  exit /b 1
)
node -e "require('pdf-lib'); require('pngjs')" >nul 2>nul
if errorlevel 1 (
  echo Instalando dependencias. A primeira instalacao precisa de internet.
  call npm ci
  if errorlevel 1 (
    echo Nao foi possivel instalar as dependencias. Confira o erro acima e sua conexao.
    pause
    exit /b 1
  )
)
echo Iniciando Appet...
echo Abra http://127.0.0.1:3000 no navegador.
echo.
node server.js
pause
exit /b 0

:incomplete
echo.
echo A pasta do projeto esta incompleta.
echo Nao abra INICIAR.bat diretamente dentro do ZIP ou WinRAR.
echo Use "Extrair para..." para extrair TODO o ZIP em uma pasta.
echo Depois abra essa pasta e execute INICIAR.bat novamente.
echo Mantenha server.js, package.json e package-lock.json junto deste arquivo.
echo.
pause
exit /b 1
