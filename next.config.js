/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Old marketing URL kept alive for any existing bookmarks / shared links.
      // 308 (permanent) so search engines update the indexed URL.
      {
        source: "/for-organizations",
        destination: "/for-churches",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
