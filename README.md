# DS Studio – Landing Page

Website resmi **DS Studio Fotografi**, studio foto & videografi di Sumenep, Madura.
Single-page landing (HTML + Tailwind CSS + vanilla JS) yang dibangun dengan Gulp.

- WhatsApp: [+62 823-3852-4669](https://wa.me/6282338524669)
- Instagram: [@ds.studio_126](https://www.instagram.com/ds.studio_126/)

## Perintah

```bash
npm install
npm run dev     # dev server + live reload (http://localhost:3000)
npm run build   # build produksi ke folder ./theme
npm run release # deploy production ke Vercel + arahkan alias ds-studio.vercel.app
```

## Hosting

Live di **https://ds-studio.vercel.app** (project Vercel `ds-studio`).

- `ds-studio.vercel.app` adalah alias manual, jadi deploy production **wajib** lewat
  `npm run release` (deploy + pindahkan alias). `vercel --prod` saja hanya memperbarui
  `ds-studio-one.vercel.app`.
- Env `SITE_URL=https://ds-studio.vercel.app` sudah diset di Vercel (Production) agar
  canonical, Open Graph, dan sitemap memakai domain yang benar.

## Konfigurasi penting

Semua data bisnis ada di `src/theme.json` → `site`
(nama, nomor WhatsApp, Instagram, email, alamat, koordinat, link & embed Google Maps).
Ubah di sana, semua halaman, meta SEO, JSON-LD, sitemap, dan tombol WhatsApp ikut berubah.

**URL domain (wajib benar untuk canonical, Open Graph & sitemap)** dipilih otomatis saat build:

1. env `SITE_URL` (contoh `SITE_URL=https://dsstudio.id`)
2. domain produksi Vercel (`VERCEL_PROJECT_PRODUCTION_URL`)
3. `URL` dari Netlify
4. fallback `site.url` di `src/theme.json`

## Struktur

| Path | Isi |
| --- | --- |
| `src/pages/index.html` | Landing page (hero, layanan, portofolio, tentang, cara booking, FAQ, lokasi, CTA) |
| `src/pages/404.html` | Halaman 404 |
| `src/partials/` | `head.html` (SEO, OG, JSON-LD), `header.html`, `footer.html`, ikon SVG, grid portofolio |
| `src/seo/` | `robots.txt`, `sitemap.xml` (dengan image sitemap), `site.webmanifest` |
| `src/styles/` | Tailwind + SCSS (`main.scss` sebagai entry) |
| `src/scripts/main.js` | Menu mobile, scroll-spy, filter portofolio, lightbox, animasi reveal |
| `src/public/images/portfolio/` | Foto portofolio WebP (640w & 1280w) |
| `src/public/images/og-image.jpg` | Gambar preview share (1200×630) |

Halaman lain di `src/pages/` adalah sisa template dan **tidak ikut di-build**.

## Menambah foto portofolio

1. Simpan foto sebagai WebP 640px dan 1280px (lebar) di `src/public/images/portfolio/`
   dengan nama `kategori-deskripsi-640.webp` dan `kategori-deskripsi-1280.webp`.
2. Tambahkan item baru di `src/partials/sections/gallery.html`
   (`data-category`: `wedding`, `prewedding`, `maternity`, `wisuda`, `portrait`, `studio`, `event`).
3. Tambahkan juga ke `src/seo/sitemap.xml` agar terindeks Google Images.

## Tracking

Setiap tombol WhatsApp punya atribut `data-wa-cta`. Jika GA4 (`gtag`) atau Meta Pixel (`fbq`)
dipasang, klik otomatis dikirim sebagai event `whatsapp_click` / `Contact`.
