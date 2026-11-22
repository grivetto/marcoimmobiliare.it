FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY marco-grivetto.vcf /usr/share/nginx/html/marco-grivetto.vcf
COPY metadata.json /usr/share/nginx/html/metadata.json
COPY assets /usr/share/nginx/html/assets
COPY chi-siamo /usr/share/nginx/html/chi-siamo
COPY appartamenti-in-vendita /usr/share/nginx/html/appartamenti-in-vendita
COPY investi-con-noi /usr/share/nginx/html/investi-con-noi
COPY investimenti-immobiliari-in-corso /usr/share/nginx/html/investimenti-immobiliari-in-corso
COPY investimenti-immobiliari-conclusi /usr/share/nginx/html/investimenti-immobiliari-conclusi
COPY contatti /usr/share/nginx/html/contatti
COPY blog /usr/share/nginx/html/blog
COPY v2 /usr/share/nginx/html/v2

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

