import type { NextConfig } from "next";

/**
 * Two build targets.
 *
 * Default (`npm run build`) is a normal Next.js build for a Node host —
 * Vercel, Netlify, a VPS — where `redirects()` and `headers()` are honoured.
 *
 * `STATIC_EXPORT=1 npm run build` (`npm run build:static`) emits a folder of
 * plain HTML/CSS/JS to `out/` for shared hosting with no Node runtime. Static
 * export does not support `redirects()` or `headers()`, so those live in
 * `public/.htaccess` instead, which Apache — what cPanel shared hosting runs —
 * reads from the uploaded folder.
 *
 * Nothing else on the site needs a server: every route prerenders, there are
 * no route handlers, no cookies and no dynamic params. The enquiry form posts
 * from the browser to an external endpoint.
 */
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Tailwind v4 runs as a Turbopack CSS loader. Without this, `@import
  // "tailwindcss"` and `@theme` in globals.css compile to nothing and the
  // page falls back to unstyled browser defaults.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  ...(isStatic
    ? {
        output: "export" as const,
        // Emits `about/index.html` rather than `about.html`, which is what
        // Apache serves cleanly from a subdirectory without rewrite rules.
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        // The live site's URLs, kept alive so existing links and anything
        // already indexed lands on the right page instead of a 404.
        // Mirrored in public/.htaccess for the static build.
        async redirects() {
          return [
            { source: "/potraits", destination: "/portraits", permanent: true },
            { source: "/contact-us", destination: "/contact", permanent: true },
            { source: "/hello-world", destination: "/", permanent: true },
            { source: "/category/uncategorized", destination: "/", permanent: true },
          ];
        },

        async headers() {
          return [
            {
              // Optimised media is content-addressed by name; nothing rewrites it.
              source: "/:dir(img|video)/:file*",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
