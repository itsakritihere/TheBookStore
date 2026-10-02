FROM nginx:1.27-alpine
COPY index.html config.js /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY script/script.js script/utils.js /usr/share/nginx/html/script/
COPY assests /usr/share/nginx/html/assets

COPY docker/40-config.sh /docker-entrypoint.d/40-config.sh
RUN chmod +x /docker-entrypoint.d/40-config.sh
ENV DATA_URL=assests/data/events.json \
    STORAGE_KEY=bookstore-events \
    LOADING_DELAY=400
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
