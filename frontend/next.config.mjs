/** @type {import('next').NextConfig} */
const nextConfig = {
  // jwks-rsa (pulled in by firebase-admin/auth) require()s the ESM-only `jose`, which fails on
  // Netlify's Node runtime (ERR_REQUIRE_ESM). Bundle them instead of loading them externally.
  transpilePackages: ['firebase-admin', 'jwks-rsa', 'jose'],
}

export default nextConfig
