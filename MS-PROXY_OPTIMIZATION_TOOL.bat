@echo off
setlocal EnableDelayedExpansion
title MS-Proxy Optimization Tool
color 0B
cd /d "%~dp0"

:: --- 管理员权限检查 ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [!] 错误: 请右键点击此文件，选择 "以管理员身份运行"！
    pause
    exit /b
)

:MAIN_MENU
cls
call :LOGO
echo.
echo  =============================================================
echo             请选择要执行的操作 / Select Option
echo  =============================================================
echo.
echo    [1] 开启网络优化 (TCP/IP, 延迟, 吞刀修复)
echo    [2] 关闭网络优化 (恢复默认网络设置)
echo    [3] 开启系统优化 (FPS提升, 显卡, 内存)
echo    [4] 关闭系统优化 (恢复默认系统设置)
echo    [5] 退出程序
echo.
echo  =============================================================
set /p choice="请输入选项 [1-5]: "

if "%choice%"=="1" goto NETWORK_MENU
if "%choice%"=="2" goto RESTORE_NETWORK
if "%choice%"=="3" goto SYSTEM_MENU
if "%choice%"=="4" goto RESTORE_SYSTEM
if "%choice%"=="5" exit

goto MAIN_MENU

:: ============================================================================
:: 网络优化模块
:: ============================================================================
:NETWORK_MENU
cls
call :LOGO
echo.
echo  --- 网络优化模式 ---
echo  [1] 基本优化 (适配 Hypixel 更新 / 常规 PvP)
echo  [2] 极致 KB 优化 (调整网卡底层参数 / 激进模式)
echo  [3] 返回主菜单
echo.
set /p net_choice="请选择 [1-3]: "

if "%net_choice%"=="1" goto NET_BASIC
if "%net_choice%"=="2" goto NET_KB
if "%net_choice%"=="3" goto MAIN_MENU
goto NETWORK_MENU

:NET_BASIC
cls
call :LOGO
echo.
echo [+] 正在执行基本网络优化 (Hypixel适配)...
echo.

echo   - 配置 AFD 参数...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Afd\Parameters" /v "DefaultSendWindow" /t REG_DWORD /d 64240 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Afd\Parameters" /v "DefaultReceiveWindow" /t REG_DWORD /d 64240 /f >nul

echo   - 优化 TCP 全局参数...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnableTCPChimney" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\QoS" /v "Do not use NLA" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpWindowSize /t REG_DWORD /d 800000 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v "TcpAckFrequency" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v DefaultTTL /t REG_DWORD /d 64 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v GlobalMaxTcpWindowSize /t REG_DWORD /d 800000 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v TcpFrequency /t REG_DWORD /d 0 /f >nul

echo   - 调整 DNS 缓存策略...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v MaxCacheEntryTtlLimit /t REG_DWORD /d 200000 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v MaxCacheTtl /t REG_DWORD /d 50 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v MaxNegativeCacheTtl /t REG_DWORD /d 50 /f >nul

echo   - 优化端口与响应...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v MaxUserPort /t REG_DWORD /d 80000 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v "DisableThrottle" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnableRSS" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v GlobalTimerResolutionRequests /t REG_DWORD /d 0 /f >nul

echo   - 解除网络节流与鼠标平滑...
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v NetworkThrottlingIndex /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseSensitivity /t REG_DWORD /d 20 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseSpeed /t REG_DWORD /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseThreshold1 /t REG_DWORD /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseThreshold2 /t REG_DWORD /d 0 /f >nul

echo   - 应用低延迟算法 (NoDelay, AckTicks)...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TCPNoDelay /t REG_DWORD /d 1 /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR" /v LatencyMode /t REG_DWORD /d 2 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "SynAttackProtect" /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnableDeadGWDetect" /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpMaxDataRetransmissions" /t REG_DWORD /d 3 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpDelAckTicks /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpTimedWaitDelay /t REG_DWORD /d 20 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "KeepAliveTime" /t REG_DWORD /d 1 /f >nul

echo   - 执行 Netsh 接口微调...
netsh interface tcp set global rss=disabled >nul 2>&1
netsh int tcp set global autotuninglevel=restricted >nul 2>&1
netsh int tcp set global ecncapability=disabled >nul 2>&1
netsh interface teredo set state type=disabled >nul 2>&1
netsh interface isatap set state disabled >nul 2>&1
netsh interface 6to4 set state disabled >nul 2>&1

echo   - 高级 TCP 选项 (MTU, SackOpts)...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpMaxDupAcks /t REG_DWORD /d 2 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v MTU /t REG_DWORD /d 5000 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v DisableTaskOffload /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v Tcp1323Opts /t REG_DWORD /d 3 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v SackOpts /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v EnablePMTUDiscovery /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v EnablePMTUBHDetect /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Psched" /v NonBestEffortLimit /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Config" /v DODownloadMode /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" /v DODownloadMode /t REG_DWORD /d 0 /f >nul
netsh int tcp set global initialRto=1000

