import { AdminGetVaryLogsParamsType } from './../../validators';
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import VaryService from "src/modules/vary/service";
import { VARY_MODULES } from "src/modules/vary";

export const GET = async (
  req: MedusaRequest<AdminGetVaryLogsParamsType>,
  res: MedusaResponse
) => {
    const { id } = req.params
    if (!id) {
        return res.status(400).json({ error: "ID parameter is missing." });
    }
    const varyService: VaryService = req.scope.resolve(VARY_MODULES);
    const association = await varyService.getOneVaryProductAssocFromMedusaById(id);
    res.json({ association });
};
