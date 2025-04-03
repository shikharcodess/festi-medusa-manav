import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    query.graph({
      entity: "product_assc",
      ...req.queryConfig,
      fields: ["id", "created_at", "updated_at", "name", "rank"],
    });
  } catch (error: any) {
    res.statusCode = 400;
    res.json({ error: { message: error.toString() } });
  }
};
