import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    // {
    //   resolve: "@medusajs/medusa/event-bus-redis",
    //   options: {
    //     redisUrl: process.env.REDIS_URL,
    //   },
    // },
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
    // {
    //   resolve: "./src/modules/sync-service",
    // },
    {
      resolve: "/final/.medusa/server/src/modules/vary",
      options: {
        varyApiUrl: "http://festi.vary.rent:1331/test/1",
        varyUser: "maastery-test",
        varyPassword: "v6JU6FgF4ap43b",
      },
    },
  ],
});
