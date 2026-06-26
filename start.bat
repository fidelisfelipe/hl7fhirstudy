@echo off
echo Iniciando HL7 FHIR Study em http://localhost:8001/index.html
start "" chrome "http://localhost:8001/index.html"
node "%~dp0server.js"
