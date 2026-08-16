::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCyDJGyX8VAjFBldQQWFAE+/Fb4I5/jH3P6GsUVQd+o2dIDJyIiIIfYa6UrqO58u2Ro=
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSzk=
::cBs/ulQjdF+5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpCI=
::egkzugNsPRvcWATEpCI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAnk
::YxY4rhs+aU+IeA==
::cxY6rQJ7JhzQF1fEqQJQ
::ZQ05rAF9IBncCkqN+0xwdVs0
::ZQ05rAF9IAHYFVzEqQIDPBpHREmhNGK2CroOiA==
::eg0/rx1wNQPfEVWB+kM9LVsJDGQ=
::fBEirQZwNQPfEVWB+kM9LVsJDGQ=
::cRolqwZ3JBvQF1fEqQIcKQ5aTwyHLiuXB7sd7+3pr9mTo14VNA==
::dhA7uBVwLU+EWEuR+UsoZRJQLA==
::YQ03rBFzNR3SWATElA==
::dhAmsQZ3MwfNWATE1BBgek0UfhGPNXP3D7F8
::ZQ0/vhVqMQ3MEVWAtB9wSA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRnk
::Zh4grVQjdCyDJGyX8VAjFBldQQWFAE+/Fb4I5/jH3P6GsUVQd+o2dIDJyIi9NOEA4gjHfZ8h2nVI1s4UCXs=
::YB416Ek+ZW8=
::
::
::978f952a14a936cc963da21a135fa983
@echo off
:: Matikan proses lama jika ada
taskkill /f /im stash-win.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

cd /d "C:\Users\bimag\Desktop\Stash-Chilorr"

:: 1. Jalankan Node.js secara benar-benar tersembunyi
start "" /B node server.js

:: 2. Jalankan Stash di jendela baru, tapi langsung di-MINIMIZE ke taskbar
start "Stash Server" /MIN "backend\stash-win.exe" --nobrowser

:: 3. Tunggu 3 detik lalu buka browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

:: 4. Sistem pemantau rahasia di latar belakang
:MONITOR
timeout /t 2 /nobreak >nul
tasklist | find /i "stash-win.exe" >nul
if %ERRORLEVEL% == 0 goto MONITOR

:: Jika program Stash di taskbar ditutup, matikan juga Node.js lalu keluar
taskkill /f /im node.exe >nul 2>&1
exit