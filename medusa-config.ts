import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    // {
    //   resolve: "@medusajs/medusa/payment",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/medusa/payment-stripe",
    //         id: "stripe",
    //         options: {
    //           apiKey: process.env.STRIPE_API_KEY,
    //         },
    //       },
    //     ],
    //   },
    // },
    {
      resolve: "./src/modules/sync-service",
    },
  ],
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000",
  },
});
