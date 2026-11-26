# Aliyun deployment

Production hostname: `jojo.entropyfield.com`
Server: `47.76.238.44` (existing Caddy host)
Repository checkout: `/opt/jojo/repo`
Published root: `/opt/jojo/current` (symlink to a successful release)

Build with `npm ci --no-audit --no-fund` and `npm run build` followed by `npm run check:seo`.
The Vite base is `/`. The build prerenders the homepage and standalone notes, with search metadata, a sitemap and robots.txt.

`update-jojo` fetches main and switches the published symlink only after a successful build.
Install it at `/usr/local/sbin/update-jojo`, with `jojo-update.service` in `/etc/systemd/system`.
The optional timer checks every five minutes and is a fallback for webhook delivery.
The existing signed receiver from `../github-webhook.py` listens on localhost:9187.
Its root-only environment file is `/etc/jojo-webhook.env`; never commit its contents.
GitHub push webhook target: `https://jojo.entropyfield.com/github`.

Append the site block from `jojo.caddy` to the existing Caddyfile, validate, then reload.
DNS and HTTPS were verified during migration on 2026-11-25.
The previous Caddyfile is backed up at `/opt/jojo/Caddyfile.before-jojo`.
Previous published releases remain in `/opt/jojo/releases` for rollback.

DNS prerequisite: GoDaddy A record `jojo` → `47.76.238.44`.
Verify HTTPS and assets before redirecting the old `/jojo/` URL or retiring its updater.
