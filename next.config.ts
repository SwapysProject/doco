import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle client-side builds
    if (!isServer) {
      // Fallback for Node.js modules that don't exist in the browser
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
        child_process: false,
        worker_threads: false,
        module: false,
        perf_hooks: false,
      };

      // Ignore MongoDB and other server-only modules on the client side
      config.externals = config.externals || [];
      config.externals.push({
        mongodb: "mongodb",
        "mongodb-client-encryption": "mongodb-client-encryption",
        "@mongodb-js/zstd": "@mongodb-js/zstd",
        kerberos: "kerberos",
        "@aws-sdk/credential-providers": "@aws-sdk/credential-providers",
        "gcp-metadata": "gcp-metadata",
        snappy: "snappy",
        aws4: "aws4",
        "mongodb-connection-string-url": "mongodb-connection-string-url",
        saslprep: "saslprep",
        "sparse-bitfield": "sparse-bitfield",
        "cpu-features": "cpu-features",
      });
    }

    // Additional module resolution rules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // Ignore problematic MongoDB modules
    config.module.rules.push({
      test: /node_modules\/mongodb\/lib\/client-side-encryption/,
      use: "null-loader",
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["mongodb"],
  },
  ignoreBuildErrors: true,
  // Explicitly mark these as server-only
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
