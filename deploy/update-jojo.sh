#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/citarreikee/jojo-portfolio"
SITE_ROOT="/home/citarreikee/jojo-site"
REPO="https://github.com/citarreikee/jojo-portfolio.git"

# The service runs as root while the working tree is owned by the site user.
# Mark only this exact checkout as trusted for Git's ownership check.
git config --global --add safe.directory "$APP_ROOT" 2>/dev/null || true

if [[ ! -d "$APP_ROOT/.git" ]]; then
  git clone "$REPO" "$APP_ROOT"
else
  git -C "$APP_ROOT" fetch --prune origin main
  git -C "$APP_ROOT" reset --hard origin/main
fi

cd "$APP_ROOT"
npm install --no-audit --no-fund
npm run build

mkdir -p "$SITE_ROOT"
find "$SITE_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a dist/. "$SITE_ROOT/"
chown -R citarreikee:citarreikee "$APP_ROOT" "$SITE_ROOT"
nginx -t
systemctl reload nginx