echo.
echo [√] 基本优化完成！
pause
goto MAIN_MENU

:NET_KB
cls
call :LOGO
echo.
echo [+] 正在执行 KB 模式优化 (网卡底层)...
echo.

echo   - 调整网络节流索引至 200...
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v NetworkThrottlingIndex /d 200 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v NetworkThrottlingIndex /d 200 /f >nul

echo   - 配置 Jumbo Packet 和 缓冲区 (PowerShell)...
powershell -command "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | ForEach-Object { Write-Host '   [+] 正在处理网卡: ' $_.Name; Disable-NetAdapterQos -Name $_.Name -ErrorAction SilentlyContinue; Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName 'Jumbo Packet' -RegistryValue 1514 -ErrorAction SilentlyContinue; Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName 'Receive Buffers' -RegistryValue 2048 -ErrorAction SilentlyContinue; Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName 'Transmit Buffers' -RegistryValue 2048 -ErrorAction SilentlyContinue }"

echo.
echo [√] KB 优化完成！
pause
goto MAIN_MENU

:: ============================================================================
:: 网络恢复模块
:: ============================================================================
:RESTORE_NETWORK
cls
call :LOGO
echo.
echo [-] 正在关闭网络优化并恢复默认设置...
echo.

echo   - 恢复 TCP 全局参数...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\QoS" /v "Do not use NLA" /t REG_DWORD /d 1 /f >nul
netsh interface tcp set global autotuninglevel=normal >nul 2>&1
netsh interface tcp set global netdma=enabled >nul 2>&1
netsh interface tcp set global ecncapability=enabled >nul 2>&1
netsh interface tcp set global rss=enabled >nul 2>&1
netsh interface tcp set global chimney=enabled >nul 2>&1
netsh interface tcp set global congestionprovider=none >nul 2>&1
netsh interface tcp set global dca=enabled >nul 2>&1

echo   - 清理注册表优化项...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnableTCPChimney" /t REG_DWORD /d 0 /f >nul
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpWindowSize /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v GlobalTimerResolutionRequests /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 20 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v SackOpts /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v DefaultTTL /t REG_DWORD /d 128 /f >nul
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v GlobalMaxTcpWindowSize /f >nul 2>&1
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v Tcp1323Opts /f >nul 2>&1
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v EnableRSS /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v MaxUserPort /t REG_DWORD /d 5000 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v DisableTaskOffload /t REG_DWORD /d 1 /f >nul
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpTimedWaitDelay /f >nul 2>&1
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v MaxCacheEntryTtlLimit /f >nul 2>&1
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v MaxNegativeCacheTtl /f >nul 2>&1
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\AFD\Parameters" /v DefaultReceiveWindow /f >nul 2>&1
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\AFD\Parameters" /v DefaultSendWindow /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\Psched" /v NonBestEffortLimit /f >nul 2>&1

echo   - 恢复服务与 DNS...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Config" /v DODownloadMode /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" /v DODownloadMode /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v MTU /t REG_DWORD /d 1500 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NlaSvc" /v Start /t REG_DWORD /d 3 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\lltdsvc" /v Start /t REG_SZ /d "3" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v MaxCacheTtl /t REG_DWORD /d 86400 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v MaxNegativeCacheTtl /t REG_DWORD /d 900 /f >nul

echo   - 恢复安全性与鼠标...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TCPNoDelay /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "SynAttackProtect" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnableDeadGWDetect" /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "KeepAliveTime" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpMaxDataRetransmissions" /t REG_DWORD /d 5 /f >nul
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpDelAckTicks /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v MouseSensitivity /t REG_DWORD /d 10 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseSpeed /t REG_DWORD /d 1 /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR" /v LatencyMode /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v NetworkThrottlingIndex /d 0 /f >nul

echo   - 恢复网卡流控 (PowerShell)...
powershell -command "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | ForEach-Object { Write-Host '   [-] 正在恢复网卡: ' $_.Name; Enable-NetAdapterQos -Name $_.Name -ErrorAction SilentlyContinue; Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName 'Jumbo Packet' -RegistryValue 1500 -ErrorAction SilentlyContinue; Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName 'Receive Buffers' -RegistryValue 256 -ErrorAction SilentlyContinue; Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName 'Transmit Buffers' -RegistryValue 256 -ErrorAction SilentlyContinue }"

echo   - 重置 IP 和 Winsock...
netsh winsock reset >nul
netsh int ip reset >nul
ipconfig /release >nul
ipconfig /renew >nul
ipconfig /flushdns >nul

echo.
echo [√] 网络已全部恢复默认。请重启电脑生效。
pause
goto MAIN_MENU

