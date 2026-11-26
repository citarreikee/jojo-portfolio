# Jojo — Personal Portfolio

Personal portfolio for Jojorn (Jojo) Sun: AI, spatial intelligence, product demos and evidence-led notes.

Production: https://jojo.entropyfield.com/

## Development

```sh
npm ci
npm run dev
```

## Build and verify

```sh
npm run build
npm run check:seo
npm run preview
```

The build creates a static React homepage plus a Notes index and six standalone reading pages. The homepage retains the interactive accordion and folder dialogs; each note also has a stable `/notes/<id>/` URL. Original source components supply both the modal and standalone article text.

`scripts/build-pages.mjs` generates canonical tags, Open Graph/Twitter metadata, Person/ProfilePage/CreativeWork/TechArticle structured data, `sitemap.xml`, `robots.txt` and `llms.txt`. The latter is a supplemental reading guide, not a guarantee that AI services will use or cite the site. Public demos copied from upstream are `noindex,follow`; the original portfolio and notes are indexable. Review annotations and the review toggle are removed.

## Deployment

See [deploy/aliyun/README.md](deploy/aliyun/README.md). The site is served at the hostname root on Aliyun, not the former `/jojo/` subpath. Releases are built before the published symlink changes; previous releases remain available for rollback.

Source components and published media are tracked here. The Lux gameplay video is a browser-compatible H.264/AAC copy with fast-start metadata; its original recording is retained outside the published directory.
