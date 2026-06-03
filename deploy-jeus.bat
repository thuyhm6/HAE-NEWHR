@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ====================================================
::   HR-11 Build & Deploy Script
::   Ho tro: Tomcat 10.x va JEUS 8.5
::   Ca hai deu dung exploded-war (target/exploded-war)
::
::   Cach dung:
::     deploy-jeus.bat               -> Chi build, khong deploy
::     deploy-jeus.bat tomcat        -> Build + deploy len Tomcat 10.x
::     deploy-jeus.bat jeus          -> Build + deploy len JEUS 8.5
:: ====================================================



:: ====================================================
::   [CAU HINH] - SUA CAC GIA TRI NAY TRUOC KHI DUNG
:: ====================================================

:: --- JDK 21 ---
set JAVA_HOME_JDK21=C:\Program Files\Java\jdk-21.0.10

:: --- Database ---
set DB_URL=jdbc:oracle:thin:@//10.42.200.55:1526/HTSVHR
set DB_USERNAME=HTSV_HR
set DB_PASSWORD=`1q2w3a4s
set PHOTO_UPLOAD_PATH=D:/source/VHR/HTSV_HR/resources/photo/HTSV
set SESSION_COOKIE_SECURE=false

:: --- Tomcat 10.x ---
set TOMCAT_HOME=C:\apache-tomcat-10.1.55
set TOMCAT_APP_NAME=ROOT

:: --- JEUS 8.5 ---
set JEUS_HOME=D:\JEUS
set JEUS_APP_NAME=HR-11
set JEUS_CONTEXT_PATH=/HR-11
set JEUS_SERVER_HOST=localhost
set JEUS_ADMIN_PORT=9736
set JEUS_SERVER_NAME=server1

:: ====================================================
::   [NOI DUNG SCRIPT] - KHONG SUA TU DAY TROL XUONG
:: ====================================================

set PROJECT_DIR=%~dp0
set MVN=%PROJECT_DIR%mvnw.cmd
set WAR_FILE=%PROJECT_DIR%target\HR-11.war
set EXPLODED_WAR=%PROJECT_DIR%target\exploded-war
set DEPLOY_MODE=%~1
if "%DEPLOY_MODE%"=="" set DEPLOY_MODE=build

echo.
echo  ================================================
echo    HR-11 Build ^& Deploy  [%DEPLOY_MODE%]
echo  ================================================
echo.

:: Kiem tra tham so hop le
if /i "%DEPLOY_MODE%"=="build"  goto :CHECK_JDK
if /i "%DEPLOY_MODE%"=="tomcat" goto :CHECK_JDK
if /i "%DEPLOY_MODE%"=="jeus"   goto :CHECK_JDK

echo  [LOI] Tham so khong hop le: "%~1"
echo.
echo  Cach dung:
echo    deploy-jeus.bat               -^> Chi build
echo    deploy-jeus.bat tomcat        -^> Build + deploy len Tomcat 10.x
echo    deploy-jeus.bat jeus          -^> Build + deploy len JEUS 8.5
echo.
pause
exit /b 1


:: ====================================================
::   BUOC 1: Kiem tra JDK 21
:: ====================================================
:CHECK_JDK
echo  [1/3] Kiem tra JDK 21...
if not exist "%JAVA_HOME_JDK21%\bin\java.exe" (
    echo.
    echo  [LOI] Khong tim thay JDK 21 tai:
    echo        %JAVA_HOME_JDK21%
    echo.
    echo  Sua bien JAVA_HOME_JDK21 trong phan [CAU HINH] cua file nay.
    pause
    exit /b 1
)
set JAVA_HOME=%JAVA_HOME_JDK21%
set PATH=%JAVA_HOME%\bin;%PATH%
for /f "tokens=*" %%v in ('java -version 2^>^&1') do (
    echo        %%v
    goto :JDK_DONE
)
:JDK_DONE
echo  [OK] JDK 21 san sang.
echo.


:: ====================================================
::   BUOC 2: Maven Build
:: ====================================================
:BUILD
echo  [2/3] Dang build (mvn clean package -DskipTests)...
echo.
call "%MVN%" clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [LOI] Maven build THAT BAI. Xem log loi o tren.
    pause
    exit /b 1
)
echo.
echo  [OK] Build thanh cong!
echo        WAR     : %WAR_FILE%
echo        Exploded: %EXPLODED_WAR%
echo.

if /i "%DEPLOY_MODE%"=="build"  goto :BUILD_ONLY_DONE
if /i "%DEPLOY_MODE%"=="tomcat" goto :DEPLOY_TOMCAT
if /i "%DEPLOY_MODE%"=="jeus"   goto :DEPLOY_JEUS


:: ====================================================
::   DEPLOY: TOMCAT 10.x (dung exploded-war)
:: ====================================================
:DEPLOY_TOMCAT
echo  [3/3] Deploy len Tomcat (exploded-war)...
echo.

:: Kiem tra thu muc Tomcat
if not exist "%TOMCAT_HOME%" (
    echo  [LOI] Khong tim thay Tomcat tai: %TOMCAT_HOME%
    echo        Sua bien TOMCAT_HOME trong phan [CAU HINH] cua file nay.
    pause
    exit /b 1
)

:: Kiem tra exploded-war
if not exist "%EXPLODED_WAR%\WEB-INF" (
    echo  [LOI] Khong tim thay exploded-war: %EXPLODED_WAR%
    echo        WEB-INF khong ton tai - kiem tra lai ket qua build.
    pause
    exit /b 1
)

:: Ghi setenv.bat cho Tomcat (bien moi truong)
echo  -- Ghi bien moi truong vao setenv.bat...
(
    echo @echo off
    echo set "DB_URL=%DB_URL%"
    echo set "DB_USERNAME=%DB_USERNAME%"
    echo set "DB_PASSWORD=%DB_PASSWORD%"
    echo set "PHOTO_UPLOAD_PATH=%PHOTO_UPLOAD_PATH%"
    echo set "SESSION_COOKIE_SECURE=%SESSION_COOKIE_SECURE%"
    echo set "JAVA_OPTS=-Xms512m -Xmx1024m -Dfile.encoding=UTF-8"
) > "%TOMCAT_HOME%\bin\setenv.bat"
echo  [OK] Ghi xong: %TOMCAT_HOME%\bin\setenv.bat
echo.

:: Dung Tomcat neu dang chay
echo  -- Dang dung Tomcat (neu dang chay)...
call "%TOMCAT_HOME%\bin\shutdown.bat" >nul 2>&1
timeout /t 4 /nobreak >nul
echo  [OK] Da gui lenh shutdown.
echo.

:: Xoa ban deploy cu (thu muc va WAR cu neu con)
echo  -- Xoa ban deploy cu...
if exist "%TOMCAT_HOME%\webapps\%TOMCAT_APP_NAME%\" (
    rmdir /s /q "%TOMCAT_HOME%\webapps\%TOMCAT_APP_NAME%"
    echo        Xoa OK: webapps\%TOMCAT_APP_NAME%\
)
if exist "%TOMCAT_HOME%\webapps\%TOMCAT_APP_NAME%.war" (
    del /f /q "%TOMCAT_HOME%\webapps\%TOMCAT_APP_NAME%.war"
    echo        Xoa OK: webapps\%TOMCAT_APP_NAME%.war
)
echo  [OK] Da xoa ban cu.
echo.

:: Copy exploded-war vao webapps/HR-11/
echo  -- Dang copy exploded-war vao webapps\%TOMCAT_APP_NAME%\...
robocopy "%EXPLODED_WAR%" "%TOMCAT_HOME%\webapps\%TOMCAT_APP_NAME%" /E /IS /IT /NFL /NDL /NJH /NJS
if %ERRORLEVEL% GEQ 8 (
    echo.
    echo  [LOI] Robocopy that bai! ERRORLEVEL=%ERRORLEVEL%
    pause
    exit /b 1
)
echo  [OK] Copy thanh cong: %TOMCAT_HOME%\webapps\%TOMCAT_APP_NAME%\
echo.

:: Khoi dong Tomcat
echo  -- Khoi dong Tomcat...
start "" "%TOMCAT_HOME%\bin\startup.bat"
echo.
echo  ================================================
echo    DEPLOY TOMCAT THANH CONG!
echo  ================================================
echo.
echo    URL truy cap : http://localhost:8080/%TOMCAT_APP_NAME%/
echo.
echo    Theo doi log (PowerShell):
echo      Get-Content "%TOMCAT_HOME%\logs\catalina.out" -Wait -Tail 50
echo.
echo    Doi den khi thay dong:
echo      "Started Hr11Application in X.XXX seconds"
echo  ================================================
echo.
pause
exit /b 0


:: ====================================================
::   DEPLOY: JEUS 8.5
:: ====================================================
:DEPLOY_JEUS
echo  [3/3] Deploy len JEUS 8.5...
echo.

:: Kiem tra thu muc JEUS
if not exist "%JEUS_HOME%" (
    echo  [LOI] Khong tim thay JEUS tai: %JEUS_HOME%
    echo        Sua bien JEUS_HOME trong phan [CAU HINH] cua file nay.
    pause
    exit /b 1
)

:: Kiem tra exploded-war
if not exist "%EXPLODED_WAR%\WEB-INF" (
    echo  [LOI] Khong tim thay exploded-war: %EXPLODED_WAR%
    echo        WEB-INF khong ton tai trong thu muc exploded-war.
    pause
    exit /b 1
)

set JEUS_DEPLOY_TARGET=%JEUS_HOME%\resource\%JEUS_APP_NAME%

:: Tao thu muc deploy neu chua co
if not exist "%JEUS_DEPLOY_TARGET%" (
    mkdir "%JEUS_DEPLOY_TARGET%"
    echo  [OK] Tao moi: %JEUS_DEPLOY_TARGET%
)

:: Copy exploded-war vao JEUS deploy dir
echo  -- Dang copy exploded-war vao JEUS deploy dir...
robocopy "%EXPLODED_WAR%" "%JEUS_DEPLOY_TARGET%" /E /IS /IT /NFL /NDL /NJH /NJS
if %ERRORLEVEL% GEQ 8 (
    echo.
    echo  [LOI] Robocopy that bai! ERRORLEVEL=%ERRORLEVEL%
    pause
    exit /b 1
)
echo  [OK] Copy thanh cong: %JEUS_DEPLOY_TARGET%
echo.

echo  ================================================
echo    DEPLOY JEUS 8.5 - BUOC TIEP THEO (MANUAL)
echo  ================================================
echo.
echo  [A] Them bien moi truong vao JEUS JVM Config:
echo.
echo      Mo WebAdmin: http://%JEUS_SERVER_HOST%:%JEUS_ADMIN_PORT%/webadmin
echo      -^> Server -^> %JEUS_SERVER_NAME% -^> JVM Config -^> JVM Option
echo.
echo      Them cac dong sau:
echo        -DDB_URL=%DB_URL%
echo        -DDB_USERNAME=%DB_USERNAME%
echo        -DDB_PASSWORD=%DB_PASSWORD%
echo        -DPHOTO_UPLOAD_PATH=%PHOTO_UPLOAD_PATH%
echo        -DSESSION_COOKIE_SECURE=%SESSION_COOKIE_SECURE%
echo        -Dfile.encoding=UTF-8
echo.
echo  [B] Dang ky ung dung (lan dau trien khai):
echo.
echo      Tren WebAdmin:
echo        App Name    : %JEUS_APP_NAME%
echo        Deploy Path : %JEUS_DEPLOY_TARGET%
echo        Context Root: %JEUS_CONTEXT_PATH%
echo        Target      : %JEUS_SERVER_NAME%
echo.
echo      Hoac qua jeusadmin CLI:
echo        deploy -id %JEUS_APP_NAME% -path "%JEUS_DEPLOY_TARGET%" -contextpath %JEUS_CONTEXT_PATH% -target %JEUS_SERVER_NAME%
echo.
echo  [C] Da dang ky roi (lan redeploy):
echo.
echo        redeploy -id %JEUS_APP_NAME%
echo.
echo  [D] URL truy cap:
echo        http://%JEUS_SERVER_HOST%:PORT%JEUS_CONTEXT_PATH%
echo        (Kiem tra port HTTP trong JEUS WebAdmin)
echo  ================================================
echo.
pause
exit /b 0


:: ====================================================
:BUILD_ONLY_DONE
echo  ================================================
echo    BUILD THANH CONG - Khong deploy
echo  ================================================
echo.
echo    Exploded WAR (cho ca Tomcat va JEUS):
echo      %EXPLODED_WAR%
echo.
echo    WAR file (phu, khong dung de deploy):
echo      %WAR_FILE%
echo.
echo    De deploy:
echo      deploy-jeus.bat tomcat   -^> Deploy len Tomcat 10.x
echo      deploy-jeus.bat jeus     -^> Deploy len JEUS 8.5
echo  ================================================
echo.
pause
exit /b 0
