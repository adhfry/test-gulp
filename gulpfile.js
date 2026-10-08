"use strict";

const sass = require("gulp-sass")(require("sass"));
const gulp = require("gulp");
const postcss = require("gulp-postcss");
const tailwindcss = require("tailwindcss");
const gutil = require("gulp-util");
const jshint = require("gulp-jshint");
const fileinclude = require("gulp-file-include");
const bs = require("browser-sync").create();
const rimraf = require("rimraf");
const wrapper = require("gulp-wrapper");
const comments = require("gulp-header-comment");
const template = require("gulp-template");
const { Transform } = require("stream");
const theme = require("./src/theme.json");
const node_env = process.argv.slice(2)[0];
const headerComments = `Created by @adhfry`;

// Absolute site URL (needed for canonical, Open Graph & sitemap).
// Priority: SITE_URL env > Vercel production domain > Netlify URL > theme.json
const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  process.env.URL ||
  theme.site.url
).replace(/\/$/, "");

const site = Object.assign({}, theme.site, { url: siteUrl });

// per-page SEO data, merged into the template data of each page
const pagesMeta = {
  "index.html": {
    path: "/",
    robots: "index, follow, max-image-preview:large",
    title:
      "DS Studio Sumenep – Studio Foto, Wedding, Prewedding & Wisuda",
    description:
      "Studio foto & fotografer profesional di Sumenep, Madura. Dokumentasi wedding, prewedding, wisuda, maternity, portrait & event. Booking mudah via WhatsApp.",
  },
  "404.html": {
    path: "/404.html",
    robots: "noindex, follow",
    title: "Halaman Tidak Ditemukan | DS Studio Sumenep",
    description:
      "Halaman yang Anda cari tidak tersedia. Kembali ke beranda DS Studio atau hubungi kami via WhatsApp.",
  },
};

// WhatsApp deep link with a pre-filled message
const wa = (message) =>
  "https://wa.me/" +
  site.whatsapp +
  "?text=" +
  encodeURIComponent(
    message || "Halo DS Studio, saya ingin bertanya tentang layanan foto."
  );

const templateData = {
  fontPrimary: theme.fonts.font_family.primary,
  fontSecondary: theme.fonts.font_family.secondary,
  site: site,
  wa: wa,
  instagramUrl: "https://www.instagram.com/" + site.instagram + "/",
  year: new Date().getFullYear(),
  buildDate: new Date().toISOString().slice(0, 10),
};

const pageData = () =>
  new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      file.data = { page: pagesMeta[file.basename] || pagesMeta["index.html"] };
      cb(null, file);
    },
  });

var path = {
  // source paths
  src: {
    theme: "src/theme.json",
    // only the landing page & 404 are published, the rest are template demos
    pages: ["src/pages/index.html", "src/pages/404.html"],
    partials: "src/partials/**/*.html",
    seo: "src/seo/*",
    styles: "src/styles/main.scss",
    stylesWatch: "src/styles/*.scss",
    scripts: "src/scripts/*.js",
    plugins: "src/plugins/**/*",
    public: "src/public/**/*",
  },

  // build paths
  build: {
    dir: "theme/",
  },
};

// pages
gulp.task("pages", function () {
  return gulp
    .src(path.src.pages)
    .pipe(
      wrapper({
        header:
          "<!DOCTYPE html>\n<html lang=\"id\">\n@@include('head.html')\n<body>\n@@include('header.html')\n<main id=\"main\">",
        footer:
          node_env === "dev"
            ? "</main>\n@@include('components/tw-size-indicator.html')\n @@include('footer.html')\n</body>\n</html>"
            : "</main>\n@@include('footer.html')\n</body>\n</html>",
      })
    )
    .pipe(
      fileinclude({
        basepath: "src/partials/",
      })
    )
    .pipe(pageData())
    .pipe(template(templateData))
    .pipe(comments(headerComments))
    .pipe(gulp.dest(path.build.dir))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

// robots.txt, sitemap.xml, site.webmanifest (need the absolute site url)
gulp.task("seo", function () {
  return gulp
    .src(path.src.seo)
    .pipe(template(templateData))
    .pipe(gulp.dest(path.build.dir));
});

// styles
gulp.task("styles", function () {
  return gulp
    .src(path.src.styles)
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", sass.logError)
    )
    .pipe(
      postcss([tailwindcss("./tailwind.config.js"), require("autoprefixer")])
    )
    .pipe(comments(headerComments))
    .pipe(gulp.dest(path.build.dir + "styles/"))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

// scripts
gulp.task("scripts", function () {
  return gulp
    .src(path.src.scripts)
    .pipe(jshint("./.jshintrc"))
    .pipe(jshint.reporter("jshint-stylish"))
    .on("error", gutil.log)
    .pipe(comments(headerComments))
    .pipe(gulp.dest(path.build.dir + "scripts/"))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

// Plugins
gulp.task("plugins", function () {
  return gulp
    .src(path.src.plugins)
    .pipe(gulp.dest(path.build.dir + "plugins/"))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

// public files
gulp.task("public", function () {
  return gulp
    .src(path.src.public, { encoding: false })
    .pipe(gulp.dest(path.build.dir));
});

// Clean Theme Folder
gulp.task("clean", function (cb) {
  rimraf("./theme", cb);
});

// Watch Task
gulp.task("watch", function () {
  gulp.watch(path.src.theme, gulp.parallel("pages", "seo", "styles"));
  gulp.watch(path.src.pages, gulp.parallel("pages", "styles"));
  gulp.watch(path.src.partials, gulp.parallel("pages", "styles"));
  gulp.watch(path.src.seo, gulp.parallel("seo"));
  gulp.watch(path.src.scripts, gulp.parallel("scripts", "styles"));
  gulp.watch(path.src.stylesWatch, gulp.parallel("styles"));
  gulp.watch(path.src.plugins, gulp.parallel("plugins", "pages"));
  gulp.watch(path.src.public, gulp.parallel("public", "pages"));
});

// dev Task
gulp.task(
  "dev",
  gulp.series(
    "clean",
    "pages",
    "seo",
    "styles",
    "scripts",
    "public",
    gulp.parallel("watch", function () {
      bs.init({
        server: {
          baseDir: path.build.dir,
        },
      });
    })
  )
);

// Build Task
gulp.task(
  "build",
  gulp.series("clean", "pages", "seo", "styles", "scripts", "public")
);

// Deploy Task
gulp.task("deploy", gulp.series("pages", "seo", "styles", "scripts", "public"));
