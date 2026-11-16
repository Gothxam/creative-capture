import type { NextConfig } from "next";

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

  // The live site's URLs, kept alive so existing links and anything already
  // indexed lands on the right page instead of a 404.
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
};

export default nextConfig;
