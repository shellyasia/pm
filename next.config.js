/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  experimental: {
    typedRoutes: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };

      // Exclude pg and related modules from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        "pg": "commonjs pg",
        "pg-native": "commonjs pg-native",
        "pg-connection-string": "commonjs pg-connection-string",
      });
    }
    return config;
  },
  env: {
    // Make sure critical environment variables are available to the client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Validate environment variables at build time
  async rewrites() {
    // Note: Environment validation is handled by the TypeScript config files
    // during the application startup instead of build time
    return [];
  },
  // Security headers for production
  async headers() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "X-XSS-Protection",
              value: "1; mode=block",
            },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains; preload",
            },
          ],
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
