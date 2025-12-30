@echo off
setlocal

chcp 65001 >nul

for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"

set "C_RESET=%ESC%[0m"
set "C_RED=%ESC%[91m"
set "C_GREEN=%ESC%[92m"
set "C_YELLOW=%ESC%[93m"
set "C_GRAY=%ESC%[90m"
set "C_WHITE=%ESC%[97m"
set "C_BOLD=%ESC%[1m"
set "C_THEME=%ESC%[38;2;66;185;147m"

cls

echo.
echo %ESC%[38;2;66;185;147m                  ▄█           █▓█%C_RESET%
echo %ESC%[38;2;65;182;145m                 ██╖▓▓▓▓▓▓▓▓▓█▄▓█▓██╖%C_RESET%
echo %ESC%[38;2;64;180;144m                ╢▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓█▓╕%C_RESET%
echo %ESC%[38;2;63;178;143m               ▄▓▓▓▓▓▓▓▒▀▓▓▓▓▓▓▓█▓▓██▓%C_RESET%
echo %ESC%[38;2;62;176;142m              ▒▓▓▓▓▓░▓▓▓└╜▒▀▓▓▓▓▓████▓▒%C_RESET%
echo %ESC%[38;2;61;174;141m             ║▓▀▓▓▓█││▀▓▄│╚└╚▓▓▓█▓███▓▓%C_RESET%
echo %ESC%[38;2;60;172;140m             ╚▓└▓▓█▒│││╚▀┤││││▒▓▓▓█▓██▓█%C_RESET%
echo %ESC%[38;2;59;170;139m              ║ ▄▓███│││││││││▀█▓▓▓███▓▓▄%C_RESET%
echo %ESC%[38;2;58;168;138m               ╔▓▓██▓█│││││││║╢█▀█ ▓███▓▓%C_RESET%
echo %ESC%[38;2;57;165;137m               ▒▓▓██▀██   ╔▄███▀   ▓███▓▓█%C_RESET%
echo %ESC%[38;2;56;163;136m              ▄▓▓███  █┌║█▓██▓▓┌╔  ╚████▓▓▓%C_RESET%
echo %ESC%[38;2;55;161;135m             ║▓▓███   ║▄█▓███│┌┌▄   ▓███▓▓▓▄%C_RESET%
echo %ESC%[38;2;54;159;134m            ║▓▓███▀  ║▓█▓▓███▄│┌█   ▀████▓▓▓▒%C_RESET%
echo %ESC%[38;2;53;157;133m           ▄▓▓████ ▄███▓▓▓████████╕ ╚█████▓▓▓█%C_RESET%
echo %ESC%[38;2;52;155;132m         ╔█▓▓████▀████▓▓▓███▀╢█████  ▓█████▓▓▓█%C_RESET%
echo %ESC%[38;2;51;153;131m        ╖▓▓▓██████▓▓▓██▓▓████╢█████  ▓██████▓▓▓█%C_RESET%
echo %ESC%[38;2;50;151;130m       ▄▓▓▓████▓████▓▓▓▓▓███████████ ╢██████▓▓▓▓█%C_RESET%
echo %ESC%[38;2;49;149;129m     ╔▒▓▓▓████▓███▓█▓▓▓██████▓▓██████ ███████▓▓▓▓█%C_RESET%
echo %ESC%[38;2;48;146;128m    ╔█▓▓▓███▓▓▓█████▓▓█████▓██▓███████████████▓▓▓▓▄%C_RESET%
echo %ESC%[38;2;47;144;127m   ╔█▓▓▓▓█▓███▓▓▓█████████████▓█████████▓██████▓▓▓▓╖%C_RESET%
echo %ESC%[38;2;46;142;126m  ╔▓▓▓▓▓█▓███████▓▓▓▓▓▓▓▓▓▓▓▓▓▓█████████▓▓█████▓▓▓▓▓%C_RESET%
echo %ESC%[38;2;45;140;125m  ▄▓▓▓▓███▓▓▓████│┤░░    ╚░░▒▀▓██████▓██████████▓▓▓▓█%C_RESET%
echo %ESC%[38;2;44;138;124m ║▓▓▓▓███████▀▓▓█▄▄▄▄     ╣███▓▓▓▓▓▓▀  ╣████████▓▓▓▓▓╕%C_RESET%
echo %ESC%[38;2;43;136;123m █▓▓▓▓███████   ▓████     ╚▓███▄        █████████▓▓▓▓█%C_RESET%
echo %ESC%[38;2;42;134;122m║▓▓▓▓▓██████▀   ▓███▀      █████▄       ▓████████▓▓▓▓▓%C_RESET%
echo %ESC%[38;2;41;132;121m▒▓▒▓▓▓██████   ▄████─      ╚▓█████      █████████▓▓▓█▓▒%C_RESET%
echo %ESC%[38;2;40;130;120m▓▓║▓▓▓██████  ╔▓████╕       ▓██████     ▓████████▓▓▓▀▒█%C_RESET%
echo %ESC%[38;2;39;127;119m▓▀║▓▓▓██████  ▄█████╡       └▓██████    ▓██▓█████▓▓▓ ║▓%C_RESET%
echo %ESC%[38;2;38;125;118m▒╡╚▓▓▓██████  ▓██████        ▀███████   ▓██║█████▓▓▓ ║▓%C_RESET%
echo %ESC%[38;2;37;123;117m║─ ╣▓▓██████ ║▓██████         ▓███████  ██ ║████▓▓▓  ║▀%C_RESET%
echo %ESC%[38;2;36;121;116m ▒  ▀▓▓█████ ║███████         ▓████████╔█  ║████▓█   ║%C_RESET%
echo %ESC%[38;2;35;119;115m ║   ╚▓▓████ ║████████        ║▓████████   ║███▓▀    ╜%C_RESET%
echo %ESC%[38;2;34;117;114m      ╚▓▓██ ╚▓████████        ▓████████   ▓██▀%C_RESET%
echo %ESC%[38;2;33;115;113m        ▀██ ▓█████████      ▄█████████  ╔█╝%C_RESET%
echo %ESC%[38;2;32;113;112m              ▓▓█████▓      ▓██████▓%C_RESET%
echo %ESC%[38;2;32;111;111m                  ░╜         ▓███▀%C_RESET%
echo.
echo %C_GRAY%========================================================%C_RESET%
echo      %C_BOLD%%C_WHITE%MS-Proxy Build Process%C_RESET%
echo %C_GRAY%========================================================%C_RESET%
echo.
echo %C_THEME%[Status] Running npm run dist ...%C_RESET%
echo %C_GRAY%--------------------------------------------------------%C_RESET%

call npm run dist

if %errorlevel% neq 0 (
    echo.
    echo %C_GRAY%--------------------------------------------------------%C_RESET%
    echo %C_RED%[Error] Build Failed! (Error Level: %errorlevel%)%C_RESET%
    echo.
    echo %C_GRAY%--------------------------------------------------------%C_RESET%
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo %C_GRAY%--------------------------------------------------------%C_RESET%
echo %C_GREEN%[Success] Build Completed!%C_RESET%
echo.
echo %C_THEME%Output Location:%C_RESET%
echo %~dp0dist\MS-Proxy.exe
echo %C_GRAY%========================================================%C_RESET%
echo.

pause