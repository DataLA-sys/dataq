call npm run build --base-href=# --prefix web/dataqui
call rmdir "src/main/resources/web" /S /Q
call xcopy "web/dataqui/dist/dataqui" "src/main/resources/web" /s /i