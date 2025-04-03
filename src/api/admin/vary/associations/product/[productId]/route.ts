import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { AdminGetVaryLogsParamsType } from "../../../validators";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import VaryService from "src/modules/vary/service";
import { VARY_MODULES } from "src/modules/vary";

export const GET = async (
  req: MedusaRequest<AdminGetVaryLogsParamsType>,
  res: MedusaResponse
) => {
   const varyService: VaryService = req.scope.resolve(VARY_MODULES);
   if(!req.params.productId) {
    return res.status(400).json({ error: "Product ID parameter is missing." });
   }
    const associations = await varyService.getVaryProductAssocFromMedusaByProductId(req.params.productId);
    res.json({ associations });
};
