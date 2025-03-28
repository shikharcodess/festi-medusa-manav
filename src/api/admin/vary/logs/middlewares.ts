import {
  defineMiddlewares,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
// other imports...

export const GetBrandsSchema = createFindParams();

export default defineMiddlewares({
  routes: [
    // ...
    {
      matcher: "/admin/vary/logs",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetBrandsSchema, {
          defaults: ["id", "name", "products.*"],
          isList: true,
        }),
      ],
    },
  ],
});
