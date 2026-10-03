@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ====================================================
::   HR-11 Build & Deploy Script
::   Ho tro: Tomcat 9.x va JEUS 7.0
::   Spring Boot 2.7.18 / JDK 11 / javax.* namespace
::
::   Cach dung:
::     deploy-jeus.bat               -> Chi build, khong deploy
::     deploy-jeus.bat tomcat        -> Build + deploy len Tomcat 9.x
::     deploy-jeus.bat jeus          -> Build + deploy len JEUS 7.0
:: ====================================================



:: ====================================================
::   [CAU HINH] - SUA CAC GIA TRI NAY TRUOC KHI DUNG
:: ====================================================

:: --- JDK 11 (pom.xml yeu cau Java 11) ---
set JAVA_HOME_JDK11=C:\Program Files\Java\jdk-11.0.30

:: --- Database ---
set DB_URL=jdbc:oracle:thin:@//10.44.7.18:1521/HAEHR
set DB_USERNAME=HAE_HR
set DB_PASSWORD=`1qaz2wsx
set PHOTO_UPLOAD_PATH=D:/JEUS7.0/resource/HAE_VHR/resources/photo/HAE
set SESSION_COOKIE_SECURE=false

:: --- Tomcat 9.x (KHONG dung Tomcat 10+ vi Spring Boot 2.7.x dung javax.* namespace) ---
set TOMCAT_HOME=C:\apache-tomcat-9.0.98
set TOMCAT_APP_NAME=ROOT

:: --- JEUS 7.0 ---
set JEUS_HOME=D:\JEUS7.0
set JEUS_APP_NAME=HAE_VHR
set JEUS_CONTEXT_PATH=/HAE_VHR
set JEUS_SERVER_HOST=localhost
set JEUS_ADMIN_PORT=9736
set JEUS_SERVER_NAME=server1

:: ====================================================
::   [NOI DUNG SCRIPT] - KHONG SUA TU DAY TRO XUONG
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
echo    Spring Boot 2.7.18 / JDK 11
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
echo    deploy-jeus.bat tomcat        -^> Build + deploy len Tomcat 9.x
echo    deploy-jeus.bat jeus          -^> Build + deploy len JEUS 7.0
echo.
pause
exit /b 1


:: ====================================================
::   BUOC 1: Kiem tra JDK 11
:: ====================================================
:CHECK_JDK
echo  [1/3] Kiem tra JDK 11...
if not exist "%JAVA_HOME_JDK11%\bin\java.exe" (
    echo.
    echo  [LOI] Khong tim thay JDK 11 tai:
    echo        %JAVA_HOME_JDK11%
    echo.
    echo  Sua bien JAVA_HOME_JDK11 trong phan [CAU HINH] cua file nay.
    pause
    exit /b 1
)
set JAVA_HOME=%JAVA_HOME_JDK11%
set PATH=%JAVA_HOME%\bin;%PATH%
for /f "tokens=*" %%v in ('java -version 2^>^&1') do (
    echo        %%v
    goto :JDK_DONE
)
:JDK_DONE
echo  [OK] JDK 11 san sang.
echo.


:: ====================================================
::   BUOC 2: Don dep WEB-INF/lib cu truoc khi build
::   (tranh conflict jar tu cac lan build truoc)
:: ====================================================
:CLEAN_LIB
echo  [2/3] Don dep WEB-INF/lib cu...
set LIB_DIR=%PROJECT_DIR%src\main\webapp\WEB-INF\lib
if exist "%LIB_DIR%\" (
    del /f /q "%LIB_DIR%\*.jar" >nul 2>&1
    echo  [OK] Da xoa jar cu trong: %LIB_DIR%
) else (
    mkdir "%LIB_DIR%"
    echo  [OK] Tao moi: %LIB_DIR%
)
echo.


:: ====================================================
::   BUOC 3: Maven Build
:: ====================================================
:BUILD
echo  [3/3] Dang build (mvn clean package -DskipTests)...
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
::   DEPLOY: TOMCAT 9.x (dung exploded-war)
::   LUU Y: Phai dung Tomcat 9.x, KHONG dung Tomcat 10+
::   Spring Boot 2.7.x dung javax.* namespace (Servlet 4.0)
::   Tomcat 10+ da chuyen sang jakarta.* (khong tuong thich)
:: ====================================================
:DEPLOY_TOMCAT
echo  [DEPLOY] Deploy len Tomcat 9.x (exploded-war)...
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
    echo set "JAVA_OPTS=-Xms512m -Xmx1024m -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Ho_Chi_Minh"
    echo set "JAVA_OPTS=%%JAVA_OPTS%% --add-opens java.base/java.lang=ALL-UNNAMED"
    echo set "JAVA_OPTS=%%JAVA_OPTS%% --add-opens java.base/java.util=ALL-UNNAMED"
) > "%TOMCAT_HOME%\bin\setenv.bat"
echo  [OK] Ghi xong: %TOMCAT_HOME%\bin\setenv.bat
echo.

:: Dung Tomcat neu dang chay
echo  -- Dang dung Tomcat (neu dang chay)...
call "%TOMCAT_HOME%\bin\shutdown.bat" >nul 2>&1
timeout /t 4 /nobreak >nul
echo  [OK] Da gui lenh shutdown.
echo.

:: Xoa ban deploy cu
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

:: Copy exploded-war vao webapps/ROOT/ (hoac ten app)
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
echo    DEPLOY TOMCAT 9.x THANH CONG!
echo  ================================================
echo.
echo    URL truy cap : http://localhost:8080/
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
::   DEPLOY: JEUS 7.0 (dung exploded-war)
::   LUU Y: JEUS 7.0 ho tro Servlet 3.1 (javax.*)
::   Tuong thich voi Spring Boot 2.7.x
:: ====================================================
:DEPLOY_JEUS
echo  [DEPLOY] Deploy len JEUS 7.0...
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
echo  -- Dang copy exploded-war vao: %JEUS_DEPLOY_TARGET%
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
echo    DEPLOY JEUS 7.0 - BUOC TIEP THEO (MANUAL)
echo  ================================================
echo.
echo  [A] Them JVM Options vao JEUS 7.0:
echo.
echo      Mo WebAdmin: http://%JEUS_SERVER_HOST%:%JEUS_ADMIN_PORT%/webadmin
echo      -^> Servers -^> %JEUS_SERVER_NAME% -^> JVM Config -^> JVM Option
echo.
echo      Them cac dong sau:
echo        -DDB_URL=%DB_URL%
echo        -DDB_USERNAME=%DB_USERNAME%
echo        -DDB_PASSWORD=%DB_PASSWORD%
echo        -DPHOTO_UPLOAD_PATH=%PHOTO_UPLOAD_PATH%
echo        -DSESSION_COOKIE_SECURE=%SESSION_COOKIE_SECURE%
echo        -Dfile.encoding=UTF-8
echo        -Duser.timezone=Asia/Ho_Chi_Minh
echo        --add-opens java.base/java.lang=ALL-UNNAMED
echo        --add-opens java.base/java.util=ALL-UNNAMED
echo.
echo  [B] Dang ky ung dung (LAN DAU trien khai):
echo.
echo      Tren JEUS 7.0 WebAdmin:
echo        App Name    : %JEUS_APP_NAME%
echo        Deploy Path : %JEUS_DEPLOY_TARGET%
echo        Context Root: %JEUS_CONTEXT_PATH%
echo        Target      : %JEUS_SERVER_NAME%
echo.
echo      Hoac qua jeusadmin CLI (JEUS 7.0):
echo        deploy -id %JEUS_APP_NAME% -path "%JEUS_DEPLOY_TARGET%" -contextpath %JEUS_CONTEXT_PATH%
echo.
echo  [C] Da dang ky roi (REDEPLOY):
echo.
echo      Qua jeusadmin CLI:
echo        redeploy -id %JEUS_APP_NAME%
echo.
echo      Hoac WebAdmin: Applications -^> %JEUS_APP_NAME% -^> Redeploy
echo.
echo  [D] URL truy cap:
echo        http://%JEUS_SERVER_HOST%:PORT%JEUS_CONTEXT_PATH%
echo        (Kiem tra port HTTP trong JEUS WebAdmin -^> Servers -^> Listeners)
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
echo    Exploded WAR (dung cho ca Tomcat 9.x va JEUS 7.0):
echo      %EXPLODED_WAR%
echo.
echo    WAR file:
echo      %WAR_FILE%
echo.
echo    De deploy:
echo      deploy-jeus.bat tomcat   -^> Deploy len Tomcat 9.x
echo      deploy-jeus.bat jeus     -^> Deploy len JEUS 7.0
echo  ================================================
echo.
pause
exit /b 0