:: ============================================================================
:: 系统优化模块
:: ============================================================================
:SYSTEM_MENU
cls
call :LOGO
echo.
echo [+] 正在执行系统优化...
echo.

echo   - 禁用 GameDVR 录制...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 0 /f >nul
reg add "HKCU\System\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 0 /f >nul

echo   - 调整游戏进程优先级与 GPU 调度...
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v Priority /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v GPU_Priority /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters" /v Size /t REG_DWORD /d 3 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v HwSchMode /t REG_DWORD /d 2 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\PriorityControl" /v Win32PrioritySeparation /t REG_DWORD /d 38 /f >nul

echo   - 优化内存管理与缓存...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v ClearPageFileAtShutdown /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v SecondLevelDataCache /t REG_DWORD /d 1024 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v DisablePagingExecutive /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v "LargeSystemCache" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v "IoPageLockLimit" /t REG_DWORD /d 6000 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v "EnableMMCO" /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" /v EnablePrefetcher /t REG_DWORD /d 3 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" /v EnableSuperfetch /t REG_DWORD /d 1 /f >nul

echo   - 优化输入设备响应 (键盘/鼠标)...
reg add "HKCU\Control Panel\Keyboard" /v KeyboardDelay /t REG_DWORD /d 0 /f >nul
reg add "HKCU\Control Panel\Keyboard" /v KeyboardSpeed /t REG_DWORD /d 48 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseSensitivity /t REG_DWORD /d 10 /f >nul

echo   - 调整系统 IO 与电源...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\PriorityControl" /v "IoPriority" /t REG_DWORD /d 7 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v "DisableQuantum" /t REG_DWORD /d 1 /f >nul
reg add "HKCU\System\GameConfigStore" /v GameDVR_FSEBehaviorMode /t REG_DWORD /d 2 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Power\PowerSettings\54533251-82be-4824-96c1-47b60b740d00\be337238-0d82-4146-a960-4f3749d470c7" /v Attributes /t REG_DWORD /d 2 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v AffinityPolicy /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\IntcAzAudAddService\SysPrep" /v GroupPolicy /t REG_DWORD /d 1 /f >nul

echo.
echo --- 选择显卡类型 ---
echo [1] NVIDIA
echo [2] AMD
echo [3] 跳过
set /p gpu_choice="请输入选项 [1-3]: "

if "%gpu_choice%"=="1" goto GPU_NVIDIA
if "%gpu_choice%"=="2" goto GPU_AMD
goto SYSTEM_FINISH

:GPU_NVIDIA
echo [+] 应用 NVIDIA 优化...
reg add "HKCU\Software\NVIDIA Corporation\Global\NVTweak" /v "PowerManagementMode" /t REG_SZ /d "Prefer maximum performance" /f >nul
reg add "HKCU\Software\NVIDIA Corporation\Global\NVTweak" /v "TextureFilteringQuality" /t REG_SZ /d "High performance" /f >nul
reg add "HKCU\Software\NVIDIA Corporation\Global\NVTweak" /v "MaxPrerenderedFrames" /t REG_DWORD /d "1" /f >nul
reg add "HKCU\Software\NVIDIA Corporation\Global" /v "PreferredOpenGPVendor" /t REG_SZ /d "NVIDIA" /f >nul
reg add "HKCU\Software\NVIDIA Corporation\Global" /v "ShimRendererMode" /t REG_DWORD /d "0x00000010" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\nvlddmkm" /v "PerfLevelSrc" /t REG_DWORD /d "0x00002222" /f >nul
goto SYSTEM_FINISH

:GPU_AMD
echo [+] 应用 AMD 优化...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "EnableUlps" /t REG_DWORD /d "0" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "PP_PhmSoftPowerPlayTable" /t REG_DWORD /d "0" /f >nul
reg add "HKCU\Software\AMD\Settings" /v "PowerManagementMode" /t REG_SZ /d "High performance" /f >nul
reg add "HKCU\Software\AMD\Settings" /v "TextureFilteringQuality" /t REG_SZ /d "Performance" /f >nul
reg add "HKCU\Software\AMD\Settings" /v "MaxPrerenderedFrames" /t REG_DWORD /d "0" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\AMD External Events Utility" /v "Start" /t REG_DWORD /d "4" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\AMDRyzenMasterDriverV13" /v "Start" /t REG_DWORD /d "4" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "PP_SclkDeepSleepDisable" /t REG_DWORD /d "1" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "ShaderCache" /t REG_DWORD /d "32" /f >nul
goto SYSTEM_FINISH

:SYSTEM_FINISH
echo.
echo [√] 系统优化完成！请重启电脑生效。
pause
goto MAIN_MENU

:: ============================================================================
:: 系统恢复模块
:: ============================================================================
:RESTORE_SYSTEM
cls
call :LOGO
echo.
echo [-] 正在恢复系统默认设置...
echo.

