const { getDefaultConfig } = require("expo/metro-config");
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push("sql");

// Enhance the middleware to inject custom headers
config.server = {
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      // Add custom headers
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

      return middleware(req, res, next);
    };
  },
};

module.exports = config;
