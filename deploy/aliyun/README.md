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
The block records only `/`, `/robots.txt`, and `/sitemap.xml` requests in
`/var/log/caddy/jojo-crawl.json`, strips request headers, and rotates at 5 MiB
with two retained files. Before validation, create the directory and log file
owned by `caddy:caddy` (directory mode 0750, file mode 0600). Root-run validation
can otherwise create a root-owned log that the Caddy service cannot open.
On an existing installation, preserve the log contents and correct ownership
before reloading. Caddy validation and service reload succeeded on 2026-11-27.

Google crawl verification on 2026-11-27: Googlebot fetched `/robots.txt` and `/`
with HTTP 200; reverse and forward DNS verified the crawler addresses.
Search Console accepted the homepage indexing request and reported sitemap
success with eight discovered URLs. This confirms fetching and submission,
not completed indexing. Earlier fetch failures predated access logging, so
their original cause remains unproven. DNS, robots rules, and routing were
unchanged during this recovery.
DNS and HTTPS were verified during migration on 2026-11-25.
The previous Caddyfile is backed up at `/opt/jojo/Caddyfile.before-jojo`.
Previous published releases remain in `/opt/jojo/releases` for rollback.

DNS prerequisite: GoDaddy A record `jojo` → `47.76.238.44`.
Verify HTTPS and assets before redirecting the old `/jojo/` URL or retiring its updater.
