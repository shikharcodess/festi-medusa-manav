import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id: productAssocId } = req.params;

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data: productAssoc } = await query.graph({
      entity: "product_assoc",
      fields: [
        "id",
        "created_at",
        "updated_at",
        "name",
        "rank",
        "metadata",
        "product.id",
        "products.title",
        "products.categories.id",
        "products.categories.name",
        "products.collection.id",
        "products.collection.title",
        "products.sales_channels.id",
        "products.sales_channels.name",
        "products.variants.id",
        "products.status",
      ],
      filters: { id: productAssocId },
    });

    res.json({ data: productAssoc });
    return;
  } catch (error: any) {
    res.statusCode = 400;
    res.json({ error: { message: error.toString() } });
  }
};