echo   - 恢复 GameDVR 与优先级...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 1 /f >nul
reg add "HKCU\System\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v Priority /t REG_DWORD /d 8 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v GPU_Priority /t REG_DWORD /d 6 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v HwSchMode /t REG_DWORD /d 1 /f >nul

echo   - 恢复内存管理...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v DisablePagingExecutive /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v "EnableMMCO" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v LargeSystemCache /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v ClearPageFileAtShutdown /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v SecondLevelDataCache /t REG_DWORD /d 256 /f >nul

echo   - 恢复键盘鼠标与 IO...
reg add "HKCU\Control Panel\Keyboard" /v KeyboardDelay /t REG_DWORD /d 1 /f >nul
reg add "HKCU\Control Panel\Keyboard" /v KeyboardSpeed /t REG_DWORD /d 31 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseSensitivity /t REG_DWORD /d 10 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\PriorityControl" /v IoPriority /t REG_DWORD /d 3 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\PriorityControl" /v "Win32PrioritySeparation" /t REG_DWORD /d 2 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v "DisableQuantum" /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v "IoPageLockLimit" /t REG_DWORD /d 0 /f >nul

echo   - 恢复电源与预读取...
reg add "HKCU\System\GameConfigStore" /v GameDVR_FSEBehaviorMode /t REG_DWORD /d 0 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Power\PowerSettings\54533251-82be-4824-96c1-47b60b740d00\be337238-0d82-4146-a960-4f3749d470c7" /v Attributes /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" /v EnablePrefetcher /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" /v EnableSuperfetch /t REG_DWORD /d 0 /f >nul
reg delete "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v AffinityPolicy /f >nul 2>&1
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\IntcAzAudAddService\SysPrep" /v GroupPolicy /f >nul 2>&1

echo.
echo --- 选择显卡类型进行恢复 ---
echo [1] NVIDIA
echo [2] AMD
echo [3] 跳过
set /p gpu_choice="请输入选项 [1-3]: "

if "%gpu_choice%"=="1" goto OFF_NVIDIA
if "%gpu_choice%"=="2" goto OFF_AMD
goto SYSTEM_OFF_FINISH

:OFF_NVIDIA
echo [-] 恢复 NVIDIA 默认...
reg add "HKCU\Software\NVIDIA Corporation\Global" /v "PreferredOpenGPVendor" /t REG_SZ /d "删除" /f >nul
reg add "HKCU\Software\NVIDIA Corporation\Global" /v "ShimRendererMode" /t REG_DWORD /d "0x00000000" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\nvlddmkm" /v "PerfLevelSrc" /t REG_DWORD /d "0x00003333" /f >nul
reg add "HKCU\Software\NVIDIA Corporation\Global\NVTweak" /v "PowerManagementMode" /t REG_SZ /d "Adaptive" /f >nul
reg add "HKCU\Software\NVIDIA Corporation\Global\NVTweak" /v "TextureFilteringQuality" /t REG_SZ /d "Quality" /f >nul
reg add "HKCU\Software\NVIDIA Corporation\Global\NVTweak" /v "MaxPrerenderedFrames" /t REG_DWORD /d "3" /f >nul
goto SYSTEM_OFF_FINISH

:OFF_AMD
echo [-] 恢复 AMD 默认...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\AMD External Events Utility" /v "Start" /t REG_DWORD /d "2" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Services\AMDRyzenMasterDriverV13" /v "Start" /t REG_DWORD /d "1" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "PP_SclkDeepSleepDisable" /t REG_DWORD /d "0" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "ShaderCache" /t REG_DWORD /d "0" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "EnableUlps" /t REG_DWORD /d "1" /f >nul
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "PP_PhmSoftPowerPlayTable" /t REG_DWORD /d "0" /f >nul
reg delete "HKCU\Software\AMD\Settings" /v "PowerState" /f >nul 2>&1
reg add "HKCU\Software\AMD\Settings" /v "TextureFiltering" /t REG_SZ /d "Quality" /f >nul
reg add "HKCU\Software\AMD\Settings" /v VSync /t REG_DWORD /d 1 /f >nul
goto SYSTEM_OFF_FINISH

:SYSTEM_OFF_FINISH
echo.
echo [√] 系统设置已恢复。请重启电脑。
pause
goto MAIN_MENU

:: ============================================================================
:: 辅助 LOGO 模块
:: ============================================================================
:LOGO
echo.
echo  ##     ##   ######  
echo  ###   ###  ##    ## 
echo  #### ####  ##       
echo  ## ### ##   ######  
echo  ##     ##        ## 
echo  ##     ##  ##    ## 
echo  ##     ##   ######  
echo.
echo  =============================================================
echo             MS-PROXY OPTIMIZATION TOOL
echo  =============================================================
exit /b
