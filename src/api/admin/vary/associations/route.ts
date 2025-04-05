import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { AdminGetVaryLogsParamsType } from "../validators";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import VaryService from "../../../../modules/vary/service";
import { VARY_MODULES } from "../../../../modules/vary";

export const GET = async (
  req: MedusaRequest<AdminGetVaryLogsParamsType>,
  res: MedusaResponse
) => {
  const varyService: VaryService = req.scope.resolve(VARY_MODULES);
  const associations = await varyService.getAllVaryProductAssocFromMedusa();
  res.json({ associations });
};
