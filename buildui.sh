npm run build --base-href=# --prefix web/dataqui
rm -r "src/main/resources/web"
cp -R "web/dataqui/dist/dataqui" "src/main/resources/web"