
set -e

HTML_DIR="${HTML_DIR:-/usr/share/nginx/html}"

DATA_URL="${DATA_URL:-assets/data/events.json}"
STORAGE_KEY="${STORAGE_KEY:-bookstore-events}"
LOADING_DELAY="${LOADING_DELAY:-400}"


case "$LOADING_DELAY" in
  ''|*[!0-9]*) LOADING_DELAY=400 ;;
esac

cat > "$HTML_DIR/config.js" <<CONFIG
window.APP_CONFIG = {
  dataUrl: "$DATA_URL",
  storageKey: "$STORAGE_KEY",
  loadingDelay: $LOADING_DELAY
};
CONFIG

echo "config.js generated (dataUrl=$DATA_URL, storageKey=$STORAGE_KEY, loadingDelay=$LOADING_DELAY)"
